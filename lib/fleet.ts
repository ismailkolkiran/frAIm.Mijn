import { pool } from "@/lib/db";

export type Vehicle = {
  id: number;
  type: string | null;
  beschrijving: string | null;
  merk: string | null;
  model: string | null;
  nummerplaat: string | null;
  toegewezen_aan: number | null;
  toewijzingsdatum: string | null;
  status: string | null;
  verzekering_vervalt: string | null;
  notities: string | null;
  aangemaakt_op: string;
};

export type MaintenanceLog = {
  id: number;
  apparatuur_id: number;
  gerapporteerd_door: number | null;
  onderhoudsdatum: string | null;
  type: string | null;
  beschrijving: string | null;
  kosten: string | null;
  garagenaam: string | null;
  notities: string | null;
  aangemaakt_op: string;
};

export async function getAssignedVehicle(userId: number) {
  const res = await pool.query<Vehicle>(`SELECT id,type,beschrijving,merk,model,nummerplaat,toegewezen_aan,toewijzingsdatum::text,status,verzekering_vervalt::text,notities,aangemaakt_op::text FROM apparatuur WHERE toegewezen_aan=$1 ORDER BY aangemaakt_op DESC LIMIT 1`, [userId]);
  return res.rows[0] ?? null;
}

export async function listMaintenanceForVehicle(vehicleId: number) {
  const res = await pool.query<MaintenanceLog>(`SELECT id,apparatuur_id,gerapporteerd_door,onderhoudsdatum::text,type,beschrijving,kosten::text,garagenaam,notities,aangemaakt_op::text FROM onderhoudslogboek WHERE apparatuur_id=$1 ORDER BY onderhoudsdatum DESC NULLS LAST, aangemaakt_op DESC`, [vehicleId]);
  return res.rows;
}

export async function createMaintenanceLog(input:{apparatuurId:number;gerapporteerdDoor:number;onderhoudsdatum:string;type:string;beschrijving:string;kosten:number|null;garagenaam:string|null;notities:string|null;}) {
  await pool.query(`INSERT INTO onderhoudslogboek (apparatuur_id,gerapporteerd_door,onderhoudsdatum,type,beschrijving,kosten,garagenaam,notities) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [input.apparatuurId,input.gerapporteerdDoor,input.onderhoudsdatum,input.type,input.beschrijving,input.kosten,input.garagenaam,input.notities]);
}

export async function listAllVehicles() {
  const res = await pool.query<Vehicle & { medewerker_naam: string | null }>(`SELECT a.id,a.type,a.beschrijving,a.merk,a.model,a.nummerplaat,a.toegewezen_aan,a.toewijzingsdatum::text,a.status,a.verzekering_vervalt::text,a.notities,a.aangemaakt_op::text,g.volledige_naam AS medewerker_naam FROM apparatuur a LEFT JOIN gebruikers g ON g.id=a.toegewezen_aan ORDER BY a.aangemaakt_op DESC`);
  return res.rows;
}

export async function listAllMaintenanceLogs() {
  const res = await pool.query<MaintenanceLog & { nummerplaat: string | null; medewerker_naam: string | null }>(`SELECT m.id,m.apparatuur_id,m.gerapporteerd_door,m.onderhoudsdatum::text,m.type,m.beschrijving,m.kosten::text,m.garagenaam,m.notities,m.aangemaakt_op::text,a.nummerplaat,g.volledige_naam AS medewerker_naam FROM onderhoudslogboek m JOIN apparatuur a ON a.id=m.apparatuur_id LEFT JOIN gebruikers g ON g.id=m.gerapporteerd_door ORDER BY m.aangemaakt_op DESC`);
  return res.rows;
}

export async function createVehicle(input:{type:string;beschrijving:string|null;merk:string|null;model:string|null;nummerplaat:string|null;status:string|null;verzekering_vervalt:string|null;notities:string|null;}) {
  await pool.query(`INSERT INTO apparatuur (type,beschrijving,merk,model,nummerplaat,status,verzekering_vervalt,notities) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [input.type,input.beschrijving,input.merk,input.model,input.nummerplaat,input.status,input.verzekering_vervalt,input.notities]);
}

export async function assignVehicle(vehicleId:number,userId:number|null) {
  await pool.query(
    `UPDATE apparatuur SET toegewezen_aan=$2::int,toewijzingsdatum=CASE WHEN $2::int IS NULL THEN NULL ELSE CURRENT_DATE END WHERE id=$1`,
    [vehicleId,userId],
  );
}
