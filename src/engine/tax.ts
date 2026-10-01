import { MIN_PER_DAY, quarterOf } from './calendar';
import { addHeat, addRecord, isJailed } from './justice';
import { coverNegativeCash } from './portfolio';
import type { GameEvent, GameState } from './types';

export const TAX_RATE = 0.25;

export function quarterlyTax(g: GameState, events: GameEvent[]): void {
  const q = quarterOf(g.time);
  if (q <= g.tax.lastQuarter) return;
  const taxable = Math.max(0, g.tax.quarterGains) + Math.max(0, g.tax.quarterGambling) + g.tax.quarterSalary;
  g.tax.lastQuarter = q;
  g.tax.quarterGains = 0;
  g.tax.quarterGambling = 0;
  g.tax.quarterSalary = 0;
  const owed = Math.round(taxable * TAX_RATE);
  if (owed < 1) return;
  if (g.tax.bill) settleOverdue(g, events);
  g.tax.bill = { quarter: q, issuedAt: g.time, dueAt: g.time + 7 * MIN_PER_DAY, taxable, owed };
  events.push({ kind: 'info', title: 'Quarterly tax bill', body: `You owe $${owed.toLocaleString()} in taxes. Due in 7 days. Pay it… or get creative.`, link: '/taxes', toast: true });
}

function settleOverdue(g: GameState, events: GameEvent[]) {
  const bill = g.tax.bill;
  if (!bill) return;
  const penalty = Math.round(bill.owed * 1.25);
  g.player.cash -= penalty;
  addHeat(g, 'tax', 15);
  g.tax.bill = null;
  addRecord(g, 'Failed to file taxes on time');
  events.push({ kind: 'bad', title: 'Tax deadline missed', body: `The Revenue Service garnished $${penalty.toLocaleString()} (incl. 25% penalty). Tax heat +15.`, toast: true });
  coverNegativeCash(g, events);
}

export function checkTaxDeadline(g: GameState, events: GameEvent[]): void {
  if (g.tax.bill && g.time >= g.tax.bill.dueAt && !isJailed(g)) settleOverdue(g, events);
}

export type TaxChoice = 'full' | 'underreport' | 'offshore';

export function payTax(g: GameState, choice: TaxChoice): string | null {
  const bill = g.tax.bill;
  if (!bill) return 'No tax bill outstanding.';
  let pay = bill.owed;
  if (choice === 'underreport') pay = Math.round(bill.owed * 0.5);
  if (choice === 'offshore') {
    if (!g.player.hasOffshore) return 'You need an offshore account to hide income.';
    pay = Math.round(bill.owed * 0.1);
  }
  if (g.player.cash < pay) return 'Not enough cash to pay that amount.';
  g.player.cash -= pay;
  const evaded = bill.owed - pay;
  if (evaded > 0) {
    g.tax.evadedTotal += evaded;
    const heat = choice === 'offshore' ? Math.min(50, 15 + evaded / 4000) : Math.min(40, 10 + evaded / 5000);
    addHeat(g, 'tax', heat);
    g.player.infamy = Math.min(100, g.player.infamy + 3);
    addRecord(g, `Evaded $${evaded.toLocaleString()} in taxes (${choice === 'offshore' ? 'offshore shell' : 'under-reported income'})`);
  } else {
    addHeat(g, 'tax', -10);
    g.player.reputation = Math.min(100, g.player.reputation + 1);
  }
  g.tax.bill = null;
  return null;
}
