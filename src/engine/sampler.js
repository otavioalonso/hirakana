/**
 * Sampler — picks the next letter and generates distractors.
 * Pure functions, no React.
 * Handles both hiragana and katakana with independent leveling.
 */

import {
  ALL_HIRAGANA,
  ALL_KATAKANA,
  HIRAGANA_ROWS,
  KATAKANA_ROWS,
  TOTAL_HIRAGANA_ROWS,
  TOTAL_KATAKANA_ROWS,
} from '../data/hiragana.js';
import {
  ALPHA,
  STALENESS_SCALE,
  STALENESS_CAP,
  MIN_SAMPLES,
  NEWNESS_BOOST,
  LATEST_ROW_BOOST,
  KATA_MAX_RATIO,
  RECENCY_BONUS,
  SAME_ROW_BONUS,
  FAMILIARITY_2,
  FAMILIARITY_3,
  UNLOCK_EMA_PREV,
  UNLOCK_EMA_ALL,
  UNLOCK_MIN_ATT,
  DEBUG,
} from './config.js';

// ── Helpers ───────────────────────────────────────────────────

/** Weighted random index from an array of weights */
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

/** Shuffle array in place (Fisher-Yates) */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Pool ──────────────────────────────────────────────────────

/** Get the pool of hiragana letters available */
export function getHiraganaPool(level) {
  return ALL_HIRAGANA.filter((l) => l.row < level);
}

/** Get the pool of katakana letters available */
export function getKatakanaPool(kataLevel) {
  return ALL_KATAKANA.filter((l) => l.row < kataLevel);
}

/** Get the combined pool of all unlocked letters */
export function getPool(level, kataLevel) {
  return [...getHiraganaPool(level), ...getKatakanaPool(kataLevel)];
}

/** Get pool filtered by practice mode ('hiragana' | 'katakana' | 'both') */
export function getPoolForMode(level, kataLevel, mode) {
  if (mode === 'hiragana') return getHiraganaPool(level);
  // If katakana mode is selected but no katakana is unlocked yet,
  // auto-unlock the first row so the user can start immediately.
  const effectiveKata = (mode === 'katakana' || mode === 'both') && kataLevel === 0
    ? 1
    : kataLevel;
  if (mode === 'katakana') return getKatakanaPool(effectiveKata);
  return [...getHiraganaPool(level), ...getKatakanaPool(effectiveKata)];
}

/** Get same-script pool for distractor selection */
function getScriptPool(store, script) {
  if (script === 'katakana') return getKatakanaPool(store.kataLevel);
  return getHiraganaPool(store.level);
}

// ── Check level unlock ────────────────────────────────────────

/**
 * Check hiragana level up.
 */
export function checkHiraganaLevelUp(store) {
  const { level, stats } = store;
  if (level >= TOTAL_HIRAGANA_ROWS) return level;

  const latestRow = HIRAGANA_ROWS[level - 1].letters;
  const latestReady = latestRow.every((l) => {
    const s = stats[l.id];
    return s.attempts >= UNLOCK_MIN_ATT && s.ema >= UNLOCK_EMA_PREV;
  });
  if (!latestReady) return level;

  const pool = getHiraganaPool(level);
  const allReady = pool.every((l) => {
    const s = stats[l.id];
    return s.attempts >= UNLOCK_MIN_ATT && s.ema >= UNLOCK_EMA_ALL;
  });

  return allReady ? level + 1 : level;
}

/**
 * Check katakana level up.
 * Katakana row i unlocks when hiragana row i is mastered (EMA ≥ UNLOCK_EMA_PREV).
 * Plus all existing katakana letters must be ≥ UNLOCK_EMA_ALL.
 */
