/**
 * KanjiHeatmap — one progress bar per unlocked JLPT level.
 * New bars appear progressively as you advance through levels.
 */

import { JLPT_LEVELS, kanjiInGroup } from '../data/kanji.js';
import { EMA_GREEN, EMA_YELLOW } from '../engine/config.js';

function cellColor(stats, unlocked) {
  if (!unlocked) return '#2a2a2e';
  if (stats.attempts === 0) return '#3a3a40';
  if (stats.ema >= EMA_GREEN) return '#22c55e';
  if (stats.ema >= EMA_YELLOW) return '#eab308';
  return '#ef4444';
}

export default function KanjiHeatmap({ store, onNavigateStats }) {
  // Only show JLPT levels that have at least one unlocked group
  const visibleLevels = JLPT_LEVELS.filter(
    (l) => store.kanjiLevel > l.firstGroup,
  );

  return (
    <div
      className="heatmap-strip"
      onClick={onNavigateStats}
      role="button"
      tabIndex={0}
      aria-label="View kanji stats"
    >
      {visibleLevels.map((level) => {
        const firstGroup = level.firstGroup;
        const lastGroup = firstGroup + level.groupCount;
        return (
          <div className="heatmap-level-row" key={level.jlpt}>
            <span className="heatmap-level-label">{level.label}</span>
            <div className="heatmap-line">
              {Array.from({ length: level.groupCount }, (_, i) => {
                const g = firstGroup + i;
                return (
                  <div className="heatmap-row-group" key={g}>
                    {kanjiInGroup(g).map((k) => {
                      const s = store.stats[k.id];
                      const unlocked = g < store.kanjiLevel;
                      return (
                        <div
                          key={k.id}
                          className="heatmap-cell"
                          style={{ backgroundColor: cellColor(s, unlocked) }}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
