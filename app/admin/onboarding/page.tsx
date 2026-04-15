import { requireAdminUser } from "@/lib/session";
import { listOnboardingForAdmin } from "@/lib/onboarding";
import AdminOnboardingClient from "@/app/admin/onboarding/AdminOnboardingClient";

export default async function AdminOnboardingPage() {
  await requireAdminUser();
  const items = await listOnboardingForAdmin();
  return <AdminOnboardingClient items={items} />;
}
