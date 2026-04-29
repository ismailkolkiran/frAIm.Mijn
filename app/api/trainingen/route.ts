import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendAdminRequestNotificationEmail } from "@/lib/email";
import { getSessionUser } from "@/lib/session";
import { createTrainingRequest, listMyTrainings } from "@/lib/certificates";

const schema = z.object({ onderwerp: z.string().min(2), aangevraagd_voor: z.string().min(10), trainer: z.string().nullable().optional(), geschatte_kosten: z.number().nullable().optional() });

export async function GET() { const user = await getSessionUser(); return NextResponse.json({ trainings: await listMyTrainings(user.id) }); }
export async function POST(request: NextRequest) {
  const user = await getSessionUser(); const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige trainingsaanvraag." }, { status: 400 });
  await createTrainingRequest({ userId: user.id, onderwerp: parsed.data.onderwerp, aangevraagd_voor: parsed.data.aangevraagd_voor, trainer: parsed.data.trainer?.trim() || null, geschatte_kosten: parsed.data.geschatte_kosten ?? null });
  try {
    await sendAdminRequestNotificationEmail({
      type: "bijscholing",
      employeeName: user.volledige_naam,
      employeeEmail: user.email,
      details: `${parsed.data.onderwerp} op ${parsed.data.aangevraagd_voor}`,
    });
  } catch (error) {
    console.error("Admin training notification failed:", error);
  }
  return NextResponse.json({ ok: true });
}
