/**
 * Kanji sampler — picks next kanji and generates distractors.
 * Pure functions, no React.
 */

import { KANJI_LIST, KANJI_BY_ID, TOTAL_KANJI_GROUPS, kanjiInGroup } from '../data/kanji.js';
import {
  ALPHA,
  STALENESS_SCALE,
  STALENESS_CAP,
  MIN_SAMPLES,
  NEWNESS_BOOST,
  LATEST_ROW_BOOST,
  RECENCY_BONUS,
  SAME_ROW_BONUS,
  KANJI_UNLOCK_EMA,
  KANJI_UNLOCK_ALL,
  KANJI_UNLOCK_MIN,
  KANJI_FAMILIARITY_2,
  KANJI_FAMILIARITY_3,
  DEBUG,
} from './config.js';

// ── Helpers ───────────────────────────────────────────────────

function weightedRandomIndex(weights) {
  const total = weights.reduce((s, w) => s + w, 0);
  if (total === 0) return 0;
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Pool ──────────────────────────────────────────────────────

/** Get all unlocked kanji */
export function getKanjiPool(kanjiLevel) {
  return KANJI_LIST.filter((k) => k.group < kanjiLevel);
}

// ── Level check ───────────────────────────────────────────────

export function checkKanjiLevelUp(store) {
  const { kanjiLevel, stats } = store;
  if (kanjiLevel >= TOTAL_KANJI_GROUPS) return kanjiLevel;

  // Latest group must all be mastered
  const latestGroup = kanjiInGroup(kanjiLevel - 1);
  const latestReady = latestGroup.every((k) => {
    const s = stats[k.id];
    return s.attempts >= KANJI_UNLOCK_MIN && s.ema >= KANJI_UNLOCK_EMA;
  });
  if (!latestReady) return kanjiLevel;

  // All earlier kanji must be at least yellow
  const pool = getKanjiPool(kanjiLevel);
  const allReady = pool.every((k) => {
    const s = stats[k.id];
    return s.attempts >= KANJI_UNLOCK_MIN && s.ema >= KANJI_UNLOCK_ALL;
  });

  return allReady ? kanjiLevel + 1 : kanjiLevel;
}

// ── Pick next kanji ───────────────────────────────────────────

export function pickKanji(store, lastId = null) {
  const pool = getKanjiPool(store.kanjiLevel);
  if (pool.length === 0) return null;
  const { stats, turn } = store;
  const latestGroup = store.kanjiLevel - 1; // 0-indexed

  const weights = pool.map((k) => {
    const s = stats[k.id];
    const errorSignal = 1 - s.ema;
    const newness =
      s.attempts < MIN_SAMPLES
        ? 1 + NEWNESS_BOOST * (MIN_SAMPLES - s.attempts) / MIN_SAMPLES
        : 1;
    const turnsSince = turn - (s.lastSeenTurn || 0);
    const staleness = Math.min(STALENESS_CAP, turnsSince / STALENESS_SCALE);

    // Boost kanji from the most recently unlocked group
    const isLatest = k.group === latestGroup;
    const latestBoost = isLatest && s.attempts < MIN_SAMPLES
      ? 1 + LATEST_ROW_BOOST * (MIN_SAMPLES - s.attempts) / MIN_SAMPLES
      : 1;

    return (1 + ALPHA * errorSignal) * newness * (1 + staleness) * latestBoost;
  });

  // Suppress immediate repeat
  if (lastId && pool.length > 1) {
    const idx = pool.findIndex((k) => k.id === lastId);
    if (idx !== -1) weights[idx] = 0;
  }

  const chosenIdx = weightedRandomIndex(weights);
  const chosen = pool[chosenIdx];

  if (DEBUG) {
    const totalW = weights.reduce((s, w) => s + w, 0);
    chosen._debug = {
      weight: weights[chosenIdx].toFixed(1),
      pct: (100 * weights[chosenIdx] / totalW).toFixed(1),
    };
  }

  return chosen;
}

// ── Dynamic option count ──────────────────────────────────────

export function getKanjiOptionCount(store, kanji) {
  const s = store.stats[kanji.id];
  const pool = getKanjiPool(store.kanjiLevel);
  let count;
  if (s.attempts < KANJI_FAMILIARITY_2) count = 2;
  else if (s.attempts < KANJI_FAMILIARITY_3) count = 3;
  else count = 4;
  return Math.min(count, pool.length);
}

// ── Distractors ───────────────────────────────────────────────

/**
 * Pick distractors, preferring the kanji's `similar` list,
 * then falling back to group-recency weighting.
 */
export function pickKanjiDistractors(store, correct, count) {
  const pool = getKanjiPool(store.kanjiLevel).filter((k) => k.id !== correct.id);
  if (pool.length === 0) return [];
  const needed = Math.min(count, pool.length);

  const similarSet = new Set(correct.similar || []);
  const maxGroup = store.kanjiLevel - 1;

  const weights = pool.map((k) => {
    let w = 1;
    // Boost similar kanji (visual/semantic confusers)
    if (similarSet.has(k.id)) w += 4;
    // Strong boost for kanji from the same group
    if (k.group === correct.group) w += SAME_ROW_BONUS;
    // Recency bonus for kanji from nearby groups
    const recency = maxGroup > 0 ? k.group / maxGroup : 1;
    w += RECENCY_BONUS * recency;
    return w;
  });

  const chosen = [];
  const used = new Set();
  for (let i = 0; i < needed; i++) {
    const w = weights.map((wt, idx) => (used.has(idx) ? 0 : wt));
    const idx = weightedRandomIndex(w);
    used.add(idx);
    const kanji = pool[idx];
    if (DEBUG) {
      const totalW = weights.reduce((s, wt) => s + wt, 0);
      kanji._debug = {
        weight: weights[idx].toFixed(1),
        pct: (100 * weights[idx] / totalW).toFixed(1),
      };
    }
    chosen.push(kanji);
  }
  return chosen;
}

/**
 * Build full option set (correct + distractors), shuffled.
 */
export function buildKanjiOptions(store, correct) {
  const optionCount = getKanjiOptionCount(store, correct);
  const distractors = pickKanjiDistractors(store, correct, optionCount - 1);
  return shuffle([correct, ...distractors]);
}