export function checkKatakanaLevelUp(store) {
  const { kataLevel, level, stats } = store;
  if (kataLevel >= TOTAL_KATAKANA_ROWS) return kataLevel;

  // Can't unlock katakana row beyond what hiragana has mastered
  // Katakana row i requires hiragana row i to be fully mastered
  const nextKataRow = kataLevel; // 0-indexed row to unlock
  if (nextKataRow >= level) return kataLevel; // hiragana hasn't reached this row yet

  // Check that the corresponding hiragana row is mastered
  const hiraRow = HIRAGANA_ROWS[nextKataRow].letters;
  const hiraReady = hiraRow.every((l) => {
    const s = stats[l.id];
    return s.attempts >= UNLOCK_MIN_ATT && s.ema >= UNLOCK_EMA_PREV;
  });
  if (!hiraReady) return kataLevel;

  // Check that all existing katakana letters are at least yellow
  if (kataLevel > 0) {
    const kataPool = getKatakanaPool(kataLevel);
    const kataReady = kataPool.every((l) => {
      const s = stats[l.id];
      return s.attempts >= UNLOCK_MIN_ATT && s.ema >= UNLOCK_EMA_ALL;
    });
    if (!kataReady) return kataLevel;

    // Latest katakana row must be mastered
    const latestKataRow = KATAKANA_ROWS[kataLevel - 1].letters;
    const latestReady = latestKataRow.every((l) => {
      const s = stats[l.id];
      return s.attempts >= UNLOCK_MIN_ATT && s.ema >= UNLOCK_EMA_PREV;
    });
    if (!latestReady) return kataLevel;
  }

  return kataLevel + 1;
}

// ── Pick next letter ──────────────────────────────────────────

/** Average EMA for a pool of letters */
function avgEma(pool, stats) {
  if (pool.length === 0) return 1;
  return pool.reduce((sum, l) => sum + stats[l.id].ema, 0) / pool.length;
}

/**
 * Pick the next letter to prompt.
 * @param {'hiragana'|'katakana'|'both'} mode  Practice mode
 */
export function pickLetter(store, lastId = null, mode = 'both') {
  const pool = getPoolForMode(store.level, store.kataLevel, mode);
  if (pool.length === 0) return null;
  const { stats, turn } = store;

  // Compute katakana catch-up: guarantee a target fraction of total weight
  // goes to katakana when it's behind in level or EMA.
  //
  // Phase 1: compute raw weights for every letter (script-agnostic).
  // Phase 2: rescale katakana weights so their share of total weight
  //          matches a target ratio derived from the gap.
  const hiraPool = getHiraganaPool(store.level);
  const kataPool = getKatakanaPool(store.kataLevel);

  // Determine the latest unlocked row per script for the latest-row boost
  const latestHiraRow = store.level - 1;   // 0-indexed
  const latestKataRow = store.kataLevel - 1;

  const weights = pool.map((letter) => {
    const s = stats[letter.id];
    const errorSignal = 1 - s.ema;
    const newness =
      s.attempts < MIN_SAMPLES
        ? 1 + NEWNESS_BOOST * (MIN_SAMPLES - s.attempts) / MIN_SAMPLES
        : 1;
    const turnsSince = turn - (s.lastSeenTurn || 0);
    const staleness = Math.min(STALENESS_CAP, turnsSince / STALENESS_SCALE);

    // Boost letters from the most recently unlocked row (tapers as attempts grow)
    const isLatestRow = letter.script === 'katakana'
      ? letter.row === latestKataRow
      : letter.row === latestHiraRow;
    const latestBoost = isLatestRow && s.attempts < MIN_SAMPLES
      ? 1 + LATEST_ROW_BOOST * (MIN_SAMPLES - s.attempts) / MIN_SAMPLES
      : 1;

    return (1 + ALPHA * errorSignal) * newness * (1 + staleness) * latestBoost;
  });

  // Phase 2: rescale if katakana is behind (only relevant in 'both' mode)
  if (mode === 'both' && kataPool.length > 0 && hiraPool.length > 0) {
    // Level gap signal (0..1): e.g. hira level 8, kata level 1 → 7/8 = 0.875
    const levelGap = Math.max(0, (store.level - store.kataLevel) / store.level);

    // EMA gap signal (0..1)
    const emaGap = Math.max(0, avgEma(hiraPool, stats) - avgEma(kataPool, stats));

    // Combined intensity: use the larger of the two signals (both are 0..1)
    const intensity = Math.max(levelGap, emaGap);

    if (intensity > 0) {
      // Target katakana fraction: scales linearly from 0 to KATA_MAX_RATIO
      const targetKataFrac = KATA_MAX_RATIO * intensity;

      // Current raw weight sums per script
      let hiraSum = 0;
      let kataSum = 0;
      for (let i = 0; i < pool.length; i++) {
        if (pool[i].script === 'katakana') kataSum += weights[i];
        else hiraSum += weights[i];
      }

      if (kataSum > 0 && hiraSum > 0) {
        // We want: kataSum * scale / (hiraSum + kataSum * scale) = targetKataFrac
        // Solving: scale = (targetKataFrac * hiraSum) / (kataSum * (1 - targetKataFrac))
        const scale = (targetKataFrac * hiraSum) / (kataSum * (1 - targetKataFrac));

        // Only boost katakana, never suppress it (scale >= 1 means boost, < 1 ignore)
        if (scale > 1) {
          for (let i = 0; i < pool.length; i++) {
            if (pool[i].script === 'katakana') weights[i] *= scale;
          }
        }
      }
    }
  }

  // Suppress the last-shown letter to avoid immediate repeats
  if (lastId && pool.length > 1) {
    const idx = pool.findIndex((l) => l.id === lastId);
    if (idx !== -1) weights[idx] = 0;
  }

  const chosenIdx = weightedRandomIndex(weights);
  const chosen = pool[chosenIdx];

  // Attach debug info
  if (DEBUG) {
    const totalW = weights.reduce((s, w) => s + w, 0);
    chosen._debug = {
      weight: weights[chosenIdx].toFixed(1),
      pct: (100 * weights[chosenIdx] / totalW).toFixed(1),
    };
    // Full distribution for the debug chart (include locked kana as weight 0)
    const poolWeightMap = new Map(pool.map((l, i) => [l.id, { weight: weights[i], selected: i === chosenIdx }]));
    const allForMode = mode === 'hiragana' ? ALL_HIRAGANA
      : mode === 'katakana' ? ALL_KATAKANA
      : [...ALL_HIRAGANA, ...ALL_KATAKANA];
    chosen._debugDist = allForMode.map((l) => {
      const entry = poolWeightMap.get(l.id);
      return {
        id: l.id,
        kana: l.kana,
        weight: entry ? entry.weight : 0,
        selected: entry ? entry.selected : false,
        locked: !entry,
      };
    });
  }

  return chosen;
}

