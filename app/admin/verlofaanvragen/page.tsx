import { listPendingLeaveRequests } from "@/lib/leave";
import { requireAdminUser } from "@/lib/session";
import AdminVerlofClient from "@/app/admin/verlofaanvragen/AdminVerlofClient";

export default async function AdminVerlofPage() {
  await requireAdminUser();
  const requests = await listPendingLeaveRequests();

  return <AdminVerlofClient initialRequests={requests} />;
}
