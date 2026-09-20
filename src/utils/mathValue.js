// Small, dependency-free helpers for parsing/formatting fraction, decimal and percent strings.
// Shared by the UI, the content validator and the audio generator (pure JS).

export const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

export const roundClean = (x, places = 6) => {
  const f = 10 ** places;
  return Math.round(x * f) / f;
};

// "3/4" | "0.75" | "75%" | "1 3/4"  ->  0.75 (as a plain number, 1 = whole)
export function parseValue(str) {
  const s = String(str).trim();
  let m;
  if ((m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/))) return Number(m[1]) + Number(m[2]) / Number(m[3]);
  if ((m = s.match(/^(\d+(?:\.\d+)?)%$/))) return roundClean(parseFloat(m[1]) / 100, 8);
  if ((m = s.match(/^(\d+)\/(\d+)$/))) return Number(m[1]) / Number(m[2]);
  if (/^\d+(?:\.\d+)?$/.test(s)) return parseFloat(s);
  return NaN;
}

export const sameValue = (a, b) => Math.abs(parseValue(a) - parseValue(b)) < 1e-9;

// 0.375 -> "37.5%"
export const toPercentString = (value) => `${roundClean(value * 100)}%`;

// 45 -> "0.45" | 5 -> "0.05" | 100 -> "1"
export const percentToDecimal = (p) => String(roundClean(p / 100, 6));

export const simplify = (n, d) => {
  const g = gcd(n, d);
  return [n / g, d / g];
};

// Shared theme colours (same palette as the previous module)
export const SLICE_COLORS = ['#06B6D4', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6'];
