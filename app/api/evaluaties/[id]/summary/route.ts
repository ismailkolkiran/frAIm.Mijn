import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { uploadEvaluationSummary } from "@/lib/evaluations";
import { uploadToCloudinary } from "@/lib/cloudinary";

const allowed = ["application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) return NextResponse.json({ error: "Bestand ontbreekt." }, { status: 400 });
  if (!allowed.includes(file.type.toLowerCase())) return NextResponse.json({ error: "Alleen PDF/TXT/DOC/DOCX toegestaan." }, { status: 400 });

  const secureUrl = await uploadToCloudinary(file, "myfraim/evaluation-summaries", "raw");
  const updated = await uploadEvaluationSummary({ evaluationId: Number(params.id), userId: user.id, fileUrl: secureUrl });
  if (!updated) return NextResponse.json({ error: "Evaluatie niet gevonden." }, { status: 404 });

  return NextResponse.json({ ok: true, updated });
}
