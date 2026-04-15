import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/session";
import { listEvaluationsForAdmin } from "@/lib/evaluations";

export async function GET() {
  await requireAdminUser();
  return NextResponse.json({ evaluations: await listEvaluationsForAdmin() });
}
