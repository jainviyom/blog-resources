import type { Opportunity } from "../api/types";
import { moneyFull, pct } from "../format";
import { FlagBadges, SlipRiskBadge } from "./FlagBadges";

interface Props {
  deals: Opportunity[];
  showOwner?: boolean;
  onAdjust?: (opp: Opportunity) => void;
}

export function DealTable({ deals, showOwner, onAdjust }: Props) {
  if (!deals.length) return <p className="muted">No deals to show.</p>;
  return (
    <table>
      <thead>
        <tr>
          <th>Account</th>
          {showOwner && <th>Owner</th>}
          <th>Stage</th>
          <th>Amount</th>
          <th>Win Prob.</th>
          <th>Slip Risk</th>
          <th>Flags</th>
          {onAdjust && <th />}
        </tr>
      </thead>
      <tbody>
        {deals.map((d) => (
          <tr key={d.id} title={d.score.whyText}>
            <td>{d.accountName}</td>
            {showOwner && <td>{d.ownerName}</td>}
            <td>{d.stage}</td>
            <td>{d.amount === null ? <span className="muted">—</span> : moneyFull(d.amount)}</td>
            <td>{pct(d.score.winProbability)}</td>
            <td>
              <SlipRiskBadge risk={d.score.slipRisk} />
            </td>
            <td>
              <FlagBadges flags={d.score.flags} />
            </td>
            {onAdjust && (
              <td>
                <button className="btn" onClick={() => onAdjust(d)}>
                  Adjust
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
