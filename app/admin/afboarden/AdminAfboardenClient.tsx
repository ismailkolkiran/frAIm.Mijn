"use client";

import { FormEvent, useState } from "react";

type Item = { id:number; gebruiker_id:number; volledige_naam:string; email:string; laatste_dag:string|null; status:string|null; items_to_return:string[]; admin_todos:string[]; bevestigd_op:string|null };
type User = { id:number; volledige_naam:string; email:string };

export default function AdminAfboardenClient({ items, users }: { items: Item[]; users: User[] }) {
  const [list, setList] = useState(items);
  const [userId, setUserId] = useState(users[0]?.id ?? 0);
  const [laatsteDag, setLaatsteDag] = useState("");
  const [itemsText, setItemsText] = useState(`Bedrijfsauto
Telefoon + oplader
Laptop + randapparatuur
Sleutels, badge
Openstaande documenten`);
  const [todosText, setTodosText] = useState(`Disabelen accounts
Systemen cleanup
Eindafrekening`);

  async function refresh() {
    const r = await fetch('/api/offboarding', { cache: 'no-store' });
    const p = await r.json();
    setList(p.items ?? []);
  }

  async function create(event: FormEvent) {
    event.preventDefault();
    await fetch('/api/offboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        laatsteDag,
        itemsToReturn: itemsText.split("\n").map((s) => s.trim()).filter(Boolean),
        adminTodos: todosText.split("\n").map((s) => s.trim()).filter(Boolean),
      }),
    });
    await refresh();
  }

  async function markDone(id: number) {
    await fetch(`/api/offboarding/${id}`, { method: 'PATCH' });
    await refresh();
  }

  return (
    <section className="space-y-6 p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Admin - Afboarden</h1>
      </div>

      <form onSubmit={create} className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
        <h2 className="text-lg font-semibold">Nieuwe afboarden checklist</h2>
        <select className="rounded border border-slate-300 px-3 py-2" value={userId} onChange={(e)=>setUserId(Number(e.target.value))}>
          {users.map((u) => <option key={u.id} value={u.id}>{u.volledige_naam} ({u.email})</option>)}
        </select>
        <input type="date" className="rounded border border-slate-300 px-3 py-2 block" value={laatsteDag} onChange={(e)=>setLaatsteDag(e.target.value)} required />
        <textarea className="w-full rounded border border-slate-300 px-3 py-2" rows={5} value={itemsText} onChange={(e)=>setItemsText(e.target.value)} />
        <textarea className="w-full rounded border border-slate-300 px-3 py-2" rows={4} value={todosText} onChange={(e)=>setTodosText(e.target.value)} />
        <button className="rounded bg-slate-900 text-white px-4 py-2">Checklist aanmaken</button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <ul className="divide-y divide-slate-100">
          {list.map((item) => (
            <li key={item.id} className="py-3 space-y-2">
              <p className="font-medium">{item.volledige_naam} ({item.email})</p>
              <p className="text-sm text-slate-600">Deadline: {item.laatste_dag ? new Date(`${item.laatste_dag}T00:00:00`).toLocaleDateString("nl-BE") : "-"} | Status: {item.status}</p>
              <p className="text-sm text-slate-600">Bevestigd op: {item.bevestigd_op ? new Date(item.bevestigd_op).toLocaleString("nl-BE") : "Nog niet"}</p>
              <button onClick={() => void markDone(item.id)} className="rounded bg-slate-700 text-white px-3 py-1 text-sm">Markeer afgerond</button>
            </li>
          ))}
          {list.length === 0 ? <li className="py-3 text-sm text-slate-500">Geen afboarden dossiers.</li> : null}
        </ul>
      </div>
    </section>
  );
}
