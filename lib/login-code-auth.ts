import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { getManualLoginCodeForEmail } from "@/lib/manual-login-codes";

export async function verifyLoginCodeForUser(userId: number, email: string, code: string) {
  const result = await pool.query<{ wachtwoord_hash: string | null }>(
    `SELECT wachtwoord_hash FROM gebruikers WHERE id = $1 LIMIT 1`,
    [userId],
  );
  const hash = result.rows[0]?.wachtwoord_hash ?? null;

  if (hash) {
    return bcrypt.compare(code, hash);
  }

  const fallbackCode = getManualLoginCodeForEmail(email);
  if (!fallbackCode) {
    return false;
  }
  return fallbackCode === code;
}
