import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/session";
import { updateLeaveStatus } from "@/lib/leave";
import { sendBackofficeLeaveEmail, sendLeaveApprovedEmail, sendLeaveRejectedEmail } from "@/lib/email";

const actionSchema = z.object({
  status: z.enum(["goedgekeurd", "afgewezen"]),
  adminOpmerkingen: z.string().nullable().optional(),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdminUser();
  const payload = await request.json();
  const parsed = actionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige actie." }, { status: 400 });
  }

  const updated = await updateLeaveStatus({
    requestId: Number(params.id),
    status: parsed.data.status,
    adminId: admin.id,
    adminOpmerkingen: parsed.data.adminOpmerkingen ?? null,
  });

  if (!updated) {
    return NextResponse.json({ error: "Aanvraag niet gevonden." }, { status: 404 });
  }

  if (updated.status === "goedgekeurd") {
    await Promise.all([
      sendLeaveApprovedEmail({
        to: updated.email,
        naam: updated.volledige_naam,
        startdatum: updated.startdatum,
        einddatum: updated.einddatum,
      }),
      sendBackofficeLeaveEmail({
        naam: updated.volledige_naam,
        startdatum: updated.startdatum,
        einddatum: updated.einddatum,
      }),
    ]);
  } else {
    await sendLeaveRejectedEmail({
      to: updated.email,
      naam: updated.volledige_naam,
      startdatum: updated.startdatum,
      einddatum: updated.einddatum,
      opmerkingen: updated.admin_opmerkingen,
    });
  }

  return NextResponse.json({ ok: true, updated });
}
