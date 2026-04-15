import { pool } from "@/lib/db";

export type User = {
  id: number;
  email: string;
  volledige_naam: string;
  functie: string | null;
  startdatum: string | null;
};

export async function getUserByEmail(email: string) {
  const result = await pool.query<User>(
    `SELECT id, email, volledige_naam, functie, startdatum FROM gebruikers WHERE email = $1 LIMIT 1`,
    [email],
  );

  return result.rows[0] ?? null;
}

export async function getUserById(id: number) {
  const result = await pool.query<User>(
    `SELECT id, email, volledige_naam, functie, startdatum FROM gebruikers WHERE id = $1 LIMIT 1`,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function listAllUsers() {
  const result = await pool.query<{ id: number; volledige_naam: string; email: string }>(
    `SELECT id, volledige_naam, email FROM gebruikers WHERE status != 'inactief' ORDER BY volledige_naam ASC`,
  );

  return result.rows;
}

export async function getUserSignatureProfile(userId: number) {
  const result = await pool.query<{
    volledige_naam: string;
    functie: string | null;
    email: string;
    telefoon: string | null;
    profielfoto_url: string | null;
  }>(
    `
      SELECT volledige_naam, functie, email, telefoon, profielfoto_url
      FROM gebruikers
      WHERE id = $1
      LIMIT 1
    `,
    [userId],
  );

  return result.rows[0] ?? null;
}
