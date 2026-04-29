import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { getManualLoginCodeForEmail } from "@/lib/manual-login-codes";

type SessionPayload = {
  sub: string;
  email: string;
  role: "admin" | "employee";
};

type MagicPayload = {
  userId: number;
  email: string;
  role: "admin" | "employee";
};

const encoder = new TextEncoder();
const secret = encoder.encode(process.env.JWT_SECRET || "development-secret-change-me");
const issuer = "myfraim";

const ATTEMPTS = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function rateLimitByIp(ip: string) {
  const now = Date.now();
  const existing = ATTEMPTS.get(ip) ?? [];
  const recent = existing.filter((time) => now - time < WINDOW_MS);

  if (recent.length >= MAX_ATTEMPTS) {
    ATTEMPTS.set(ip, recent);
    return false;
  }

  recent.push(now);
  ATTEMPTS.set(ip, recent);
  return true;
}

export function getRoleForEmail(email: string): "admin" | "employee" {
  const normalized = email.toLowerCase().trim();
  const adminEmails = (process.env.ADMIN_EMAILS || "ismail.kolkiran@immokeuring.be")
    .split(",")
    .map((item) => item.toLowerCase().trim())
    .filter(Boolean);
  return adminEmails.includes(normalized) ? "admin" : "employee";
}

export async function createMagicToken(userId: number, email: string) {
  const role = getRoleForEmail(email);

  return new SignJWT({ userId, email, role } as MagicPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(issuer)
    .setAudience("magic-link")
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}

export async function verifyMagicToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer,
      audience: "magic-link",
    });

    return payload as unknown as MagicPayload;
  } catch {
    return null;
  }
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(issuer)
    .setAudience("session")
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || "30m")
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer,
      audience: "session",
    });

    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

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
