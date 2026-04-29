"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <p className="text-slate-700">Doorsturen naar login...</p>
    </main>
  );
}
