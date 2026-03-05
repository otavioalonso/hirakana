/**
 * A single option button with feedback animations.
 * Optional `label` shown below the main character after feedback is given.
 */

export default function OptionButton({ letter, feedback, onPick, disabled, label, debugLabel }) {
  let className = 'option-btn';
  if (feedback === 'correct') className += ' option-btn--correct';
  else if (feedback === 'wrong') className += ' option-btn--wrong';
  else if (feedback === 'reveal') className += ' option-btn--reveal';

  return (
    <button
      className={className}
      onClick={() => onPick(letter)}
      disabled={disabled}
    >
      {letter.kana}
      {feedback && label && (
        <span className="option-btn-label">{label}</span>
      )}
      {debugLabel && (
        <span className="debug-label">{debugLabel}</span>
      )}
    </button>
  );
}
