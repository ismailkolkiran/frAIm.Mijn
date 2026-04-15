import { pool } from "@/lib/db";

export type Evaluation = {
  id: number;
  gebruiker_id: number;
  ingeplande_datum: string | null;
  notities: string | null;
  samenvattings_bestand_url: string | null;
  admin_evaluatie: string | null;
  afgerond_op: string | null;
  aangemaakt_op: string;
};

export async function scheduleEvaluation(input: { gebruikerId: number; ingeplandeDatum: string; notities: string | null }) {
  const result = await pool.query<Evaluation>(
    `
      INSERT INTO evaluaties (gebruiker_id, ingeplande_datum, notities)
      VALUES ($1, $2, $3)
      RETURNING id, gebruiker_id, ingeplande_datum::text, notities, samenvattings_bestand_url,
                admin_evaluatie, afgerond_op::text, aangemaakt_op::text
    `,
    [input.gebruikerId, input.ingeplandeDatum, input.notities],
  );
  return result.rows[0] ?? null;
}

export async function listEvaluationsForUser(userId: number) {
  const result = await pool.query<Evaluation>(
    `SELECT id, gebruiker_id, ingeplande_datum::text, notities, samenvattings_bestand_url, admin_evaluatie, afgerond_op::text, aangemaakt_op::text FROM evaluaties WHERE gebruiker_id=$1 ORDER BY ingeplande_datum DESC NULLS LAST, aangemaakt_op DESC`,
    [userId],
  );
  return result.rows;
}

export async function listEvaluationsForAdmin() {
  const result = await pool.query<Evaluation & { volledige_naam: string; email: string }>(
    `
      SELECT e.id, e.gebruiker_id, g.volledige_naam, g.email,
             e.ingeplande_datum::text, e.notities, e.samenvattings_bestand_url,
             e.admin_evaluatie, e.afgerond_op::text, e.aangemaakt_op::text
      FROM evaluaties e
      JOIN gebruikers g ON g.id=e.gebruiker_id
      ORDER BY e.ingeplande_datum DESC NULLS LAST, e.aangemaakt_op DESC
    `,
  );
  return result.rows;
}

export async function uploadEvaluationSummary(input: { evaluationId: number; userId: number; fileUrl: string }) {
  const result = await pool.query<Evaluation>(
    `
      UPDATE evaluaties
      SET samenvattings_bestand_url=$3
      WHERE id=$1 AND gebruiker_id=$2
      RETURNING id, gebruiker_id, ingeplande_datum::text, notities, samenvattings_bestand_url,
                admin_evaluatie, afgerond_op::text, aangemaakt_op::text
    `,
    [input.evaluationId, input.userId, input.fileUrl],
  );
  return result.rows[0] ?? null;
}

export async function finalizeEvaluation(input: { evaluationId: number; adminEvaluatie: string | null }) {
  const result = await pool.query<Evaluation & { volledige_naam: string; email: string }>(
    `
      UPDATE evaluaties e
      SET admin_evaluatie=$2,
          afgerond_op=NOW()
      FROM gebruikers g
      WHERE e.id=$1 AND g.id=e.gebruiker_id
      RETURNING e.id, e.gebruiker_id, g.volledige_naam, g.email,
                e.ingeplande_datum::text, e.notities, e.samenvattings_bestand_url,
                e.admin_evaluatie, e.afgerond_op::text, e.aangemaakt_op::text
    `,
    [input.evaluationId, input.adminEvaluatie],
  );
  return result.rows[0] ?? null;
}
