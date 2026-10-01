import { create } from 'zustand';
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';
import { advance, migrateGame, newGame, offlineMinutes, pushInbox, SAVE_VERSION, workGig } from '../engine/game';
import type { GameEvent, GameState } from '../engine/types';

const SAVE_KEY = 'capital-save-v1';

export interface Toast {
  id: number;
  kind: GameEvent['kind'];
  title: string;
  body: string;
  link?: string;
}

interface Store {
  game: GameState | null;
  tick: number;
  loaded: boolean;
  toasts: Toast[];
  awaySummary: { minutes: number; netWorthDelta: number } | null;
  /** Run a mutation against the game state, then re-render. Returns the mutation's result. */
  act: <T>(fn: (g: GameState, events: GameEvent[]) => T) => T;
  step: (minutes: number) => void;
  gig: () => void;
  setSpeed: (s: number) => void;
  start: (name: string) => void;
  load: () => Promise<void>;
  save: () => Promise<void>;
  reset: () => Promise<void>;
  importSave: (code: string) => string | null;
  exportSave: () => string;
  dismissToast: (id: number) => void;
  clearAway: () => void;
}

let toastId = 0;

function toToasts(events: GameEvent[]): Toast[] {
  return events.filter((e) => e.toast).map((e) => ({ id: ++toastId, kind: e.kind, title: e.title, body: e.body, link: e.link }));
}

export const useGame = create<Store>((set, get) => ({
  game: null,
  tick: 0,
  loaded: false,
  toasts: [],
  awaySummary: null,

  act: (fn) => {
    const g = get().game;
    if (!g) throw new Error('No game');
    const events: GameEvent[] = [];
    const result = fn(g, events);
    for (const e of events) pushInbox(g, e);
    set((s) => ({ tick: s.tick + 1, toasts: [...s.toasts, ...toToasts(events)].slice(-5) }));
    return result;
  },

  step: (minutes) => {
    const g = get().game;
    if (!g || minutes <= 0) return;
    const events = advance(g, minutes);
    set((s) => ({ tick: s.tick + 1, toasts: events.length ? [...s.toasts, ...toToasts(events)].slice(-5) : s.toasts }));
  },

  gig: () => {
    const g = get().game;
    if (!g) return;
    const events = workGig(g);
    set((s) => ({ tick: s.tick + 1, toasts: [...s.toasts, ...toToasts(events)].slice(-5) }));
  },

  setSpeed: (speed) => {
    const g = get().game;
    if (!g) return;
    g.speed = speed;
    set((s) => ({ tick: s.tick + 1 }));
  },

  start: (name) => {
    const g = newGame(name);
    set({ game: g, tick: 0, toasts: [] });
    void get().save();
  },

  load: async () => {
    try {
      const saved = (await idbGet(SAVE_KEY)) as GameState | undefined;
      if (saved && saved.version === SAVE_VERSION) {
        migrateGame(saved);
        const away = offlineMinutes(saved);
        let awaySummary = null;
        if (away > 30 && !saved.trial) {
          const before = saved.netWorthHistory[saved.netWorthHistory.length - 1]?.v ?? 0;
          const events = advance(saved, away);
          const after = saved.netWorthHistory[saved.netWorthHistory.length - 1]?.v ?? before;
          awaySummary = { minutes: away, netWorthDelta: after - before };
          set({ toasts: toToasts(events).slice(-3) });
        }
        set({ game: saved, loaded: true, awaySummary });
        return;
      }
    } catch (e) {
      console.warn('Could not load save', e);
    }
    set({ loaded: true });
  },

  save: async () => {
    const g = get().game;
    if (!g) return;
    g.lastSavedReal = Date.now();
    try {
      await idbSet(SAVE_KEY, g);
    } catch (e) {
      console.warn('Save failed', e);
    }
  },

  reset: async () => {
    await idbDel(SAVE_KEY);
    set({ game: null, tick: 0, toasts: [], awaySummary: null });
  },

  exportSave: () => {
    const g = get().game;
    if (!g) return '';
    return btoa(unescape(encodeURIComponent(JSON.stringify(g))));
  },

  importSave: (code) => {
    try {
      const g = JSON.parse(decodeURIComponent(escape(atob(code.trim())))) as GameState;
      if (g.version !== SAVE_VERSION || !g.stocks || !g.player) return 'That save code is not valid for this version.';
      migrateGame(g);
      g.lastSavedReal = Date.now();
      set({ game: g, tick: 0, toasts: [] });
      void get().save();
      return null;
    } catch {
      return 'Could not read that save code.';
    }
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clearAway: () => set({ awaySummary: null }),
}));

/** Subscribe a component to every simulation tick and return the (mutable) game state. */
export function useGameState(): GameState {
  useGame((s) => s.tick);
  return useGame((s) => s.game)!;
}

/** Start the real-time loop. 4 updates per second; `speed` = game minutes per real second. */
export function startLoop(): () => void {
  let carry = 0;
  const interval = window.setInterval(() => {
    const { game, step } = useGame.getState();
    if (!game || game.speed <= 0 || game.trial) return;
    carry += game.speed / 4;
    const whole = Math.floor(carry);
    if (whole > 0) {
      carry -= whole;
      step(whole);
    }
  }, 250);
  const autosave = window.setInterval(() => void useGame.getState().save(), 15000);
  const onHide = () => {
    if (document.visibilityState === 'hidden') void useGame.getState().save();
  };
  document.addEventListener('visibilitychange', onHide);
  window.addEventListener('pagehide', onHide);
  return () => {
    window.clearInterval(interval);
    window.clearInterval(autosave);
    document.removeEventListener('visibilitychange', onHide);
    window.removeEventListener('pagehide', onHide);
  };
}
