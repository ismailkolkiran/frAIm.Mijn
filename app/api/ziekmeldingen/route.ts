import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";
import { createSickReport, listMySickReports } from "@/lib/sick-leave";
import { sendSickLeaveConfirmationEmail } from "@/lib/email";

const schema = z.object({
  startdatum: z.string().min(10),
  einddatum: z.string().min(10),
  reden: z.string().optional(),
  doktersbezoek_random: z.boolean(),
  bevestigd_door_werknemer: z.boolean(),
});

export async function GET() {
  const user = await getSessionUser();
  const reports = await listMySickReports(user.id);
  return NextResponse.json({ reports });
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige ziekmelding." }, { status: 400 });
  }

  if (!parsed.data.bevestigd_door_werknemer) {
    return NextResponse.json({ error: "Bevestiging is verplicht." }, { status: 400 });
  }

  const id = await createSickReport({
    userId: user.id,
    startdatum: parsed.data.startdatum,
    einddatum: parsed.data.einddatum,
    reden: parsed.data.reden?.trim() || null,
    doktersbezoek_random: parsed.data.doktersbezoek_random,
    bevestigd_door_werknemer: parsed.data.bevestigd_door_werknemer,
  });

  await sendSickLeaveConfirmationEmail({
    to: user.email,
    naam: user.volledige_naam,
    startdatum: parsed.data.startdatum,
    einddatum: parsed.data.einddatum,
  });

  return NextResponse.json({ ok: true, id });
}
