import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, useGameState } from '../store/useGame';

export default function Settings() {
  const g = useGameState();
  const { exportSave, importSave, reset, save } = useGame.getState();
  const act = useGame((s) => s.act);
  const nav = useNavigate();
  const [name, setName] = useState(g.player.name);
  const [code, setCode] = useState('');
  const [exported, setExported] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="font-display text-2xl font-bold">Settings</h1>

      <div className="panel panel-pad space-y-3">
        <div className="panel-title">Profile</div>
        <label className="label" htmlFor="pname">
          Tycoon name
        </label>
        <div className="flex gap-2">
          <input id="pname" className="input" maxLength={28} value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn-ghost" onClick={() => act((gs) => void (gs.player.name = name.trim() || gs.player.name))}>
            Save
          </button>
        </div>
      </div>

      <div className="panel panel-pad space-y-3">
        <div className="panel-title">Save game</div>
        <p className="text-sm text-ink-400">Your game autosaves in this browser every 15 seconds. Use a save code to move it to another device.</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={() => void save().then(() => setMsg('Saved.'))}>
            Save now
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              const c = exportSave();
              setExported(c);
              void navigator.clipboard?.writeText(c).then(
                () => setMsg('Save code copied to clipboard.'),
                () => setMsg('Copy the code below.'),
              );
            }}
          >
            Export save code
          </button>
        </div>
        {exported && <textarea readOnly className="input h-24 font-mono text-[10px]" value={exported} onFocus={(e) => e.currentTarget.select()} />}
        <textarea className="input h-20 font-mono text-xs" placeholder="Paste a save code to import" value={code} onChange={(e) => setCode(e.target.value)} />
        <button className="btn-ghost" disabled={!code.trim()} onClick={() => setMsg(importSave(code) ?? 'Save imported.')}>
          Import save code
        </button>
        {msg && <div className="text-sm text-gold-400">{msg}</div>}
      </div>

      <div className="panel panel-pad space-y-3 border-down/30">
        <div className="panel-title">Danger zone</div>
        {confirmReset ? (
          <div className="flex gap-2">
            <button
              className="btn-sell"
              onClick={() => {
                void reset().then(() => nav('/'));
              }}
            >
              Yes, delete everything
            </button>
            <button className="btn-ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="btn-ghost text-down" onClick={() => setConfirmReset(true)}>
            Start a new game
          </button>
        )}
      </div>

      <div className="panel panel-pad space-y-2 text-sm text-ink-400">
        <div className="panel-title">About</div>
        <p>
          <b className="text-ink-200">CAPITAL</b> is a satirical capitalism LARP. Stock-market companies, people and news are fictional; any resemblance is parody. Shop items use real brand and model names for flavour only — trademarks belong to their owners, who are not affiliated with or endorsing this game. Prices and specs are approximate. Nothing here is financial advice and no real money is involved. All art is drawn procedurally in code.
        </p>
        <p>Market data is simulated: prices follow a correlated random walk with sector betas, mean reversion to fundamental value, and shocks from the news engine. Rumours move prices but fade; real news sticks.</p>
      </div>
    </div>
  );
}
