import { getSessionUser } from "@/lib/session";
import { listMySickReports } from "@/lib/sick-leave";
import ZiekmeldingenClient from "@/app/dashboard/ziekmeldingen/ZiekmeldingenClient";

export default async function ZiekmeldingenPage() {
  const user = await getSessionUser();
  const reports = await listMySickReports(user.id);

  return <ZiekmeldingenClient initialReports={reports} />;
}
