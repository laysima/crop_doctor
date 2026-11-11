import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { DiagnosisLab } from "./diagnosis-lab";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = {
  title: "Scan a plant · Crop Doctor",
  robots: { index: false },
};

async function SignedInLab() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  return (
    <>
      <div className="flex items-center justify-between gap-4 text-sm text-muted">
        <span className="truncate">Signed in as {session.user.name || session.user.email}</span>
        <SignOutButton />
      </div>
      <DiagnosisLab />
    </>
  );
}

export default function LabPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-12">
      <Link href="/" className="text-[15px] text-muted transition-opacity hover:opacity-60">← Crop Doctor</Link>
      <h1 className="mt-4 text-4xl font-medium tracking-[-0.035em]">Scan a plant</h1>
      <p className="mt-3 mb-8 text-[15px] leading-snug text-muted">
        Upload a photo or short video of any crop. Files are shrunk before sending to save data. Early preview: results are AI suggestions, not yet reviewed by an expert.
      </p>
      <Suspense fallback={<p className="text-[15px] text-muted">Checking your sign-in…</p>}>
        <SignedInLab />
      </Suspense>
    </main>
  );
}
