"use client";

type Checklist = {
  id: number;
  laatste_dag: string | null;
  status: string | null;
  items_to_return: string[];
  admin_todos: string[];
  bevestigd_op: string | null;
} | null;

export default function AfboardenClient({ checklist }: { checklist: Checklist }) {
  async function confirm() {
    if (!checklist) return;
    await fetch(`/api/offboarding/${checklist.id}`, { method: "POST" });
    window.location.reload();
  }

  if (!checklist) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Afboarden</h1>
        <p className="text-slate-600 mt-2">Er is momenteel geen actieve afboarden checklist.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Afboarden Checklist</h1>
        <p className="text-slate-600 mt-1">Laatste dag: {checklist.laatste_dag ? new Date(`${checklist.laatste_dag}T00:00:00`).toLocaleDateString("nl-BE") : "-"}</p>
        <p className="text-sm text-slate-600 mt-1">Status: {checklist.status ?? "lopend"}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">In te leveren items</h2>
        <ul className="mt-3 list-disc pl-5 text-sm text-slate-700 space-y-1">
          {checklist.items_to_return.map((item, idx) => <li key={idx}>{item}</li>)}
        </ul>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Bedrijfszijde volgt op</h2>
        <ul className="mt-3 list-disc pl-5 text-sm text-slate-700 space-y-1">
          {checklist.admin_todos.map((item, idx) => <li key={idx}>{item}</li>)}
        </ul>
      </div>

      <button
        onClick={() => void confirm()}
        disabled={Boolean(checklist.bevestigd_op)}
        className="rounded bg-slate-900 text-white px-4 py-2 disabled:opacity-60"
      >
        {checklist.bevestigd_op ? "Bevestigd" : "Ik heb alles ingeleverd"}
      </button>
    </section>
  );
}
