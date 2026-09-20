import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, CheckCircle, ArrowRight, Minus, Plus, Zap, Droplet, Award } from 'lucide-react';
import soundEngine from '../utils/audio';
import { eventNarration } from '../data/narration';
import TripleReadout from './TripleReadout';
import MathText from './MathText';
import { realWorldSkins, CLASS_SIZES, TEST_TOTALS } from '../data/stationData';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const levelColor = (p) => (p > 50 ? '#10B981' : p > 20 ? '#F59E0B' : '#F43F5E');

const SizePills = ({ label, options, value, onChange }) => (
  <div className="flex items-center gap-1.5 flex-wrap justify-center">
    <span className="text-[11px] md:text-xs font-black text-purple-300">{label}</span>
    {options.map((o) => (
      <button
        key={o}
        onClick={() => onChange(o)}
        className={`px-2.5 py-0.5 rounded-full text-[11px] md:text-xs font-black cursor-pointer transition-all ${
          value === o ? 'bg-amber-400 text-slate-950 shadow-glow-gold scale-105' : 'bg-[#1A1333] text-purple-300 border border-purple-700/60 hover:text-white'
        }`}
      >
        {o}
      </button>
    ))}
  </div>
);

// ── 🔋 Phone battery widget ─────────────────────────────────────────────
const BatteryWidget = ({ onChange }) => {
  const [level, setLevel] = useState(100);
  const svgRef = useRef(null);
  const down = useRef(false);

  useEffect(() => { onChange({ num: level, den: 100 }); }, [level]); // eslint-disable-line react-hooks/exhaustive-deps

  const setFromPointer = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 300;
    const raw = ((x - 18) / 234) * 100;
    const v = clamp(Math.round(raw / 5) * 5, 0, 100);
    setLevel((prev) => { if (prev !== v) soundEngine.playDragClick(); return v; });
  };

  const setPreset = (v) => {
    soundEngine.playPop();
    setLevel(v);
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {/* Battery Presets */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {[20, 50, 75, 90, 100].map((p) => (
          <button
            key={p}
            onClick={() => setPreset(p)}
            className={`px-2 py-0.5 rounded-lg text-[10px] md:text-xs font-black border transition-all cursor-pointer ${
              level === p
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-glow-gold'
                : 'bg-[#1A1333] border-purple-700/60 text-purple-200 hover:text-white'
            }`}
          >
            {p === 100 ? '⚡ 100% Full' : `${p}%`}
          </button>
        ))}
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 300 130"
        className="w-full max-w-[290px] touch-none cursor-ew-resize select-none"
        onPointerDown={(e) => { down.current = true; svgRef.current.setPointerCapture(e.pointerId); setFromPointer(e); }}
        onPointerMove={(e) => { if (down.current) setFromPointer(e); }}
        onPointerUp={(e) => { down.current = false; if (svgRef.current.hasPointerCapture(e.pointerId)) svgRef.current.releasePointerCapture(e.pointerId); }}
      >
        <rect x="10" y="15" width="250" height="100" rx="18" fill="#161129" stroke="#F3F4F6" strokeWidth="6" />
        <rect x="264" y="45" width="16" height="40" rx="6" fill="#F3F4F6" />
        <rect x="18" y="23" width={(234 * level) / 100} height="84" rx="11" fill={levelColor(level)} style={{ transition: 'width 0.12s, fill 0.2s' }} />
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={18 + ((i + 1) * 234) / 10} y1="23" x2={18 + ((i + 1) * 234) / 10} y2="107" stroke="rgba(15,11,30,0.45)" strokeWidth="2" />
        ))}
        <text x="135" y="82" textAnchor="middle" fill="#fff" stroke="rgba(15,11,30,0.6)" strokeWidth="5" paintOrder="stroke" fontSize="42" fontWeight="900" fontFamily="Outfit, Inter, sans-serif">
          {level}%
        </text>
      </svg>

      <input
        type="range" min="0" max="100" step="5" value={level}
        onChange={(e) => { soundEngine.playDragClick(); setLevel(Number(e.target.value)); }}
        className="w-full max-w-[290px] accent-amber-400 cursor-pointer"
        aria-label="Battery level"
      />
    </div>
  );
};

