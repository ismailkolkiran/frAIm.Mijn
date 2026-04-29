import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, getRoleForEmail } from "@/lib/auth";
import { verifyLoginCodeForUser } from "@/lib/login-code-auth";
import { getUserByEmail } from "@/lib/users";

const payloadSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(request: NextRequest) {
  const json = await request.json();
  const parsed = payloadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "E-mail of code is ongeldig." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "E-mail of code klopt niet." }, { status: 401 });
  }

  const verified = await verifyLoginCodeForUser(user.id, email, parsed.data.code);
  if (!verified) {
    return NextResponse.json({ error: "Code ongeldig." }, { status: 401 });
  }

  const role = getRoleForEmail(user.email);
  const sessionToken = await createSessionToken({
    sub: String(user.id),
    email: user.email,
    role,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: "myfraim_session",
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 30,
  });

  return response;
}
