"use client";

import { FormEvent, useMemo, useState } from "react";

type Report = {
  id: number;
  startdatum: string;
  einddatum: string;
  reden: string | null;
  briefje_url: string | null;
  briefje_geupload_op: string | null;
  doktersbezoek_random: boolean;
  aangemaakt_op: string;
};

export default function ZiekmeldingenClient({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState(initialReports);
  const [startdatum, setStartdatum] = useState("");
  const [einddatum, setEinddatum] = useState("");
  const [reden, setReden] = useState("");
  const [doktersbezoekRandom, setDoktersbezoekRandom] = useState(false);
  const [bevestigd, setBevestigd] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const missingCount = useMemo(
    () => reports.filter((r) => !r.briefje_url).length,
    [reports],
  );

  async function refresh() {
    const response = await fetch("/api/ziekmeldingen", { cache: "no-store" });
    const payload = await response.json();
    setReports(payload.reports ?? []);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus(null);
    setError(null);

    const response = await fetch("/api/ziekmeldingen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startdatum,
        einddatum,
        reden,
        doktersbezoek_random: doktersbezoekRandom,
        bevestigd_door_werknemer: bevestigd,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Ziekmelding mislukt.");
      return;
    }

    setStatus("Ziekmelding geregistreerd.");
    setStartdatum("");
    setEinddatum("");
    setReden("");
    setDoktersbezoekRandom(false);
    setBevestigd(false);
    await refresh();
  }

  async function uploadNote(reportId: number, file: File) {
    setUploadingId(reportId);
    setError(null);

    const body = new FormData();
    body.append("file", file);

    const response = await fetch(`/api/ziekmeldingen/${reportId}/briefje`, {
      method: "POST",
      body,
    });

    setUploadingId(null);

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Upload mislukt." }));
      setError(payload.error ?? "Upload mislukt.");
      return;
    }

    setStatus("Doktersbriefje geüpload.");
    await refresh();
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Ziekmeldingen</h1>
        <p className="text-slate-600 mt-1">Openstaande briefjes: {missingCount}</p>
      </div>

      <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold">Nieuwe ziekmelding</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Startdatum</span>
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2" type="date" value={startdatum} onChange={(e) => setStartdatum(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Einddatum</span>
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2" type="date" value={einddatum} onChange={(e) => setEinddatum(e.target.value)} required />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Reden (optioneel)</span>
            <textarea className="mt-1 w-full rounded border border-slate-300 px-3 py-2" rows={3} value={reden} onChange={(e) => setReden(e.target.value)} />
          </label>
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={doktersbezoekRandom} onChange={(e) => setDoktersbezoekRandom(e.target.checked)} />
          <span>Ik begrijp dat de bedrijfsarbeidsgeneesheer random kan langskomen.</span>
        </label>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={bevestigd} onChange={(e) => setBevestigd(e.target.checked)} required />
          <span>Ik bevestig dat ik binnen 24 uur mijn doktersbriefje upload indien vereist.</span>
        </label>

        <button className="rounded bg-slate-900 text-white px-4 py-2">Ziekmelding indienen</button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Mijn meldingen</h2>
        <ul className="mt-4 divide-y divide-slate-100">
          {reports.map((report) => (
            <li key={report.id} className="py-3 space-y-2">
              <p className="font-medium">
                {new Date(`${report.startdatum}T00:00:00`).toLocaleDateString("nl-BE")} - {new Date(`${report.einddatum}T00:00:00`).toLocaleDateString("nl-BE")}
              </p>
              <p className="text-sm text-slate-600">Reden: {report.reden ?? "-"}</p>
              {report.briefje_url ? (
                <a className="text-sm underline" href={report.briefje_url} target="_blank" rel="noreferrer">Doktersbriefje openen</a>
              ) : (
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="application/pdf,image/png,image/jpeg"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void uploadNote(report.id, file);
                      }
                    }}
                  />
                  {uploadingId === report.id ? <span className="text-sm text-slate-600">Uploaden...</span> : null}
                </div>
              )}
            </li>
          ))}
          {reports.length === 0 ? <li className="py-3 text-sm text-slate-500">Nog geen meldingen.</li> : null}
        </ul>
      </div>

      {status ? <p className="text-sm text-green-700">{status}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
