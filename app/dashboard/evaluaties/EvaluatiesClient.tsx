"use client";

import { useState } from "react";

type Evaluation = {
  id: number;
  ingeplande_datum: string | null;
  notities: string | null;
  samenvattings_bestand_url: string | null;
  admin_evaluatie: string | null;
  afgerond_op: string | null;
};

export default function EvaluatiesClient({ evaluations }: { evaluations: Evaluation[] }) {
  const [items, setItems] = useState(evaluations);

  async function uploadSummary(id: number, file: File) {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`/api/evaluaties/${id}/summary`, { method: "POST", body: form });
    if (!response.ok) {
      window.alert("Upload mislukt.");
      return;
    }
    const refreshed = await fetch('/api/evaluaties', { cache: 'no-store' });
    const payload = await refreshed.json();
    setItems(payload.evaluations ?? []);
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Evaluaties</h1>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="py-3 space-y-1">
              <p className="font-medium">Gepland: {item.ingeplande_datum ? new Date(item.ingeplande_datum).toLocaleString("nl-BE") : "-"}</p>
              <p className="text-sm text-slate-600">Admin notities: {item.notities ?? "-"}</p>
              {item.samenvattings_bestand_url ? (
                <a className="text-sm underline" href={item.samenvattings_bestand_url} target="_blank" rel="noreferrer">Samenvatting openen</a>
              ) : (
                <input type="file" accept="application/pdf,text/plain,.doc,.docx" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) void uploadSummary(item.id, f); }} />
              )}
              {item.admin_evaluatie ? <p className="text-sm text-slate-700">Eindbeoordeling: {item.admin_evaluatie}</p> : null}
            </li>
          ))}
          {items.length === 0 ? <li className="py-3 text-sm text-slate-500">Nog geen evaluaties ingepland.</li> : null}
        </ul>
      </div>
    </section>
  );
}
