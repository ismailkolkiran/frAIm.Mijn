import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";
import { createMaintenanceLog, getAssignedVehicle } from "@/lib/fleet";

const schema = z.object({ onderhoudsdatum: z.string().min(10), type: z.string().min(2), beschrijving: z.string().min(2), kosten: z.number().nullable().optional(), garagenaam: z.string().nullable().optional(), notities: z.string().nullable().optional() });

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  const vehicle = await getAssignedVehicle(user.id);
  if (!vehicle) return NextResponse.json({ error: "Geen toegewezen voertuig." }, { status: 400 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige onderhoudsmelding." }, { status: 400 });

  const kosten = parsed.data.kosten ?? null;
  const approvalRequired = kosten !== null && kosten > 500;

  await createMaintenanceLog({
    apparatuurId: vehicle.id,
    gerapporteerdDoor: user.id,
    onderhoudsdatum: parsed.data.onderhoudsdatum,
    type: parsed.data.type,
    beschrijving: parsed.data.beschrijving,
    kosten,
    garagenaam: parsed.data.garagenaam ?? null,
    notities: `${parsed.data.notities ?? ""}${approvalRequired ? "\n[ADMIN_APPROVAL_REQUIRED]" : ""}`.trim() || null,
  });

  return NextResponse.json({ ok: true, approvalRequired });
}
