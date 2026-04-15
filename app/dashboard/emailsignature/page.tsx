import { getSessionUser } from "@/lib/session";
import { getUserSignatureProfile } from "@/lib/users";
import { buildSignatureHtml } from "@/lib/signature";

export default async function EmailSignaturePage() {
  const user = await getSessionUser();
  const profile = await getUserSignatureProfile(user.id);

  if (!profile) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">E-mailhandtekening</h1>
        <p className="text-slate-600 mt-2">Profiel niet gevonden.</p>
      </section>
    );
  }

  const signatureHtml = buildSignatureHtml(profile);

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">E-mailhandtekening</h1>
        <p className="text-slate-600 mt-1">Sjabloon met links naam/functie/foto en rechts contactgegevens.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold mb-3">Live voorbeeld</h2>
        <div className="overflow-auto border border-slate-200 rounded-lg bg-white">
          <iframe title="signature-preview" srcDoc={signatureHtml} className="w-[760px] h-[280px] bg-white" />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
        <a href="/api/emailsignature" className="inline-block rounded bg-slate-900 text-white px-4 py-2">
          Download HTML handtekening
        </a>
        <p className="text-sm text-slate-600">Outlook/Gmail: open instellingen → handtekening → plak de HTML inhoud of importeer het bestand.</p>
      </div>
    </section>
  );
}
