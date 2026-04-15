import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth";
import { getUserById } from "@/lib/users";

export async function getSessionUser() {
  const token = cookies().get("myfraim_session")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = await verifySessionToken(token);
  if (!payload?.sub) {
    redirect("/login");
  }

  const user = await getUserById(Number(payload.sub));
  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await getSessionUser();
  if (user.email !== "ismail.kolkiran@immokeuring.be") {
    redirect("/dashboard/home");
  }

  return user;
}
