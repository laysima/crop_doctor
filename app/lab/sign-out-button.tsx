"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={signOut} className="min-h-11 shrink-0 rounded-full border border-ink/20 px-4 text-ink transition-colors hover:bg-sage">
      Sign out
    </button>
  );
}
