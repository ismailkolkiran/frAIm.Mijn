import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/session";
import { finalizeEvaluation } from "@/lib/evaluations";
import { sendEvaluationFinalizedEmail } from "@/lib/email";

const schema = z.object({ adminEvaluatie: z.string().nullable().optional() });

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  await requireAdminUser();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige evaluatie-input." }, { status: 400 });

  const updated = await finalizeEvaluation({
    evaluationId: Number(params.id),
    adminEvaluatie: parsed.data.adminEvaluatie ?? null,
  });

  if (!updated) return NextResponse.json({ error: "Evaluatie niet gevonden." }, { status: 404 });

  await sendEvaluationFinalizedEmail({
    to: updated.email,
    naam: updated.volledige_naam,
    datum: updated.ingeplande_datum ?? new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, updated });
}
