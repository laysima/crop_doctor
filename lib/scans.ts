import "server-only";
import type { Diagnosis } from "./diagnosis/diagnose";
import { db } from "./db";

export const DAILY_SCAN_LIMIT = Number(process.env.DAILY_SCAN_LIMIT ?? 20);

type ScanDocument = {
  userId: string;
  createdAt: Date;
  status: "analysed";
  // Photos are not stored yet: only what the AI concluded.
  diagnosis: Omit<Diagnosis, "audit">;
  audit: Diagnosis["audit"];
};

const scans = db.collection<ScanDocument>("scans");
let indexReady: Promise<string> | undefined;

function startOfUtcDay() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function scansToday(userId: string) {
  indexReady ??= scans.createIndex({ userId: 1, createdAt: -1 });
  await indexReady;
  return scans.countDocuments({ userId, createdAt: { $gte: startOfUtcDay() } });
}

export async function saveScan(userId: string, { audit, ...diagnosis }: Diagnosis) {
  await scans.insertOne({ userId, createdAt: new Date(), status: "analysed", diagnosis, audit });
}
