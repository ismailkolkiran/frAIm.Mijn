"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";

type Profile = {
  volledige_naam: string;
  email: string;
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

type DocumentItem = {
  id: number;
  type: string | null;
  bestand_url: string;
  geupload_op: string;
};

const docTypes = ["id-kaart", "rijbewijs", "verzekering", "cv", "ander"];

export default function ProfileClient({
  initialProfile,
  initialDocuments,
}: {
  initialProfile: Profile;
  initialDocuments: DocumentItem[];
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [documents, setDocuments] = useState(initialDocuments);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documentType, setDocumentType] = useState("id-kaart");

  const startLabel = useMemo(() => {
    if (!profile.startdatum) {
      return "Onbekend";
    }

    return new Date(profile.startdatum).toLocaleDateString("nl-BE");
  }, [profile.startdatum]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setError(null);

    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      setError("Profiel opslaan mislukt.");
      return;
    }

    setStatus("Profiel opgeslagen.");
  }

  async function uploadDocument(file: File) {
    setUploading(true);
    setError(null);

    const body = new FormData();
    body.append("file", file);
    body.append("uploadType", "document");
    body.append("documentType", documentType);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body,
    });

    setUploading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Upload mislukt." }));
      setError(payload.error ?? "Upload mislukt.");
      return;
    }

    const reloaded = await fetch("/api/profile", { cache: "no-store" });
    const payload = await reloaded.json();
    setDocuments(payload.documents ?? []);
    setStatus("Document geüpload.");
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    setError(null);

    const body = new FormData();
    body.append("file", file);
    body.append("uploadType", "photo");

    const response = await fetch("/api/uploads", {
      method: "POST",
      body,
    });

    setUploading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: "Foto upload mislukt." }));
      setError(payload.error ?? "Foto upload mislukt.");
      return;
    }

    const payload = await response.json();
    setProfile((current) => ({ ...current, profielfoto_url: payload.secureUrl }));
    setStatus("Profielfoto geüpload.");
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Profiel</h1>
        <p className="text-slate-600 mt-1">Startdatum: {startLabel}</p>
      </div>

      <form onSubmit={saveProfile} className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Persoonlijke gegevens</h2>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Input label="Volledige naam" value={profile.volledige_naam} onChange={(v) => setProfile({ ...profile, volledige_naam: v })} required />
            <Input label="E-mail" value={profile.email} onChange={() => {}} disabled />
            <Input label="Functie" value={profile.functie ?? ""} onChange={(v) => setProfile({ ...profile, functie: v })} />
            <Input label="Telefoon" value={profile.telefoon ?? ""} onChange={(v) => setProfile({ ...profile, telefoon: v })} />
            <Input label="Geboortedatum" type="date" value={profile.geboortedatum ?? ""} onChange={(v) => setProfile({ ...profile, geboortedatum: v })} />
            <Input label="Geboorteplaats" value={profile.geboorteplaats ?? ""} onChange={(v) => setProfile({ ...profile, geboorteplaats: v })} />
            <Input label="Nationaliteit" value={profile.nationaliteit ?? ""} onChange={(v) => setProfile({ ...profile, nationaliteit: v })} />
            <Input label="Adres" value={profile.adres ?? ""} onChange={(v) => setProfile({ ...profile, adres: v })} />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Bank & ondernemingsgegevens (versleuteld)</h2>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Input label="BTW nummer (indien in het bezit)" value={profile.btw_nummer ?? ""} onChange={(v) => setProfile({ ...profile, btw_nummer: v })} />
            <Input label="Bankrekeningnummer" value={profile.bankrekeningnummer ?? ""} onChange={(v) => setProfile({ ...profile, bankrekeningnummer: v })} />
          </div>
        </div>

        <button className="rounded bg-slate-900 text-white px-4 py-2">Profiel opslaan</button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold">Profielfoto</h2>
        {profile.profielfoto_url ? (
          <Image
            src={profile.profielfoto_url}
            alt="Profielfoto"
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover border border-slate-200"
            unoptimized
          />
        ) : (
          <p className="text-sm text-slate-500">Nog geen foto geüpload.</p>
        )}
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void uploadPhoto(file);
            }
          }}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold">Documenten</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <select
            className="rounded border border-slate-300 px-3 py-2"
            value={documentType}
            onChange={(event) => setDocumentType(event.target.value)}
          >
            {docTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void uploadDocument(file);
              }
            }}
          />
          {uploading ? <span className="text-sm text-slate-600">Uploaden...</span> : null}
        </div>

        <ul className="divide-y divide-slate-100">
          {documents.map((doc) => (
            <li key={doc.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{doc.type ?? "document"}</p>
                <p className="text-sm text-slate-500">{new Date(doc.geupload_op).toLocaleDateString("nl-BE")}</p>
              </div>
              <a href={doc.bestand_url} target="_blank" className="text-sm text-slate-700 underline" rel="noreferrer">
                Open
              </a>
            </li>
          ))}
          {documents.length === 0 ? <li className="py-3 text-sm text-slate-500">Nog geen documenten.</li> : null}
        </ul>
      </div>

      {status ? <p className="text-sm text-green-700">{status}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 disabled:bg-slate-100"
      />
    </label>
  );
}
