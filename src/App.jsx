import { useState } from 'react';
import Home from './components/Home.jsx';
import Play from './components/Play.jsx';
import PlayKanji from './components/PlayKanji.jsx';
import Stats from './components/Stats.jsx';
import KanjiStats from './components/KanjiStats.jsx';
import { loadStore } from './engine/stats.js';
import { loadKanjiStore } from './engine/kanjiStats.js';
import './App.css';

export default function App() {
  const [store, setStore] = useState(loadStore);
  const [kanjiStore, setKanjiStore] = useState(loadKanjiStore);
  const [screen, setScreen] = useState('home'); // 'home' | 'play' | 'stats' | 'kanji' | 'kanjiStats'
  const [mode, setMode] = useState('both');      // 'hiragana' | 'katakana' | 'both' | 'kanji'

  if (screen === 'home') {
    return (
      <Home
        onStart={(m) => {
          setMode(m);
          setScreen(m === 'kanji' ? 'kanji' : 'play');
        }}
      />
    );
  }

  if (screen === 'kanjiStats') {
    return (
      <KanjiStats
        store={kanjiStore}
        setStore={setKanjiStore}
        onBack={() => setScreen('kanji')}
      />
    );
  }

  if (screen === 'stats') {
    return (
      <Stats
        store={store}
        setStore={setStore}
        mode={mode}
        onBack={() => setScreen('play')}
      />
    );
  }

  if (screen === 'kanji') {
    return (
      <PlayKanji
        store={kanjiStore}
        setStore={setKanjiStore}
        onNavigateStats={() => setScreen('kanjiStats')}
        onNavigateHome={() => setScreen('home')}
      />
    );
  }

  return (
    <Play
      store={store}
      setStore={setStore}
      mode={mode}
      onNavigateStats={() => setScreen('stats')}
      onNavigateHome={() => setScreen('home')}
    />
  );
}
