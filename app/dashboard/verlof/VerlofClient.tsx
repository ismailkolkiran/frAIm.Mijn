"use client";

import { FormEvent, useMemo, useState } from "react";

type Allocation = {
  jaar: number;
  beschikbare_uren: string;
  gebruikte_uren: string;
  meegenomen_uren: string;
};

type Holiday = {
  id: number;
  datum: string;
  naam: string;
  vervangdatum: string | null;
};

type LeaveRequest = {
  id: number;
  startdatum: string;
  einddatum: string;
  uren: string | null;
  verloftype: string | null;
  status: "in_afwachting" | "goedgekeurd" | "afgewezen";
  admin_opmerkingen: string | null;
};

export default function VerlofClient({
  initialAllocation,
  initialHolidays,
  initialRequests,
}: {
  initialAllocation: Allocation;
  initialHolidays: Holiday[];
  initialRequests: LeaveRequest[];
}) {
  const [allocation, setAllocation] = useState(initialAllocation);
  const [holidays] = useState(initialHolidays);
  const [requests, setRequests] = useState(initialRequests);
  const [startdatum, setStartdatum] = useState("");
  const [einddatum, setEinddatum] = useState("");
  const [verloftype, setVerloftype] = useState("vakantie");
  const [opmerkingen, setOpmerkingen] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const restant = useMemo(() => {
    const beschikbaar = Number(allocation.beschikbare_uren ?? 0);
    const meegenomen = Number(allocation.meegenomen_uren ?? 0);
    const gebruikt = Number(allocation.gebruikte_uren ?? 0);
    return beschikbaar + meegenomen - gebruikt;
  }, [allocation]);

  async function refreshData() {
    const response = await fetch("/api/verlof", { cache: "no-store" });
    const payload = await response.json();
    setAllocation(payload.allocation);
    setRequests(payload.requests ?? []);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus(null);
    setError(null);

    const response = await fetch("/api/verlof", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startdatum, einddatum, verloftype, opmerkingen }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Verlofaanvraag mislukt.");
      return;
    }

    setStatus(`Verlofaanvraag ingediend (${payload.uren} uur).`);
    setStartdatum("");
    setEinddatum("");
    setOpmerkingen("");
    await refreshData();
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Verlof</h1>
        <p className="text-slate-600 mt-1">Beschikbaar: {restant.toFixed(1)} uur ({allocation.jaar})</p>
      </div>

      <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold">Nieuwe verlofaanvraag</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Startdatum</span>
            <input type="date" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" value={startdatum} onChange={(e) => setStartdatum(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Einddatum</span>
            <input type="date" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" value={einddatum} onChange={(e) => setEinddatum(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Verloftype</span>
            <select className="mt-1 w-full rounded border border-slate-300 px-3 py-2" value={verloftype} onChange={(e) => setVerloftype(e.target.value)}>
              <option value="vakantie">Vakantie</option>
              <option value="persoonlijk">Persoonlijk</option>
              <option value="rouwen">Rouwen</option>
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Opmerking</span>
            <textarea className="mt-1 w-full rounded border border-slate-300 px-3 py-2" value={opmerkingen} onChange={(e) => setOpmerkingen(e.target.value)} rows={3} />
          </label>
        </div>

        <button className="rounded bg-slate-900 px-4 py-2 text-white">Aanvraag indienen</button>
        {status ? <p className="text-sm text-green-700">{status}</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Bedrijfsfeestdagen</h2>
        <ul className="mt-4 divide-y divide-slate-100">
          {holidays.map((holiday) => (
            <li key={holiday.id} className="py-2 text-sm flex items-center justify-between gap-4">
              <span>{holiday.naam}</span>
              <span className="text-slate-600">
                {new Date(`${(holiday.vervangdatum ?? holiday.datum)}T00:00:00`).toLocaleDateString("nl-BE")}
                {holiday.vervangdatum ? " (vervangdag)" : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Mijn aanvragen</h2>
        <ul className="mt-4 divide-y divide-slate-100">
          {requests.map((req) => (
            <li key={req.id} className="py-3">
              <p className="font-medium">
                {new Date(`${req.startdatum}T00:00:00`).toLocaleDateString("nl-BE")} - {new Date(`${req.einddatum}T00:00:00`).toLocaleDateString("nl-BE")} ({req.uren ?? "0"} uur)
              </p>
              <p className="text-sm text-slate-600">Type: {req.verloftype ?? "-"} | Status: {req.status}</p>
              {req.admin_opmerkingen ? <p className="text-sm text-slate-600">Opmerking: {req.admin_opmerkingen}</p> : null}
            </li>
          ))}
          {requests.length === 0 ? <li className="py-3 text-sm text-slate-500">Nog geen aanvragen.</li> : null}
        </ul>
      </div>
    </section>
  );
}
