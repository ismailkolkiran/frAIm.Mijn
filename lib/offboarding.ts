import { pool } from "@/lib/db";

export type OffboardingChecklist = {
  id: number;
  gebruiker_id: number;
  laatste_dag: string | null;
  status: string | null;
  items_to_return: string[];
  admin_todos: string[];
  bevestigd_op: string | null;
  aangemaakt_op: string;
};

export async function createOffboardingChecklist(input: {
  userId: number;
  laatsteDag: string;
  itemsToReturn: string[];
  adminTodos: string[];
}) {
  const result = await pool.query<OffboardingChecklist>(
    `
      INSERT INTO afboarden_checklists (gebruiker_id, laatste_dag, status, items_to_return, admin_todos)
      VALUES ($1, $2, 'lopend', $3, $4)
      RETURNING id, gebruiker_id, laatste_dag::text, status, items_to_return, admin_todos, bevestigd_op::text, aangemaakt_op::text
    `,
    [input.userId, input.laatsteDag, input.itemsToReturn, input.adminTodos],
  );

  await pool.query(`UPDATE gebruikers SET status='afboarden', bijgewerkt_op=NOW() WHERE id=$1`, [input.userId]);

  return result.rows[0] ?? null;
}

export async function getOffboardingChecklistForUser(userId: number) {
  const result = await pool.query<OffboardingChecklist>(
    `
      SELECT id, gebruiker_id, laatste_dag::text, status, items_to_return, admin_todos,
             bevestigd_op::text, aangemaakt_op::text
      FROM afboarden_checklists
      WHERE gebruiker_id = $1
      ORDER BY aangemaakt_op DESC
      LIMIT 1
    `,
    [userId],
  );

  return result.rows[0] ?? null;
}

export async function listOffboardingForAdmin() {
  const result = await pool.query<
    OffboardingChecklist & { volledige_naam: string; email: string }
  >(
    `
      SELECT a.id, a.gebruiker_id, g.volledige_naam, g.email,
             a.laatste_dag::text, a.status, a.items_to_return, a.admin_todos,
             a.bevestigd_op::text, a.aangemaakt_op::text
      FROM afboarden_checklists a
      JOIN gebruikers g ON g.id = a.gebruiker_id
      ORDER BY a.aangemaakt_op DESC
    `,
  );

  return result.rows;
}

export async function updateOffboardingChecklist(input: {
  checklistId: number;
  itemsToReturn: string[];
  adminTodos: string[];
  laatsteDag: string;
}) {
  const result = await pool.query<OffboardingChecklist>(
    `
      UPDATE afboarden_checklists
      SET items_to_return = $2,
          admin_todos = $3,
          laatste_dag = $4
      WHERE id = $1
      RETURNING id, gebruiker_id, laatste_dag::text, status, items_to_return, admin_todos,
                bevestigd_op::text, aangemaakt_op::text
    `,
    [input.checklistId, input.itemsToReturn, input.adminTodos, input.laatsteDag],
  );

  return result.rows[0] ?? null;
}

export async function confirmOffboardingByUser(checklistId: number, userId: number) {
  const result = await pool.query<OffboardingChecklist>(
    `
      UPDATE afboarden_checklists
      SET status = 'bevestigd',
          bevestigd_op = NOW()
      WHERE id = $1 AND gebruiker_id = $2
      RETURNING id, gebruiker_id, laatste_dag::text, status, items_to_return, admin_todos,
                bevestigd_op::text, aangemaakt_op::text
    `,
    [checklistId, userId],
  );

  return result.rows[0] ?? null;
}

export async function completeOffboardingByAdmin(checklistId: number) {
  const result = await pool.query<OffboardingChecklist>(
    `
      UPDATE afboarden_checklists
      SET status = 'afgerond'
      WHERE id = $1
      RETURNING id, gebruiker_id, laatste_dag::text, status, items_to_return, admin_todos,
                bevestigd_op::text, aangemaakt_op::text
    `,
    [checklistId],
  );

  const updated = result.rows[0] ?? null;
  if (updated) {
    await pool.query(`UPDATE gebruikers SET status='inactief', bijgewerkt_op=NOW() WHERE id=$1`, [updated.gebruiker_id]);
  }

  return updated;
}
