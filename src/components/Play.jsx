/**
 * Main play screen.
 */

import { useState, useCallback, useEffect } from 'react';
import Heatmap from './Heatmap.jsx';
import OptionButton from './OptionButton.jsx';
import DebugChart from './DebugChart.jsx';
import { pickLetter, buildOptions, checkHiraganaLevelUp, checkKatakanaLevelUp } from '../engine/sampler.js';
import { recordAnswer, setLevel, saveStore, skipLevel } from '../engine/stats.js';
import { HIRAGANA_ROWS, KATAKANA_ROWS, TOTAL_HIRAGANA_ROWS, TOTAL_KATAKANA_ROWS, ROMAJI_TO_HIRAGANA, ROMAJI_TO_KATAKANA } from '../data/hiragana.js';
import { hapticCorrect, hapticWrong, useSwipeBack } from '../hooks/useUI.js';
import { DEBUG } from '../engine/config.js';

export default function Play({ store, setStore, mode, onNavigateStats, onNavigateHome }) {
  const [currentLetter, setCurrentLetter] = useState(() => pickLetter(store, null, mode));
  const [options, setOptions] = useState(() => buildOptions(store, pickLetter(store, null, mode)));
  const [feedback, setFeedback] = useState({}); // { [letterId]: 'correct' | 'wrong' | 'reveal' }
  const [locked, setLocked] = useState(false);
  const [lastId, setLastId] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Swipe right → back to home
  useSwipeBack(onNavigateHome);

  // Re-initialise on mount so options match the letter
  useEffect(() => {
    let s = store;
    // Auto-unlock first katakana row when entering katakana/both mode
    if ((mode === 'katakana' || mode === 'both') && s.kataLevel === 0) {
      s = { ...s, kataLevel: 1 };
      saveStore(s);
      setStore(s);
    }
    const letter = pickLetter(s, null, mode);
    setCurrentLetter(letter);
    setOptions(buildOptions(s, letter));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const advance = useCallback(
    (updatedStore, wasCorrect) => {
      let s = updatedStore;

      // Always check both level-ups (hiragana level gates katakana unlock)
      let leveledUp = false;
      const newHiraLevel = checkHiraganaLevelUp(s);
      if (newHiraLevel > s.level) {
        s = setLevel(s, newHiraLevel);
        if (mode !== 'katakana') leveledUp = true; // only flash if user sees hiragana
      }

      const newKataLevel = checkKatakanaLevelUp(s);
      if (newKataLevel > s.kataLevel) {
        s = { ...s, kataLevel: newKataLevel };
        if (mode !== 'hiragana') leveledUp = true; // only flash if user sees katakana
      }

      saveStore(s);
      setStore(s);

      const delay = leveledUp ? 800 : wasCorrect ? 300 : 650;

      if (leveledUp) setShowLevelUp(true);

      setTimeout(() => {
        if (leveledUp) setShowLevelUp(false);
        const next = pickLetter(s, currentLetter.id, mode);
        setCurrentLetter(next);
        setOptions(buildOptions(s, next));
        setFeedback({});
        setLocked(false);
        setLastId(currentLetter.id);
      }, delay);
    },
    [currentLetter, setStore, mode],
  );

  const handlePick = useCallback(
    (chosen) => {
      if (locked) return;
      const correct = chosen.id === currentLetter.id;

      if (correct) {
        hapticCorrect();
        setFeedback({ [chosen.id]: 'correct' });
        setLocked(true);
        const updated = recordAnswer(store, currentLetter.id, chosen.id, true);
        advance(updated, true);
      } else {
        // Mark wrong + reveal correct
        hapticWrong();
        setFeedback((prev) => ({
          ...prev,
          [chosen.id]: 'wrong',
          [currentLetter.id]: 'reveal',
        }));
        setLocked(true);
        const updated = recordAnswer(store, currentLetter.id, chosen.id, false);
        advance(updated, false);
      }
    },
    [locked, currentLetter, store, advance],
  );

  const handleSkip = useCallback(() => {
    const updated = skipLevel(store, mode);
    setStore(updated);
    const next = pickLetter(updated, null, mode);
    setCurrentLetter(next);
    setOptions(buildOptions(updated, next));
    setFeedback({});
    setLocked(false);
  }, [store, mode, setStore]);

  // Can we skip? Check we haven't maxed out
  const canSkipHira = mode !== 'katakana' && store.level < TOTAL_HIRAGANA_ROWS;
  const canSkipKata = mode !== 'hiragana' && store.kataLevel > 0 && store.kataLevel < TOTAL_KATAKANA_ROWS;
  const canSkip = canSkipHira || canSkipKata;

  // Keyboard support (1-4)
  useEffect(() => {
    const handler = (e) => {
      const idx = parseInt(e.key, 10) - 1;
      if (idx >= 0 && idx < options.length && !locked) {
        handlePick(options[idx]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [options, locked, handlePick]);

  const isKatakana = currentLetter?.script === 'katakana';

  // Build level label(s) based on mode
  const hiraRowName = store.level > 0 && store.level <= HIRAGANA_ROWS.length
    ? HIRAGANA_ROWS[store.level - 1].name : '—';
  const kataRowName = store.kataLevel > 0 && store.kataLevel <= KATAKANA_ROWS.length
    ? KATAKANA_ROWS[store.kataLevel - 1].name : '—';

  let levelLabel;
  if (mode === 'hiragana') {
    levelLabel = `ひらがな — ${hiraRowName}`;
  } else if (mode === 'katakana') {
    levelLabel = `カタカナ — ${kataRowName}`;
  } else {
    levelLabel = `ひらがな ${hiraRowName} · カタカナ ${kataRowName}`;
  }

  if (!currentLetter) {
    return (
      <div className="play-screen">
        <p style={{ margin: 'auto', color: 'var(--muted)' }}>
          No letters unlocked yet for this mode.
        </p>
        <button className="back-btn" onClick={onNavigateHome} style={{ margin: '0 auto 32px' }}>
          ← Choose mode
        </button>
      </div>
    );
  }

  return (
    <div className={`play-screen${isKatakana ? ' play-screen--kata' : ''}`}>
      {DEBUG && <DebugChart dist={currentLetter._debugDist} />}
      <Heatmap
        store={store}
        mode={mode}
        onNavigateStats={onNavigateStats}
      />

      <div className="play-toolbar">
        <button className="toolbar-btn" onClick={onNavigateHome} aria-label="Home">
          ⌂
        </button>
        <div className="level-badge">
          {levelLabel}
          {showLevelUp && <span className="level-up-flash">🎉 New row!</span>}
        </div>
        {canSkip && (
          <button className="toolbar-btn toolbar-btn--skip" onClick={handleSkip} aria-label="Skip level">
            ⏭
          </button>
        )}
      </div>

      <div className="prompt-area">
        <div className="prompt-stack">
          <span className={`romaji-prompt${isKatakana ? ' romaji-prompt--kata' : ''}`}>
            {currentLetter.romaji}
          </span>
          {currentLetter.script === 'katakana' && ROMAJI_TO_HIRAGANA[currentLetter.romaji] && (
            <span className="prompt-sub">{ROMAJI_TO_HIRAGANA[currentLetter.romaji]}</span>
          )}
          {currentLetter.script === 'hiragana' && ROMAJI_TO_KATAKANA[currentLetter.romaji] && (
            <span className="prompt-sub prompt-sub--kata">{ROMAJI_TO_KATAKANA[currentLetter.romaji]}</span>
          )}
          {DEBUG && currentLetter._debug && (
            <span className="debug-label">{currentLetter._debug.pct}%</span>
          )}
        </div>
      </div>

      <div className={`options-grid options-grid--${options.length}`}>
        {options.map((letter) => (
          <OptionButton
            key={letter.id}
            letter={letter}
            feedback={feedback[letter.id] || null}
            onPick={handlePick}
            disabled={locked}
            debugLabel={DEBUG && letter._debug ? `${letter._debug.pct}%` : null}
          />
        ))}
      </div>
    </div>
  );
}
