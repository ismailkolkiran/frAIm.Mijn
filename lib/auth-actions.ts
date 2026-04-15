"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  cookies().set("myfraim_session", "", { maxAge: 0, path: "/" });
  redirect("/login");
}
