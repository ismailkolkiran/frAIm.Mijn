"use client";

import { useState } from "react";

type LeaveRequest = {
  id: number;
  volledige_naam: string;
  email: string;
  startdatum: string;
  einddatum: string;
  uren: string | null;
  verloftype: string | null;
  admin_opmerkingen: string | null;
};

export default function AdminVerlofClient({ initialRequests }: { initialRequests: LeaveRequest[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [savingId, setSavingId] = useState<number | null>(null);

  async function handleAction(id: number, status: "goedgekeurd" | "afgewezen") {
    const notes = window.prompt("Admin opmerking (optioneel):") ?? "";
    setSavingId(id);

    const response = await fetch(`/api/admin/verlofaanvragen/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminOpmerkingen: notes || null }),
    });

    setSavingId(null);

    if (!response.ok) {
      window.alert("Actie mislukt.");
      return;
    }

    setRequests((current) => current.filter((item) => item.id !== id));
  }

  return (
    <section className="space-y-6 p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Admin - Verlofaanvragen</h1>
        <p className="text-slate-600 mt-1">Openstaande aanvragen: {requests.length}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <ul className="divide-y divide-slate-100">
          {requests.map((req) => (
            <li key={req.id} className="py-4 flex flex-col gap-3">
              <div>
                <p className="font-medium">{req.volledige_naam} ({req.email})</p>
                <p className="text-sm text-slate-600">
                  {new Date(`${req.startdatum}T00:00:00`).toLocaleDateString("nl-BE")} - {new Date(`${req.einddatum}T00:00:00`).toLocaleDateString("nl-BE")} ({req.uren ?? "0"} uur) | Type: {req.verloftype ?? "-"}
                </p>
                {req.admin_opmerkingen ? <p className="text-sm text-slate-600">Notitie werknemer: {req.admin_opmerkingen}</p> : null}
              </div>
              <div className="flex gap-2">
                <button disabled={savingId === req.id} onClick={() => void handleAction(req.id, "goedgekeurd")} className="rounded bg-green-700 text-white px-3 py-2 text-sm disabled:opacity-60">Goedkeuren</button>
                <button disabled={savingId === req.id} onClick={() => void handleAction(req.id, "afgewezen")} className="rounded bg-red-700 text-white px-3 py-2 text-sm disabled:opacity-60">Afwijzen</button>
              </div>
            </li>
          ))}
          {requests.length === 0 ? <li className="py-3 text-sm text-slate-500">Geen openstaande aanvragen.</li> : null}
        </ul>
      </div>
    </section>
  );
}
