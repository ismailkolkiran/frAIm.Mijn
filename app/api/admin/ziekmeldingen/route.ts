import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/session";
import { listAllSickReports } from "@/lib/sick-leave";

export async function GET() {
  await requireAdminUser();
  const reports = await listAllSickReports();
  return NextResponse.json({ reports });
}
