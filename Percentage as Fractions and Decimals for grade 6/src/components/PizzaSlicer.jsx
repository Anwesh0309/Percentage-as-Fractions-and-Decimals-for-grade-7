import React, { useState } from 'react';
import soundEngine from '../utils/audio';
import TripleReadout from './TripleReadout';

const SLICE_OPTIONS = [4, 5, 8, 10];

// Wonder-stage widget: tap pizza slices to "eat" them and watch the fraction, decimal and percent
// change together.
export const PizzaSlicer = () => {
  const [slices, setSlices] = useState(4);
  const [eaten, setEaten] = useState([true, false, false, false]);

  const changeSlices = (n) => {
    soundEngine.playPop();
    setSlices(n);
    setEaten(Array.from({ length: n }, (_, i) => i === 0));
  };

  const toggle = (i) => {
    soundEngine.playPop();
    setEaten((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  const count = eaten.filter(Boolean).length;
  const cx = 100, cy = 100, r = 88;
  const step = (2 * Math.PI) / slices;

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        {SLICE_OPTIONS.map((n) => (
          <button
            key={n}
            onClick={() => changeSlices(n)}
            className={`px-3 py-1 rounded-full text-xs md:text-sm font-black transition-all cursor-pointer ${
              slices === n
                ? 'bg-amber-400 text-slate-950 shadow-glow-gold scale-105'
                : 'bg-[#1A1333] text-purple-300 border border-purple-700/60 hover:text-white'
            }`}
          >
            {n} slices
          </button>
        ))}
      </div>

      <svg viewBox="0 0 200 200" className="w-28 h-28 md:w-[20vh] md:h-[20vh] max-w-[150px] max-h-[150px] touch-none select-none overflow-visible">
        <circle cx={cx} cy={cy} r={r + 6} fill="#241A45" stroke="#8B5CF6" strokeOpacity="0.5" strokeWidth="3" />
        {Array.from({ length: slices }).map((_, i) => {
          const a0 = -Math.PI / 2 + i * step;
          const a1 = a0 + step;
          const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
          const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
          const mid = (a0 + a1) / 2;
          const on = eaten[i];
          return (
            <g key={i} onClick={() => toggle(i)} className="cursor-pointer">
              <path
                d={`M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`}
                fill={on ? '#FFB800' : '#1C1438'}
                stroke={on ? '#FFE08A' : '#8B5CF6'}
                strokeOpacity={on ? 1 : 0.55}
                strokeWidth="3"
                strokeLinejoin="round"
                style={{ filter: on ? 'drop-shadow(0 0 6px rgba(255,184,0,0.7))' : 'none', transition: 'fill 0.2s' }}
              />
              {on && (
                <>
                  <circle cx={cx + r * 0.55 * Math.cos(mid)} cy={cy + r * 0.55 * Math.sin(mid)} r="6" fill="#B91C1C" />
                  <circle cx={cx + r * 0.78 * Math.cos(mid + 0.12)} cy={cy + r * 0.78 * Math.sin(mid + 0.12)} r="4.5" fill="#B91C1C" />
                </>
              )}
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="5" fill="#F3F4F6" stroke="#8B5CF6" strokeWidth="2.5" />
      </svg>

      <TripleReadout numerator={count} denominator={slices} />
    </div>
  );
};

export default PizzaSlicer;
