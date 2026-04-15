import { getSessionUser } from "@/lib/session";
import { listMyTrainings } from "@/lib/certificates";
import TrainingenClient from "@/app/dashboard/trainingen/TrainingenClient";
export default async function TrainingenPage(){const user=await getSessionUser();return <TrainingenClient initialTrainings={await listMyTrainings(user.id)} />;}
