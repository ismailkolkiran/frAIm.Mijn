import nodemailer from "nodemailer";

type LeaveMailInput = {
  to: string;
  naam: string;
  startdatum: string;
  einddatum: string;
  opmerkingen?: string | null;
};

type SickMailInput = {
  to: string;
  naam: string;
  startdatum: string;
  einddatum: string;
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("nl-BE");
}

function ensureSmtpConfigured() {
  const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"] as const;
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`SMTP config ontbreekt: ${missing.join(", ")}`);
  }
}

function getAdminRecipients() {
  return (process.env.ADMIN_EMAILS || "ismail.kolkiran@immokeuring.be")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(",");
}

export async function sendAdminRequestNotificationEmail(input: {
  type: "verlof" | "ziekmelding" | "bijscholing" | "wagenpark";
  employeeName: string;
  employeeEmail: string;
  details: string;
}) {
  ensureSmtpConfigured();
  const subjectByType = {
    verlof: "Nieuwe verlofaanvraag",
    ziekmelding: "Nieuwe ziekmelding",
    bijscholing: "Nieuwe aanvraag jaarlijkse bijscholing",
    wagenpark: "Nieuwe aanvraag auto-onderhoud/herstel",
  } as const;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: getAdminRecipients(),
    subject: `[Mijn ImmoKeuring] ${subjectByType[input.type]}`,
    html: `
      <p>Er is een nieuwe aanvraag binnengekomen.</p>
      <p><strong>Type:</strong> ${subjectByType[input.type]}</p>
      <p><strong>Werknemer:</strong> ${input.employeeName} (${input.employeeEmail})</p>
      <p><strong>Details:</strong> ${input.details}</p>
    `,
  });
}

export async function sendMagicLinkEmail(email: string, token: string) {
  ensureSmtpConfigured();
  const appBase = process.env.APP_BASE_URL || "http://localhost:3000";
  const url = `${appBase}/verify?token=${encodeURIComponent(token)}`;

  const html = `
    <p>Beste collega,</p>
    <p>Klik op onderstaande knop om in te loggen op Mijn ImmoKeuring:</p>
    <p><a href="${url}" style="background:#111827;color:#fff;padding:10px 14px;text-decoration:none;border-radius:6px;">Inloggen</a></p>
    <p>Deze link is 15 minuten geldig.</p>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Mijn ImmoKeuring magische loginlink",
    html,
  });
}

export async function sendLoginCodeEmail(email: string, code: string) {
  ensureSmtpConfigured();
  const html = `
    <p>Beste collega,</p>
    <p>Gebruik onderstaande code om in te loggen op Mijn ImmoKeuring:</p>
    <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0;">${code}</p>
    <p>Deze code is 15 minuten geldig en kan slechts 1 keer gebruikt worden.</p>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Mijn ImmoKeuring inlogcode",
    html,
  });
}

export async function sendLeaveApprovedEmail(input: LeaveMailInput) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: input.to,
    subject: `Uw verlofaanvraag ${formatDate(input.startdatum)} - ${formatDate(input.einddatum)} is goedgekeurd`,
    html: `
      <p>Beste ${input.naam},</p>
      <p>Uw verlofaanvraag van <strong>${formatDate(input.startdatum)}</strong> tot <strong>${formatDate(input.einddatum)}</strong> is goedgekeurd.</p>
      <p>Met vriendelijke groet,<br/>ImmoKeuring</p>
    `,
  });
}

export async function sendLeaveRejectedEmail(input: LeaveMailInput) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: input.to,
    subject: "Uw verlofaanvraag is afgewezen",
    html: `
      <p>Beste ${input.naam},</p>
      <p>Uw verlofaanvraag van <strong>${formatDate(input.startdatum)}</strong> tot <strong>${formatDate(input.einddatum)}</strong> is helaas afgewezen.</p>
      <p>Reden: ${input.opmerkingen ?? "Geen extra toelichting."}</p>
      <p>Met vriendelijke groet,<br/>ImmoKeuring</p>
    `,
  });
}

export async function sendBackofficeLeaveEmail(input: {
  naam: string;
  startdatum: string;
  einddatum: string;
}) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: "info@immokeuring.be",
    subject: "Verlof goedgekeurd: backoffice melding",
    html: `
      <p>Verlof goedgekeurd: Werknemer <strong>${input.naam}</strong>, van <strong>${formatDate(input.startdatum)}</strong> tot <strong>${formatDate(input.einddatum)}</strong>.</p>
    `,
  });
}

export async function sendSickLeaveConfirmationEmail(input: SickMailInput) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: input.to,
    subject: "Ziekmeldingsrapport ontvangen",
    html: `
      <p>Beste ${input.naam},</p>
      <p>Je ziekmeldingsrapport van <strong>${formatDate(input.startdatum)}</strong> tot <strong>${formatDate(input.einddatum)}</strong> is ontvangen.</p>
      <p>Gelieve je doktersbriefje binnen 24 uur op te laden.</p>
      <p>Bij vragen kan je contact opnemen met je leidinggevende of met de bedrijfsarts volgens policy.</p>
    `,
  });
}

