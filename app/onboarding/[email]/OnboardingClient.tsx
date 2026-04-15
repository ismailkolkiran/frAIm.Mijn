"use client";

import { FormEvent, useMemo, useState } from "react";

type Dossier = {
  intake_data: Record<string, string>;
  training_ack: string[];
  contract_getekend: boolean;
  equipment_handover: Record<string, string>;
  progress_pct: number;
  voltooid: boolean;
};

const trainingModules = [
  "Hoe Fraim gebruiken",
  "Klantbetalingen verwerken",
  "Planning & Inplannen",
  "Arbeidsreglement",
  "Salaris & Voordelen Uitleg",
  "Verzekering & RSZ",
];

export default function OnboardingClient({ userName, userEmail, initialDossier }: { userName: string; userEmail: string; initialDossier: Dossier }) {
  const [dossier, setDossier] = useState(initialDossier);
  const [intake, setIntake] = useState<Record<string, string>>(initialDossier.intake_data ?? {});
  const [equipment, setEquipment] = useState<Record<string, string>>(initialDossier.equipment_handover ?? {});
  const [status, setStatus] = useState<string | null>(null);

  const progress = useMemo(() => dossier.progress_pct ?? 0, [dossier.progress_pct]);

  async function save(payload: Partial<Dossier>) {
    const response = await fetch("/api/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (response.ok) {
      setDossier(data.dossier);
      setStatus("Opgeslagen.");
    }
  }

  function onIntakeSubmit(event: FormEvent) {
    event.preventDefault();
    void save({ intake_data: intake });
  }

  function onEquipmentSubmit(event: FormEvent) {
    event.preventDefault();
    void save({ equipment_handover: equipment });
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Onboarding - {userName}</h1>
        <p className="text-slate-600">{userEmail}</p>
        <p className="mt-2 text-sm">Voortgang: {progress}% {dossier.voltooid ? "(Voltooid)" : ""}</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">1) Intakeformulier</h2>
        <form className="mt-4 grid md:grid-cols-2 gap-3" onSubmit={onIntakeSubmit}>
          <input className="rounded border border-slate-300 px-3 py-2" placeholder="Noodcontact" value={intake.noodcontact ?? ""} onChange={(e)=>setIntake({...intake,noodcontact:e.target.value})} />
          <input className="rounded border border-slate-300 px-3 py-2" placeholder="Bankrekening" value={intake.bankrekening ?? ""} onChange={(e)=>setIntake({...intake,bankrekening:e.target.value})} />
          <input className="rounded border border-slate-300 px-3 py-2" placeholder="Verzekering voorkeur" value={intake.verzekering ?? ""} onChange={(e)=>setIntake({...intake,verzekering:e.target.value})} />
          <input className="rounded border border-slate-300 px-3 py-2" placeholder="RSZ info" value={intake.rsz ?? ""} onChange={(e)=>setIntake({...intake,rsz:e.target.value})} />
          <button className="md:col-span-2 rounded bg-slate-900 text-white px-4 py-2">Intake opslaan</button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">2) Verplichte trainingsmodules</h2>
        <ul className="mt-3 space-y-2">
          {trainingModules.map((mod) => {
            const checked = dossier.training_ack?.includes(mod);
            return (
              <li key={mod} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const current = new Set(dossier.training_ack ?? []);
                    if (e.target.checked) current.add(mod); else current.delete(mod);
                    void save({ training_ack: [...current] });
                  }}
                />
                <span>{mod}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">3) Contract e-signature</h2>
        <label className="mt-3 flex items-center gap-2">
          <input
            type="checkbox"
            checked={dossier.contract_getekend}
            onChange={(e) => void save({ contract_getekend: e.target.checked })}
          />
          <span>Ik bevestig dat ik het arbeidscontract digitaal onderteken.</span>
        </label>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">4) Apparatuuroverdracht</h2>
        <form className="mt-4 grid md:grid-cols-2 gap-3" onSubmit={onEquipmentSubmit}>
          <input className="rounded border border-slate-300 px-3 py-2" placeholder="Auto" value={equipment.auto ?? ""} onChange={(e)=>setEquipment({...equipment,auto:e.target.value})} />
          <input className="rounded border border-slate-300 px-3 py-2" placeholder="Telefoon" value={equipment.telefoon ?? ""} onChange={(e)=>setEquipment({...equipment,telefoon:e.target.value})} />
          <input className="rounded border border-slate-300 px-3 py-2" placeholder="Laptop" value={equipment.laptop ?? ""} onChange={(e)=>setEquipment({...equipment,laptop:e.target.value})} />
          <input className="rounded border border-slate-300 px-3 py-2" placeholder="Inloggegevens" value={equipment.inlog ?? ""} onChange={(e)=>setEquipment({...equipment,inlog:e.target.value})} />
          <button className="md:col-span-2 rounded bg-slate-900 text-white px-4 py-2">Overdracht opslaan</button>
        </form>
      </section>

      {status ? <p className="text-sm text-green-700">{status}</p> : null}
    </main>
  );
}
