import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/session";
import { assignVehicle } from "@/lib/fleet";

const schema = z.object({ vehicleId: z.coerce.number(), userId: z.coerce.number().nullable() });

export async function POST(request: NextRequest) {
  await requireAdminUser();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige toewijzing." }, { status: 400 });
  await assignVehicle(parsed.data.vehicleId, parsed.data.userId);
  return NextResponse.json({ ok: true });
}
