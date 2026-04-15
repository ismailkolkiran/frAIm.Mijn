import { requireAdminUser } from "@/lib/session";
import { listAllMaintenanceLogs, listAllVehicles } from "@/lib/fleet";
import { listAllUsers } from "@/lib/users";
import AdminFleetClient from "@/app/admin/fleet/AdminFleetClient";

export default async function AdminFleetPage() {
  await requireAdminUser();
  const [vehicles, maintenance, users] = await Promise.all([listAllVehicles(), listAllMaintenanceLogs(), listAllUsers()]);
  return <AdminFleetClient initialVehicles={vehicles} initialMaintenance={maintenance} users={users} />;
}
