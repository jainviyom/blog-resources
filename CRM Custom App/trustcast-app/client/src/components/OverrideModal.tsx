import { useState } from "react";
import { moneyFull } from "../format";

interface Props {
  title: string;
  priorValue: number;
  onCancel: () => void;
  onSubmit: (newValue: number, reason: string) => void;
}

const REASON_PRESETS = [
  "Customer verbal commit",
  "Competitive risk not reflected in CRM",
  "Budget/timing pushed by customer",
  "Champion change at account",
  "Other (see notes)",
];

export function OverrideModal({ title, priorValue, onCancel, onSubmit }: Props) {
  const [newValue, setNewValue] = useState(priorValue);
  const [preset, setPreset] = useState(REASON_PRESETS[0]);
  const [notes, setNotes] = useState("");

  const reason = notes.trim() ? `${preset} — ${notes.trim()}` : preset;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p className="secondary" style={{ fontSize: 13 }}>
          AI-drafted value: {moneyFull(priorValue)}
        </p>
        <div className="slider-row">
          <label>Your number</label>
          <input type="number" value={newValue} onChange={(e) => setNewValue(Number(e.target.value))} />
        </div>
        <div className="slider-row">
          <label>Reason (required — feeds the judgment-learning loop)</label>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            style={{
              padding: 8,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--surface-raised)",
              color: "var(--text-primary)",
            }}
          >
            {REASON_PRESETS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="slider-row">
          <label>Notes (optional)</label>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => onSubmit(newValue, reason)}>
            Save override
          </button>
        </div>
      </div>
    </div>
  );
}
