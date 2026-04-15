import { requireAdminUser } from "@/lib/session";
import { listEvaluationsForAdmin } from "@/lib/evaluations";
import { listAllUsers } from "@/lib/users";
import AdminEvaluatiesClient from "@/app/admin/evaluaties/AdminEvaluatiesClient";

export default async function AdminEvaluatiesPage() {
  await requireAdminUser();
  const [evaluations, users] = await Promise.all([listEvaluationsForAdmin(), listAllUsers()]);
  return <AdminEvaluatiesClient evaluations={evaluations} users={users} />;
}
