import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, verifyMagicToken } from "@/lib/auth";

const payloadSchema = z.object({
  token: z.string().min(10),
});

export async function POST(request: NextRequest) {
  const json = await request.json();
  const parsed = payloadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Token ontbreekt." }, { status: 400 });
  }

  const payload = await verifyMagicToken(parsed.data.token);
  if (!payload) {
    return NextResponse.json({ error: "Token ongeldig of verlopen." }, { status: 401 });
  }

  const sessionToken = await createSessionToken({
    sub: String(payload.userId),
    email: payload.email,
    role: payload.role,
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
