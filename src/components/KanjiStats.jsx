/**
 * KanjiStats — per-kanji grid with EMA bars and attempt log.
 * Groups are organized by JLPT level, only showing unlocked levels.
 */

import { JLPT_LEVELS, kanjiInGroup, KANJI_GROUP_NAMES } from '../data/kanji.js';
import { EMA_GREEN, EMA_YELLOW } from '../engine/config.js';
import { resetKanjiStore } from '../engine/kanjiStats.js';

function emaColor(ema, attempts) {
  if (attempts === 0) return '#3a3a40';
  if (ema >= EMA_GREEN) return '#22c55e';
  if (ema >= EMA_YELLOW) return '#eab308';
  return '#ef4444';
}

export default function KanjiStats({ store, setStore, onBack }) {
  const handleReset = () => {
    if (window.confirm('Reset all kanji progress? This cannot be undone.')) {
      setStore(resetKanjiStore());
    }
  };

  // Only show JLPT levels that have at least one unlocked group
  const visibleLevels = JLPT_LEVELS.filter(
    (l) => store.kanjiLevel > l.firstGroup,
  );

  return (
    <div className="stats-screen">
      <header className="stats-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Kanji Stats</h2>
        <button className="reset-btn" onClick={handleReset}>Reset</button>
      </header>

      {visibleLevels.map((level) => {
        const firstGroup = level.firstGroup;
        const lastGroup = firstGroup + level.groupCount;
        // Only show groups up to kanjiLevel (unlocked)
        const shownGroups = Math.min(lastGroup, store.kanjiLevel) - firstGroup;

        return (
          <div key={level.jlpt} className="stats-jlpt-section">
            <h3 className="stats-jlpt-heading">{level.label}</h3>
            <div className="stats-grid">
              {Array.from({ length: shownGroups }, (_, i) => {
                const g = firstGroup + i;
                const kanji = kanjiInGroup(g);
                const unlocked = g < store.kanjiLevel;
                const groupName = g < KANJI_GROUP_NAMES.length ? KANJI_GROUP_NAMES[g] : `Group ${g + 1}`;
                return (
                  <div key={g} className="stats-row">
                    <div className="stats-row-name">{groupName}</div>
                    <div className="stats-row-letters">
                      {kanji.map((k) => {
                        const s = store.stats[k.id];
                        return (
                          <div
                            key={k.id}
                            className={`stats-card stats-card--kanji${unlocked ? '' : ' stats-card--locked'}`}
                          >
                            <div className="stats-kana">{k.kanji}</div>
                            <div className="stats-romaji">{k.meaning}</div>
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
                              <div className="stats-detail">{unlocked ? '—' : '🔒'}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <details className="log-section">
        <summary>Full attempt log ({store.log.length} entries)</summary>
        <div className="log-table-wrap">
          <table className="log-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Kanji</th>
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
                    <td>{entry.kanjiId}</td>
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
