import Link from "next/link";
import { logout } from "@/lib/auth-actions";
import { requireAdminUser } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();

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
    { href: "/admin/dashboard", label: "Admin Dashboard" },
    { href: "/admin/werknemers", label: "Admin Werknemers" },
    { href: "/admin/reports", label: "Admin Rapportage" },
    { href: "/admin/verlofaanvragen", label: "Admin Verlofaanvragen" },
    { href: "/admin/ziekmeldingen", label: "Admin Ziekmeldingen" },
    { href: "/admin/trainingen", label: "Admin Trainingen" },
    { href: "/admin/fleet", label: "Admin Wagenpark" },
  ];

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-slate-900 text-white p-6 space-y-4 sticky top-0 h-screen overflow-y-auto">
        <p className="text-lg font-semibold">Mijn ImmoKeuring</p>
        <nav className="space-y-1">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded px-3 py-2 hover:bg-slate-800">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-col min-w-0">
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
