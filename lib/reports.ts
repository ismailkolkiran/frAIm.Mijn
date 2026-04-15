import { pool } from "@/lib/db";
import * as XLSX from "xlsx";

function workbookBuffer(sheets: { name: string; rows: Record<string, unknown>[] }[]) {
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    const ws = XLSX.utils.json_to_sheet(s.rows);
    XLSX.utils.book_append_sheet(wb, ws, s.name);
  }
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export async function exportLeaveReport(from: string, to: string) {
  const result = await pool.query(
    `
      SELECT g.volledige_naam AS naam, v.verloftype AS type, v.startdatum::text AS startdatum, v.einddatum::text AS einddatum,
             v.uren::text AS uren, v.status::text AS status
      FROM verlofaanvragen v
      JOIN gebruikers g ON g.id=v.gebruiker_id
      WHERE v.startdatum BETWEEN $1::date AND $2::date
      ORDER BY v.startdatum ASC
    `,
    [from, to],
  );
  return workbookBuffer([{ name: "Verlof", rows: result.rows as Record<string, unknown>[] }]);
}

export async function exportSickReport(from: string, to: string) {
  const result = await pool.query(
    `
      SELECT g.volledige_naam AS naam, z.startdatum::text AS startdatum, z.einddatum::text AS einddatum,
             z.reden, CASE WHEN z.briefje_url IS NULL THEN 'nee' ELSE 'ja' END AS briefje
      FROM ziekmeldingsrapporten z
      JOIN gebruikers g ON g.id=z.gebruiker_id
      WHERE z.startdatum BETWEEN $1::date AND $2::date
      ORDER BY z.startdatum ASC
    `,
    [from, to],
  );
  return workbookBuffer([{ name: "Ziekmeldingen", rows: result.rows as Record<string, unknown>[] }]);
}

export async function exportComplianceReport() {
  const certs = await pool.query(
    `
      SELECT g.volledige_naam AS naam, c.naam AS certificaat, c.vervaldatum::text AS vervaldatum,
             CASE WHEN c.vervaldatum < CURRENT_DATE THEN 'verlopen' ELSE 'actief' END AS status
      FROM certificaten c
      JOIN gebruikers g ON g.id=c.gebruiker_id
      ORDER BY c.vervaldatum ASC NULLS LAST
    `,
  );

  const trainings = await pool.query(
    `
      SELECT g.volledige_naam AS naam, t.onderwerp, t.aangevraagd_voor::text AS datum, t.status::text AS status
      FROM trainingsaanvragen t
      JOIN gebruikers g ON g.id=t.gebruiker_id
      ORDER BY t.aangemaakt_op DESC
    `,
  );

  return workbookBuffer([
    { name: "Certificaten", rows: certs.rows as Record<string, unknown>[] },
    { name: "Trainingen", rows: trainings.rows as Record<string, unknown>[] },
  ]);
}

export async function exportEmployeeDossierJson(userId: number) {
  const [user, docs, leave, sick, certs, trainings, evals] = await Promise.all([
    pool.query(`SELECT * FROM gebruikers WHERE id=$1`, [userId]),
    pool.query(`SELECT * FROM documenten WHERE gebruiker_id=$1 ORDER BY geupload_op DESC`, [userId]),
    pool.query(`SELECT * FROM verlofaanvragen WHERE gebruiker_id=$1 ORDER BY aangemaakt_op DESC`, [userId]),
    pool.query(`SELECT * FROM ziekmeldingsrapporten WHERE gebruiker_id=$1 ORDER BY aangemaakt_op DESC`, [userId]),
    pool.query(`SELECT * FROM certificaten WHERE gebruiker_id=$1 ORDER BY geupload_op DESC`, [userId]),
    pool.query(`SELECT * FROM trainingsaanvragen WHERE gebruiker_id=$1 ORDER BY aangemaakt_op DESC`, [userId]),
    pool.query(`SELECT * FROM evaluaties WHERE gebruiker_id=$1 ORDER BY aangemaakt_op DESC`, [userId]),
  ]);

  return {
    user: user.rows[0] ?? null,
    documenten: docs.rows,
    verlof: leave.rows,
    ziekmeldingen: sick.rows,
    certificaten: certs.rows,
    trainingen: trainings.rows,
    evaluaties: evals.rows,
  };
}
