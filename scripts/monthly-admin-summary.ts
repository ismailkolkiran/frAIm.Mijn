import { getAdminStats } from "../lib/admin";
import nodemailer from "nodemailer";

async function run() {
  const stats = await getAdminStats();
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: "ismail.kolkiran@immokeuring.be",
    subject: "Maandelijkse myfrAIm samenvatting",
    html: `
      <p>Maandelijkse samenvatting:</p>
      <ul>
        <li>Totaal werknemers: ${stats.totaalWerknemers}</li>
        <li>Openstaande goedkeuringen: ${stats.openstaandeGoedkeuringen}</li>
        <li>Vervallende certificaten: ${stats.vervallendeCertificaten}</li>
        <li>Ziekmeldingen deze maand: ${stats.ziekmeldingenDezeMaand}</li>
      </ul>
    `,
  });

  console.log("Maandelijkse samenvatting verzonden.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
