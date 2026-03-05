/**
 * Shared UI utilities — haptics, gestures, etc.
 * No React imports needed for the helpers; hook is exported separately.
 */

import { useEffect, useRef } from 'react';

// ── Haptic feedback ───────────────────────────────────────────

/**
 * Trigger device vibration on supported devices (Android Chrome).
 * Silently ignored on iOS and unsupported browsers.
 */
function vibrate(pattern) {
  try {
    if (navigator?.vibrate) navigator.vibrate(pattern);
  } catch { /* unsupported */ }
}

/**
 * Visual micro-shake on the entire screen — works everywhere.
 * Used as a universal fallback for haptic feedback.
 */
function visualBuzz(intensity = 'light') {
  const el = document.documentElement;
  const cls = intensity === 'heavy' ? 'haptic-buzz-heavy' : 'haptic-buzz';
  el.classList.remove(cls);       // reset if already active
  void el.offsetWidth;            // force reflow
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), 200);
}

/** Short single tap — correct answer */
export function hapticCorrect() {
  vibrate(10);
  // No visual buzz on correct — the green button animation is enough
}

/** Double tap — wrong answer (vibrate + visual shake) */
export function hapticWrong() {
  vibrate([15, 60, 15]);
  visualBuzz('heavy');
}

// ── Swipe-right-to-go-back hook ───────────────────────────────

/**
 * Detects a horizontal right-swipe and calls `onSwipeBack`.
 * Starts tracking only from the left 40% of the screen to avoid
 * conflicts with button taps.
 */
export function useSwipeBack(onSwipeBack) {
  const touchRef = useRef(null);

  useEffect(() => {
    const THRESHOLD = 60; // px — minimum horizontal distance
    const RATIO = 1.3;    // dx/dy must exceed this to count as horizontal

    const handleStart = (e) => {
      const t = e.touches[0];
      // Only start tracking if the touch begins in the left 40% of the screen
      if (t.clientX < window.innerWidth * 0.4) {
        touchRef.current = { x: t.clientX, y: t.clientY };
      } else {
        touchRef.current = null;
      }
    };

    const handleEnd = (e) => {
      if (!touchRef.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchRef.current.x;
      const dy = Math.abs(t.clientY - touchRef.current.y);
      touchRef.current = null;

      if (dx > THRESHOLD && dx / (dy || 1) > RATIO) {
        onSwipeBack();
      }
    };

    window.addEventListener('touchstart', handleStart, { passive: true });
    window.addEventListener('touchend', handleEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleStart);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [onSwipeBack]);
}
