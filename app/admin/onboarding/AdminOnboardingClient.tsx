"use client";

type Item = { gebruiker_id: number; volledige_naam: string; email: string; status: string; progress_pct: number; voltooid: boolean };

export default function AdminOnboardingClient({ items }: { items: Item[] }) {
  return (
    <section className="space-y-6 p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Admin - Onboarding</h1>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.gebruiker_id} className="py-3">
              <p className="font-medium">{item.volledige_naam} ({item.email})</p>
              <p className="text-sm text-slate-600">Status: {item.status} | Progress: {item.progress_pct}% | Voltooid: {item.voltooid ? "Ja" : "Nee"}</p>
              <a className="text-sm underline" href={`/onboarding/${encodeURIComponent(item.email)}`}>Open onboarding</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
