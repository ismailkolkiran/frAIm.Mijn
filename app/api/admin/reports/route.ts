import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/session";
import { exportComplianceReport, exportEmployeeDossierJson, exportLeaveReport, exportSickReport } from "@/lib/reports";

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: NextRequest) {
  await requireAdminUser();
  const params = request.nextUrl.searchParams;
  const kind = params.get("kind");

  if (kind === "leave") {
    const from = params.get("from") ?? new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
    const to = params.get("to") ?? new Date().toISOString().slice(0, 10);
    if (!isValidDate(from) || !isValidDate(to)) {
      return NextResponse.json({ error: "Ongeldig datumbereik." }, { status: 400 });
    }
    const buffer = await exportLeaveReport(from, to);
    return new NextResponse(new Uint8Array(buffer), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename=verlofrapport-${from}-${to}.xlsx` } });
  }

  if (kind === "sick") {
    const from = params.get("from") ?? new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
    const to = params.get("to") ?? new Date().toISOString().slice(0, 10);
    if (!isValidDate(from) || !isValidDate(to)) {
      return NextResponse.json({ error: "Ongeldig datumbereik." }, { status: 400 });
    }
    const buffer = await exportSickReport(from, to);
    return new NextResponse(new Uint8Array(buffer), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename=ziekmeldingen-${from}-${to}.xlsx` } });
  }

  if (kind === "compliance") {
    const buffer = await exportComplianceReport();
    return new NextResponse(new Uint8Array(buffer), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": "attachment; filename=compliance-rapport.xlsx" } });
  }

  if (kind === "dossier") {
    const userId = Number(params.get("userId"));
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Ongeldige userId." }, { status: 400 });
    }
    const dossier = await exportEmployeeDossierJson(userId);
    return new NextResponse(JSON.stringify(dossier, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename=employee-dossier-${userId}.json` } });
  }

  return NextResponse.json({ error: "Onbekend rapport type." }, { status: 400 });
}