// ── Dynamic option count ──────────────────────────────────────

export function getOptionCount(store, letter) {
  const s = store.stats[letter.id];
  const scriptPool = getScriptPool(store, letter.script);
  let count;
  if (s.attempts < FAMILIARITY_2) count = 2;
  else if (s.attempts < FAMILIARITY_3) count = 3;
  else count = 4;
  return Math.min(count, scriptPool.length);
}

// ── Distractor selection ──────────────────────────────────────

/**
 * Pick distractors from the SAME script as the correct letter.
 * Distractors are weighted toward recent rows.
 */
export function pickDistractors(store, correctLetter, count) {
  const scriptPool = getScriptPool(store, correctLetter.script);
  const pool = scriptPool.filter((l) => l.id !== correctLetter.id);
  if (pool.length === 0) return [];
  const needed = Math.min(count, pool.length);

  const maxRow = correctLetter.script === 'katakana'
    ? store.kataLevel - 1
    : store.level - 1;
  const weights = pool.map((l) => {
    let w = 1;
    // Strong boost for letters from the same row (more confusable)
    if (l.row === correctLetter.row) w += SAME_ROW_BONUS;
    // Recency gradient for the rest
    const recency = maxRow > 0 ? l.row / maxRow : 1;
    w += RECENCY_BONUS * recency;
    return w;
  });

  const chosen = [];
  const used = new Set();
  for (let i = 0; i < needed; i++) {
    const w = weights.map((wt, idx) => (used.has(idx) ? 0 : wt));
    const idx = weightedRandomIndex(w);
    used.add(idx);
    const letter = pool[idx];
    if (DEBUG) {
      const totalW = weights.reduce((s, wt) => s + wt, 0);
      letter._debug = {
        weight: weights[idx].toFixed(1),
        pct: (100 * weights[idx] / totalW).toFixed(1),
      };
    }
    chosen.push(letter);
  }
  return chosen;
}

/**
 * Build the full set of option buttons (correct + distractors), shuffled.
 */
export function buildOptions(store, correctLetter) {
  const optionCount = getOptionCount(store, correctLetter);
  const distractors = pickDistractors(store, correctLetter, optionCount - 1);
  return shuffle([correctLetter, ...distractors]);
}
