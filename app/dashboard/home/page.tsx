import { getSessionUser } from "@/lib/session";
import { getDashboardMetrics } from "@/lib/dashboard";

export default async function DashboardHome() {
  const user = await getSessionUser();
  const metrics = await getDashboardMetrics(user.id);

  const cards = [
    { title: "Verlof restant (uren)", value: metrics.verlofRestantUren.toFixed(1) },
    { title: "Vervallende certificaten (<60d)", value: String(metrics.vervallendeCertificaten) },
    { title: "Openstaande goedkeuringen", value: String(metrics.openstaandeGoedkeuringen) },
    { title: "Nieuwe documenten (14d)", value: String(metrics.nieuweDocumenten) },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Welkom, {user.volledige_naam}</h1>
        <p className="text-slate-600 mt-1">Functie: {user.functie ?? "Nog niet ingesteld"}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{card.title}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
