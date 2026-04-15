import { getSessionUser } from "@/lib/session";
import { listEvaluationsForUser } from "@/lib/evaluations";
import EvaluatiesClient from "@/app/dashboard/evaluaties/EvaluatiesClient";

export default async function EvaluatiesPage() {
  const user = await getSessionUser();
  const evaluations = await listEvaluationsForUser(user.id);
  return <EvaluatiesClient evaluations={evaluations} />;
}
