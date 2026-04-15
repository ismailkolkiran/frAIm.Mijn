import { getSessionUser } from "@/lib/session";
import { ensureLeaveAllocation, listHolidays, listMyLeaveRequests } from "@/lib/leave";
import VerlofClient from "@/app/dashboard/verlof/VerlofClient";

export default async function VerlofPage() {
  const user = await getSessionUser();
  const year = new Date().getFullYear();

  const [allocation, holidays, requests] = await Promise.all([
    ensureLeaveAllocation(user.id, year),
    listHolidays(year),
    listMyLeaveRequests(user.id, year),
  ]);

  if (!allocation) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Verlof</h1>
        <p className="text-slate-600 mt-2">Geen verlofallocatie gevonden.</p>
      </section>
    );
  }

  return <VerlofClient initialAllocation={allocation} initialHolidays={holidays} initialRequests={requests} />;
}
