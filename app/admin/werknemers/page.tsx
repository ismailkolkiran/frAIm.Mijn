import { requireAdminUser } from "@/lib/session";
import { listEmployees } from "@/lib/admin";
import AdminWerknemersClient from "@/app/admin/werknemers/AdminWerknemersClient";

export default async function AdminWerknemersPage() {
  await requireAdminUser();
  const employees = await listEmployees();
  return <AdminWerknemersClient initialEmployees={employees} />;
}
