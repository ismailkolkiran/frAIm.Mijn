"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-slate-700">Token wordt gecontroleerd...</p>
      </main>
    }>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch("/api/auth/verify-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((response) => {
        if (!response.ok) {
          router.replace("/login?error=invalid_token");
          return;
        }
        router.replace("/dashboard/home");
      })
      .catch(() => {
        router.replace("/login?error=invalid_token");
      });
  }, [router, searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <p className="text-slate-700">Token wordt gecontroleerd...</p>
    </main>
  );
}
