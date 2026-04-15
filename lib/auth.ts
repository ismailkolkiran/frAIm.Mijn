import { SignJWT, jwtVerify } from "jose";

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

export async function createMagicToken(userId: number, email: string) {
  const role = email === "ismail.kolkiran@immokeuring.be" ? "admin" : "employee";

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
