import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser, requireAdminUser } from "@/lib/session";
import { createOffboardingChecklist, getOffboardingChecklistForUser, listOffboardingForAdmin } from "@/lib/offboarding";
import { getUserById } from "@/lib/users";
import { sendOffboardingChecklistEmail } from "@/lib/email";

const createSchema = z.object({
  userId: z.number(),
  laatsteDag: z.string().min(10),
  itemsToReturn: z.array(z.string().min(1)).min(1),
  adminTodos: z.array(z.string().min(1)).min(1),
});

export async function GET() {
  const user = await getSessionUser();
  if (user.email === "ismail.kolkiran@immokeuring.be") {
    return NextResponse.json({ items: await listOffboardingForAdmin() });
  }
  return NextResponse.json({ item: await getOffboardingChecklistForUser(user.id) });
}

export async function POST(request: NextRequest) {
  await requireAdminUser();
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige afboarden input." }, { status: 400 });
  }

  const checklist = await createOffboardingChecklist(parsed.data);
  const user = await getUserById(parsed.data.userId);

  if (user && checklist) {
    await sendOffboardingChecklistEmail({
      to: user.email,
      naam: user.volledige_naam,
      laatsteDag: checklist.laatste_dag ?? parsed.data.laatsteDag,
      itemsToReturn: checklist.items_to_return,
    });
  }

  return NextResponse.json({ ok: true, checklist });
}
