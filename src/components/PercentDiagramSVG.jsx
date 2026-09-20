import React from 'react';

const GOLD = '#FFB800';
const CYAN = '#06B6D4';
const DARK = '#1C1438';
const EDGE = 'rgba(139, 92, 246, 0.35)';

const levelColor = (l) => (l < 20 ? '#F43F5E' : l < 50 ? '#F59E0B' : '#10B981');

const Badge = ({ x, y, text, color = CYAN, w = 64 }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x={-w / 2} y="-15" width={w} height="30" rx="8" fill="#161129" stroke={color} strokeWidth="3" />
    <text x="0" y="6" textAnchor="middle" fill="#F3F4F6" fontSize="16" fontWeight="900">{text}</text>
  </g>
);

export const PercentDiagramSVG = ({ diagram }) => {
  if (!diagram) return null;
  const svgCls = 'h-full w-auto max-w-full max-h-full object-contain select-none';

  // ── 10 × 10 hundred grid ───────────────────────────────────
  if (diagram.type === 'grid') {
    const n = diagram.shaded ?? 0;
    const cell = 25, gap = 3, off = 11.5;
    return (
      <svg viewBox="0 0 300 300" className={svgCls}>
        {Array.from({ length: 100 }, (_, i) => (
          <rect
            key={i}
            x={off + (i % 10) * (cell + gap)}
            y={off + Math.floor(i / 10) * (cell + gap)}
            width={cell}
            height={cell}
            rx="4"
            fill={i < n ? GOLD : DARK}
            stroke={i < n ? '#FFD966' : EDGE}
            strokeWidth="1.5"
          />
        ))}
      </svg>
    );
  }

  // ── Fraction bar ────────────────────────────────────────────
  if (diagram.type === 'bar') {
    const { parts, filled } = diagram;
    const w = 270 / parts;
    return (
      <svg viewBox="0 0 300 300" className={svgCls}>
        <rect x="12" y="92" width="276" height="116" rx="18" fill="#161129" stroke={EDGE} strokeWidth="3" />
        {Array.from({ length: parts }, (_, i) => (
          <rect
            key={i}
            x={15 + i * w + 0.8}
            y="97"
            width={w - 1.6}
            height="106"
            rx={parts > 12 ? 1 : 6}
            fill={i < filled ? CYAN : DARK}
            stroke={i < filled ? '#67E8F9' : EDGE}
            strokeWidth="1.2"
          />
        ))}
        <text x="150" y="246" textAnchor="middle" fill="#C4B5FD" fontSize="26" fontWeight="900">
          {filled} of {parts} equal parts shaded
        </text>
      </svg>
    );
  }

  // ── Number line (0 … max) with optional marker ─────────────
  if (diagram.type === 'numberline') {
    const { max = 1, value = null, label = '', labels = 'decimal' } = diagram;
    const x0 = 30, x1 = 270;
    const px = (v) => x0 + (v / max) * (x1 - x0);
    const step = max <= 1 ? 0.25 : 0.5;
    const ticks = [];
    for (let t = 0; t <= max + 1e-9; t += step) ticks.push(Math.round(t * 100) / 100);
    const showLabel = (t) => (max <= 1 ? [0, 0.5, 1].includes(t) || labels === 'decimal' : t % 1 === 0);
    const text = (t) => (labels === 'percent' ? `${Math.round(t * 100)}%` : String(t));
    return (
      <svg viewBox="0 0 300 300" className={svgCls}>
        <line x1={x0} y1="170" x2={x1} y2="170" stroke={GOLD} strokeWidth="7" strokeLinecap="round" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={px(t)} y1="158" x2={px(t)} y2="182" stroke="#C4B5FD" strokeWidth="4" strokeLinecap="round" />
            {showLabel(t) && (
              <text x={px(t)} y="218" textAnchor="middle" fill="#E9D5FF" fontSize="26" fontWeight="900">{text(t)}</text>
            )}
          </g>
        ))}
        {value !== null && (
          <g>
            <line x1={px(value)} y1="170" x2={px(value)} y2="110" stroke={CYAN} strokeWidth="3" strokeDasharray="5 5" />
            <circle cx={px(value)} cy="170" r="12" fill={CYAN} stroke="#161129" strokeWidth="4" />
            <Badge x={Math.min(Math.max(px(value), 44), 256)} y="92" text={label} color={CYAN} />
          </g>
        )}
        {value === null && (
          <text x="150" y="112" textAnchor="middle" fill="#C4B5FD" fontSize="26" fontWeight="900">Where do they sit?</text>
        )}
        <text x="150" y="266" textAnchor="middle" fill="#A78BFA" fontSize="22" fontWeight="900">
          {max > 1 ? `Number line: 0 to ${max}` : 'Number line: 0 to 1 whole'}
        </text>
      </svg>
    );
  }

  // ── Big value card ─────────────────────────────────────────
  if (diagram.type === 'card') {
    const { top = '', label = '', sub = '' } = diagram;
    const fr = top.match(/^(\d+)\/(\d+)$/);
    const size = top.length <= 3 ? 98 : top.length <= 5 ? 80 : top.length <= 7 ? 60 : 48;
    return (
      <svg viewBox="0 0 300 300" className={svgCls}>
        <rect x="24" y="36" width="252" height="228" rx="28" fill="#161129" stroke={CYAN} strokeWidth="4" />
        <rect x="84" y="20" width="132" height="32" rx="16" fill={CYAN} />
        <text x="150" y="42" textAnchor="middle" fill="#161129" fontSize="18" fontWeight="900" letterSpacing="1.5">{label}</text>
        {fr ? (
          <g fontWeight="900" fill="#FFFFFF" textAnchor="middle" fontFamily="Outfit, sans-serif">
            <text x="150" y="140" fontSize="72">{fr[1]}</text>
            <line x1="100" y1="156" x2="200" y2="156" stroke="#FFB800" strokeWidth="6" strokeLinecap="round" />
            <text x="150" y="222" fontSize="72">{fr[2]}</text>
          </g>
        ) : (
          <text x="150" y={sub ? 158 : 168} textAnchor="middle" fill="#FFFFFF" fontSize={size} fontWeight="900" fontFamily="Outfit, sans-serif">{top}</text>
        )}
        {sub && !fr && <text x="150" y="222" textAnchor="middle" fill="#C4B5FD" fontSize="25" fontWeight="900">{sub}</text>}
        {sub && fr && <text x="150" y="250" textAnchor="middle" fill="#C4B5FD" fontSize="25" fontWeight="900">{sub}</text>}
      </svg>
    );
  }

  // ── Battery / jug / tank fill level ────────────────────────
  if (diagram.type === 'battery') {
    const { level = 50, kind = 'battery' } = diagram;
    const color = levelColor(level);
    if (kind === 'battery') {
      return (
        <svg viewBox="0 0 300 300" className={svgCls}>
          <rect x="30" y="100" width="222" height="104" rx="18" fill="#161129" stroke="#C4B5FD" strokeWidth="6" />
          <rect x="252" y="130" width="20" height="44" rx="6" fill="#C4B5FD" />
          <rect x="40" y="110" width={(202 * level) / 100} height="84" rx="10" fill={color} />
          <text x="141" y="240" textAnchor="middle" fill="#E9D5FF" fontSize="24" fontWeight="900">Battery charge</text>
        </svg>
      );
    }
    const h = (170 * level) / 100;
    return (
      <svg viewBox="0 0 300 300" className={svgCls}>
        <path d="M95 50 L205 50 L215 250 L85 250 Z" fill="#161129" stroke="#C4B5FD" strokeWidth="6" strokeLinejoin="round" />
        <clipPath id="fillClip"><path d="M99 60 L201 60 L210 244 L90 244 Z" /></clipPath>
        <rect x="80" y={244 - h} width="140" height={h} fill={kind === 'jug' ? '#FBBF24' : '#38BDF8'} clipPath="url(#fillClip)" opacity="0.9" />
        <text x="150" y="282" textAnchor="middle" fill="#E9D5FF" fontSize="24" fontWeight="900">{kind === 'jug' ? 'Jug of juice' : 'Water tank'}</text>
      </svg>
    );
  }

  // ── Dots (people / marbles) ────────────────────────────────
  if (diagram.type === 'dots') {
    const { total, count } = diagram;
    const cols = total === 40 ? 8 : 5;
    const rows = Math.ceil(total / cols);
    const cell = Math.min(260 / cols, 210 / rows);
    const ox = (300 - cols * cell) / 2;
    return (
      <svg viewBox="0 0 300 300" className={svgCls}>
        {Array.from({ length: total }, (_, i) => (
          <circle
            key={i}
            cx={ox + (i % cols) * cell + cell / 2}
            cy={30 + Math.floor(i / cols) * cell + cell / 2}
            r={cell * 0.36}
            fill={i < count ? GOLD : DARK}
            stroke={i < count ? '#FFD966' : EDGE}
            strokeWidth="2"
          />
        ))}
        <text x="150" y="280" textAnchor="middle" fill="#C4B5FD" fontSize="26" fontWeight="900">{count} out of {total}</text>
      </svg>
    );
  }

  return null;
};

export default PercentDiagramSVG;
