import { getSessionUser } from "@/lib/session";
import { getOffboardingChecklistForUser } from "@/lib/offboarding";
import AfboardenClient from "@/app/dashboard/afboarden/AfboardenClient";

export default async function AfboardenPage() {
  const user = await getSessionUser();
  const checklist = await getOffboardingChecklistForUser(user.id);
  return <AfboardenClient checklist={checklist} />;
}
