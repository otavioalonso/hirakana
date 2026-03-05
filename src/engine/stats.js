/**
 * Statistics engine — pure data, no React.
 *
 * Tracks per-letter EMA, attempt counts, last-seen turn,
 * and a **full attempt log** so analysis pages can be built later.
 *
 * Persistence: JSON ↔ localStorage, but the module is unaware of
 * any UI framework.
 */

import { ALL_LETTERS } from '../data/hiragana.js';
import {
  EMA_DECAY,
  EMA_DECAY_MASTERED,
  EMA_GREEN,
  EMA_INITIAL,
  STORAGE_KEY,
} from './config.js';

// ── Shape helpers ─────────────────────────────────────────────

/** Create a fresh per-letter stats object */
const freshLetterStats = () => ({
  ema: EMA_INITIAL,
  attempts: 0,
  mistakes: 0,
  lastSeenTurn: 0,
});

/** Create a blank store */
export function createBlankStore() {
  const stats = {};
  for (const letter of ALL_LETTERS) {
    stats[letter.id] = freshLetterStats();
  }
  return {
    stats,          // Record<letterId, { ema, attempts, mistakes, lastSeenTurn }>
    level: 1,       // Hiragana rows unlocked (1-indexed: 1 = vowels only)
    kataLevel: 0,   // Katakana rows unlocked (0 = none; 1 = vowels katakana, etc.)
    turn: 0,        // Global turn counter
    log: [],        // Full attempt log: { turn, letterId, chosenId, correct, timestamp }
  };
}

// ── Persistence ───────────────────────────────────────────────

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createBlankStore();
    const parsed = JSON.parse(raw);
    // Ensure any newly-added letters exist in the store
    for (const letter of ALL_LETTERS) {
      if (!parsed.stats[letter.id]) {
        parsed.stats[letter.id] = freshLetterStats();
      }
    }
    if (!Array.isArray(parsed.log)) parsed.log = [];
    if (parsed.kataLevel === undefined) parsed.kataLevel = 0;
    return parsed;
  } catch {
    return createBlankStore();
  }
}

export function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // quota exceeded — silently fail
  }
}

// ── Mutations (all pure — return new objects) ─────────────────

/**
 * Record an answer and return the updated store.
 * @param {object}  store     Current store
 * @param {string}  letterId  The prompted letter's id
 * @param {string}  chosenId  The id of the kana the player picked
 * @param {boolean} correct   Whether the answer was correct
 * @returns {object} New store (shallow-cloned at top level)
 */
export function recordAnswer(store, letterId, chosenId, correct) {
  const turn = store.turn + 1;
  const prev = store.stats[letterId];
  // Asymmetric decay: forgive slips on mastered letters more
  const decay = (!correct && prev.ema >= EMA_GREEN) ? EMA_DECAY_MASTERED : EMA_DECAY;
  const newEma = prev.ema * decay + (correct ? 1 : 0) * (1 - decay);

  const newStats = {
    ...store.stats,
    [letterId]: {
      ema: newEma,
      attempts: prev.attempts + 1,
      mistakes: prev.mistakes + (correct ? 0 : 1),
      lastSeenTurn: turn,
    },
  };

  const logEntry = {
    turn,
    letterId,
    chosenId,
    correct,
    timestamp: Date.now(),
  };

  return {
    ...store,
    stats: newStats,
    turn,
    log: [...store.log, logEntry],
  };
}

/**
 * Set the level (number of unlocked rows).
 */
export function setLevel(store, newLevel) {
  return { ...store, level: newLevel };
}

/**
 * Reset all progress.
 */
export function resetStore() {
  const blank = createBlankStore();
  saveStore(blank);
  return blank;
}

/**
 * Skip the current level — give all unlocked letters a passing score
 * and advance hiragana (and katakana if unlocked) by one level.
 */
export function skipLevel(store, mode) {
  const newStats = { ...store.stats };

  // Give every unlocked letter a passing EMA + min attempts
  for (const letter of ALL_LETTERS) {
    const s = newStats[letter.id];
    const isHira = letter.script === 'hiragana' && letter.row < store.level;
    const isKata = letter.script === 'katakana' && letter.row < store.kataLevel;
    if (isHira || isKata) {
      newStats[letter.id] = {
        ...s,
        ema: Math.max(s.ema, 0.8),
        attempts: Math.max(s.attempts, 6),
        lastSeenTurn: store.turn,
      };
    }
  }

  let newLevel = store.level;
  let newKataLevel = store.kataLevel;

  if (mode !== 'katakana') {
    newLevel = store.level + 1;
  }
  if (mode !== 'hiragana' && store.kataLevel > 0) {
    newKataLevel = store.kataLevel + 1;
  }

  const updated = {
    ...store,
    stats: newStats,
    level: newLevel,
    kataLevel: newKataLevel,
  };
  saveStore(updated);
  return updated;
}
