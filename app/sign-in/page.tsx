import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "../components/logo";
import { getSession } from "@/lib/auth";
import { GoogleButton } from "./google-button";

export const metadata: Metadata = { title: "Sign in · Crop Doctor" };

async function RedirectIfSignedIn() {
  if (await getSession()) redirect("/lab");
  return null;
}

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <Suspense>
        <RedirectIfSignedIn />
      </Suspense>
      <div className="w-full max-w-sm rounded-3xl bg-white p-7 sm:p-9">
        <Link href="/" aria-label="Crop Doctor home">
          <Logo />
        </Link>
        <h1 className="mt-8 text-[30px] leading-tight font-medium tracking-[-0.035em]">Sign in to scan a plant</h1>
        <p className="mt-3 text-[15px] leading-snug text-muted">
          Your account keeps your past scans in one place.
        </p>
        <div className="mt-8">
          <GoogleButton />
        </div>
        <p className="mt-6 text-sm leading-snug text-muted">
          We keep your name, email and scan results. Photos are not stored.
        </p>
      </div>
    </main>
  );
}
