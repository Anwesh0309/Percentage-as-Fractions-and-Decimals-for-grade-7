import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Minus, Plus, RotateCcw, CheckCircle2, Sparkles, Palette } from 'lucide-react';
import soundEngine from '../utils/audio';
import TripleReadout, { FractionBar } from './TripleReadout';
import { gridLandmarks } from '../data/stationData';
import { simplify } from '../utils/mathValue';

const THEMES = {
  gold: { name: 'Gold Glow', bg: 'linear-gradient(135deg,#FFC933,#F59E0B)', stroke: '#FFE08A', shadow: 'rgba(255,184,0,0.55)' },
  cyan: { name: 'Cyber Cyan', bg: 'linear-gradient(135deg,#22D3EE,#06B6D4)', stroke: '#67E8F9', shadow: 'rgba(6,182,212,0.6)' },
  flame: { name: 'Flame Orange', bg: 'linear-gradient(135deg,#FB923C,#EA580C)', stroke: '#FDBA74', shadow: 'rgba(234,88,12,0.6)' },
  emerald: { name: 'Emerald', bg: 'linear-gradient(135deg,#34D399,#059669)', stroke: '#6EE7B7', shadow: 'rgba(5,150,105,0.6)' },
};

const PRESETS = [
  { label: '⅒ (10%)', val: 10 },
  { label: '⅕ (20%)', val: 20 },
  { label: '¼ (25%)', val: 25 },
  { label: '½ (50%)', val: 50 },
  { label: '¾ (75%)', val: 75 },
  { label: 'Whole (100%)', val: 100 },
];

