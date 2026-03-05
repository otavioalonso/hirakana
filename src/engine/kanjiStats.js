/**
 * Kanji statistics engine — pure data, no React.
 *
 * Mirrors the kana stats engine but uses a separate localStorage key
 * and a separate store shape (kanjiLevel instead of level/kataLevel).
 */

import { KANJI_LIST } from '../data/kanji.js';
import {
  EMA_DECAY,
  EMA_DECAY_MASTERED,
  EMA_GREEN,
  EMA_INITIAL,
  KANJI_STORAGE_KEY,
} from './config.js';

// ── Shape helpers ─────────────────────────────────────────────

const freshKanjiStats = () => ({
  ema: EMA_INITIAL,
  attempts: 0,
  mistakes: 0,
  lastSeenTurn: 0,
});

export function createBlankKanjiStore() {
  const stats = {};
  for (const k of KANJI_LIST) {
    stats[k.id] = freshKanjiStats();
  }
  return {
    stats,
    kanjiLevel: 1,   // Groups unlocked (1 = first group only)
    turn: 0,
    log: [],
  };
}

// ── Persistence ───────────────────────────────────────────────

export function loadKanjiStore() {
  try {
    const raw = localStorage.getItem(KANJI_STORAGE_KEY);
    if (!raw) return createBlankKanjiStore();
    const parsed = JSON.parse(raw);
    for (const k of KANJI_LIST) {
      if (!parsed.stats[k.id]) {
        parsed.stats[k.id] = freshKanjiStats();
      }
    }
    if (!Array.isArray(parsed.log)) parsed.log = [];
    if (parsed.kanjiLevel === undefined) parsed.kanjiLevel = 1;
    return parsed;
  } catch {
    return createBlankKanjiStore();
  }
}

export function saveKanjiStore(store) {
  try {
    localStorage.setItem(KANJI_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // quota exceeded
  }
}

// ── Mutations (pure) ──────────────────────────────────────────

export function recordKanjiAnswer(store, kanjiId, chosenId, correct) {
  const turn = store.turn + 1;
  const prev = store.stats[kanjiId];
  const decay = (!correct && prev.ema >= EMA_GREEN) ? EMA_DECAY_MASTERED : EMA_DECAY;
  const newEma = prev.ema * decay + (correct ? 1 : 0) * (1 - decay);

  const newStats = {
    ...store.stats,
    [kanjiId]: {
      ema: newEma,
      attempts: prev.attempts + 1,
      mistakes: prev.mistakes + (correct ? 0 : 1),
      lastSeenTurn: turn,
    },
  };

  const logEntry = {
    turn,
    kanjiId,
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

export function setKanjiLevel(store, newLevel) {
  return { ...store, kanjiLevel: newLevel };
}

export function resetKanjiStore() {
  const blank = createBlankKanjiStore();
  saveKanjiStore(blank);
  return blank;
}

/**
 * Skip the current kanji group — give all unlocked kanji a passing score
 * and advance to the next group.
 */
export function skipKanjiLevel(store) {
  const newStats = { ...store.stats };

  for (const k of KANJI_LIST) {
    if (k.group < store.kanjiLevel) {
      const s = newStats[k.id];
      newStats[k.id] = {
        ...s,
        ema: Math.max(s.ema, 0.8),
        attempts: Math.max(s.attempts, 6),
        lastSeenTurn: store.turn,
      };
    }
  }

  const updated = {
    ...store,
    stats: newStats,
    kanjiLevel: store.kanjiLevel + 1,
  };
  saveKanjiStore(updated);
  return updated;
}
