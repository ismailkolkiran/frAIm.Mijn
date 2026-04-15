import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";
import { getOrCreateOnboardingDossier, updateOnboarding } from "@/lib/onboarding";

const schema = z.object({
  intake_data: z.record(z.string(), z.string()).optional(),
  training_ack: z.array(z.string()).optional(),
  contract_getekend: z.boolean().optional(),
  equipment_handover: z.record(z.string(), z.string()).optional(),
});

export async function GET() {
  const user = await getSessionUser();
  const dossier = await getOrCreateOnboardingDossier(user.id);
  return NextResponse.json({ dossier });
}

export async function PUT(request: NextRequest) {
  const user = await getSessionUser();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige onboarding input." }, { status: 400 });
  const dossier = await updateOnboarding(user.id, parsed.data);
  return NextResponse.json({ ok: true, dossier });
}
