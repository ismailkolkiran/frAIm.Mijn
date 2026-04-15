import { pool } from "@/lib/db";

export type OnboardingDossier = {
  id: number;
  gebruiker_id: number;
  intake_data: Record<string, string>;
  training_ack: string[];
  contract_getekend: boolean;
  contract_getekend_op: string | null;
  equipment_handover: Record<string, string>;
  progress_pct: number;
  voltooid: boolean;
  voltooid_op: string | null;
};

export async function getOrCreateOnboardingDossier(userId: number) {
  await pool.query(`INSERT INTO onboarding_dossiers (gebruiker_id) VALUES ($1) ON CONFLICT (gebruiker_id) DO NOTHING`, [userId]);
  const result = await pool.query<OnboardingDossier & { contract_getekend_op: string | null; voltooid_op: string | null }>(
    `SELECT id, gebruiker_id, intake_data, training_ack, contract_getekend, contract_getekend_op::text, equipment_handover, progress_pct, voltooid, voltooid_op::text FROM onboarding_dossiers WHERE gebruiker_id=$1 LIMIT 1`,
    [userId],
  );
  return result.rows[0] ?? null;
}

export async function updateOnboarding(userId: number, payload: {
  intake_data?: Record<string, string>;
  training_ack?: string[];
  contract_getekend?: boolean;
  equipment_handover?: Record<string, string>;
}) {
  const current = await getOrCreateOnboardingDossier(userId);
  if (!current) return null;

  const intake = payload.intake_data ?? current.intake_data;
  const training = payload.training_ack ?? current.training_ack;
  const contractSigned = payload.contract_getekend ?? current.contract_getekend;
  const equipment = payload.equipment_handover ?? current.equipment_handover;

  let progress = 0;
  if (Object.keys(intake).length > 0) progress += 30;
  if (training.length >= 3) progress += 25;
  if (contractSigned) progress += 25;
  if (Object.keys(equipment).length > 0) progress += 20;

  const voltooid = progress >= 100;

  await pool.query(
    `
      UPDATE onboarding_dossiers
      SET intake_data=$2, training_ack=$3, contract_getekend=$4,
          contract_getekend_op=CASE WHEN $4 = TRUE THEN COALESCE(contract_getekend_op, NOW()) ELSE NULL END,
          equipment_handover=$5, progress_pct=$6, voltooid=$7,
          voltooid_op=CASE WHEN $7 = TRUE THEN COALESCE(voltooid_op, NOW()) ELSE NULL END,
          bijgewerkt_op=NOW()
      WHERE gebruiker_id=$1
    `,
    [userId, JSON.stringify(intake), JSON.stringify(training), contractSigned, JSON.stringify(equipment), progress, voltooid],
  );

  if (voltooid) {
    await pool.query(`UPDATE gebruikers SET status='actief', bijgewerkt_op=NOW() WHERE id=$1 AND status='inboarden'`, [userId]);
  }

  return getOrCreateOnboardingDossier(userId);
}

export async function listOnboardingForAdmin() {
  const result = await pool.query<{
    gebruiker_id: number;
    volledige_naam: string;
    email: string;
    status: string;
    progress_pct: number;
    voltooid: boolean;
  }>(
    `
      SELECT g.id AS gebruiker_id, g.volledige_naam, g.email, g.status::text, COALESCE(o.progress_pct,0) AS progress_pct, COALESCE(o.voltooid,FALSE) AS voltooid
      FROM gebruikers g
      LEFT JOIN onboarding_dossiers o ON o.gebruiker_id=g.id
      WHERE g.status IN ('inboarden','actief')
      ORDER BY g.volledige_naam ASC
    `,
  );

  return result.rows;
}
