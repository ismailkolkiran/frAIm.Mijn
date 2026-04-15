import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { attachDoctorNote } from "@/lib/sick-leave";
import { uploadToCloudinary } from "@/lib/cloudinary";

const allowedDocs = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Bestand ontbreekt." }, { status: 400 });
  }

  if (!allowedDocs.includes(file.type.toLowerCase())) {
    return NextResponse.json({ error: "Alleen PDF/JPG/PNG toegestaan." }, { status: 400 });
  }

  const secureUrl = await uploadToCloudinary(file, "myfraim/sick-notes", "raw");
  await attachDoctorNote(Number(params.id), user.id, secureUrl);

  return NextResponse.json({ ok: true, secureUrl });
}
