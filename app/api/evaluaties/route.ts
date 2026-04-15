import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";
import { listEvaluationsForUser, scheduleEvaluation } from "@/lib/evaluations";
import { getUserById } from "@/lib/users";
import { sendEvaluationScheduledEmail } from "@/lib/email";

const scheduleSchema = z.object({
  gebruikerId: z.number(),
  ingeplandeDatum: z.string().min(10),
  notities: z.string().nullable().optional(),
});

export async function GET() {
  const user = await getSessionUser();
  const evaluations = await listEvaluationsForUser(user.id);
  return NextResponse.json({ evaluations });
}

export async function POST(request: NextRequest) {
  const admin = await getSessionUser();
  if (admin.email !== "ismail.kolkiran@immokeuring.be") {
    return NextResponse.json({ error: "Geen toegang." }, { status: 403 });
  }

  const parsed = scheduleSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige evaluatieplanning." }, { status: 400 });
  }

  const evaluation = await scheduleEvaluation({
    gebruikerId: parsed.data.gebruikerId,
    ingeplandeDatum: parsed.data.ingeplandeDatum,
    notities: parsed.data.notities ?? null,
  });

  const user = await getUserById(parsed.data.gebruikerId);
  if (user && evaluation) {
    await sendEvaluationScheduledEmail({
      to: user.email,
      naam: user.volledige_naam,
      datum: parsed.data.ingeplandeDatum,
      notes: parsed.data.notities ?? null,
    });
  }

  return NextResponse.json({ ok: true, evaluation });
}
