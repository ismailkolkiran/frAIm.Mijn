import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { addProfileDocument, updateProfilePhoto } from "@/lib/profile";
import { uploadToCloudinary } from "@/lib/cloudinary";

const allowedDocs = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const allowedPhotos = ["image/jpeg", "image/jpg", "image/png"];

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  const formData = await request.formData();

  const file = formData.get("file");
  const uploadType = String(formData.get("uploadType") || "document");
  const documentType = String(formData.get("documentType") || "algemeen");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Bestand ontbreekt." }, { status: 400 });
  }

  const mime = file.type.toLowerCase();

  if (uploadType === "photo" && !allowedPhotos.includes(mime)) {
    return NextResponse.json({ error: "Alleen JPG/PNG foto's zijn toegestaan." }, { status: 400 });
  }

  if (uploadType !== "photo" && !allowedDocs.includes(mime)) {
    return NextResponse.json({ error: "Alleen PDF, JPG of PNG bestanden zijn toegestaan." }, { status: 400 });
  }

  const secureUrl = await uploadToCloudinary(
    file,
    uploadType === "photo" ? "myfraim/profile-photos" : "myfraim/documents",
    uploadType === "photo" ? "image" : "raw",
  );

  if (uploadType === "photo") {
    await updateProfilePhoto(user.id, secureUrl);
    return NextResponse.json({ ok: true, secureUrl });
  }

  await addProfileDocument(user.id, documentType, secureUrl);
  return NextResponse.json({ ok: true, secureUrl });
}
