import { getSessionUser } from "@/lib/session";
import { listMyCertificates } from "@/lib/certificates";
import CertificatenClient from "@/app/dashboard/certificaten/CertificatenClient";
export default async function CertificatenPage(){ const user=await getSessionUser(); return <CertificatenClient initialCertificates={await listMyCertificates(user.id)} />; }
