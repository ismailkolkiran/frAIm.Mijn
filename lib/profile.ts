import { pool } from "@/lib/db";
import { decryptField, encryptField } from "@/lib/crypto";

export type ProfileData = {
  id: number;
  email: string;
  volledige_naam: string;
  functie: string | null;
  geboortedatum: string | null;
  geboorteplaats: string | null;
  nationaliteit: string | null;
  telefoon: string | null;
  adres: string | null;
  btw_nummer: string | null;
  bankrekeningnummer: string | null;
  profielfoto_url: string | null;
  startdatum: string | null;
};

export type ProfileUpdateInput = {
  volledige_naam: string;
  functie: string | null;
  geboortedatum: string | null;
  geboorteplaats: string | null;
  nationaliteit: string | null;
  telefoon: string | null;
  adres: string | null;
  btw_nummer: string | null;
  bankrekeningnummer: string | null;
};

function tryDecrypt(value: string | null) {
  if (!value) {
    return null;
  }

  if (!value.includes(":")) {
    return value;
  }

  try {
    return decryptField(value);
  } catch {
    return value;
  }
}

function maybeEncrypt(value: string | null) {
  if (!value) {
    return null;
  }

  return encryptField(value);
}

export async function getProfileByUserId(userId: number) {
  const result = await pool.query<ProfileData>(
    `
      SELECT
        id,
        email,
        volledige_naam,
        functie,
        geboortedatum::text,
        geboorteplaats,
        nationaliteit,
        telefoon,
        adres,
        belastingnummer AS btw_nummer,
        bankrekeningnummer,
        profielfoto_url,
        startdatum::text
      FROM gebruikers
      WHERE id = $1
      LIMIT 1
    `,
    [userId],
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return {
    ...row,
    btw_nummer: tryDecrypt(row.btw_nummer),
    bankrekeningnummer: tryDecrypt(row.bankrekeningnummer),
  };
}

export async function updateProfileByUserId(userId: number, input: ProfileUpdateInput) {
  await pool.query(
    `
      UPDATE gebruikers
      SET
        volledige_naam = $2,
        functie = $3,
        geboortedatum = $4,
        geboorteplaats = $5,
        nationaliteit = $6,
        telefoon = $7,
        adres = $8,
        belastingnummer = $9,
        bankrekeningnummer = $10,
        rsz_nummer = NULL,
        bijgewerkt_op = NOW()
      WHERE id = $1
    `,
    [
      userId,
      input.volledige_naam,
      input.functie,
      input.geboortedatum,
      input.geboorteplaats,
      input.nationaliteit,
      input.telefoon,
      input.adres,
      maybeEncrypt(input.btw_nummer),
      maybeEncrypt(input.bankrekeningnummer),
      null,
    ],
  );

  return getProfileByUserId(userId);
}

export async function addProfileDocument(userId: number, type: string, bestandUrl: string) {
  await pool.query(
    `INSERT INTO documenten (gebruiker_id, type, bestand_url) VALUES ($1, $2, $3)`,
    [userId, type, bestandUrl],
  );
}

export async function listProfileDocuments(userId: number) {
  const result = await pool.query<{
    id: number;
    type: string | null;
    bestand_url: string;
    geupload_op: string;
    vervaldatum: string | null;
  }>(
    `
      SELECT id, type, bestand_url, geupload_op::text, vervaldatum::text
      FROM documenten
      WHERE gebruiker_id = $1
      ORDER BY geupload_op DESC
    `,
    [userId],
  );

  return result.rows;
}

export async function updateProfilePhoto(userId: number, url: string) {
  await pool.query(`UPDATE gebruikers SET profielfoto_url = $2, bijgewerkt_op = NOW() WHERE id = $1`, [
    userId,
    url,
  ]);
}
