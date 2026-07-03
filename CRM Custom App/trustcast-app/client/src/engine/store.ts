const randomUUID = () => crypto.randomUUID();
import {
  accounts,
  reps,
  priorOpportunities,
  buildCurrentOpportunities,
  modelCard,
  accuracyRecords,
  overrideOutcomes,
  initialTopDownTarget,
} from "./data/seed";
import type { Account, AuditEntry, Opportunity, Override, Rep } from "./types";

class Store {
  reps: Rep[] = reps;
  accounts: Account[] = accounts;
  priorOpportunities: Opportunity[] = priorOpportunities;
  currentOpportunities: Opportunity[] = buildCurrentOpportunities();
  overrides: Override[] = [];
  auditLog: AuditEntry[] = [];
  topDownTarget: number = initialTopDownTarget;
  accuracyRecords = accuracyRecords;
  overrideOutcomes = overrideOutcomes;
  modelCard = modelCard;

  addAudit(actor: string, action: string, detail: string): AuditEntry {
    const entry: AuditEntry = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      actor,
      action,
      detail,
    };
    this.auditLog.unshift(entry);
    return entry;
  }

  addOverride(o: Omit<Override, "id" | "timestamp">): Override {
    const override: Override = {
      ...o,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };
    this.overrides.unshift(override);
    return override;
  }

  getOpportunity(id: string): Opportunity | undefined {
    return this.currentOpportunities.find((o) => o.id === id);
  }

  getRep(id: string): Rep | undefined {
    return this.reps.find((r) => r.id === id);
  }

  getAccount(id: string): Account | undefined {
    return this.accounts.find((a) => a.id === id);
  }
}

export const store = new Store();
