/**
 * PlayKanji — main kanji quiz screen.
 *
 * Prompt: English meaning + hiragana reading + romaji
 * Options: kanji characters
 *
 * Clues fade as EMA rises (thresholds from config).
 */

import { useState, useCallback, useEffect } from 'react';
import KanjiHeatmap from './KanjiHeatmap.jsx';
import OptionButton from './OptionButton.jsx';
import { pickKanji, buildKanjiOptions, checkKanjiLevelUp } from '../engine/kanjiSampler.js';
import { recordKanjiAnswer, setKanjiLevel, saveKanjiStore, skipKanjiLevel } from '../engine/kanjiStats.js';
import { KANJI_GROUP_NAMES, TOTAL_KANJI_GROUPS, jlptForGroup } from '../data/kanji.js';
import {
  KANJI_HIDE_ROMAJI,
  KANJI_HIDE_HIRAGANA,
  KANJI_HIDE_ENGLISH,
  DEBUG,
} from '../engine/config.js';
import { hapticCorrect, hapticWrong, useSwipeBack } from '../hooks/useUI.js';

export default function PlayKanji({ store, setStore, onNavigateStats, onNavigateHome }) {
  const [current, setCurrent] = useState(() => pickKanji(store));
  const [options, setOptions] = useState(() => buildKanjiOptions(store, pickKanji(store)));
  const [feedback, setFeedback] = useState({});
  const [locked, setLocked] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Swipe right → back to home
  useSwipeBack(onNavigateHome);

  // Initialise on mount
  useEffect(() => {
    const k = pickKanji(store);
    setCurrent(k);
    setOptions(buildKanjiOptions(store, k));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const advance = useCallback(
    (updatedStore, wasCorrect) => {
      let s = updatedStore;
      let leveledUp = false;

      const newLevel = checkKanjiLevelUp(s);
      if (newLevel > s.kanjiLevel) {
        s = setKanjiLevel(s, newLevel);
        leveledUp = true;
      }

      saveKanjiStore(s);
      setStore(s);

      const delay = leveledUp ? 800 : wasCorrect ? 300 : 650;
      if (leveledUp) setShowLevelUp(true);

      setTimeout(() => {
        if (leveledUp) setShowLevelUp(false);
        const next = pickKanji(s, current.id);
        setCurrent(next);
        setOptions(buildKanjiOptions(s, next));
        setFeedback({});
        setLocked(false);
      }, delay);
    },
    [current, setStore],
  );

  const handlePick = useCallback(
    (chosen) => {
      if (locked) return;
      const correct = chosen.id === current.id;

      if (correct) {
        hapticCorrect();
        setFeedback({ [chosen.id]: 'correct' });
      } else {
        hapticWrong();
        setFeedback((prev) => ({
          ...prev,
          [chosen.id]: 'wrong',
          [current.id]: 'reveal',
        }));
      }
      setLocked(true);
      const updated = recordKanjiAnswer(store, current.id, chosen.id, correct);
      advance(updated, correct);
    },
    [locked, current, store, advance],
  );

  const handleSkip = useCallback(() => {
    const updated = skipKanjiLevel(store);
    setStore(updated);
    const next = pickKanji(updated, null);
    setCurrent(next);
    setOptions(buildKanjiOptions(updated, next));
    setFeedback({});
    setLocked(false);
  }, [store, setStore]);

  const canSkip = store.kanjiLevel < TOTAL_KANJI_GROUPS;

  // Keyboard support
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

  if (!current) {
    return (
      <div className="play-screen">
        <p style={{ margin: 'auto', color: 'var(--muted)' }}>No kanji unlocked yet.</p>
        <button className="back-btn" onClick={onNavigateHome} style={{ margin: '0 auto 32px' }}>
          ← Choose mode
        </button>
      </div>
    );
  }

  // Clue visibility based on EMA
  const ema = store.stats[current.id].ema;
  const showRomaji   = ema < KANJI_HIDE_ROMAJI;
  const showHiragana = ema < KANJI_HIDE_HIRAGANA;
  const showEnglish  = ema < KANJI_HIDE_ENGLISH;

  const groupName = current.group < KANJI_GROUP_NAMES.length
    ? KANJI_GROUP_NAMES[current.group]
    : `Group ${current.group + 1}`;
  const jlptInfo = jlptForGroup(current.group);
  const jlptLabel = jlptInfo ? jlptInfo.label : '';

  // Map kanji options to include a `kana` field for OptionButton compatibility
  const mappedOptions = options.map((k) => ({ ...k, kana: k.kanji }));

  return (
    <div className="play-screen play-screen--kanji">
      <KanjiHeatmap store={store} onNavigateStats={onNavigateStats} />

      <div className="play-toolbar">
        <button className="toolbar-btn" onClick={onNavigateHome} aria-label="Home">
          ⌂
        </button>
        <div className="level-badge">
          {jlptLabel} — {groupName}
          {showLevelUp && <span className="level-up-flash">🎉 Level up!</span>}
        </div>
        {canSkip && (
          <button className="toolbar-btn toolbar-btn--skip" onClick={handleSkip} aria-label="Skip group">
            ⏭
          </button>
        )}
      </div>

      <div className="prompt-area">
        <div className="kanji-prompt-stack">
          {showHiragana && (
            <span className="kanji-prompt-hiragana">{current.reading}</span>
          )}
          {showEnglish && (
            <span className="kanji-prompt-english">{current.meaning}</span>
          )}
          {showRomaji && (
            <span className="kanji-prompt-romaji">{current.romaji}</span>
          )}
          {!showEnglish && !showHiragana && !showRomaji && (
            <span className="kanji-prompt-mystery">?</span>
          )}
          {DEBUG && current._debug && (
            <span className="debug-label">{current._debug.pct}%</span>
          )}
        </div>
      </div>

      <div className={`options-grid options-grid--${mappedOptions.length}`}>
        {mappedOptions.map((k) => (
          <OptionButton
            key={k.id}
            letter={k}
            feedback={feedback[k.id] || null}
            onPick={handlePick}
            disabled={locked}
            debugLabel={DEBUG && k._debug ? `${k._debug.pct}%` : null}
          />
        ))}
      </div>
    </div>
  );
}
