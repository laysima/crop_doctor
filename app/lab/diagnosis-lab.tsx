"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent, useRef, useState } from "react";
import type { Diagnosis, Outcome } from "@/lib/diagnosis/diagnose";

const PHOTO = { maxSide: 1024, maxBytes: 300 * 1024 };
const FRAME = { maxSide: 768, maxBytes: 120 * 1024 };
const VIDEO_FRAMES = 6;
const VIDEO_TIMEOUT_MS = 20_000;

const OUTCOME_TEXT: Record<Outcome, string> = {
  show_advice: "Likely cause found.",
  show_top_two: "Two possibilities. Start with the safest steps and answer the questions below.",
  unsure: "Not sure. Try another photo or contact an extension officer.",
  healthy: "No clear problem is visible.",
  not_a_plant: "This does not look like a plant. Try a different photo or video.",
  retake: "This is too unclear to examine. Try again in good light, closer to the leaf.",
};

function toJpeg(source: CanvasImageSource, width: number, height: number, limits: typeof PHOTO): Promise<Blob> {
  const scale = Math.min(1, limits.maxSide / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext("2d")!.drawImage(source, 0, 0, canvas.width, canvas.height);

  return (async () => {
    let blob: Blob | null = null;
    for (const quality of [0.85, 0.75, 0.65, 0.5, 0.4]) {
      blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= limits.maxBytes) return blob;
    }
    if (!blob) throw new Error("Could not read this file.");
    return blob;
  })();
}

async function photoToBlobs(file: File) {
  const bitmap = await createImageBitmap(file);
  try {
    return [await toJpeg(bitmap, bitmap.width, bitmap.height, PHOTO)];
  } finally {
    bitmap.close();
  }
}

/** Sends a few evenly spaced frames instead of the whole video, which would be far too heavy on weak signal. */
async function videoToBlobs(file: File) {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  const waitFor = (event: string) =>
    new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), VIDEO_TIMEOUT_MS);
      video.addEventListener(event, () => { clearTimeout(timer); resolve(); }, { once: true });
      video.addEventListener("error", () => { clearTimeout(timer); reject(new Error("decode")); }, { once: true });
    });

  try {
    const loaded = waitFor("loadeddata");
    video.src = url;
    await loaded;
    if (!Number.isFinite(video.duration) || video.duration <= 0) throw new Error("no duration");

    const frames: Blob[] = [];
    for (let i = 0; i < VIDEO_FRAMES; i++) {
      const seeked = waitFor("seeked");
      video.currentTime = ((i + 0.5) / VIDEO_FRAMES) * video.duration;
      await seeked;
      frames.push(await toJpeg(video, video.videoWidth, video.videoHeight, FRAME));
    }
    return frames;
  } catch {
    throw new Error("Could not read this video on this device. Try a photo instead.");
  } finally {
    URL.revokeObjectURL(url);
  }
}

type State =
  | { status: "idle" }
  | { status: "working" }
  | { status: "error"; message: string }
  | { status: "done"; result: Diagnosis; totalMs: number };

