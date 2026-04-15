import { requireAdminUser } from "@/lib/session";
import { listEmployees } from "@/lib/admin";

export default async function AdminReportsPage() {
  await requireAdminUser();
  const employees = await listEmployees();

  return (
    <section className="space-y-6 p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6"><h1 className="text-2xl font-semibold">Admin - Rapportage</h1></div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
        <a className="inline-block rounded bg-slate-900 text-white px-4 py-2" href="/api/admin/reports?kind=leave">Export verlofrapport (Excel)</a>
        <a className="inline-block rounded bg-slate-900 text-white px-4 py-2 ml-2" href="/api/admin/reports?kind=sick">Export ziekmeldingen (Excel)</a>
        <a className="inline-block rounded bg-slate-900 text-white px-4 py-2 ml-2" href="/api/admin/reports?kind=compliance">Export compliance (Excel)</a>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold mb-3">Employee dossier (JSON)</h2>
        <ul className="divide-y divide-slate-100">
          {employees.map((e) => (
            <li key={e.id} className="py-2 flex items-center justify-between gap-4">
              <span className="text-sm">{e.volledige_naam} ({e.email})</span>
              <a className="text-sm underline" href={`/api/admin/reports?kind=dossier&userId=${e.id}`}>Download JSON</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
