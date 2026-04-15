import { requireAdminUser } from "@/lib/session";
import { listPendingTrainingRequests } from "@/lib/certificates";
import AdminTrainingenClient from "@/app/admin/trainingen/AdminTrainingenClient";
export default async function AdminTrainingenPage(){await requireAdminUser();return <AdminTrainingenClient initialTrainings={await listPendingTrainingRequests()} />;}
