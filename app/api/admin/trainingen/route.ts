import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/session";
import { listPendingTrainingRequests } from "@/lib/certificates";

export async function GET() { await requireAdminUser(); return NextResponse.json({ trainings: await listPendingTrainingRequests() }); }
