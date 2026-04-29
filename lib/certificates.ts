import { pool } from "@/lib/db";

export type CertificateRow = {
  id: number;
  naam: string | null;
  type: string | null;
  bestand_url: string | null;
  uitgiftedatum: string | null;
  vervaldatum: string | null;
  herinnering_verzonden: boolean;
  geupload_op: string;
};

export type TrainingRow = {
  id: number;
  onderwerp: string | null;
  aangevraagd_voor: string | null;
  trainer: string | null;
  geschatte_kosten: string | null;
  status: "in_afwachting" | "goedgekeurd" | "afgewezen" | "afgerond";
  admin_opmerkingen: string | null;
  aangemaakt_op: string;
};

export async function listMyCertificates(userId: number) {
  const result = await pool.query<CertificateRow>(
    `
      SELECT id, naam, type, bestand_url, uitgiftedatum::text, vervaldatum::text,
             herinnering_verzonden, geupload_op::text
      FROM certificaten
      WHERE gebruiker_id = $1
      ORDER BY COALESCE(vervaldatum, CURRENT_DATE + INTERVAL '100 years') ASC, geupload_op DESC
    `,
    [userId],
  );

  return result.rows;
}

export async function createCertificate(input: {
  userId: number;
  naam: string;
  type: string;
  bestandUrl: string | null;
  uitgiftedatum: string | null;
  vervaldatum: string | null;
}) {
  await pool.query(
    `
      INSERT INTO certificaten (gebruiker_id, naam, type, bestand_url, uitgiftedatum, vervaldatum)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [input.userId, input.naam, input.type, input.bestandUrl, input.uitgiftedatum, input.vervaldatum],
  );
}

export async function listMyTrainings(userId: number) {
  const result = await pool.query<TrainingRow>(
    `
      SELECT id, onderwerp, aangevraagd_voor::text, trainer, geschatte_kosten::text,
             status, admin_opmerkingen, aangemaakt_op::text
      FROM trainingsaanvragen
      WHERE gebruiker_id = $1
      ORDER BY aangemaakt_op DESC
    `,
    [userId],
  );

  return result.rows;
}

export async function createTrainingRequest(input: {
  userId: number;
  onderwerp: string;
  aangevraagd_voor: string;
  trainer: string | null;
  geschatte_kosten: number | null;
}) {
  await pool.query(
    `
      INSERT INTO trainingsaanvragen (gebruiker_id, onderwerp, aangevraagd_voor, trainer, geschatte_kosten, status)
      VALUES ($1, $2, $3, $4, $5, 'in_afwachting')
    `,
    [input.userId, input.onderwerp, input.aangevraagd_voor, input.trainer, input.geschatte_kosten],
  );
}

export async function listPendingTrainingRequests() {
  const result = await pool.query<
    TrainingRow & {
      gebruiker_id: number;
      volledige_naam: string;
      email: string;
    }
  >(
    `
      SELECT
        t.id,
        t.gebruiker_id,
        g.volledige_naam,
        g.email,
        t.onderwerp,
        t.aangevraagd_voor::text,
        t.trainer,
        t.geschatte_kosten::text,
        t.status,
        t.admin_opmerkingen,
        t.aangemaakt_op::text
      FROM trainingsaanvragen t
      JOIN gebruikers g ON g.id = t.gebruiker_id
      WHERE t.status = 'in_afwachting'
      ORDER BY t.aangemaakt_op ASC
    `,
  );

  return result.rows;
}

export async function updateTrainingStatus(input: {
  id: number;
  status: "goedgekeurd" | "afgewezen";
  adminOpmerkingen: string | null;
}) {
  const result = await pool.query<
    TrainingRow & {
      gebruiker_id: number;
      volledige_naam: string;
      email: string;
    }
  >(
    `
      UPDATE trainingsaanvragen t
      SET status = $2,
          admin_opmerkingen = $3
      FROM gebruikers g
      WHERE t.id = $1
        AND g.id = t.gebruiker_id
      RETURNING t.id, t.gebruiker_id, g.volledige_naam, g.email, t.onderwerp,
                t.aangevraagd_voor::text, t.trainer, t.geschatte_kosten::text,
                t.status, t.admin_opmerkingen, t.aangemaakt_op::text
    `,
    [input.id, input.status, input.adminOpmerkingen],
  );

  return result.rows[0] ?? null;
}

export async function listCertificatesExpiringIn60DaysWithoutReminder() {
  const result = await pool.query<
    CertificateRow & {
      gebruiker_id: number;
      volledige_naam: string;
      email: string;
    }
  >(
    `
      SELECT
        c.id,
        c.gebruiker_id,
        g.volledige_naam,
        g.email,
        c.naam,
        c.type,
        c.bestand_url,
        c.uitgiftedatum::text,
        c.vervaldatum::text,
        c.herinnering_verzonden,
        c.geupload_op::text
      FROM certificaten c
      JOIN gebruikers g ON g.id = c.gebruiker_id
      WHERE c.vervaldatum IS NOT NULL
        AND c.vervaldatum BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days'
        AND c.herinnering_verzonden = FALSE
      ORDER BY c.vervaldatum ASC
    `,
  );

  return result.rows;
}

export async function markCertificateReminderSent(certificateId: number) {
  await pool.query(`UPDATE certificaten SET herinnering_verzonden = TRUE WHERE id = $1`, [certificateId]);
}
