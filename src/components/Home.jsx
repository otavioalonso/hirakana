/**
 * Home screen — choose practice mode.
 */

export default function Home({ onStart }) {
  return (
    <div className="home-screen">
      <h1 className="home-title">Hirakana</h1>
      <p className="home-subtitle">Choose what to practice</p>

      <div className="home-buttons">
        <button className="home-btn home-btn--hira" onClick={() => onStart('hiragana')}>
          <span className="home-btn-kana">あ</span>
          <span className="home-btn-label">Hiragana</span>
        </button>
        <button className="home-btn home-btn--kata" onClick={() => onStart('katakana')}>
          <span className="home-btn-kana">ア</span>
          <span className="home-btn-label">Katakana</span>
        </button>
        <button className="home-btn home-btn--both" onClick={() => onStart('both')}>
          <span className="home-btn-kana">あア</span>
          <span className="home-btn-label">Both</span>
        </button>
        <button className="home-btn home-btn--kanji" onClick={() => onStart('kanji')}>
          <span className="home-btn-kana">漢</span>
          <span className="home-btn-label">Kanji</span>
        </button>
      </div>
    </div>
  );
}
