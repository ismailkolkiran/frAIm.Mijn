"use client";

import { FormEvent, useState } from "react";

type Vehicle={id:number;merk:string|null;model:string|null;nummerplaat:string|null;status:string|null;medewerker_naam:string|null;toegewezen_aan:number|null};
type Maintenance={id:number;nummerplaat:string|null;medewerker_naam:string|null;type:string|null;kosten:string|null;beschrijving:string|null;notities:string|null};
type User={id:number;volledige_naam:string;email:string};

export default function AdminFleetClient({initialVehicles,initialMaintenance,users}:{initialVehicles:Vehicle[];initialMaintenance:Maintenance[];users:User[]}){
  const [vehicles,setVehicles]=useState(initialVehicles);
  const [maintenance]=useState(initialMaintenance);
  const [type,setType]=useState("auto");
  const [merk,setMerk]=useState("");
  const [model,setModel]=useState("");
  const [nummerplaat,setNummerplaat]=useState("");

  async function refresh(){const r=await fetch('/api/admin/fleet',{cache:'no-store'});const p=await r.json();setVehicles(p.vehicles??[]);}

  async function addVehicle(event:FormEvent){event.preventDefault();await fetch('/api/admin/fleet',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,merk:merk||null,model:model||null,nummerplaat:nummerplaat||null,status:'beschikbaar'})});setMerk('');setModel('');setNummerplaat('');await refresh();}
  async function assign(vehicleId:number,userId:number|null){await fetch('/api/admin/fleet/assign',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({vehicleId,userId})});await refresh();}

  return <section className="space-y-6 p-6"><div className="rounded-xl border border-slate-200 bg-white p-6"><h1 className="text-2xl font-semibold">Admin - Wagenpark</h1></div><form onSubmit={addVehicle} className="rounded-xl border border-slate-200 bg-white p-6 grid md:grid-cols-4 gap-3"><input className="rounded border border-slate-300 px-3 py-2" value={type} onChange={e=>setType(e.target.value)} placeholder="Type" required/><input className="rounded border border-slate-300 px-3 py-2" value={merk} onChange={e=>setMerk(e.target.value)} placeholder="Merk"/><input className="rounded border border-slate-300 px-3 py-2" value={model} onChange={e=>setModel(e.target.value)} placeholder="Model"/><input className="rounded border border-slate-300 px-3 py-2" value={nummerplaat} onChange={e=>setNummerplaat(e.target.value)} placeholder="Nummerplaat"/><button className="md:col-span-4 rounded bg-slate-900 text-white px-4 py-2">Voertuig toevoegen</button></form><div className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-semibold">Voertuigen</h2><ul className="mt-4 divide-y divide-slate-100">{vehicles.map(v=><li key={v.id} className="py-3"><p className="font-medium">{v.merk??'-'} {v.model??'-'} ({v.nummerplaat??'-'})</p><p className="text-sm text-slate-600">Toegewezen aan: {v.medewerker_naam??'Niemand'}</p><select className="mt-2 rounded border border-slate-300 px-2 py-1" value={v.toegewezen_aan??""} onChange={e=>void assign(v.id,e.target.value?Number(e.target.value):null)}><option value="">-- Niet toegewezen --</option>{users.map(u=><option key={u.id} value={u.id}>{u.volledige_naam}</option>)}</select></li>)}{vehicles.length===0?<li className="py-3 text-sm text-slate-500">Geen voertuigen.</li>:null}</ul></div><div className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-semibold">Onderhoudslogboek</h2><ul className="mt-4 divide-y divide-slate-100">{maintenance.map(m=><li key={m.id} className="py-3"><p className="font-medium">{m.type??'Onderhoud'} - {m.nummerplaat??'-'}</p><p className="text-sm text-slate-600">Door: {m.medewerker_naam??'-'} | Kosten: {m.kosten??'-'}</p>{m.notities?.includes('ADMIN_APPROVAL_REQUIRED')?<p className="text-sm text-amber-700">Goedkeuring vereist (&gt; €500)</p>:null}</li>)}{maintenance.length===0?<li className="py-3 text-sm text-slate-500">Geen onderhoudslogs.</li>:null}</ul></div></section>;
}