export async function sendSickLeaveReminderEmail(input: SickMailInput) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: input.to,
    subject: "Herinnering: doktersbriefje nog niet ontvangen",
    html: `
      <p>Beste ${input.naam},</p>
      <p>Voor je ziekmelding van <strong>${formatDate(input.startdatum)}</strong> tot <strong>${formatDate(input.einddatum)}</strong> hebben we nog geen doktersbriefje ontvangen.</p>
      <p>Dien dit zo snel mogelijk in via myfrAIm.</p>
    `,
  });
}


type TrainingMailInput = {
  to: string;
  naam: string;
  onderwerp: string;
  datum: string;
  status: "goedgekeurd" | "afgewezen" | "in_afwachting" | "afgerond";
  opmerkingen?: string | null;
};

type CertExpiryMailInput = {
  to: string;
  naam: string;
  certificaatNaam: string;
  vervaldatum: string;
};

export async function sendTrainingStatusEmail(input: TrainingMailInput) {
  const approved = input.status === "goedgekeurd";
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: input.to,
    subject: approved ? `Trainingsaanvraag goedgekeurd: ${input.onderwerp}` : `Trainingsaanvraag afgewezen: ${input.onderwerp}`,
    html: `<p>Beste ${input.naam},</p><p>Je trainingsaanvraag <strong>${input.onderwerp}</strong> voor <strong>${formatDate(input.datum)}</strong> is ${approved ? "goedgekeurd" : "afgewezen"}.</p><p>Opmerking: ${input.opmerkingen ?? "Geen extra toelichting."}</p>`,
  });
}

export async function sendCertificateExpiryReminderEmail(input: CertExpiryMailInput) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: input.to,
    subject: `Uw certificaat ${input.certificaatNaam} vervalt binnenkort`,
    html: `<p>Beste ${input.naam},</p><p>Uw certificaat <strong>${input.certificaatNaam}</strong> vervalt op <strong>${formatDate(input.vervaldatum)}</strong> (binnen 60 dagen).</p><p>Gelieve tijdig te vernieuwen en het nieuwe certificaat op te laden in myfrAIm.</p>`,
  });
}


type OffboardingMailInput = {
  to: string;
  naam: string;
  laatsteDag: string;
  itemsToReturn: string[];
};

export async function sendOffboardingChecklistEmail(input: OffboardingMailInput) {
  const itemsHtml = input.itemsToReturn.map((item) => `<li>${item}</li>`).join("");
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: input.to,
    subject: `Afboarden Checklist - Laatste dag: ${formatDate(input.laatsteDag)}`,
    html: `
      <p>Beste ${input.naam},</p>
      <p>Hierbij je afboarden checklist met deadline <strong>${formatDate(input.laatsteDag)}</strong>.</p>
      <p>In te leveren:</p>
      <ul>${itemsHtml}</ul>
      <p>Gelieve ontvangst te bevestigen via het portaal.</p>
    `,
  });
}

export async function sendOffboardingConfirmationEmail(input: {
  to: string;
  employeeCopyTo: string;
  naam: string;
  laatsteDag: string;
  itemsToReturn: string[];
}) {
  const itemsHtml = input.itemsToReturn.map((item) => `<li>${item}</li>`).join("");
  const html = `
    <p>Afboarden bevestiging van <strong>${input.naam}</strong>.</p>
    <p>Laatste dag: <strong>${formatDate(input.laatsteDag)}</strong></p>
    <p>Items:</p>
    <ul>${itemsHtml}</ul>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: `${input.to},${input.employeeCopyTo}`,
    subject: `Afboarden bevestiging - ${input.naam}`,
    html,
  });
}


export async function sendEvaluationScheduledEmail(input: {
  to: string;
  naam: string;
  datum: string;
  notes?: string | null;
}) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: input.to,
    subject: `Evaluatiegesprek ingepland voor ${new Date(input.datum).toLocaleString("nl-BE")}`,
    html: `
      <p>Beste ${input.naam},</p>
      <p>Je evaluatiegesprek is ingepland op <strong>${new Date(input.datum).toLocaleString("nl-BE")}</strong>.</p>
      <p>Agenda/notities: ${input.notes ?? "Geen extra notities."}</p>
    `,
  });
}

export async function sendEvaluationFinalizedEmail(input: {
  to: string;
  naam: string;
  datum: string;
}) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: input.to,
    subject: "Evaluatie afgerond",
    html: `
      <p>Beste ${input.naam},</p>
      <p>Je evaluatie van <strong>${new Date(input.datum).toLocaleString("nl-BE")}</strong> is afgerond.</p>
      <p>Je kan de eindbeoordeling bekijken in het portaal.</p>
    `,
  });
}
