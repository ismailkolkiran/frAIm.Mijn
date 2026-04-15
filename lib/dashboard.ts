import { pool } from "@/lib/db";

export type DashboardMetrics = {
  verlofRestantUren: number;
  vervallendeCertificaten: number;
  openstaandeGoedkeuringen: number;
  nieuweDocumenten: number;
};

export async function getDashboardMetrics(userId: number) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const sixtyDaysLater = new Date(now);
  sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);

  const [verlofRes, certRes, approvalsRes, docsRes] = await Promise.all([
    pool.query<{ restant: string | null }>(
      `
        SELECT (COALESCE(beschikbare_uren, 0) + COALESCE(meegenomen_uren, 0) - COALESCE(gebruikte_uren, 0))::text AS restant
        FROM verlofallocatie
        WHERE gebruiker_id = $1 AND jaar = $2
        LIMIT 1
      `,
      [userId, currentYear],
    ),
    pool.query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM certificaten
        WHERE gebruiker_id = $1
          AND vervaldatum IS NOT NULL
          AND vervaldatum BETWEEN CURRENT_DATE AND $2::date
      `,
      [userId, sixtyDaysLater.toISOString().slice(0, 10)],
    ),
    pool.query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM verlofaanvragen
        WHERE gebruiker_id = $1
          AND status = 'in_afwachting'
      `,
      [userId],
    ),
    pool.query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM documenten
        WHERE gebruiker_id = $1
          AND geupload_op >= NOW() - INTERVAL '14 days'
      `,
      [userId],
    ),
  ]);

  return {
    verlofRestantUren: Number(verlofRes.rows[0]?.restant ?? 0),
    vervallendeCertificaten: Number(certRes.rows[0]?.count ?? 0),
    openstaandeGoedkeuringen: Number(approvalsRes.rows[0]?.count ?? 0),
    nieuweDocumenten: Number(docsRes.rows[0]?.count ?? 0),
  } satisfies DashboardMetrics;
}
