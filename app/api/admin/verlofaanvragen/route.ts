import { NextResponse } from "next/server";
import { listPendingLeaveRequests } from "@/lib/leave";
import { requireAdminUser } from "@/lib/session";

export async function GET() {
  await requireAdminUser();
  const requests = await listPendingLeaveRequests();
  return NextResponse.json({ requests });
}