export function DiagnosisLab() {
  const [state, setState] = useState<State>({ status: "idle" });
  const [previews, setPreviews] = useState<string[]>([]);
  const cropInput = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setState({ status: "working" });
    const started = performance.now();
    try {
      const blobs = file.type.startsWith("video/") ? await videoToBlobs(file) : await photoToBlobs(file);
      setPreviews((previous) => {
        previous.forEach((url) => URL.revokeObjectURL(url));
        return blobs.map((blob) => URL.createObjectURL(blob));
      });
      const form = new FormData();
      blobs.forEach((blob, index) => form.append("image", blob, `frame-${index}.jpg`));
      const crop = cropInput.current?.value.trim();
      if (crop) form.set("crop", crop);
      const response = await fetch("/api/diagnose", { method: "POST", body: form });
      if (response.status === 401) {
        router.push("/sign-in");
        return;
      }
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? "Something went wrong.");
      setState({ status: "done", result: body, totalMs: Math.round(performance.now() - started) });
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Something went wrong." });
    }
  }

  return (
    <div className="mt-6 space-y-5">
      <div>
        <label htmlFor="crop" className="text-[15px] font-medium">Crop (optional)</label>
        <input
          id="crop"
          ref={cropInput}
          maxLength={40}
          placeholder="Leave empty and the AI will work it out"
          className="mt-1.5 min-h-12 w-full rounded-2xl border border-ink/20 bg-white/60 px-4 text-base"
        />
      </div>

      <label className="flex min-h-14 cursor-pointer items-center justify-center rounded-full bg-ink px-6 text-[15px] font-medium text-white focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-[#7a9a1f]">
        {state.status === "working" ? "Examining…" : "Choose a photo or video"}
        <input type="file" accept="image/*,video/*" onChange={onFile} disabled={state.status === "working"} className="sr-only" />
      </label>

      {previews.length > 0 && (
        <div className={previews.length > 1 ? "grid grid-cols-3 gap-2" : ""}>
          {previews.map((url, index) => (
            // Local blob previews, which next/image cannot optimise.
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt={`Uploaded plant, image ${index + 1}`} className="max-h-80 w-full rounded-2xl object-cover" />
          ))}
        </div>
      )}

      {state.status === "error" && (
        <p role="alert" className="rounded-2xl bg-sage p-4 text-[15px]">{state.message}</p>
      )}

      {state.status === "done" && <Result result={state.result} totalMs={state.totalMs} />}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[15px] leading-snug text-muted">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

function Result({ result, totalMs }: { result: Diagnosis; totalMs: number }) {
  const { audit } = result;
  return (
    <section aria-live="polite" className="space-y-3">
      <div className="rounded-2xl bg-sage p-4 text-[15px]">
        {result.crop && (
          <p className="text-muted">
            Crop: <span className="font-medium text-ink">{result.crop.name}</span> ({result.crop.confidence} confidence)
          </p>
        )}
        <p className="mt-1 font-medium">{OUTCOME_TEXT[result.outcome]}</p>
      </div>

      {result.urgentEscalation && (
        <p className="rounded-2xl bg-ink p-4 text-[15px] text-white">
          One of the possible causes can spread fast. Contact your extension service.
        </p>
      )}

      {result.candidates.map((candidate, index) => (
        <article key={candidate.name} className="rounded-2xl border border-ink/12 bg-white/60 p-4">
          <p className="text-xs text-muted">{index === 0 ? "Most likely" : "Could also be"}</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <h2 className="text-xl font-medium tracking-tight">{candidate.name}</h2>
            <span className="shrink-0 rounded-full bg-lime px-2.5 py-1 text-xs font-medium">{candidate.confidence} confidence</span>
          </div>
          {candidate.scientificName && <p className="text-sm italic text-muted">{candidate.scientificName}</p>}
          <BulletList items={candidate.visibleSymptoms} />
          {candidate.lowCostSteps.length > 0 && (
            <>
              <h3 className="mt-3 text-[15px] font-medium">What to do</h3>
              <BulletList items={candidate.lowCostSteps} />
            </>
          )}
        </article>
      ))}

      {result.chemicalReferral && (
        <p className="rounded-2xl border border-ink/30 p-4 text-[15px] leading-snug">{result.chemicalReferral}</p>
      )}

      {result.followUpQuestions.length > 0 && (
        <div className="rounded-2xl border border-ink/12 bg-white/60 p-4">
          <h2 className="text-[15px] font-medium">Follow-up questions</h2>
          <BulletList items={result.followUpQuestions} />
        </div>
      )}

      <p className="text-sm text-muted">
        AI suggestion, not yet reviewed by an expert · {(totalMs / 1000).toFixed(1)}s · {audit.imageCount} image{audit.imageCount > 1 ? "s" : ""}, {Math.round(audit.imageBytes / 1024)} KB · {audit.model} · {audit.promptVersion}
      </p>

      <details className="text-sm">
        <summary className="cursor-pointer py-2">Raw response</summary>
        <pre className="overflow-x-auto rounded-2xl bg-sage p-4 text-xs">{JSON.stringify(result, null, 2)}</pre>
      </details>
    </section>
  );
}
