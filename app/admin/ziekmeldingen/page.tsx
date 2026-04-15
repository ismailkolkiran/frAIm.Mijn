import { requireAdminUser } from "@/lib/session";
import { listAllSickReports } from "@/lib/sick-leave";
import AdminZiekmeldingenClient from "@/app/admin/ziekmeldingen/AdminZiekmeldingenClient";

export default async function AdminZiekmeldingenPage() {
  await requireAdminUser();
  const reports = await listAllSickReports();

  return <AdminZiekmeldingenClient reports={reports} />;
}