// ── 🥤 Water bottle widget ─────────────────────────────────────────────
const BottleWidget = ({ onChange }) => {
  const [level, setLevel] = useState(0); // 0..10 tenths
  const svgRef = useRef(null);
  const down = useRef(false);

  useEffect(() => { onChange({ num: level, den: 10 }); }, [level]); // eslint-disable-line react-hooks/exhaustive-deps

  const setFromPointer = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    const y = ((e.clientY - r.top) / r.height) * 240;
    const v = clamp(Math.round((222 - y) / 18.2), 0, 10);
    setLevel((prev) => { if (prev !== v) soundEngine.playDragClick(); return v; });
  };
  const fillH = 18.2 * level;

  const milliliters = level * 100;

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {/* Bottle Presets */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {[2, 5, 7, 10].map((t) => (
          <button
            key={t}
            onClick={() => { soundEngine.playPop(); setLevel(t); }}
            className={`px-2.5 py-0.5 rounded-lg text-[10px] md:text-xs font-black border transition-all cursor-pointer ${
              level === t
                ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-glow-cyan'
                : 'bg-[#1A1333] border-purple-700/60 text-purple-200 hover:text-white'
            }`}
          >
            {t}/10 ({t * 10}%)
          </button>
        ))}
      </div>

      <div className="h-full flex items-center justify-center gap-4">
        <svg
          ref={svgRef}
          viewBox="0 0 160 240"
          className="h-[170px] md:h-[190px] touch-none cursor-pointer select-none"
          onPointerDown={(e) => { down.current = true; svgRef.current.setPointerCapture(e.pointerId); setFromPointer(e); }}
          onPointerMove={(e) => { if (down.current) setFromPointer(e); }}
          onPointerUp={(e) => { down.current = false; if (svgRef.current.hasPointerCapture(e.pointerId)) svgRef.current.releasePointerCapture(e.pointerId); }}
        >
          <rect x="60" y="4" width="40" height="30" rx="8" fill="#F3F4F6" />
          <rect x="38" y="30" width="84" height="200" rx="16" fill="#161129" stroke="#F3F4F6" strokeWidth="6" />
          <rect x="44" y={224 - fillH} width="72" height={fillH} rx="10" fill="#06B6D4" opacity="0.95" style={{ transition: 'all 0.12s' }} />
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={i} x1="122" y1={224 - (i + 1) * 18.2} x2={i === 9 ? 142 : 134} y2={224 - (i + 1) * 18.2} stroke="#C4B5FD" strokeWidth="3" strokeLinecap="round" />
          ))}
        </svg>

        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-3xl md:text-4xl font-black text-cyan-300 font-display">{level} / 10</span>
          <span className="text-xs md:text-sm font-black text-purple-200 leading-tight">
            💧 {milliliters} mL / 1000 mL
          </span>
          <span className="text-[10px] font-bold text-purple-400">
            ({level * 10}% capacity)
          </span>
        </div>
      </div>
    </div>
  );
};

