import { notFound, redirect } from "next/navigation";
import OnboardingClient from "@/app/onboarding/[email]/OnboardingClient";
import { getSessionUser } from "@/lib/session";
import { getOrCreateOnboardingDossier } from "@/lib/onboarding";

export default async function OnboardingPage({ params }: { params: { email: string } }) {
  const user = await getSessionUser();
  const requestedEmail = decodeURIComponent(params.email).toLowerCase();
  const isAdmin = user.email === "ismail.kolkiran@immokeuring.be";

  if (!isAdmin && user.email.toLowerCase() !== requestedEmail) {
    redirect("/dashboard/home");
  }

  if (requestedEmail !== user.email.toLowerCase() && !isAdmin) {
    notFound();
  }

  const dossier = await getOrCreateOnboardingDossier(user.id);
  if (!dossier) notFound();

  return <OnboardingClient userName={user.volledige_naam} userEmail={user.email} initialDossier={dossier} />;
}
