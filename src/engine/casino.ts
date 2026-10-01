import { nextRandom, type RngHolder } from './rng';

// ---------------- Roulette (European, single zero) ----------------

export const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
export const WHEEL_ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

export type RouletteBet =
  | { kind: 'straight'; n: number }
  | { kind: 'red' | 'black' | 'odd' | 'even' | 'low' | 'high' }
  | { kind: 'dozen' | 'column'; n: 1 | 2 | 3 };

export const numberColor = (n: number) => (n === 0 ? 'green' : RED_NUMBERS.has(n) ? 'red' : 'black');

export function spinRoulette(h: RngHolder): number {
  return Math.floor(nextRandom(h) * 37);
}

/** Total returned (stake + winnings) for a winning bet, 0 for a loss. */
export function roulettePayout(bet: RouletteBet, stake: number, n: number): number {
  const win = (mult: number) => stake * (mult + 1);
  switch (bet.kind) {
    case 'straight':
      return bet.n === n ? win(35) : 0;
    case 'red':
      return numberColor(n) === 'red' ? win(1) : 0;
    case 'black':
      return numberColor(n) === 'black' ? win(1) : 0;
    case 'odd':
      return n !== 0 && n % 2 === 1 ? win(1) : 0;
    case 'even':
      return n !== 0 && n % 2 === 0 ? win(1) : 0;
    case 'low':
      return n >= 1 && n <= 18 ? win(1) : 0;
    case 'high':
      return n >= 19 ? win(1) : 0;
    case 'dozen':
      return n !== 0 && Math.ceil(n / 12) === bet.n ? win(2) : 0;
    case 'column':
      return n !== 0 && ((n - 1) % 3) + 1 === bet.n ? win(2) : 0;
  }
}

export function betKey(b: RouletteBet): string {
  return 'n' in b ? `${b.kind}-${b.n}` : b.kind;
}

// ---------------- Blackjack ----------------

export interface Card {
  rank: number; // 1 = Ace, 11-13 = J Q K
  suit: 0 | 1 | 2 | 3; // ♠ ♥ ♦ ♣
}

export const SUITS = ['♠', '♥', '♦', '♣'];
export const RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function newShoe(h: RngHolder, decks = 6): Card[] {
  const cards: Card[] = [];
  for (let d = 0; d < decks; d++)
    for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) cards.push({ rank: r, suit: s as Card['suit'] });
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom(h) * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export function handValue(cards: Card[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += Math.min(10, c.rank);
    if (c.rank === 1) aces++;
  }
  const soft = aces > 0 && total + 10 <= 21;
  return { total: soft ? total + 10 : total, soft };
}

export const isBlackjack = (cards: Card[]) => cards.length === 2 && handValue(cards).total === 21;

/** Dealer draws to 17, standing on soft 17. Mutates shoe. */
export function playDealer(dealer: Card[], shoe: Card[]): Card[] {
  const out = [...dealer];
  while (handValue(out).total < 17) out.push(shoe.pop()!);
  return out;
}

export type BjOutcome = 'blackjack' | 'win' | 'push' | 'lose' | 'bust';

export function settleBlackjack(player: Card[], dealer: Card[]): BjOutcome {
  const p = handValue(player).total;
  const d = handValue(dealer).total;
  if (p > 21) return 'bust';
  if (isBlackjack(player) && !isBlackjack(dealer)) return 'blackjack';
  if (isBlackjack(dealer) && !isBlackjack(player)) return 'lose';
  if (d > 21 || p > d) return 'win';
  if (p === d) return 'push';
  return 'lose';
}

export function blackjackReturn(outcome: BjOutcome, stake: number): number {
  switch (outcome) {
    case 'blackjack':
      return stake * 2.5;
    case 'win':
      return stake * 2;
    case 'push':
      return stake;
    default:
      return 0;
  }
}
