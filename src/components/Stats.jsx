/**
 * Stats screen — full per-kana grid with EMA bars, attempts, and mistake counts.
 * Shows hiragana and katakana in separate sections.
 * Also shows the full attempt log for future analysis.
 */

import { HIRAGANA_ROWS, KATAKANA_ROWS } from '../data/hiragana.js';
import { EMA_GREEN, EMA_YELLOW } from '../engine/config.js';
import { resetStore } from '../engine/stats.js';

function emaColor(ema, attempts) {
  if (attempts === 0) return '#3a3a40';
  if (ema >= EMA_GREEN) return '#22c55e';
  if (ema >= EMA_YELLOW) return '#eab308';
  return '#ef4444';
}

function StatsSection({ title, rows, store, unlockedLevel }) {
  return (
    <>
      <h3 className="stats-section-title">{title}</h3>
      <div className="stats-grid">
        {rows.map((row, rowIdx) => (
          <div key={row.name} className="stats-row">
            <div className="stats-row-name">{row.name}</div>
            <div className="stats-row-letters">
              {row.letters.map((letter) => {
                const s = store.stats[letter.id];
                const unlocked = rowIdx < unlockedLevel;
                return (
                  <div
                    key={letter.id}
                    className={`stats-card${unlocked ? '' : ' stats-card--locked'}`}
                  >
                    <div className="stats-kana">{letter.kana}</div>
                    <div className="stats-romaji">{letter.romaji}</div>
                    {unlocked && s.attempts > 0 ? (
                      <>
                        <div
                          className="stats-ema-bar"
                          style={{
                            background: emaColor(s.ema, s.attempts),
                            width: `${Math.round(s.ema * 100)}%`,
                          }}
                        />
                        <div className="stats-detail">
                          {s.attempts} tries · {s.mistakes} miss
                        </div>
                      </>
                    ) : (
                      <div className="stats-detail">
                        {unlocked ? '—' : '🔒'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Stats({ store, setStore, mode, onBack }) {
  const handleReset = () => {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      setStore(resetStore());
    }
  };

  return (
    <div className="stats-screen">
      <header className="stats-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Statistics</h2>
        <button className="reset-btn" onClick={handleReset}>
          Reset
        </button>
      </header>

      {mode !== 'katakana' && (
        <StatsSection
          title="ひらがな"
          rows={HIRAGANA_ROWS}
          store={store}
          unlockedLevel={store.level}
        />
      )}

      {mode !== 'hiragana' && (
        <StatsSection
          title="カタカナ"
          rows={KATAKANA_ROWS}
          store={store}
          unlockedLevel={store.kataLevel}
        />
      )}

      <details className="log-section">
        <summary>Full attempt log ({store.log.length} entries)</summary>
        <div className="log-table-wrap">
          <table className="log-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Letter</th>
                <th>Chosen</th>
                <th>Result</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {store.log
                .slice()
                .reverse()
                .slice(0, 200)
                .map((entry) => (
                  <tr key={entry.turn}>
                    <td>{entry.turn}</td>
                    <td>{entry.letterId}</td>
                    <td>{entry.chosenId}</td>
                    <td>{entry.correct ? '✓' : '✗'}</td>
                    <td>{new Date(entry.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
