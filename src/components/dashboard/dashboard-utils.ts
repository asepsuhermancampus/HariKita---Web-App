/**
 * Utilitas Matematika Kurva SVG & Formatting untuk Dashboard Tracking HariKita
 */

export function calculateBezierSplinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const prev = points[i - 1] || current;
    const nextNext = points[i + 2] || next;

    const smoothing = 0.2;
    const cp1x = current.x + (next.x - prev.x) * smoothing;
    const cp1y = current.y + (next.y - prev.y) * smoothing;
    const cp2x = next.x - (nextNext.x - current.x) * smoothing;
    const cp2y = next.y - (nextNext.y - current.y) * smoothing;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  }
  return path;
}

export function calculateSvgArcPath(
  cx: number,
  cy: number,
  r: number,
  startAngleDeg: number,
  endAngleDeg: number
): string {
  const startRad = (startAngleDeg * Math.PI) / 180;
  const endRad = (endAngleDeg * Math.PI) / 180;

  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);

  const angleDiff = Math.abs(endAngleDeg - startAngleDeg);
  const largeArcFlag = angleDiff > 180 ? "1" : "0";
  // 1 for clockwise sweep
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}
