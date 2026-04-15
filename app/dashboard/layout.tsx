import Link from "next/link";
import { logout } from "@/lib/auth-actions";
import { getSessionUser } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  const links = [
    { href: "/dashboard/home", label: "Home" },
    { href: "/dashboard/profiel", label: "Profiel" },
    { href: "/dashboard/verlof", label: "Verlof" },
    { href: "/dashboard/ziekmeldingen", label: "Ziekmeldingen" },
    { href: "/dashboard/auto", label: "Bedrijfsauto" },
    { href: "/dashboard/certificaten", label: "Certificaten" },
    { href: "/dashboard/trainingen", label: "Trainingen" },
    { href: "/dashboard/emailsignature", label: "E-mailhandtekening" },
    { href: "/dashboard/documenten", label: "Documenten" },
  ];

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-slate-900 text-white p-6 space-y-4">
        <p className="text-lg font-semibold">Mijn ImmoKeuring</p>
        <nav className="space-y-1">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded px-3 py-2 hover:bg-slate-800">
              {item.label}
            </Link>
          ))}
          {user.email === "ismail.kolkiran@immokeuring.be" ? (
            <>
              <Link href="/admin/dashboard" className="block rounded px-3 py-2 hover:bg-slate-800">
                Admin Dashboard
              </Link>
              <Link href="/admin/werknemers" className="block rounded px-3 py-2 hover:bg-slate-800">
                Admin Werknemers
              </Link>
              <Link href="/admin/reports" className="block rounded px-3 py-2 hover:bg-slate-800">
                Admin Rapportage
              </Link>
              <Link href="/admin/verlofaanvragen" className="block rounded px-3 py-2 hover:bg-slate-800">
                Admin Verlofaanvragen
              </Link>
              <Link href="/admin/ziekmeldingen" className="block rounded px-3 py-2 hover:bg-slate-800">
                Admin Ziekmeldingen
              </Link>
              <Link href="/admin/trainingen" className="block rounded px-3 py-2 hover:bg-slate-800">
                Admin Trainingen
              </Link>
              <Link href="/admin/fleet" className="block rounded px-3 py-2 hover:bg-slate-800">
                Admin Wagenpark
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
