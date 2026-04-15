import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createMagicToken, rateLimitByIp } from "@/lib/auth";
import { sendMagicLinkEmail } from "@/lib/email";
import { getUserByEmail } from "@/lib/users";

const payloadSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "unknown";

  const allowed = rateLimitByIp(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Te veel pogingen. Probeer later opnieuw." }, { status: 429 });
  }

  const json = await request.json();
  const parsed = payloadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldig e-mailadres." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await getUserByEmail(email);

  if (!user) {
    return NextResponse.json({ error: "Gebruiker niet gevonden." }, { status: 404 });
  }

  const token = await createMagicToken(user.id, user.email);
  await sendMagicLinkEmail(user.email, token);

  return NextResponse.json({ ok: true });
}