export const HundredGrid = ({ onEvent }) => {
  const [filled, setFilled] = useState(0);
  const [found, setFound] = useState([]);
  const [themeKey, setThemeKey] = useState('gold');
  const gridRef = useRef(null);
  const dragging = useRef(false);
  const lastIdx = useRef(-1);

  const theme = THEMES[themeKey];

  // Landmark detection
  useEffect(() => {
    const hit = gridLandmarks.find((l) => l.percent === filled && !found.includes(l.id));
    if (!hit) return;
    const next = [...found, hit.id];
    setFound(next);
    soundEngine.playSuccess();
    confetti({ particleCount: 45, spread: 65, origin: { y: 0.55 } });
    onEvent?.(next.length === gridLandmarks.length ? 'discover_all' : hit.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filled]);

  const cellFromEvent = (e) => {
    const rect = gridRef.current.getBoundingClientRect();
    const col = Math.min(9, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * 10)));
    const row = Math.min(9, Math.max(0, Math.floor(((e.clientY - rect.top) / rect.height) * 10)));
    return row * 10 + col;
  };

  const setCount = (n) => {
    const v = Math.max(0, Math.min(100, n));
    setFilled((prev) => {
      if (prev !== v) soundEngine.playDragClick();
      return v;
    });
  };

  const handleDown = (e) => {
    dragging.current = true;
    gridRef.current.setPointerCapture(e.pointerId);
    const idx = cellFromEvent(e);
    lastIdx.current = idx;
    setCount(idx + 1 === filled ? idx : idx + 1);
  };
  const handleMove = (e) => {
    if (!dragging.current) return;
    const idx = cellFromEvent(e);
    if (idx === lastIdx.current) return;
    lastIdx.current = idx;
    setCount(idx + 1);
  };
  const handleUp = (e) => {
    dragging.current = false;
    if (gridRef.current?.hasPointerCapture(e.pointerId)) gridRef.current.releasePointerCapture(e.pointerId);
  };

  const [sn, sd] = filled === 0 ? [0, 1] : simplify(filled, 100);
  const isPerfect = found.length === gridLandmarks.length;

  const fullRows = Math.floor(filled / 10);
  const extraCells = filled % 10;

  const stepBtn = 'px-3 py-1 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-[#3B2D6B] text-purple-100 font-black text-xs flex items-center justify-center cursor-pointer transition-all hover:scale-105';

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-center gap-3 md:gap-5">
      {/* Left: the hundred grid + steppers + presets */}
      <div className="flex flex-col items-center gap-2 shrink-0">
        
        {/* Quick Presets Bar */}
        <div className="flex items-center gap-1 flex-wrap justify-center max-w-[300px]">
          <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Presets:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.val}
              onClick={() => setCount(p.val)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                filled === p.val
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-glow-gold'
                  : 'bg-[#1A1333] border-purple-700/60 text-purple-200 hover:text-white hover:border-purple-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Grid Container */}
        <div className="flex items-stretch gap-1.5">
          <div className="flex flex-col justify-around text-[10px] md:text-xs font-black text-purple-400/70 py-0.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="leading-none text-right">{(i + 1) * 10}%</span>
            ))}
          </div>
          <div
            ref={gridRef}
            data-testid="hundred-grid"
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
            onPointerCancel={handleUp}
            className="grid grid-cols-10 gap-[3px] p-1.5 rounded-2xl bg-[#161129]/95 border-2 border-[#3B2D6B] shadow-glow-purple touch-none cursor-pointer select-none relative"
            style={{ width: 'min(32vh, 260px)', height: 'min(32vh, 260px)' }}
          >
            {Array.from({ length: 100 }).map((_, i) => {
              const on = i < filled;
              return (
                <div
                  key={i}
                  className="rounded-[4px] transition-colors duration-150"
                  style={{
                    background: on ? theme.bg : '#1C1438',
                    border: on ? `1px solid ${theme.stroke}` : '1px solid rgba(139,92,246,0.3)',
                    boxShadow: on ? `0 0 6px ${theme.shadow}` : 'none',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Controls: Steppers & Theme Selector */}
        <div className="flex items-center gap-1.5">
          <button onClick={() => setCount(filled - 10)} className={stepBtn} title="-10%"><Minus className="w-3 h-3" />10</button>
          <button onClick={() => setCount(filled - 1)} className={stepBtn} title="-1%"><Minus className="w-3 h-3" />1</button>
          <button onClick={() => setCount(filled + 1)} className={stepBtn} title="+1%"><Plus className="w-3 h-3" />1</button>
          <button onClick={() => setCount(filled + 10)} className={stepBtn} title="+10%"><Plus className="w-3 h-3" />10</button>
          <button onClick={() => { setCount(0); }} className={stepBtn} title="Clear Grid"><RotateCcw className="w-3.5 h-3.5" /></button>
          
          {/* Theme Switcher Button */}
          <button
            onClick={() => {
              const keys = Object.keys(THEMES);
              const nextIdx = (keys.indexOf(themeKey) + 1) % keys.length;
              setThemeKey(keys[nextIdx]);
              soundEngine.playPop();
            }}
            className="px-2.5 py-1 rounded-xl bg-purple-900/60 border border-purple-500/50 text-amber-300 hover:text-white font-black text-xs flex items-center gap-1 cursor-pointer"
            title="Change Grid Color Theme"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{theme.name}</span>
          </button>
        </div>

      </div>

      {/* Right: Live Converter + Detailed HUD */}
      <div className="w-full max-w-md flex flex-col gap-2">
        {/* Shading Details HUD */}
        <div className="bg-[#161129]/95 border border-[#3B2D6B] rounded-2xl px-3.5 py-2 text-center shadow-lg flex items-center justify-between">
          <p className="text-xs md:text-sm font-black text-purple-200">
            Shaded: <span className="text-amber-400 text-base md:text-lg font-display">{filled}</span>/100 squares
          </p>
          <p className="text-[11px] font-black text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-2.5 py-0.5 rounded-full">
            {fullRows} full row{fullRows !== 1 ? 's' : ''} {extraCells > 0 ? `+ ${extraCells} cell${extraCells !== 1 ? 's' : ''}` : ''}
          </p>
        </div>

        {/* Live Triple Readout */}
        <TripleReadout numerator={filled} denominator={100} size="lg" />

        {/* Simplest Fraction Breakdown */}
        <div className="bg-[#161129]/95 border border-[#3B2D6B] rounded-2xl px-3.5 py-2 space-y-1">
          <div className="flex items-center justify-between text-xs font-black text-cyan-300">
            <span>Simplest fraction</span>
            <span>{sd === 1 ? (sn === 0 ? '0' : '1 whole') : `${sn} of ${sd} equal parts`}</span>
          </div>
          <FractionBar filled={sn} parts={sd} />
        </div>

        {/* Landmark Discoveries */}
        <div className="bg-[#161129]/95 border border-[#3B2D6B] rounded-2xl px-3.5 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] md:text-xs font-black text-amber-300 uppercase tracking-wider">Landmarks to discover</span>
            {isPerfect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </div>
          <div className="flex items-center justify-between gap-1.5">
            {gridLandmarks.map((l) => {
              const got = found.includes(l.id);
              return (
                <button
                  key={l.id}
                  onClick={() => setCount(l.percent)}
                  className={`flex-1 rounded-xl border-2 py-1 text-center transition-all cursor-pointer ${
                    got
                      ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-glow-green'
                      : 'bg-[#1A1333] border-purple-800/60 text-purple-400 hover:border-purple-400 hover:text-white'
                  }`}
                  title={`Click to set grid to ${l.name} (${l.percent}%)`}
                >
                  <div className="text-base md:text-lg font-black leading-none">{got ? l.badge : '?'}</div>
                  <div className="text-[9px] md:text-[10px] font-black leading-tight mt-0.5">{got ? l.name : 'Find it!'}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HundredGrid;

