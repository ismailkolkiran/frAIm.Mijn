import { pool } from "@/lib/db";

export type AdminNotificationCounts = {
  leavePending: number;
  sickOpen: number;
  trainingPending: number;
  fleetApprovalRequired: number;
  total: number;
};

export async function getAdminNotificationCounts(): Promise<AdminNotificationCounts> {
  const [leaveRes, sickRes, trainingRes, fleetRes] = await Promise.all([
    pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM verlofaanvragen WHERE status = 'in_afwachting'`),
    pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM ziekmeldingsrapporten WHERE briefje_url IS NULL`),
    pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM trainingsaanvragen WHERE status = 'in_afwachting'`),
    pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM onderhoudslogboek WHERE COALESCE(notities, '') LIKE '%ADMIN_APPROVAL_REQUIRED%'`,
    ),
  ]);

  const leavePending = Number(leaveRes.rows[0]?.count ?? 0);
  const sickOpen = Number(sickRes.rows[0]?.count ?? 0);
  const trainingPending = Number(trainingRes.rows[0]?.count ?? 0);
  const fleetApprovalRequired = Number(fleetRes.rows[0]?.count ?? 0);

  return {
    leavePending,
    sickOpen,
    trainingPending,
    fleetApprovalRequired,
    total: leavePending + sickOpen + trainingPending + fleetApprovalRequired,
  };
}
