import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser, requireAdminUser } from "@/lib/session";
import { completeOffboardingByAdmin, confirmOffboardingByUser, updateOffboardingChecklist } from "@/lib/offboarding";
import { getUserById } from "@/lib/users";
import { sendOffboardingConfirmationEmail } from "@/lib/email";

const updateSchema = z.object({
  itemsToReturn: z.array(z.string().min(1)),
  adminTodos: z.array(z.string().min(1)),
  laatsteDag: z.string().min(10),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminUser();
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige update." }, { status: 400 });
  const updated = await updateOffboardingChecklist({ checklistId: Number(params.id), ...parsed.data });
  return NextResponse.json({ ok: true, updated });
}

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  const updated = await confirmOffboardingByUser(Number(params.id), user.id);
  if (!updated) return NextResponse.json({ error: "Checklist niet gevonden." }, { status: 404 });

  const employee = await getUserById(user.id);
  if (employee) {
    await sendOffboardingConfirmationEmail({
      to: "ismail.kolkiran@immokeuring.be",
      naam: employee.volledige_naam,
      laatsteDag: updated.laatste_dag ?? "",
      itemsToReturn: updated.items_to_return,
      employeeCopyTo: employee.email,
    });
  }

  return NextResponse.json({ ok: true, updated });
}

export async function PATCH(_: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminUser();
  const updated = await completeOffboardingByAdmin(Number(params.id));
  return NextResponse.json({ ok: true, updated });
}
