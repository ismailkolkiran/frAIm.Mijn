import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/session";
import { createVehicle, listAllMaintenanceLogs, listAllVehicles } from "@/lib/fleet";

const schema = z.object({ type: z.string().min(2), beschrijving: z.string().nullable().optional(), merk: z.string().nullable().optional(), model: z.string().nullable().optional(), nummerplaat: z.string().nullable().optional(), status: z.string().nullable().optional(), verzekering_vervalt: z.string().nullable().optional(), notities: z.string().nullable().optional() });

export async function GET() {
  await requireAdminUser();
  const [vehicles, maintenance] = await Promise.all([listAllVehicles(), listAllMaintenanceLogs()]);
  return NextResponse.json({ vehicles, maintenance });
}

export async function POST(request: NextRequest) {
  await requireAdminUser();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige voertuiggegevens." }, { status: 400 });
  await createVehicle({ ...parsed.data, beschrijving: parsed.data.beschrijving ?? null, merk: parsed.data.merk ?? null, model: parsed.data.model ?? null, nummerplaat: parsed.data.nummerplaat ?? null, status: parsed.data.status ?? "beschikbaar", verzekering_vervalt: parsed.data.verzekering_vervalt ?? null, notities: parsed.data.notities ?? null });
  return NextResponse.json({ ok: true });
}
