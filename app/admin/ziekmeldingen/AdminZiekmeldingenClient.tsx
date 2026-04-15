"use client";

type Report = {
  id: number;
  volledige_naam: string;
  email: string;
  startdatum: string;
  einddatum: string;
  reden: string | null;
  briefje_url: string | null;
  briefje_geupload_op: string | null;
  aangemaakt_op: string;
};

function olderThan24h(dateValue: string) {
  const created = new Date(dateValue).getTime();
  return Date.now() - created > 24 * 60 * 60 * 1000;
}

export default function AdminZiekmeldingenClient({ reports }: { reports: Report[] }) {
  const missingLate = reports.filter((r) => !r.briefje_url && olderThan24h(r.aangemaakt_op));

  return (
    <section className="space-y-6 p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Admin - Ziekmeldingen</h1>
        <p className="text-slate-600 mt-1">Briefje ontbreekt &gt;24u: {missingLate.length}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <ul className="divide-y divide-slate-100">
          {reports.map((report) => {
            const missing = !report.briefje_url;
            const late = missing && olderThan24h(report.aangemaakt_op);

            return (
              <li key={report.id} className="py-3 space-y-1">
                <p className="font-medium">{report.volledige_naam} ({report.email})</p>
                <p className="text-sm text-slate-600">
                  {new Date(`${report.startdatum}T00:00:00`).toLocaleDateString("nl-BE")} - {new Date(`${report.einddatum}T00:00:00`).toLocaleDateString("nl-BE")}
                </p>
                <p className="text-sm text-slate-600">Reden: {report.reden ?? "-"}</p>
                {late ? <p className="text-sm font-medium text-red-700">Briefje ontbreekt!</p> : null}
                {report.briefje_url ? (
                  <a className="text-sm underline" href={report.briefje_url} target="_blank" rel="noreferrer">Briefje openen</a>
                ) : (
                  <p className="text-sm text-slate-500">Nog geen briefje geüpload.</p>
                )}
              </li>
            );
          })}
          {reports.length === 0 ? <li className="py-3 text-sm text-slate-500">Geen ziekmeldingen.</li> : null}
        </ul>
      </div>
    </section>
  );
}
