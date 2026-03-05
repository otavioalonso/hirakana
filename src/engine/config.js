/**
 * Tunable constants for the game engine.
 * Tweak these to adjust difficulty, pacing, and adaptive behaviour.
 * Nothing here imports React or any UI code.
 */

// ── Debug ─────────────────────────────────────────────────────
export const DEBUG = typeof window !== 'undefined' && window.location.pathname.endsWith('/debug');

// ── EMA (Exponential Moving Average) ──────────────────────────
export const EMA_DECAY          = 0.7;   // Default decay for wrong answers on weak letters
export const EMA_DECAY_MASTERED = 0.85;  // Gentler decay for slips on mastered letters (ema ≥ EMA_GREEN)
export const EMA_INITIAL  = 0.0;   // Starting EMA for unseen letters (neutral)
export const EMA_GREEN    = 0.75;  // EMA ≥ this → "mastered" (green, eligible for level-up)
export const EMA_YELLOW   = 0.4;   // EMA ≥ this → "learning" (yellow); below → "struggling" (red)

// ── Sampling weights ──────────────────────────────────────────
export const ALPHA            = 4;   // Error-signal multiplier
export const STALENESS_SCALE  = 15;  // Turns before staleness boost reaches 1.0
export const STALENESS_CAP    = 3;   // Max staleness multiplier
export const MIN_SAMPLES      = 8;   // Attempts below which newness boost is active
export const NEWNESS_BOOST    = 3;   // Max extra weight for brand-new letters (tapers to 0 over MIN_SAMPLES attempts)
export const LATEST_ROW_BOOST = 5;   // Extra multiplier for letters in the most recently unlocked row (tapers with attempts)
export const KATA_MAX_RATIO   = 0.85; // Max fraction of prompts that go to katakana when it's far behind

// ── Level progression ─────────────────────────────────────────
export const UNLOCK_EMA_PREV  = 0.75; // Latest row letters must reach this EMA to unlock next row
export const UNLOCK_EMA_ALL   = 0.4;  // All earlier letters must be at least this EMA
export const UNLOCK_MIN_ATT   = 5;    // All letters need at least this many attempts

// ── Distractors ───────────────────────────────────────────────
export const RECENCY_BONUS    = 2;    // Extra weight for distractors from recent rows
export const SAME_ROW_BONUS   = 6;    // Extra weight for distractors from the same row as the correct letter

// ── Dynamic option count ──────────────────────────────────────
export const FAMILIARITY_2    = 3;    // Attempts < this → 2 options
export const FAMILIARITY_3    = 6;    // Attempts < this → 3 options; ≥ this → 4 options

// ── Persistence ───────────────────────────────────────────────
export const STORAGE_KEY       = 'hirakana_state';
export const KANJI_STORAGE_KEY = 'hirakana_kanji_state';

// ── Kanji: clue fading thresholds ─────────────────────────────
// As EMA rises, prompt clues are progressively hidden.
export const KANJI_HIDE_ROMAJI   = 1.0;  // EMA ≥ this → hide romaji
export const KANJI_HIDE_HIRAGANA = 1.0;  // EMA ≥ this → hide hiragana reading
export const KANJI_HIDE_ENGLISH  = 1.0;  // EMA ≥ this → hide English meaning (kanji recall only)

// ── Kanji: sampling & progression ─────────────────────────────
export const KANJI_GROUP_SIZE     = 5;    // Kanji per unlock group
export const KANJI_UNLOCK_EMA    = 0.75;  // Latest group must reach this to unlock next
export const KANJI_UNLOCK_ALL    = 0.4;   // All earlier kanji must be at least this
export const KANJI_UNLOCK_MIN    = 5;     // Min attempts per kanji before unlock
export const KANJI_FAMILIARITY_2 = 3;     // Attempts < this → 2 options
export const KANJI_FAMILIARITY_3 = 6;     // Attempts < this → 3 options; ≥ → 4
