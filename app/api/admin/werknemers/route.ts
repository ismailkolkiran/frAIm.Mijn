import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/session";
import { createEmployee, listEmployees } from "@/lib/admin";

const createSchema = z.object({
  email: z.string().email(),
  volledigeNaam: z.string().min(2),
  functie: z.string().nullable().optional(),
  startdatum: z.string().nullable().optional(),
});

export async function GET() {
  await requireAdminUser();
  return NextResponse.json({ employees: await listEmployees() });
}

export async function POST(request: NextRequest) {
  await requireAdminUser();
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige input." }, { status: 400 });
  await createEmployee({ ...parsed.data, functie: parsed.data.functie ?? null, startdatum: parsed.data.startdatum ?? null });
  return NextResponse.json({ ok: true });
}
