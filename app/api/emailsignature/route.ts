import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getUserSignatureProfile } from "@/lib/users";
import { buildSignatureHtml } from "@/lib/signature";

export async function GET() {
  const user = await getSessionUser();
  const profile = await getUserSignatureProfile(user.id);

  if (!profile) {
    return NextResponse.json({ error: "Profiel niet gevonden." }, { status: 404 });
  }

  const html = buildSignatureHtml(profile);
  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": "attachment; filename=myfraim-handtekening.html",
      "Cache-Control": "no-store",
    },
  });
}
