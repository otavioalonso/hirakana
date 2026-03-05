/**
 * Heatmap strip — two rows: hiragana on top, katakana below.
 * Always shows all kana as fixed-width colored cells.
 * Tapping it navigates to the Stats screen.
 */

import { HIRAGANA_ROWS, KATAKANA_ROWS } from '../data/hiragana.js';
import { EMA_GREEN, EMA_YELLOW } from '../engine/config.js';

function cellColor(stats, unlocked) {
  if (!unlocked) return '#2a2a2e';          // dark gray — locked
  if (stats.attempts === 0) return '#3a3a40'; // slightly lighter — unseen
  if (stats.ema >= EMA_GREEN) return '#22c55e'; // green
  if (stats.ema >= EMA_YELLOW) return '#eab308'; // yellow
  return '#ef4444';                           // red
}

function HeatmapRow({ rows, store, unlockedLevel }) {
  return (
    <div className="heatmap-line">
      {rows.map((row, rowIdx) => (
        <div className="heatmap-row-group" key={row.name}>
          {row.letters.map((letter) => {
            const s = store.stats[letter.id];
            const unlocked = rowIdx < unlockedLevel;
            return (
              <div
                key={letter.id}
                className="heatmap-cell"
                style={{ backgroundColor: cellColor(s, unlocked) }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function Heatmap({ store, mode, onNavigateStats }) {
  return (
    <div
      className="heatmap-strip"
      onClick={onNavigateStats}
      role="button"
      tabIndex={0}
      aria-label="View stats"
    >
      {mode !== 'katakana' && (
        <HeatmapRow rows={HIRAGANA_ROWS} store={store} unlockedLevel={store.level} />
      )}
      {mode !== 'hiragana' && (
        <HeatmapRow rows={KATAKANA_ROWS} store={store} unlockedLevel={store.kataLevel} />
      )}
    </div>
  );
}
