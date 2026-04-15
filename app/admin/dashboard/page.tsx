import { requireAdminUser } from "@/lib/session";
import { getActivityFeed, getAdminStats } from "@/lib/admin";

export default async function AdminDashboardPage() {
  await requireAdminUser();
  const [stats, feed] = await Promise.all([getAdminStats(), getActivityFeed()]);

  const cards = [
    ["Totale werknemers", stats.totaalWerknemers],
    ["Openstaande goedkeuringen", stats.openstaandeGoedkeuringen],
    ["Vervallende certificaten", stats.vervallendeCertificaten],
    ["Ziekmeldingen deze maand", stats.ziekmeldingenDezeMaand],
  ] as const;

  return (
    <section className="space-y-6 p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-semibold mt-2">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Activiteitsfeed</h2>
        <ul className="mt-4 divide-y divide-slate-100">
          {feed.map((item, idx) => (
            <li key={idx} className="py-2 text-sm text-slate-700">
              <span className="font-medium mr-2">{item.type}</span>
              {item.tekst}
            </li>
          ))}
          {feed.length === 0 ? <li className="py-2 text-sm text-slate-500">Geen recente activiteit.</li> : null}
        </ul>
      </div>
    </section>
  );
}
