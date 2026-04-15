import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";
import { getProfileByUserId, listProfileDocuments, updateProfileByUserId } from "@/lib/profile";

const profileSchema = z.object({
  volledige_naam: z.string().min(2),
  functie: z.string().nullable(),
  geboortedatum: z.string().nullable(),
  geboorteplaats: z.string().nullable(),
  nationaliteit: z.string().nullable(),
  telefoon: z.string().nullable(),
  adres: z.string().nullable(),
  belastingnummer: z.string().nullable(),
  bankrekeningnummer: z.string().nullable(),
  rsz_nummer: z.string().nullable(),
});

export async function GET() {
  const user = await getSessionUser();
  const [profile, documents] = await Promise.all([
    getProfileByUserId(user.id),
    listProfileDocuments(user.id),
  ]);

  return NextResponse.json({ profile, documents });
}

export async function PUT(request: NextRequest) {
  const user = await getSessionUser();
  const body = await request.json();

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige profielgegevens." }, { status: 400 });
  }

  const normalize = (value: string | null) => {
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const updated = await updateProfileByUserId(user.id, {
    ...parsed.data,
    volledige_naam: parsed.data.volledige_naam.trim(),
    functie: normalize(parsed.data.functie),
    geboortedatum: normalize(parsed.data.geboortedatum),
    geboorteplaats: normalize(parsed.data.geboorteplaats),
    nationaliteit: normalize(parsed.data.nationaliteit),
    telefoon: normalize(parsed.data.telefoon),
    adres: normalize(parsed.data.adres),
    belastingnummer: normalize(parsed.data.belastingnummer),
    bankrekeningnummer: normalize(parsed.data.bankrekeningnummer),
    rsz_nummer: normalize(parsed.data.rsz_nummer),
  });

  return NextResponse.json({ ok: true, profile: updated });
}
