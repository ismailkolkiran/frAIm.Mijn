import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function getAdminStats() {
  const [employees, approvals, expiringCerts, sickThisMonth] = await Promise.all([
    pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM gebruikers WHERE status != 'inactief'`),
    pool.query<{ count: string }>(`SELECT (SELECT COUNT(*) FROM verlofaanvragen WHERE status='in_afwachting') + (SELECT COUNT(*) FROM trainingsaanvragen WHERE status='in_afwachting') AS count`),
    pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM certificaten WHERE vervaldatum BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days'`),
    pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM ziekmeldingsrapporten WHERE date_trunc('month', startdatum)=date_trunc('month', CURRENT_DATE)`),
  ]);

  return {
    totaalWerknemers: Number(employees.rows[0]?.count ?? 0),
    openstaandeGoedkeuringen: Number(approvals.rows[0]?.count ?? 0),
    vervallendeCertificaten: Number(expiringCerts.rows[0]?.count ?? 0),
    ziekmeldingenDezeMaand: Number(sickThisMonth.rows[0]?.count ?? 0),
  };
}

export async function getActivityFeed() {
  const result = await pool.query<{ type: string; tekst: string; tijdstip: string }>(
    `
      SELECT * FROM (
        SELECT 'verlof'::text AS type, CONCAT('Verlofaanvraag #', id, ' (', status::text, ')') AS tekst, aangemaakt_op::text AS tijdstip FROM verlofaanvragen
        UNION ALL
        SELECT 'ziekmelding'::text AS type, CONCAT('Ziekmelding #', id) AS tekst, aangemaakt_op::text AS tijdstip FROM ziekmeldingsrapporten
        UNION ALL
        SELECT 'training'::text AS type, CONCAT('Trainingsaanvraag #', id, ' (', status::text, ')') AS tekst, aangemaakt_op::text AS tijdstip FROM trainingsaanvragen
      ) x
      ORDER BY tijdstip DESC
      LIMIT 20
    `,
  );
  return result.rows;
}

export async function listEmployees() {
  const result = await pool.query<{
    id: number;
    email: string;
    volledige_naam: string;
    functie: string | null;
    startdatum: string | null;
    status: string;
  }>(`SELECT id,email,volledige_naam,functie,startdatum::text,status::text FROM gebruikers ORDER BY volledige_naam ASC`);
  return result.rows;
}

export async function createEmployee(input: { email: string; volledigeNaam: string; functie: string | null; startdatum: string | null }) {
  await pool.query(
    `INSERT INTO gebruikers (email, volledige_naam, functie, startdatum, status) VALUES ($1,$2,$3,$4,'inboarden')`,
    [input.email, input.volledigeNaam, input.functie, input.startdatum],
  );
}

export async function updateEmployee(input: { id: number; volledigeNaam: string; functie: string | null; status: string }) {
  await pool.query(`UPDATE gebruikers SET volledige_naam=$2, functie=$3, status=$4::gebruiker_status, bijgewerkt_op=NOW() WHERE id=$1`, [input.id, input.volledigeNaam, input.functie, input.status]);
}

export async function deactivateEmployee(id: number) {
  await pool.query(`UPDATE gebruikers SET status='inactief', bijgewerkt_op=NOW() WHERE id=$1`, [id]);
}

export async function deleteEmployee(id: number) {
  await pool.query(`DELETE FROM gebruikers WHERE id=$1`, [id]);
}

export async function resetEmployeePassword(id: number) {
  const tempCode = Math.floor(Math.random() * 1_000_000).toString().padStart(6, "0");
  const hash = await bcrypt.hash(tempCode, 10);
  const result = await pool.query<{ email: string; volledige_naam: string }>(`UPDATE gebruikers SET wachtwoord_hash=$2 WHERE id=$1 RETURNING email, volledige_naam`, [id, hash]);
  return { tempCode, user: result.rows[0] ?? null };
}
