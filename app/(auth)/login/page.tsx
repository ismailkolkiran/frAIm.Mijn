"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("Verzenden...");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error ?? "Loginlink kon niet verzonden worden.");
      setStatus(null);
      return;
    }

    setStatus("Loginlink verzonden. Controleer je inbox.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-semibold">myfrAIm Login</h1>
        <p className="mt-2 text-sm text-slate-600">Log in met je ImmoKeuring e-mailadres.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">E-mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="naam@immokeuring.be"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 text-white py-2.5 font-medium hover:bg-slate-800"
          >
            Verstuur magische link
          </button>
        </form>

        {status ? <p className="mt-4 text-sm text-green-700">{status}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </div>
    </main>
  );
}
