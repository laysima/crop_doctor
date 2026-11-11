// Downloads a sample of the public PlantDoc dataset (CC BY 4.0) into
// eval/photos/<crop>/<condition>/. Usage: npm run eval:fetch -- --per-class 20
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const REPO = "pratikkayal/PlantDoc-Dataset";
const CLASSES = {
  "Corn Gray leaf spot": "maize/gray-leaf-spot",
  "Corn leaf blight": "maize/leaf-blight",
  "Corn rust leaf": "maize/rust",
  "Bell_pepper leaf": "pepper/healthy",
  "Bell_pepper leaf spot": "pepper/leaf-spot",
};

const flag = process.argv.indexOf("--per-class");
const perClass = flag > -1 ? Number(process.argv[flag + 1]) : 20;
const headers = { "User-Agent": "crop-doctor-eval" };

async function list(split, source) {
  const url = `https://api.github.com/repos/${REPO}/contents/${split}/${encodeURIComponent(source)}`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`GitHub listing failed (${response.status}) for ${split}/${source}`);
  return (await response.json()).filter((file) => /\.(jpe?g|png)$/i.test(file.name));
}

for (const [source, target] of Object.entries(CLASSES)) {
  const dir = join("eval/photos", target);
  mkdirSync(dir, { recursive: true });
  const files = [...(await list("test", source)), ...(await list("train", source))];
  const step = Math.max(1, Math.floor(files.length / (perClass * 1.5)));
  let saved = 0;
  for (let i = 0; i < files.length && saved < perClass; i += step) {
    const dest = join(dir, `${String(i).padStart(4, "0")}.jpg`);
    if (existsSync(dest)) { saved++; continue; }
    try {
      const response = await fetch(files[i].download_url, { headers });
      if (!response.ok) continue;
      const image = await sharp(Buffer.from(await response.arrayBuffer())).rotate().jpeg({ quality: 92 }).toBuffer();
      writeFileSync(dest, image);
      saved++;
    } catch {
      // Some dataset entries are broken links or corrupt files: skip them.
    }
  }
  console.log(`${target}: ${saved} photos`);
}
