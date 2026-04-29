import Link from "next/link";
import { logout } from "@/lib/auth-actions";
import { getAdminNotificationCounts } from "@/lib/admin-notifications";
import { getRoleForEmail } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  const isAdmin = getRoleForEmail(user.email) === "admin";
  const notificationCounts = isAdmin ? await getAdminNotificationCounts() : null;
  const badges: Record<string, number> = isAdmin && notificationCounts
    ? {
        "/admin/dashboard": notificationCounts.total,
        "/admin/verlofaanvragen": notificationCounts.leavePending,
        "/admin/ziekmeldingen": notificationCounts.sickOpen,
        "/admin/trainingen": notificationCounts.trainingPending,
        "/admin/fleet": notificationCounts.fleetApprovalRequired,
      }
    : {};

  const links = [
    { href: "/dashboard/home", label: "Home" },
    { href: "/dashboard/profiel", label: "Profiel" },
    { href: "/dashboard/verlof", label: "Verlof" },
    { href: "/dashboard/ziekmeldingen", label: "Ziekmeldingen" },
    { href: "/dashboard/auto", label: "Bedrijfsauto" },
    { href: "/dashboard/certificaten", label: "Hoogst behaalde diploma en certificaten" },
    { href: "/dashboard/trainingen", label: "Jaarlijkse bijscholingen" },
    { href: "/dashboard/emailsignature", label: "E-mailhandtekening" },
    { href: "/dashboard/documenten", label: "Documenten" },
  ];

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-slate-900 text-white p-6 space-y-4">
        <p className="text-lg font-semibold">Mijn ImmoKeuring</p>
        <nav className="space-y-1">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center justify-between rounded px-3 py-2 hover:bg-slate-800">
              <span>{item.label}</span>
            </Link>
          ))}
          {isAdmin ? (
            <>
              <Link href="/admin/dashboard" className="flex items-center justify-between rounded px-3 py-2 hover:bg-slate-800">
                <span>Admin Dashboard</span>
                {badges["/admin/dashboard"] ? <Badge count={badges["/admin/dashboard"]} /> : null}
              </Link>
              <Link href="/admin/werknemers" className="flex items-center justify-between rounded px-3 py-2 hover:bg-slate-800">
                <span>Admin Werknemers</span>
              </Link>
              <Link href="/admin/reports" className="flex items-center justify-between rounded px-3 py-2 hover:bg-slate-800">
                <span>Admin Rapportage</span>
              </Link>
              <Link href="/admin/verlofaanvragen" className="flex items-center justify-between rounded px-3 py-2 hover:bg-slate-800">
                <span>Admin Verlofaanvragen</span>
                {badges["/admin/verlofaanvragen"] ? <Badge count={badges["/admin/verlofaanvragen"]} /> : null}
              </Link>
              <Link href="/admin/ziekmeldingen" className="flex items-center justify-between rounded px-3 py-2 hover:bg-slate-800">
                <span>Admin Ziekmeldingen</span>
                {badges["/admin/ziekmeldingen"] ? <Badge count={badges["/admin/ziekmeldingen"]} /> : null}
              </Link>
              <Link href="/admin/trainingen" className="flex items-center justify-between rounded px-3 py-2 hover:bg-slate-800">
                <span>Admin Trainingen</span>
                {badges["/admin/trainingen"] ? <Badge count={badges["/admin/trainingen"]} /> : null}
              </Link>
              <Link href="/admin/fleet" className="flex items-center justify-between rounded px-3 py-2 hover:bg-slate-800">
                <span>Admin Wagenpark</span>
                {badges["/admin/fleet"] ? <Badge count={badges["/admin/fleet"]} /> : null}
              </Link>
            </>
          ) : null}
        </nav>
      </aside>
      <div className="flex flex-col">
        <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-end">
          <form action={logout}>
            <button className="rounded bg-slate-900 text-white px-4 py-2 text-sm">Uitloggen</button>
          </form>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-semibold text-white">
      {count}
    </span>
  );
}
