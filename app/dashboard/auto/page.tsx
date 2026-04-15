import { getSessionUser } from "@/lib/session";
import { getAssignedVehicle, listMaintenanceForVehicle } from "@/lib/fleet";
import AutoClient from "@/app/dashboard/auto/AutoClient";

export default async function AutoPage() {
  const user = await getSessionUser();
  const vehicle = await getAssignedVehicle(user.id);
  const maintenance = vehicle ? await listMaintenanceForVehicle(vehicle.id) : [];
  return <AutoClient vehicle={vehicle} maintenance={maintenance} />;
}
