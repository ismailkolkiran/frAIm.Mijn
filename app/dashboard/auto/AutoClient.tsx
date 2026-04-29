"use client";

import { FormEvent, useState } from "react";

type Vehicle = { id:number; merk:string|null; model:string|null; nummerplaat:string|null; verzekering_vervalt:string|null; status:string|null; notities:string|null } | null;
type Log = { id:number; onderhoudsdatum:string|null; type:string|null; beschrijving:string|null; kosten:string|null; garagenaam:string|null; notities:string|null };

export default function AutoClient({ vehicle, maintenance }: { vehicle: Vehicle; maintenance: Log[] }) {
  const [logs, setLogs] = useState(maintenance);
  const [onderhoudsdatum, setOnderhoudsdatum] = useState("");
  const [type, setType] = useState("onderhoud");
  const [beschrijving, setBeschrijving] = useState("");
  const [kilometerstand, setKilometerstand] = useState("");
  const [extraOpmerkingen, setExtraOpmerkingen] = useState("");
  const [kosten, setKosten] = useState("");
  const [garagenaam, setGaragenaam] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const r = await fetch("/api/auto", { cache: "no-store" });
    const p = await r.json();
    setLogs(p.maintenance ?? []);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus(null); setError(null);
    const r = await fetch("/api/auto/maintenance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ onderhoudsdatum, type, beschrijving, kilometerstand: Number(kilometerstand), extraOpmerkingen: extraOpmerkingen || null, kosten: kosten ? Number(kosten) : null, garagenaam: garagenaam || null, notities: null }) });
    const p = await r.json();
    if (!r.ok) { setError(p.error ?? "Melding mislukt."); return; }
    setStatus(p.approvalRequired ? "Melding opgeslagen. Kosten > €500: admin approval vereist." : "Melding opgeslagen.");
    setOnderhoudsdatum(""); setType("onderhoud"); setBeschrijving(""); setKilometerstand(""); setExtraOpmerkingen(""); setKosten(""); setGaragenaam("");
    await refresh();
  }

  if (!vehicle) return <section className="rounded-xl border border-slate-200 bg-white p-6"><h1 className="text-2xl font-semibold">Bedrijfsauto</h1><p className="text-slate-600 mt-2">Je hebt momenteel geen toegewezen voertuig.</p></section>;

  return <section className="space-y-6"><div className="rounded-xl border border-slate-200 bg-white p-6"><h1 className="text-2xl font-semibold">Bedrijfsauto</h1><p className="text-slate-600 mt-1">{vehicle.merk ?? "-"} {vehicle.model ?? "-"} | {vehicle.nummerplaat ?? "-"}</p><p className="text-sm text-slate-600 mt-1">Verzekering vervalt: {vehicle.verzekering_vervalt ? new Date(`${vehicle.verzekering_vervalt}T00:00:00`).toLocaleDateString("nl-BE") : "-"}</p></div><form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6 grid md:grid-cols-2 gap-4"><h2 className="md:col-span-2 text-lg font-semibold">Auto-onderhoud of herstel aanvragen</h2><input type="date" className="rounded border border-slate-300 px-3 py-2" value={onderhoudsdatum} onChange={(e)=>setOnderhoudsdatum(e.target.value)} required/><input className="rounded border border-slate-300 px-3 py-2" value={type} onChange={(e)=>setType(e.target.value)} placeholder="Type (onderhoud/herstel)" required/><input className="md:col-span-2 rounded border border-slate-300 px-3 py-2" value={beschrijving} onChange={(e)=>setBeschrijving(e.target.value)} placeholder="Beschrijving / mankement" required/><input type="number" min="0" className="rounded border border-slate-300 px-3 py-2" value={kilometerstand} onChange={(e)=>setKilometerstand(e.target.value)} placeholder="Kilometerstand" required/><input className="rounded border border-slate-300 px-3 py-2" value={extraOpmerkingen} onChange={(e)=>setExtraOpmerkingen(e.target.value)} placeholder="Extra opmerkingen / mankementen"/><input type="number" min="0" step="0.01" className="rounded border border-slate-300 px-3 py-2" value={kosten} onChange={(e)=>setKosten(e.target.value)} placeholder="Kosten"/><input className="rounded border border-slate-300 px-3 py-2" value={garagenaam} onChange={(e)=>setGaragenaam(e.target.value)} placeholder="Garagenaam"/><button className="md:col-span-2 rounded bg-slate-900 text-white px-4 py-2">Aanvraag indienen</button></form><div className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-semibold">Onderhoudshistorie</h2><ul className="mt-4 divide-y divide-slate-100">{logs.map((l)=><li key={l.id} className="py-3"><p className="font-medium">{l.type ?? "Onderhoud"} - {l.onderhoudsdatum ? new Date(`${l.onderhoudsdatum}T00:00:00`).toLocaleDateString("nl-BE") : "-"}</p><p className="text-sm text-slate-600">{l.beschrijving ?? ""}</p><p className="text-sm text-slate-600">Kosten: {l.kosten ?? "-"} | Garage: {l.garagenaam ?? "-"}</p>{l.notities?.includes("ADMIN_APPROVAL_REQUIRED") ? <p className="text-sm text-amber-700">Admin approval vereist (&gt; €500)</p> : null}</li>)}{logs.length===0?<li className="py-3 text-sm text-slate-500">Nog geen onderhoudsmeldingen.</li>:null}</ul></div>{status?<p className="text-sm text-green-700">{status}</p>:null}{error?<p className="text-sm text-red-700">{error}</p>:null}</section>;
}
