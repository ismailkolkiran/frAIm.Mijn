import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/session";
import { updateTrainingStatus } from "@/lib/certificates";
import { sendTrainingStatusEmail } from "@/lib/email";

const schema = z.object({ status: z.enum(["goedgekeurd", "afgewezen"]), adminOpmerkingen: z.string().nullable().optional() });

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminUser();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige status update." }, { status: 400 });
  const training = await updateTrainingStatus({ id: Number(params.id), status: parsed.data.status, adminOpmerkingen: parsed.data.adminOpmerkingen ?? null });
  if (!training) return NextResponse.json({ error: "Aanvraag niet gevonden." }, { status: 404 });
  await sendTrainingStatusEmail({ to: training.email, naam: training.volledige_naam, onderwerp: training.onderwerp ?? "Training", datum: training.aangevraagd_voor ?? new Date().toISOString().slice(0,10), status: training.status, opmerkingen: training.admin_opmerkingen });
  return NextResponse.json({ ok: true, training });
}
