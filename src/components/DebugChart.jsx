/**
 * DebugChart — renders a continuous line chart of the weight distribution.
 * Overlaid behind the prompt area, blending with the background.
 */

export default function DebugChart({ dist }) {
  if (!dist || dist.length === 0) return null;

  const maxW = Math.max(...dist.map((d) => d.weight));
  if (maxW === 0) return null;

  const n = dist.length;
  // Build polyline points: x goes 0→100%, y goes top (max weight) → bottom (0)
  const points = dist.map((d, i) => {
    const x = n === 1 ? 50 : (i / (n - 1)) * 100;
    const y = 100 - (d.weight / maxW) * 90; // leave 10% margin at top
    return `${x},${y}`;
  }).join(' ');

  // Find the selected index to draw a dot
  const selIdx = dist.findIndex((d) => d.selected);
  const selX = n === 1 ? 50 : (selIdx / (n - 1)) * 100;
  const selY = 100 - (dist[selIdx].weight / maxW) * 90;

  return (
    <svg
      className="debug-chart"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="0.8"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
