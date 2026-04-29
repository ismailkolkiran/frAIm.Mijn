import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";
import { createCertificate, listMyCertificates } from "@/lib/certificates";

const schema = z.object({
  naam: z.string().min(2),
  type: z.enum(["diploma", "certificaat"]),
});

export async function GET() { const user = await getSessionUser(); return NextResponse.json({ certificates: await listMyCertificates(user.id) }); }

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige certificaatgegevens." }, { status: 400 });
  await createCertificate({
    userId: user.id,
    naam: parsed.data.naam,
    type: parsed.data.type,
    bestandUrl: null,
    uitgiftedatum: null,
    vervaldatum: null,
  });
  return NextResponse.json({ ok: true });
}