// ── 🧑‍🎓 Class vote widget ─────────────────────────────────────────────
const VoteWidget = ({ onChange }) => {
  const [size, setSize] = useState(20);
  const [votes, setVotes] = useState(() => Array(20).fill(false));
  const [foodItem, setFoodItem] = useState('🍕 Pizza');
  const paintMode = useRef(null);

  const FOODS = ['🍕 Pizza', '🍔 Burgers', '🌮 Tacos'];

  const cols = size === 50 ? 10 : 5;
  const cell = size === 50 ? 24 : size === 25 ? 30 : 34;
  const count = votes.filter(Boolean).length;

  useEffect(() => { onChange({ num: count, den: size }); }, [count, size]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeSize = (s) => { soundEngine.playPop(); setSize(s); setVotes(Array(s).fill(false)); };
  const paint = (idx) => setVotes((prev) => {
    if (prev[idx] === paintMode.current) return prev;
    const next = [...prev];
    next[idx] = paintMode.current;
    soundEngine.playDragClick();
    return next;
  });
  const idxFromPoint = (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const v = el?.getAttribute?.('data-idx');
    return v === null || v === undefined ? null : Number(v);
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {/* Food Choice Pills */}
      <div className="flex items-center gap-1.5 justify-center mb-0.5">
        {FOODS.map((f) => (
          <button
            key={f}
            onClick={() => { soundEngine.playPop(); setFoodItem(f); }}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border transition-all cursor-pointer ${
              foodItem === f ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-glow-gold' : 'bg-[#1A1333] border-purple-700/60 text-purple-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <SizePills label="Class size:" options={CLASS_SIZES} value={size} onChange={changeSize} />

      <div
        className="grid gap-1 touch-none select-none my-1"
        style={{ gridTemplateColumns: `repeat(${cols}, ${cell}px)` }}
        onPointerMove={(e) => { if (paintMode.current === null) return; const i = idxFromPoint(e); if (i !== null) paint(i); }}
        onPointerUp={() => { paintMode.current = null; }}
        onPointerLeave={() => { paintMode.current = null; }}
        onPointerCancel={() => { paintMode.current = null; }}
      >
        {votes.map((v, i) => (
          <div
            key={i}
            data-idx={i}
            onPointerDown={(e) => { e.preventDefault(); paintMode.current = !votes[i]; paint(i); }}
            className={`rounded-full flex items-center justify-center cursor-pointer transition-all border-2 ${
              v ? 'bg-amber-400/25 border-amber-400 shadow-[0_0_8px_rgba(255,184,0,0.6)]' : 'bg-[#1A1333] border-purple-800/60 opacity-70'
            }`}
            style={{ width: cell, height: cell, fontSize: cell * 0.6 }}
          >
            <span data-idx={i} className="pointer-events-none">{v ? '🙋' : '🧑‍🎓'}</span>
          </div>
        ))}
      </div>

      <span className="text-[11px] md:text-xs font-black text-amber-300 text-center">
        🙋 {count} of {size} students voted for {foodItem} ({Math.round((count / size) * 100)}%)
      </span>
    </div>
  );
};

// ── 📝 Test score widget ─────────────────────────────────────────────
const ScoreWidget = ({ onChange }) => {
  const [total, setTotal] = useState(20);
  const [correct, setCorrect] = useState(0);

  useEffect(() => { onChange({ num: correct, den: total }); }, [correct, total]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeTotal = (t) => { soundEngine.playPop(); setTotal(t); setCorrect(0); };
  const bump = (d) => setCorrect((c) => { const v = clamp(c + d, 0, total); if (v !== c) soundEngine.playDragClick(); return v; });
  const pct = (correct / total) * 100;
  
  const getGradeBadge = (p) => {
    if (p === 100) return { grade: 'A+', color: 'text-amber-400 bg-amber-950/80 border-amber-400' };
    if (p >= 80) return { grade: 'A', color: 'text-emerald-400 bg-emerald-950/80 border-emerald-400' };
    if (p >= 60) return { grade: 'B', color: 'text-cyan-300 bg-cyan-950/80 border-cyan-400' };
    if (p >= 40) return { grade: 'C', color: 'text-yellow-400 bg-yellow-950/80 border-yellow-400' };
    return { grade: 'D', color: 'text-rose-400 bg-rose-950/80 border-rose-400' };
  };

  const { grade, color: gradeColor } = getGradeBadge(pct);

  const R = 48, C = 2 * Math.PI * R;
  const btn = 'px-3 py-1 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-[#3B2D6B] text-purple-100 font-black text-xs md:text-sm flex items-center gap-0.5 cursor-pointer transition-transform hover:scale-105';

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <SizePills label="Marks in test:" options={TEST_TOTALS} value={total} onChange={changeTotal} />
      
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 140 140" className="w-[110px] h-[110px] md:w-[125px] md:h-[125px]">
          <circle cx="70" cy="70" r={R} fill="none" stroke="#1C1438" strokeWidth="12" />
          <circle
            cx="70" cy="70" r={R} fill="none" stroke={levelColor(pct)} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${(C * pct) / 100} ${C}`} transform="rotate(-90 70 70)" style={{ transition: 'stroke-dasharray 0.15s' }}
          />
          <text x="70" y="66" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="900" fontFamily="Outfit, Inter, sans-serif">{correct}</text>
          <text x="70" y="86" textAnchor="middle" fill="#C4B5FD" fontSize="14" fontWeight="900" fontFamily="Outfit, Inter, sans-serif">out of {total}</text>
        </svg>

        {/* Grade Badge */}
        <div className={`absolute top-0 right-0 px-2 py-0.5 rounded-full border text-xs font-black shadow-md ${gradeColor}`}>
          Grade {grade}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button onClick={() => bump(-5)} className={btn}><Minus className="w-3 h-3" />5</button>
        <button onClick={() => bump(-1)} className={btn}><Minus className="w-3 h-3" />1</button>
        <button onClick={() => bump(1)} className={btn}><Plus className="w-3 h-3" />1</button>
        <button onClick={() => bump(5)} className={btn}><Plus className="w-3 h-3" />5</button>
      </div>
    </div>
  );
};

const WIDGETS = { battery: BatteryWidget, bottle: BottleWidget, vote: VoteWidget, score: ScoreWidget };

// Station D — Real-World Percent Lab
export const RealWorldLab = ({ onEvent }) => {
  const [skinId, setSkinId] = useState('battery');
  const [mIdx, setMIdx] = useState({ battery: 0, bottle: 0, vote: 0, score: 0 });
  const [done, setDone] = useState({ battery: [false, false, false], bottle: [false, false, false], vote: [false, false, false], score: [false, false, false] });
  const [amount, setAmount] = useState({ num: 0, den: 100 });
  const mounted = useRef(false);

  const skin = realWorldSkins.find((s) => s.id === skinId);
  const idx = mIdx[skinId];
  const mission = skin.missions[idx];
  const missionDone = done[skinId][idx];
  const allDone = done[skinId].every(Boolean);
  const Widget = WIDGETS[skinId];
  const percent = amount.den ? (amount.num / amount.den) * 100 : 0;

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    soundEngine.narrate(eventNarration(mission.key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skinId, idx]);

  useEffect(() => {
    if (missionDone) return;
    if (Math.abs(percent - mission.target) > 1e-6) return;
    const nextDone = done[skinId].map((d, i) => (i === idx ? true : d));
    setDone((prev) => ({ ...prev, [skinId]: nextDone }));
    soundEngine.playSuccess();
    confetti({ particleCount: 55, spread: 70, origin: { y: 0.6 } });
    onEvent?.(nextDone.every(Boolean) ? 'mission_all' : 'mission_complete');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent, skinId, idx]);

  const nextMission = () => setMIdx((prev) => ({ ...prev, [skinId]: Math.min(2, prev[skinId] + 1) }));

  return (
    <div className="w-full flex flex-col items-center gap-2.5 md:gap-3">
      {/* Object selector pills */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {realWorldSkins.map((s) => {
          const selected = s.id === skinId;
          const complete = done[s.id].every(Boolean);
          return (
            <button
              key={s.id}
              onClick={() => { soundEngine.playPop(); setSkinId(s.id); }}
              className={`px-4 py-2 rounded-2xl font-black text-sm md:text-base flex items-center gap-2 transition-all cursor-pointer ${
                selected ? 'bg-amber-400 text-slate-950 shadow-glow-gold scale-105' : 'bg-[#161129]/95 text-purple-200 hover:text-white border border-[#3B2D6B]'
              }`}
            >
              <span>{s.name} {s.icon}</span>
              {complete && <span className="text-emerald-500">✓</span>}
            </button>
          );
        })}
      </div>

      <div className="w-full flex flex-col md:flex-row items-stretch justify-center gap-3.5">
        {/* Widget */}
        <div className="w-full md:w-1/2 min-h-[220px] md:min-h-[260px] bg-[#161129]/95 border-2 border-[#3B2D6B] rounded-3xl p-4 flex items-center justify-center shadow-xl">
          <Widget key={skinId} onChange={setAmount} />
        </div>

        {/* Mission + readout */}
        <div className="w-full md:w-1/2 flex flex-col justify-center gap-3">
          <div className={`rounded-2xl border-2 px-4 py-3 transition-all ${
            missionDone ? 'bg-emerald-950/70 border-emerald-500 shadow-glow-green' : 'bg-amber-950/40 border-amber-400/70 shadow-[0_0_16px_rgba(255,184,0,0.25)]'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs md:text-sm font-black uppercase tracking-widest ${missionDone ? 'text-emerald-300' : 'text-amber-300'}`}>
                🎯 Mission {idx + 1} of 3
              </span>
              <button
                onClick={() => soundEngine.narrate(eventNarration(mission.key))}
                className="p-1 rounded-lg text-purple-300 hover:text-amber-400 hover:bg-purple-900/40 cursor-pointer"
                title="Listen to the mission"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-base md:text-xl font-black text-white leading-snug"><MathText>{mission.text}</MathText></p>

            {missionDone && (
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 text-xs md:text-base font-black text-emerald-300"><CheckCircle className="w-4.5 h-4.5" /> Complete!</span>
                {!allDone && idx < 2 && (
                  <button onClick={nextMission} className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-1.5 rounded-full text-xs md:text-sm font-black flex items-center gap-1 cursor-pointer">
                    Next mission <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {allDone && <span className="text-xs md:text-base font-black text-emerald-200">🏅 Try another object!</span>}
              </div>
            )}
          </div>

          <TripleReadout numerator={amount.num} denominator={amount.den} />
        </div>
      </div>
    </div>
  );
};

export default RealWorldLab;

