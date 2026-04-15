import { listReportsMissingDoctorNoteFor24h } from "../lib/sick-leave";
import { sendSickLeaveReminderEmail } from "../lib/email";

async function run() {
  const reports = await listReportsMissingDoctorNoteFor24h();
  let sent = 0;

  for (const report of reports) {
    await sendSickLeaveReminderEmail({
      to: report.email,
      naam: report.volledige_naam,
      startdatum: report.startdatum,
      einddatum: report.einddatum,
    });
    sent += 1;
  }

  console.log(`Reminders verstuurd: ${sent}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
