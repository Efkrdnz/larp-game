// Core serializable game types. The whole GameState is saved to IndexedDB as-is.

export type SectorId = 'tech' | 'finance' | 'energy' | 'health' | 'consumer' | 'industrial' | 'auto' | 'media';

export interface Bar {
  t: number; // game minute of bar start
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface StockState {
  ticker: string;
  price: number;
  fair: number; // log of fundamental value; price mean-reverts toward it
  prevClose: number;
  dayOpen: number;
  intraday: Bar[]; // 5-minute bars, last few days
  daily: Bar[]; // one bar per trading day
  pendingGap: number; // log-return accumulated while market is closed, applied at open
  drift: number; // log-return still being applied from recent news
}

export type NewsScope = 'company' | 'sector' | 'macro';

export interface NewsItem {
  id: string;
  t: number; // release time
  headline: string;
  body: string;
  scope: NewsScope;
  tickers: string[];
  sectors: SectorId[];
  impact: number; // headline move (fraction), for display
  moves: Record<string, number>; // ticker -> log-return applied on release
  rumor: boolean; // rumors move price but not fundamentals, so they fade
  category: string;
  breaking: boolean;
}

export type OrderType = 'market' | 'limit' | 'stop';
export type Side = 'buy' | 'sell';

export interface Order {
  id: string;
  ticker: string;
  side: Side;
  type: OrderType;
  qty: number;
  trigger: number; // limit/stop price (unused for market)
  placedAt: number;
}

export interface Holding {
  qty: number; // negative = short
  avgCost: number;
}

export interface Trade {
  id: string;
  t: number;
  ticker: string;
  side: Side;
  qty: number;
  price: number;
  realized: number;
  insider: boolean;
}

export interface OwnedItem {
  uid: string;
  itemId: string;
  boughtFor: number;
  boughtAt: number;
  custom: Record<string, string | number | boolean>;
}

export type Agency = 'tax' | 'sec' | 'police';

export interface Investigation {
  agency: Agency;
  openedAt: number;
  endsAt: number;
  evidence: number; // 0..100
  lawyer: boolean;
  charges: string[];
}

export interface Trial {
  agency: Agency;
  charges: string[];
  evidence: number;
  lawyerTier: 0 | 1 | 2;
  judgeBribed: boolean;
}

export interface TaxBill {
  quarter: number;
  issuedAt: number;
  dueAt: number;
  taxable: number;
  owed: number;
}

export interface InsiderTip {
  newsId: string;
  ticker: string;
  hint: string;
  boughtAt: number;
  expiresAt: number;
  up: boolean;
}

export interface Rival {
  id: string;
  name: string;
  title: string;
  netWorth: number;
  beta: number;
  color: string;
}

export interface InboxMessage {
  id: string;
  t: number;
  kind: 'info' | 'good' | 'bad' | 'crime' | 'news';
  title: string;
  body: string;
  link?: string;
}

export interface GameState {
  version: number;
  seed: number;
  rng: number; // mulberry32 state
  time: number; // game minutes since 2026-01-05 00:00 (a Monday)
  speed: number;
  lastSavedReal: number;
  idCounter: number;

  player: {
    name: string;
    cash: number;
    offshore: number;
    hasOffshore: boolean;
    reputation: number; // 0..100 public standing
    infamy: number; // 0..100 underworld standing
    jailUntil: number | null;
    jailTerms: number;
    salary: number;
    job: string;
  };

  stocks: Record<string, StockState>;
  holdings: Record<string, Holding>;
  orders: Order[];
  trades: Trade[];

  news: NewsItem[]; // released, newest first
  scheduled: NewsItem[]; // future news, sorted by t

  inventory: OwnedItem[];

  heat: Record<Agency, number>;
  investigation: Investigation | null;
  trial: Trial | null;
  record: { t: number; text: string }[];
  tips: InsiderTip[];

  tax: {
    quarterGains: number; // realized trading gains this quarter
    quarterGambling: number; // net gambling winnings this quarter
    quarterSalary: number;
    evadedTotal: number;
    bill: TaxBill | null;
    lastQuarter: number;
  };

  netWorthHistory: { t: number; v: number }[];
  indexHistory: { t: number; v: number }[];
  rivals: Rival[];
  inbox: InboxMessage[];
  stats: { casinoWagered: number; casinoNet: number; bribesPaid: number; tradesMade: number };
}

export interface GameEvent {
  kind: InboxMessage['kind'];
  title: string;
  body: string;
  link?: string;
  toast?: boolean;
}
