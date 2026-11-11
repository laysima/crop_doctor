import { timingSafeEqual } from "node:crypto";
import { getSession } from "@/lib/auth";
import { diagnose, DiagnosisError } from "@/lib/diagnosis/diagnose";
import { DAILY_SCAN_LIMIT, saveScan, scansToday } from "@/lib/scans";

const MAX_IMAGES = 8;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_TOTAL_BYTES = 4 * 1024 * 1024; // stays under Vercel's 4.5 MB request limit
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function fail(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

/** `npm run eval` sends this instead of signing in. Leave EVAL_TOKEN unset in production. */
function isEvalRequest(request: Request) {
  const expected = process.env.EVAL_TOKEN;
  const given = request.headers.get("x-eval-token");
  if (!expected || !given || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

export async function POST(request: Request) {
  const isEval = isEvalRequest(request);
  let userId: string | null = null;

  if (!isEval) {
    const session = await getSession();
    if (!session) return fail(401, "sign_in_required", "Sign in to scan a plant.");
    userId = session.user.id;
    if ((await scansToday(userId)) >= DAILY_SCAN_LIMIT) {
      return fail(429, "daily_limit", `You have used today's ${DAILY_SCAN_LIMIT} scans. Try again tomorrow.`);
    }
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "bad_request", "Send the photo as multipart form data.");
  }

  const images = form.getAll("image").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const cropField = form.get("crop");
  // Optional hint from the farmer. It goes into the prompt, so keep it short and on one line.
  const cropHint = typeof cropField === "string" ? cropField.replace(/\s+/g, " ").trim().slice(0, 40) || null : null;

  if (images.length === 0) return fail(400, "missing_image", "Add a photo of the plant.");
  if (images.length > MAX_IMAGES) return fail(400, "too_many_images", `Send at most ${MAX_IMAGES} images.`);
  if (images.some((image) => !ALLOWED_TYPES.has(image.type))) {
    return fail(415, "unsupported_image", "Use JPEG, PNG or WebP images.");
  }
  if (
    images.some((image) => image.size > MAX_IMAGE_BYTES) ||
    images.reduce((total, image) => total + image.size, 0) > MAX_TOTAL_BYTES
  ) {
    return fail(413, "image_too_large", "The photos are too large.");
  }

  try {
    const result = await diagnose({
      images: await Promise.all(
        images.map(async (image) => ({ bytes: new Uint8Array(await image.arrayBuffer()), mimeType: image.type })),
      ),
      cropHint,
    });
    if (userId) await saveScan(userId, result);
    console.info(
      JSON.stringify({
        event: "diagnosis",
        ...result.audit,
        eval: isEval,
        outcome: result.outcome,
        crop: result.crop?.name ?? null,
        top: result.candidates[0]?.name ?? null,
      }),
    );
    return Response.json(result);
  } catch (error) {
    if (error instanceof DiagnosisError) {
      console.error(JSON.stringify({ event: "diagnosis_failed", message: error.message }));
      return error.retryable
        ? fail(503, "ai_busy", "The diagnosis service is busy. Try again shortly.")
        : fail(502, "ai_unavailable", "The diagnosis service could not read this photo.");
    }
    throw error;
  }
}
