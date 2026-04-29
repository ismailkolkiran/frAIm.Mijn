import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendAdminRequestNotificationEmail } from "@/lib/email";
import { getSessionUser } from "@/lib/session";
import {
  calculateWorkingHours,
  createLeaveRequest,
  ensureLeaveAllocation,
  listHolidays,
  listMyLeaveRequests,
} from "@/lib/leave";

const requestSchema = z.object({
  startdatum: z.string().min(10),
  einddatum: z.string().min(10),
  verloftype: z.enum(["jaarlijks_verlof", "onbetaald_verlof", "ouderschapsverlof", "zwangerschapsverlof"]),
  opmerkingen: z.string().optional(),
});

export async function GET() {
  const user = await getSessionUser();
  const year = new Date().getFullYear();

  const [allocation, holidays, requests] = await Promise.all([
    ensureLeaveAllocation(user.id, year),
    listHolidays(year),
    listMyLeaveRequests(user.id, year),
  ]);

  return NextResponse.json({ allocation, holidays, requests });
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  const payload = await request.json();
  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige invoer." }, { status: 400 });
  }

  const uren = await calculateWorkingHours(parsed.data.startdatum, parsed.data.einddatum);
  if (uren <= 0) {
    return NextResponse.json({ error: "Geen geldige werkuren geselecteerd." }, { status: 400 });
  }

  const requestId = await createLeaveRequest({
    userId: user.id,
    startdatum: parsed.data.startdatum,
    einddatum: parsed.data.einddatum,
    uren,
    verloftype: parsed.data.verloftype,
    opmerkingen: parsed.data.opmerkingen ?? null,
  });

  try {
    await sendAdminRequestNotificationEmail({
      type: "verlof",
      employeeName: user.volledige_naam,
      employeeEmail: user.email,
      details: `${parsed.data.verloftype}: ${parsed.data.startdatum} t/m ${parsed.data.einddatum} (${uren} uur)`,
    });
  } catch (error) {
    console.error("Admin leave notification failed:", error);
  }

  return NextResponse.json({ ok: true, requestId, uren });
}
