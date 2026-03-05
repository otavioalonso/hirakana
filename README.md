# Hirakana ひらかな

A mobile-first PWA for learning Japanese — hiragana, katakana, and 2200+ kanji (JLPT N5→N1) through adaptive multiple-choice quizzes.

**Live:** [hirakana.web.app](https://hirakana.web.app)

## Features

- **Four modes** — Hiragana, Katakana, Both, Kanji
- **Adaptive repetition** — EMA-based scoring weights prompts toward letters you struggle with, while letting mastered ones fade into the background
- **Progressive unlock** — new rows/groups unlock automatically as you demonstrate mastery of the current set
- **Dynamic difficulty** — option count scales from 2→3→4 as familiarity increases
- **Kanji across all JLPT levels** — 80 hand-curated N5 kanji + 2131 auto-generated N4–N1 kanji in 445 thematic groups
- **Visual progress** — continuous heatmap (red → yellow → green) and detailed stats per letter/kanji
- **PWA** — installable, works offline via service worker
- **Haptic feedback** — vibration on correct/wrong answers (on supported devices)
- **Swipe navigation** — swipe right to go back to home

## Tech Stack

- **React 19** + **Vite 8**
- **vite-plugin-pwa** for service worker / offline support
- **Firebase Hosting** for deployment
- Zero runtime dependencies beyond React

## Project Structure

```
src/
├── data/
│   ├── hiragana.js      # 16 hiragana + 16 katakana rows (incl. dakuten/handakuten)
│   └── kanji.js          # 2211 kanji across 5 JLPT levels, 445 groups
├── engine/
│   ├── config.js         # All tunable constants (EMA, sampling, unlock thresholds)
│   ├── sampler.js        # Weighted letter picker + distractor builder (kana)
│   ├── stats.js          # Store management + answer recording (kana)
│   ├── kanjiSampler.js   # Weighted kanji picker + distractor builder
│   └── kanjiStats.js     # Store management + answer recording (kanji)
├── components/
│   ├── Home.jsx          # Mode selection screen
│   ├── Play.jsx          # Kana quiz screen
│   ├── PlayKanji.jsx     # Kanji quiz screen
│   ├── Heatmap.jsx       # Kana progress heatmap
│   ├── KanjiHeatmap.jsx  # Multi-JLPT kanji progress heatmap
│   ├── Stats.jsx         # Kana detailed stats
│   ├── KanjiStats.jsx    # Kanji detailed stats (per JLPT level)
│   └── OptionButton.jsx  # Reusable answer button with feedback animations
├── hooks/
│   └── useUI.js          # Haptic feedback + swipe gesture hooks
├── App.jsx               # Screen routing + store initialization
└── App.css               # All styles
```

## How the Engine Works

### Adaptive Sampling

Each letter/kanji tracks an **Exponential Moving Average (EMA)** of correctness. The sampler assigns weights based on:

1. **Error signal** — lower EMA → higher weight (you see harder letters more often)
2. **Staleness** — letters not seen recently get a boost to prevent neglect
3. **Newness** — fresh letters get a temporary boost so you encounter them quickly
4. **Asymmetric decay** — wrong answers on mastered letters decay more gently (EMA_DECAY_MASTERED = 0.85 vs EMA_DECAY = 0.7)

### Level Progression

New rows/groups unlock when:
- All letters in the **latest row** reach EMA ≥ 0.75
- All **earlier letters** are at least EMA ≥ 0.4
- Every letter has at least **5 attempts**

### Two Stores

- `hirakana_state` — kana progress (hiragana level, katakana level, per-letter stats)
- `hirakana_kanji_state` — kanji progress (kanji level, per-kanji stats)

Both persist to `localStorage`.

## Development

```bash
npm install
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview production build locally
```

## Deployment

```bash
npm run build && firebase deploy --only hosting
```

## License

MIT
