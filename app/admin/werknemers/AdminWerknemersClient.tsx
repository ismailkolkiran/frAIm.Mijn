"use client";

import { FormEvent, useState } from "react";

type Employee = { id: number; email: string; volledige_naam: string; functie: string | null; startdatum: string | null; status: string };

export default function AdminWerknemersClient({ initialEmployees }: { initialEmployees: Employee[] }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [email, setEmail] = useState("");
  const [naam, setNaam] = useState("");
  const [functie, setFunctie] = useState("");
  const [startdatum, setStartdatum] = useState("");

  async function refresh() {
    const r = await fetch('/api/admin/werknemers', { cache: 'no-store' });
    const p = await r.json();
    setEmployees(p.employees ?? []);
  }

  async function create(event: FormEvent) {
    event.preventDefault();
    await fetch('/api/admin/werknemers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, volledigeNaam: naam, functie: functie || null, startdatum: startdatum || null }) });
    setEmail(''); setNaam(''); setFunctie(''); setStartdatum('');
    await refresh();
  }

  async function deactivate(id: number) {
    await fetch(`/api/admin/werknemers/${id}?action=deactivate`, { method: 'POST' });
    await refresh();
  }

  async function resetPassword(id: number) {
    const r = await fetch(`/api/admin/werknemers/${id}?action=reset-password`, { method: 'POST' });
    const p = await r.json();
    if (p?.reset?.tempPassword) {
      window.alert(`Tijdelijk wachtwoord: ${p.reset.tempPassword}`);
    }
  }

  async function remove(id: number) {
    await fetch(`/api/admin/werknemers/${id}`, { method: 'DELETE' });
    await refresh();
  }

  return (
    <section className="space-y-6 p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6"><h1 className="text-2xl font-semibold">Admin - Werknemers</h1></div>

      <form onSubmit={create} className="rounded-xl border border-slate-200 bg-white p-6 grid md:grid-cols-2 gap-3">
        <input className="rounded border border-slate-300 px-3 py-2" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <input className="rounded border border-slate-300 px-3 py-2" placeholder="Naam" value={naam} onChange={(e)=>setNaam(e.target.value)} required />
        <input className="rounded border border-slate-300 px-3 py-2" placeholder="Functie" value={functie} onChange={(e)=>setFunctie(e.target.value)} />
        <input type="date" className="rounded border border-slate-300 px-3 py-2" value={startdatum} onChange={(e)=>setStartdatum(e.target.value)} />
        <button className="md:col-span-2 rounded bg-slate-900 text-white px-4 py-2">Werknemer toevoegen</button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <ul className="divide-y divide-slate-100">
          {employees.map((e) => (
            <li key={e.id} className="py-3 space-y-1">
              <p className="font-medium">{e.volledige_naam} ({e.email})</p>
              <p className="text-sm text-slate-600">Functie: {e.functie ?? '-'} | Status: {e.status}</p>
              <div className="flex gap-2 pt-1">
                <button onClick={() => void deactivate(e.id)} className="rounded bg-amber-700 text-white px-3 py-1 text-sm">Deactiveer</button>
                <button onClick={() => void resetPassword(e.id)} className="rounded bg-slate-700 text-white px-3 py-1 text-sm">Reset wachtwoord</button>
                <button onClick={() => void remove(e.id)} className="rounded bg-red-700 text-white px-3 py-1 text-sm">Verwijder</button>
              </div>
            </li>
          ))}
          {employees.length === 0 ? <li className="py-3 text-sm text-slate-500">Geen werknemers.</li> : null}
        </ul>
      </div>
    </section>
  );
}
