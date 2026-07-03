import { useEffect, useState } from "react";
import { api } from "./api/client";
import type { Rep } from "./api/types";
import { RepView } from "./pages/RepView";
import { ManagerCROView } from "./pages/ManagerCROView";
import { CFOView } from "./pages/CFOView";
import { RevOpsView } from "./pages/RevOpsView";

type Persona = "rep" | "manager" | "cfo" | "revops";

const PERSONAS: { id: Persona; label: string }[] = [
  { id: "rep", label: "Sales Rep" },
  { id: "manager", label: "Manager / CRO" },
  { id: "cfo", label: "CFO / FP&A" },
  { id: "revops", label: "RevOps / Admin" },
];

export default function App() {
  const [persona, setPersona] = useState<Persona>("manager");
  const [reps, setReps] = useState<Rep[]>([]);
  const [selectedRepId, setSelectedRepId] = useState<string>("");

  useEffect(() => {
    api.getReps().then((r) => {
      setReps(r);
      if (r.length) setSelectedRepId(r[0].id);
    });
  }, []);

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="brand">
          TrustCast<small>From Rollup to Reasoning — prototype</small>
        </div>
        {persona === "rep" && reps.length > 0 && (
          <select
            value={selectedRepId}
            onChange={(e) => setSelectedRepId(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--surface-raised)",
              color: "var(--text-primary)",
            }}
          >
            {reps.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        )}
        <div className="persona-tabs">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              className={`persona-tab ${persona === p.id ? "active" : ""}`}
              onClick={() => setPersona(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </nav>
      <main className="view">
        {persona === "rep" && selectedRepId && <RepView repId={selectedRepId} />}
        {persona === "manager" && <ManagerCROView />}
        {persona === "cfo" && <CFOView />}
        {persona === "revops" && <RevOpsView />}
      </main>
    </div>
  );
}
