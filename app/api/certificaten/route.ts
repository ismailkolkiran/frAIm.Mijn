import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";
import { createCertificate, listMyCertificates } from "@/lib/certificates";
import { uploadToCloudinary } from "@/lib/cloudinary";

const schema = z.object({ naam: z.string().min(2), type: z.string().min(2), uitgiftedatum: z.string().nullable().optional(), vervaldatum: z.string().min(10) });
const allowedFiles = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

export async function GET() { const user = await getSessionUser(); return NextResponse.json({ certificates: await listMyCertificates(user.id) }); }

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  const formData = await request.formData();
  const parsed = schema.safeParse(JSON.parse(String(formData.get("metadata") ?? "{}")));
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige certificaatgegevens." }, { status: 400 });
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Bestand ontbreekt." }, { status: 400 });
  if (!allowedFiles.includes(file.type.toLowerCase())) return NextResponse.json({ error: "Alleen PDF/JPG/PNG toegestaan." }, { status: 400 });
  const secureUrl = await uploadToCloudinary(file, "myfraim/certificates", "raw");
  await createCertificate({ userId: user.id, naam: parsed.data.naam, type: parsed.data.type, bestandUrl: secureUrl, uitgiftedatum: parsed.data.uitgiftedatum ?? null, vervaldatum: parsed.data.vervaldatum });
  return NextResponse.json({ ok: true, secureUrl });
}
