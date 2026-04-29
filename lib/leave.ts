import { pool } from "@/lib/db";

export type LeaveRequestRow = {
  id: number;
  startdatum: string;
  einddatum: string;
  uren: string | null;
  verloftype: string | null;
  status: "in_afwachting" | "goedgekeurd" | "afgewezen";
  admin_opmerkingen: string | null;
  aangemaakt_op: string;
  bijgewerkt_op: string;
};

export type HolidayRow = {
  id: number;
  datum: string;
  naam: string;
  vervangdatum: string | null;
};

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function eachDate(start: Date, end: Date) {
  const dates: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export async function getLeaveAllocation(userId: number, year: number) {
  const result = await pool.query<{
    id: number;
    jaar: number;
    beschikbare_uren: string;
    gebruikte_uren: string;
    meegenomen_uren: string;
  }>(
    `
      SELECT id, jaar, beschikbare_uren::text, gebruikte_uren::text, meegenomen_uren::text
      FROM verlofallocatie
      WHERE gebruiker_id = $1 AND jaar = $2
      LIMIT 1
    `,
    [userId, year],
  );

  return result.rows[0] ?? null;
}

export async function ensureLeaveAllocation(userId: number, year: number) {
  await pool.query(
    `
      INSERT INTO verlofallocatie (gebruiker_id, jaar, beschikbare_uren, gebruikte_uren, meegenomen_uren)
      VALUES ($1, $2, 160, 0, 0)
      ON CONFLICT (gebruiker_id, jaar) DO NOTHING
    `,
    [userId, year],
  );

  return getLeaveAllocation(userId, year);
}

export async function listHolidays(year: number) {
  const result = await pool.query<HolidayRow>(
    `
      SELECT id, datum::text, naam, vervangdatum::text
      FROM bedrijfsfeestdagen
      WHERE EXTRACT(YEAR FROM COALESCE(vervangdatum, datum)) = $1
      ORDER BY COALESCE(vervangdatum, datum) ASC
    `,
    [year],
  );

  return result.rows;
}

export async function listMyLeaveRequests(userId: number, year: number) {
  const result = await pool.query<LeaveRequestRow>(
    `
      SELECT id, startdatum::text, einddatum::text, uren::text, verloftype, status, admin_opmerkingen,
             aangemaakt_op::text, bijgewerkt_op::text
      FROM verlofaanvragen
      WHERE gebruiker_id = $1 AND EXTRACT(YEAR FROM startdatum) = $2
      ORDER BY aangemaakt_op DESC
    `,
    [userId, year],
  );

  return result.rows;
}

export async function calculateWorkingHours(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    throw new Error("Ongeldig datumbereik");
  }

  const years = new Set<number>();
  years.add(start.getFullYear());
  years.add(end.getFullYear());

  const holidayDates = new Set<string>();
  for (const year of years) {
    const holidays = await listHolidays(year);
    for (const holiday of holidays) {
      holidayDates.add(holiday.vervangdatum ?? holiday.datum);
    }
  }

  let workingDays = 0;
  for (const day of eachDate(start, end)) {
    const dayIndex = day.getDay();
    const isWeekend = dayIndex === 0 || dayIndex === 6;
    if (isWeekend) {
      continue;
    }

    const iso = toISODate(day);
    if (holidayDates.has(iso)) {
      continue;
    }

    workingDays += 1;
  }

  return workingDays * 8;
}

export async function createLeaveRequest(input: {
  userId: number;
  startdatum: string;
  einddatum: string;
  uren: number;
  verloftype: string;
  opmerkingen?: string | null;
}) {
  const result = await pool.query<{ id: number }>(
    `
      INSERT INTO verlofaanvragen (gebruiker_id, startdatum, einddatum, uren, verloftype, admin_opmerkingen)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
    [input.userId, input.startdatum, input.einddatum, input.uren, input.verloftype, input.opmerkingen ?? null],
  );

  return result.rows[0]?.id ?? null;
}

export async function listPendingLeaveRequests() {
  const result = await pool.query<
    LeaveRequestRow & {
      gebruiker_id: number;
      volledige_naam: string;
      email: string;
    }
  >(
    `
      SELECT
        v.id,
        v.gebruiker_id,
        g.volledige_naam,
        g.email,
        v.startdatum::text,
        v.einddatum::text,
        v.uren::text,
        v.verloftype,
        v.status,
        v.admin_opmerkingen,
        v.aangemaakt_op::text,
        v.bijgewerkt_op::text
      FROM verlofaanvragen v
      JOIN gebruikers g ON g.id = v.gebruiker_id
      WHERE v.status = 'in_afwachting'
      ORDER BY v.aangemaakt_op ASC
    `,
  );

  return result.rows;
}

export async function updateLeaveStatus(input: {
  requestId: number;
  status: "goedgekeurd" | "afgewezen";
  adminId: number;
  adminOpmerkingen: string | null;
}) {
  const result = await pool.query<
    LeaveRequestRow & { gebruiker_id: number; volledige_naam: string; email: string }
  >(
    `
      UPDATE verlofaanvragen v
      SET status = $2::verlof_status,
          admin_id = $3,
          admin_opmerkingen = $4,
          bijgewerkt_op = NOW(),
          medegedeeld_aan_backoffice = CASE WHEN $2::verlof_status = 'goedgekeurd'::verlof_status THEN TRUE ELSE medegedeeld_aan_backoffice END
      FROM gebruikers g
      WHERE v.id = $1 AND g.id = v.gebruiker_id
      RETURNING v.id, v.gebruiker_id, g.volledige_naam, g.email,
                v.startdatum::text, v.einddatum::text, v.uren::text, v.verloftype, v.status,
                v.admin_opmerkingen, v.aangemaakt_op::text, v.bijgewerkt_op::text
    `,
    [input.requestId, input.status, input.adminId, input.adminOpmerkingen],
  );

  const updated = result.rows[0] ?? null;

  if (updated && input.status === "goedgekeurd") {
    const year = new Date(`${updated.startdatum}T00:00:00`).getFullYear();
    await ensureLeaveAllocation(updated.gebruiker_id, year);

    await pool.query(
      `
        UPDATE verlofallocatie
        SET gebruikte_uren = gebruikte_uren + $3
        WHERE gebruiker_id = $1 AND jaar = $2
      `,
      [updated.gebruiker_id, year, Number(updated.uren ?? 0)],
    );
  }

  return updated;
}
