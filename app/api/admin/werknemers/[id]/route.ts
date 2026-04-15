import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/session";
import { deactivateEmployee, deleteEmployee, resetEmployeePassword, updateEmployee } from "@/lib/admin";

const updateSchema = z.object({
  volledigeNaam: z.string().min(2),
  functie: z.string().nullable(),
  status: z.enum(["actief", "inactief", "inboarden", "afboarden"]),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminUser();
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige update." }, { status: 400 });
  await updateEmployee({ id: Number(params.id), ...parsed.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminUser();
  await deleteEmployee(Number(params.id));
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminUser();
  const action = new URL(request.url).searchParams.get("action");
  if (action === "deactivate") {
    await deactivateEmployee(Number(params.id));
    return NextResponse.json({ ok: true });
  }
  if (action === "reset-password") {
    const reset = await resetEmployeePassword(Number(params.id));
    return NextResponse.json({ ok: true, reset });
  }
  return NextResponse.json({ error: "Onbekende actie." }, { status: 400 });
}
