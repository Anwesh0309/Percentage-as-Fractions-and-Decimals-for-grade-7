import React from 'react';
import { Frac } from './MathText';
import { simplify, roundClean } from '../utils/mathValue';

// Shows ONE amount in its three costumes: fraction • decimal • percent.
//   numerator / denominator = the amount (e.g. 37 / 100, or 12 / 20)
export const TripleReadout = ({ numerator = 0, denominator = 100, size = 'md', className = '' }) => {
  const value = denominator ? numerator / denominator : 0;
  const percent = roundClean(value * 100, 2);
  const decimal = roundClean(value, 4);
  const [sn, sd] = numerator === 0 ? [0, 1] : simplify(numerator, denominator);
  const isSimplified = numerator !== 0 && (sn !== numerator || sd !== denominator);

  const big = size === 'lg';
  const cardBase = `flex-1 min-w-0 rounded-2xl border-2 flex flex-col items-center justify-center text-center ${big ? 'px-3 py-3 short:py-1.5' : 'px-2 py-2.5'}`;
  const label = 'text-xs md:text-sm font-black uppercase tracking-widest';
  const val = big ? 'text-4xl md:text-5xl short:text-3xl' : 'text-2xl md:text-3xl lg:text-4xl';

  return (
    <div className={`flex items-stretch gap-2.5 w-full ${className}`}>
      {/* Fraction */}
      <div className={`${cardBase} bg-cyan-950/40 border-cyan-400/70`}>
        <span className={`${label} text-cyan-300`}>Fraction</span>
        <span className={`${val} font-black text-white font-display leading-tight`}>
          <Frac n={numerator} d={denominator} />
        </span>
        <span className="text-xs md:text-sm font-black text-cyan-200 h-5 flex items-center gap-1">
          {isSimplified && sd !== 1 && (<>= <Frac n={sn} d={sd} /></>)}
          {isSimplified && sd === 1 && <>= {sn}</>}
        </span>
      </div>

      {/* Decimal */}
      <div className={`${cardBase} bg-amber-950/40 border-amber-400/70`}>
        <span className={`${label} text-amber-300`}>Decimal</span>
        <span className={`${val} font-black text-white font-display leading-tight`}>{decimal}</span>
        <span className="text-xs md:text-sm font-black text-amber-200 h-5">{numerator} ÷ {denominator}</span>
      </div>

      {/* Percent */}
      <div className={`${cardBase} bg-pink-950/40 border-pink-400/70`}>
        <span className={`${label} text-pink-300`}>Percent</span>
        <span className={`${val} font-black text-white font-display leading-tight`}>{percent}%</span>
        <span className="text-xs md:text-sm font-black text-pink-200 h-5">per 100</span>
      </div>
    </div>
  );
};

// A row of equal parts with `filled` of them lit — used to picture the simplest fraction.
export const FractionBar = ({ filled, parts, color = '#06B6D4' }) => {
  const n = Math.max(1, Math.min(parts, 20));
  return (
    <div className="flex w-full h-4 rounded-md overflow-hidden gap-[2px]">
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          className="flex-1 transition-colors duration-200"
          style={{ background: i < filled ? color : '#1C1438', boxShadow: i < filled ? `0 0 6px ${color}` : 'none' }}
        />
      ))}
    </div>
  );
};

export default TripleReadout;
