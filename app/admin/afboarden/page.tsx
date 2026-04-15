import { requireAdminUser } from "@/lib/session";
import { listOffboardingForAdmin } from "@/lib/offboarding";
import { listAllUsers } from "@/lib/users";
import AdminAfboardenClient from "@/app/admin/afboarden/AdminAfboardenClient";

export default async function AdminAfboardenPage() {
  await requireAdminUser();
  const [items, users] = await Promise.all([listOffboardingForAdmin(), listAllUsers()]);
  return <AdminAfboardenClient items={items} users={users} />;
}
