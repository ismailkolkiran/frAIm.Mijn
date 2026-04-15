"use client";

import { FormEvent, useState } from "react";

type Evaluation = {
  id: number;
  gebruiker_id: number;
  volledige_naam: string;
  email: string;
  ingeplande_datum: string | null;
  notities: string | null;
  samenvattings_bestand_url: string | null;
  admin_evaluatie: string | null;
  afgerond_op: string | null;
};

type User = { id: number; volledige_naam: string; email: string };

export default function AdminEvaluatiesClient({ evaluations, users }: { evaluations: Evaluation[]; users: User[] }) {
  const [items, setItems] = useState(evaluations);
  const [gebruikerId, setGebruikerId] = useState(users[0]?.id ?? 0);
  const [datum, setDatum] = useState("");
  const [notities, setNotities] = useState("");

  async function refresh() {
    const r = await fetch('/api/admin/evaluaties', { cache: 'no-store' });
    const p = await r.json();
    setItems(p.evaluations ?? []);
  }

  async function schedule(event: FormEvent) {
    event.preventDefault();
    await fetch('/api/evaluaties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gebruikerId, ingeplandeDatum: datum, notities: notities || null }),
    });
    setDatum('');
    setNotities('');
    await refresh();
  }

  async function finalize(id: number) {
    const adminEvaluatie = window.prompt('Eindbeoordeling (optioneel):') ?? '';
    await fetch(`/api/admin/evaluaties/${id}/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminEvaluatie: adminEvaluatie || null }),
    });
    await refresh();
  }

  return (
    <section className="space-y-6 p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Admin - Evaluaties</h1>
      </div>

      <form onSubmit={schedule} className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
        <h2 className="text-lg font-semibold">Evaluatie plannen</h2>
        <select className="rounded border border-slate-300 px-3 py-2" value={gebruikerId} onChange={(e)=>setGebruikerId(Number(e.target.value))}>
          {users.map((u) => <option key={u.id} value={u.id}>{u.volledige_naam} ({u.email})</option>)}
        </select>
        <input type="datetime-local" className="rounded border border-slate-300 px-3 py-2 block" value={datum} onChange={(e)=>setDatum(e.target.value)} required />
        <textarea className="w-full rounded border border-slate-300 px-3 py-2" rows={3} value={notities} onChange={(e)=>setNotities(e.target.value)} placeholder="Agenda/notities" />
        <button className="rounded bg-slate-900 text-white px-4 py-2">Inplannen</button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="py-3 space-y-1">
              <p className="font-medium">{item.volledige_naam} ({item.email})</p>
              <p className="text-sm text-slate-600">Gepland: {item.ingeplande_datum ? new Date(item.ingeplande_datum).toLocaleString("nl-BE") : '-'}</p>
              <p className="text-sm text-slate-600">Notities: {item.notities ?? '-'}</p>
              {item.samenvattings_bestand_url ? <a href={item.samenvattings_bestand_url} target="_blank" rel="noreferrer" className="text-sm underline">Samenvatting werknemer</a> : <p className="text-sm text-slate-500">Nog geen samenvatting</p>}
              <p className="text-sm text-slate-600">Eindbeoordeling: {item.admin_evaluatie ?? '-'}</p>
              <button onClick={() => void finalize(item.id)} className="rounded bg-slate-700 text-white px-3 py-1 text-sm">Finaliseer evaluatie</button>
            </li>
          ))}
          {items.length === 0 ? <li className="py-3 text-sm text-slate-500">Geen evaluaties.</li> : null}
        </ul>
      </div>
    </section>
  );
}
