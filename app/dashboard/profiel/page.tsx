import { getSessionUser } from "@/lib/session";
import { getProfileByUserId, listProfileDocuments } from "@/lib/profile";
import ProfileClient from "@/app/dashboard/profiel/ProfileClient";

export default async function ProfielPage() {
  const user = await getSessionUser();
  const [profile, documents] = await Promise.all([
    getProfileByUserId(user.id),
    listProfileDocuments(user.id),
  ]);

  if (!profile) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Profiel</h1>
        <p className="text-slate-600 mt-2">Profiel niet gevonden.</p>
      </section>
    );
  }

  return <ProfileClient initialProfile={profile} initialDocuments={documents} />;
}
