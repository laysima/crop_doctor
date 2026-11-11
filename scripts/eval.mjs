// Runs labelled photos in eval/photos/<crop>/<condition>/ through the diagnosis
// API and reports accuracy against the pilot targets. Progress is saved, so an
// interrupted run continues where it stopped; pass --fresh to start over.
// Usage: npm run eval -- [--base http://localhost:3000] [--per-class 20] [--fresh]
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import nextEnv from "@next/env";
import sharp from "sharp";

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.EVAL_TOKEN) throw new Error("Set EVAL_TOKEN in .env.local so the test can call the API without signing in.");

const arg = (name, fallback) => {
  const index = process.argv.indexOf(`--${name}`);
  return index > -1 ? process.argv[index + 1] : fallback;
};
const BASE = arg("base", "http://localhost:3000");
const PER_CLASS = Number(arg("per-class", Infinity));
const THROTTLE_MS = Number(arg("throttle", 4500)); // stays under free-tier per-minute limits
const BUSY_WAITS_MS = [20_000, 40_000, 60_000, 60_000];
const MAX_CONSECUTIVE_BUSY = 3;

const RESULTS = "eval/results/results.jsonl";
const REPORT = "eval/results/report.md";
const labels = JSON.parse(readFileSync("eval/labels.json", "utf8"));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

mkdirSync("eval/results", { recursive: true });
if (process.argv.includes("--fresh")) rmSync(RESULTS, { force: true });

const records = existsSync(RESULTS)
  ? readFileSync(RESULTS, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line))
  : [];
const done = new Set(records.map((record) => record.file));

