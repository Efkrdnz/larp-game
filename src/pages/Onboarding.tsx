import { useState } from 'react';
import { useGame } from '../store/useGame';
import CarArt from '../ui/art/CarArt';
import HomeArt from '../ui/art/HomeArt';

export default function Onboarding() {
  const start = useGame((s) => s.start);
  const importSave = useGame((s) => s.importSave);
  const [name, setName] = useState('');
  const [agree, setAgree] = useState(false);
  const [code, setCode] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="noise-bg min-h-screen">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 lg:grid-cols-2 lg:py-20">
        <div>
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" className="h-12 w-12" />
            <span className="font-display text-3xl font-bold tracking-[0.3em] text-gold-500">CAPITAL</span>
          </div>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight sm:text-5xl">
            Greed is good.
            <br />
            <span className="text-ink-300">Jail is less good.</span>
          </h1>
          <p className="mt-4 max-w-lg text-ink-300">
            The ultimate capitalism LARP. Trade 40 stocks on a market driven by breaking news. Buy supercars, watches, mansions and yachts — and pimp them out. Hit the casino. Bribe officials, dodge taxes, trade on insider tips… and maybe end up in a cell.
          </p>
          <ul className="mt-5 grid max-w-lg grid-cols-2 gap-2 text-sm text-ink-200">
            {['📈 Realistic candlestick charts', '📰 News that moves markets', '🏎️ 550+ real cars, watches, homes & jets', '🎰 Blackjack & roulette', '💼 Bribes, tips & offshore', '⚖️ Investigations, trials, prison'].map((f) => (
              <li key={f} className="rounded-xl border border-ink-700 bg-ink-850 px-3 py-2">
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="panel overflow-hidden">
          <div className="relative">
            <HomeArt style="mansion" custom={{ wall: '#fef3c7', roof: '#57534e', pool: true, garden: true, lights: true, gate: false }} hour={19} className="h-auto w-full" />
            <div className="absolute inset-x-0 bottom-0 translate-y-[18%] px-6">
              <CarArt body="super" custom={{ paint: '#dc2626', rims: 'gold', wrap: 'stripes', tint: 'limo', spoiler: true, lowered: true, plate: 'BOSS' }} className="h-auto w-full drop-shadow-2xl" />
            </div>
          </div>
          <div className="space-y-4 p-5 pt-14">
            <div>
              <label className="label" htmlFor="name">
                Your tycoon name
              </label>
              <input id="name" className="input" placeholder="e.g. Gordon Gekko Jr." maxLength={28} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <label className="flex items-start gap-3 rounded-xl border border-ink-700 bg-ink-900 p-3 text-xs text-ink-300">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-yellow-500" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>
                I understand this is a <b className="text-ink-100">satirical game</b>. Stock-market companies and people are fictional; real product names in the shop are used for flavour only and their owners are not affiliated. No real money is involved and nothing here is financial advice. Crimes in the game are fictional — please don't bribe real people.
              </span>
            </label>
            <button className="btn-primary w-full py-3 text-base" disabled={!agree} onClick={() => start(name)}>
              Start with $10,000
            </button>
            <button className="w-full text-center text-xs text-ink-400 underline-offset-2 hover:underline" onClick={() => setShowImport((v) => !v)}>
              Have a save code? Import it
            </button>
            {showImport && (
              <div className="space-y-2">
                <textarea className="input h-20 font-mono text-xs" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste save code" />
                <button className="btn-ghost w-full" onClick={() => setErr(importSave(code))}>
                  Import save
                </button>
                {err && <div className="text-sm text-down">{err}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
