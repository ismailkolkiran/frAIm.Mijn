import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getAssignedVehicle, listMaintenanceForVehicle } from "@/lib/fleet";

export async function GET() {
  const user = await getSessionUser();
  const vehicle = await getAssignedVehicle(user.id);
  if (!vehicle) return NextResponse.json({ vehicle: null, maintenance: [] });
  const maintenance = await listMaintenanceForVehicle(vehicle.id);
  return NextResponse.json({ vehicle, maintenance });
}