function photos() {
  const list = [];
  for (const crop of readdirSync("eval/photos")) {
    if (crop.startsWith(".")) continue;
    for (const condition of readdirSync(join("eval/photos", crop))) {
      if (condition.startsWith(".")) continue;
      const key = `${crop}/${condition}`;
      if (!labels.conditions[key]) throw new Error(`Add "${key}" to eval/labels.json`);
      const files = readdirSync(join("eval/photos", key)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort().slice(0, PER_CLASS);
      list.push(...files.map((file) => ({ crop, key, file: join("eval/photos", key, file) })));
    }
  }
  return list;
}

const matches = (text, terms) => terms.some((term) => text.toLowerCase().includes(term));

async function shrink(file) {
  // Same limits as the app: longest side 1024px, under 300 KB.
  for (const quality of [85, 75, 65, 50, 40]) {
    const buffer = await sharp(file).rotate().resize(1024, 1024, { fit: "inside", withoutEnlargement: true }).jpeg({ quality }).toBuffer();
    if (buffer.length <= 300 * 1024 || quality === 40) return buffer;
  }
}

async function post(buffer) {
  const form = new FormData();
  form.append("image", new File([buffer], "photo.jpg", { type: "image/jpeg" }));
  return fetch(`${BASE}/api/diagnose`, {
    method: "POST",
    body: form,
    headers: { "x-eval-token": process.env.EVAL_TOKEN },
  });
}

async function run() {
  const queue = photos().filter((photo) => !done.has(photo.file));
  console.log(`${queue.length} photos to run, ${done.size} already done`);
  let consecutiveBusy = 0;

  for (const [index, photo] of queue.entries()) {
    const buffer = await shrink(photo.file);
    const started = Date.now();
    let response;
    let body;
    for (let attempt = 0; ; attempt++) {
      response = await post(buffer);
      body = await response.json();
      if (response.status !== 503 || attempt >= BUSY_WAITS_MS.length) break;
      console.log(`  service busy, waiting ${BUSY_WAITS_MS[attempt] / 1000}s`);
      await sleep(BUSY_WAITS_MS[attempt]);
    }

    if (response.status === 503) {
      // Likely a daily quota. Stop without recording, so a later run picks these up.
      if (++consecutiveBusy >= MAX_CONSECUTIVE_BUSY) {
        console.log("Stopping: the service keeps refusing requests. Run again later to continue.");
        return;
      }
      continue;
    }
    consecutiveBusy = 0;

    const terms = labels.conditions[photo.key];
    const record = response.ok
      ? {
          file: photo.file,
          key: photo.key,
          crop: photo.crop,
          ms: Date.now() - started,
          outcome: body.outcome,
          predictedCrop: body.crop?.name ?? null,
          cropRight: !!body.crop && matches(body.crop.name, labels.crops[photo.crop]),
          candidates: body.candidates.map((c) => ({ name: c.name, scientificName: c.scientificName, confidence: c.confidence })),
          rightAt: body.candidates.findIndex((c) => matches(`${c.name} ${c.scientificName}`, terms)),
          urgent: body.urgentEscalation,
          model: body.audit.model,
          promptVersion: body.audit.promptVersion,
        }
      : { file: photo.file, key: photo.key, crop: photo.crop, error: body.error?.code ?? String(response.status) };

    appendFileSync(RESULTS, `${JSON.stringify(record)}\n`);
    records.push(record);
    if (record.error) console.log(`[${index + 1}/${queue.length}] ${photo.file}: ERROR ${record.error}`);
    else console.log(`[${index + 1}/${queue.length}] ${photo.key}: ${record.candidates[0]?.name ?? record.outcome} ${record.rightAt === 0 ? "✓" : record.rightAt > 0 ? "~" : "✗"}`);
    await sleep(THROTTLE_MS);
  }
}

const pct = (part, whole) => (whole ? `${Math.round((part / whole) * 100)}%` : "n/a");

function stats(rows) {
  const high = rows.filter((r) => r.candidates[0]?.confidence === "high");
  return {
    n: rows.length,
    crop: rows.filter((r) => r.cropRight).length,
    top1: rows.filter((r) => r.rightAt === 0).length,
    top3: rows.filter((r) => r.rightAt >= 0).length,
    high: high.length,
    highRight: high.filter((r) => r.rightAt === 0).length,
  };
}

function report() {
  const ok = records.filter((r) => !r.error);
  const failed = records.filter((r) => r.error);
  const overall = stats(ok);
  const ms = ok.map((r) => r.ms).sort((a, b) => a - b);
  const line = (name, s) =>
    `| ${name} | ${s.n} | ${pct(s.crop, s.n)} | ${pct(s.top1, s.n)} | ${pct(s.top3, s.n)} | ${s.highRight}/${s.high} (${pct(s.highRight, s.high)}) |`;
  const outcomes = Object.entries(Object.groupBy(ok, (r) => r.outcome)).map(([k, v]) => `${k}: ${v.length}`).join(", ");
  const misses = ok.filter((r) => r.rightAt < 0).slice(0, 40)
    .map((r) => `- ${r.file}: ${r.candidates.map((c) => `${c.name} (${c.confidence})`).join(", ") || r.outcome}`);

  const text = [
    "# Accuracy report",
    "",
    `Model ${ok[0]?.model ?? "n/a"}, prompt ${ok[0]?.promptVersion ?? "n/a"}. Photos that returned no candidate count as wrong.`,
    "",
    `**Top-1: ${pct(overall.top1, overall.n)} (target 60%). Top-3: ${pct(overall.top3, overall.n)} (target 80%). Right when high confidence: ${pct(overall.highRight, overall.high)} (about 90% needed before chemical advice).**`,
    "",
    "| Class | Photos | Crop right | Top-1 | Top-3 | Right when high confidence |",
    "|---|---|---|---|---|---|",
    ...Object.entries(Object.groupBy(ok, (r) => r.key)).map(([key, rows]) => line(key, stats(rows))),
    line("**All**", overall),
    "",
    `Latency: median ${((ms[Math.floor(ms.length / 2)] ?? 0) / 1000).toFixed(1)}s, slowest ${((ms.at(-1) ?? 0) / 1000).toFixed(1)}s.`,
    `Outcomes: ${outcomes || "none"}.`,
    `Flagged fast-spreading: ${ok.filter((r) => r.urgent).length}/${ok.length}.`,
    `Failed requests: ${failed.length}.`,
    "",
    "## Not in the top 3",
    ...misses,
    "",
  ].join("\n");
  writeFileSync(REPORT, text);
  console.log(`\n${text.split("## Not in the top 3")[0]}Full report: ${REPORT}`);
}

await run();
report();
