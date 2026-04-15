import { pool } from "@/lib/db";

export type SickReport = {
  id: number;
  gebruiker_id: number;
  volledige_naam: string;
  email: string;
  startdatum: string;
  einddatum: string;
  reden: string | null;
  briefje_url: string | null;
  briefje_geupload_op: string | null;
  doktersbezoek_random: boolean;
  bevestigd_door_werknemer: boolean | null;
  aangemaakt_op: string;
};

export async function createSickReport(input: {
  userId: number;
  startdatum: string;
  einddatum: string;
  reden: string | null;
  doktersbezoek_random: boolean;
  bevestigd_door_werknemer: boolean;
}) {
  const result = await pool.query<{ id: number }>(
    `
      INSERT INTO ziekmeldingsrapporten (
        gebruiker_id,
        startdatum,
        einddatum,
        reden,
        doktersbezoek_random,
        bevestigd_door_werknemer
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
    [
      input.userId,
      input.startdatum,
      input.einddatum,
      input.reden,
      input.doktersbezoek_random,
      input.bevestigd_door_werknemer,
    ],
  );

  return result.rows[0]?.id ?? null;
}

export async function listMySickReports(userId: number) {
  const result = await pool.query<SickReport>(
    `
      SELECT
        z.id,
        z.gebruiker_id,
        g.volledige_naam,
        g.email,
        z.startdatum::text,
        z.einddatum::text,
        z.reden,
        z.briefje_url,
        z.briefje_geupload_op::text,
        z.doktersbezoek_random,
        z.bevestigd_door_werknemer,
        z.aangemaakt_op::text
      FROM ziekmeldingsrapporten z
      JOIN gebruikers g ON g.id = z.gebruiker_id
      WHERE z.gebruiker_id = $1
      ORDER BY z.aangemaakt_op DESC
    `,
    [userId],
  );

  return result.rows;
}

export async function listAllSickReports() {
  const result = await pool.query<SickReport>(
    `
      SELECT
        z.id,
        z.gebruiker_id,
        g.volledige_naam,
        g.email,
        z.startdatum::text,
        z.einddatum::text,
        z.reden,
        z.briefje_url,
        z.briefje_geupload_op::text,
        z.doktersbezoek_random,
        z.bevestigd_door_werknemer,
        z.aangemaakt_op::text
      FROM ziekmeldingsrapporten z
      JOIN gebruikers g ON g.id = z.gebruiker_id
      ORDER BY z.aangemaakt_op DESC
    `,
  );

  return result.rows;
}

export async function attachDoctorNote(reportId: number, userId: number, briefjeUrl: string) {
  await pool.query(
    `
      UPDATE ziekmeldingsrapporten
      SET briefje_url = $3,
          briefje_geupload_op = NOW()
      WHERE id = $1 AND gebruiker_id = $2
    `,
    [reportId, userId, briefjeUrl],
  );
}

export async function listReportsMissingDoctorNoteFor24h() {
  const result = await pool.query<SickReport>(
    `
      SELECT
        z.id,
        z.gebruiker_id,
        g.volledige_naam,
        g.email,
        z.startdatum::text,
        z.einddatum::text,
        z.reden,
        z.briefje_url,
        z.briefje_geupload_op::text,
        z.doktersbezoek_random,
        z.bevestigd_door_werknemer,
        z.aangemaakt_op::text
      FROM ziekmeldingsrapporten z
      JOIN gebruikers g ON g.id = z.gebruiker_id
      WHERE z.briefje_url IS NULL
        AND z.aangemaakt_op <= NOW() - INTERVAL '24 hours'
      ORDER BY z.aangemaakt_op ASC
    `,
  );

  return result.rows;
}
