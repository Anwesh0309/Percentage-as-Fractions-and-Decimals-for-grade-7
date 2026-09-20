import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Dices, Search, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import soundEngine from '../utils/audio';
import MathText from './MathText';
import { detectiveCases } from '../data/stationData';
import { parseValue, toPercentString } from '../utils/mathValue';

const TAGS = ['A', 'B', 'C', 'D'];

// Station C — Imposter Detective
// Three of four cards show the SAME amount. Find the imposter (use Magnifier to inspect suspect cards).
export const ImposterDetective = ({ onEvent }) => {
  const [caseIdx, setCaseIdx] = useState(0);
  const [cleared, setCleared] = useState([]);       // card indexes ruled out
  const [caught, setCaught] = useState(false);
  const [magnifier, setMagnifier] = useState('ready'); // ready | armed | used
  const [peekedCards, setPeekedCards] = useState([]);  // card indexes revealed by magnifier
  const [solved, setSolved] = useState([]);
  const [shakeIdx, setShakeIdx] = useState(null);

  const c = detectiveCases[caseIdx];
  const allSolved = solved.length === detectiveCases.length;
  const percentOf = (label) => toPercentString(parseValue(label));

  const loadCase = (idx) => {
    setCaseIdx(idx);
    setCleared([]);
    setCaught(false);
    setMagnifier('ready');
    setPeekedCards([]);
    setShakeIdx(null);
  };

  const nextCase = () => loadCase((caseIdx + 1) % detectiveCases.length);

  const handleCard = (i) => {
    if (caught || cleared.includes(i)) return;

    if (magnifier === 'armed') {
      soundEngine.playPop();
      if (!peekedCards.includes(i)) {
        setPeekedCards((prev) => [...prev, i]);
      }
      setMagnifier('ready');
      return;
    }

    if (i === c.imposter) {
      soundEngine.playSuccess();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.55 } });
      setCaught(true);
      const next = solved.includes(c.id) ? solved : [...solved, c.id];
      setSolved(next);
      onEvent?.(next.length === detectiveCases.length ? 'detective_all' : 'detective_caught');
    } else {
      soundEngine.playWrong();
      setCleared((prev) => [...prev, i]);
      setShakeIdx(i);
      setTimeout(() => setShakeIdx(null), 450);
      onEvent?.('detective_wrong');
    }
  };

  const cardClasses = (i) => {
    if (caught && i === c.imposter) return 'bg-pink-950/80 border-pink-400 text-pink-100 shadow-[0_0_22px_rgba(244,63,94,0.55)] scale-105';
    if (caught) return 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200';
    if (cleared.includes(i)) return 'bg-[#161129]/60 border-purple-900/50 text-purple-500 opacity-60 line-through decoration-2';
    if (magnifier === 'armed') return 'bg-[#1A1333] border-amber-400 text-white hover:scale-105 cursor-zoom-in animate-pulse';
    return 'bg-[#1A1333] border-purple-600/70 text-white hover:border-amber-400 hover:scale-105 cursor-pointer';
  };

  return (
    <div className="w-full max-w-lg flex flex-col items-center gap-2 md:gap-3">
      {/* Case header & Rank Badge */}
      <div className="w-full flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-black text-cyan-300 uppercase tracking-wider">Case #{c.id} of {detectiveCases.length}</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-950 border border-purple-600 text-amber-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Sleuth Rank {solved.length}/{detectiveCases.length}
            </span>
          </div>
          <p className="text-base md:text-xl font-black text-white font-display truncate">🗂️ {c.title}</p>
        </div>
        <button
          onClick={nextCase}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-1.5 rounded-xl text-xs md:text-sm font-black flex items-center gap-1.5 cursor-pointer shadow-glow-gold transition-transform hover:scale-105 shrink-0"
        >
          <Dices className="w-4 h-4" />
          <span>New Case 🎲</span>
        </button>
      </div>

      {/* Case progress dots */}
      <div className="flex items-center gap-2">
        {detectiveCases.map((cs, i) => (
          <button
            key={cs.id}
            onClick={() => loadCase(i)}
            className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center border-2 cursor-pointer transition-all ${
              solved.includes(cs.id) ? 'bg-emerald-500 border-emerald-300 text-slate-950 shadow-glow-green'
                : i === caseIdx ? 'bg-amber-400 border-amber-200 text-slate-950 scale-110 shadow-glow-gold'
                : 'bg-[#1A1333] border-purple-700/60 text-purple-400'
            }`}
            title={`Case ${cs.id}`}
          >
            {solved.includes(cs.id) ? '✓' : cs.id}
          </button>
        ))}
      </div>

      {/* Suspect cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 w-full">
        {c.cards.map((label, i) => (
          <button
            key={`${c.id}-${i}`}
            data-suspect={i}
            onClick={() => handleCard(i)}
            className={`relative rounded-2xl border-2 h-[88px] md:h-[104px] flex flex-col items-center justify-center transition-all ${cardClasses(i)} ${shakeIdx === i ? 'animate-[shake_0.4s]' : ''}`}
          >
            <span className="absolute top-1.5 left-2.5 text-xs font-black text-amber-300/80">Suspect {TAGS[i]}</span>
            <span className="text-3xl md:text-5xl font-black font-display leading-none"><MathText>{label}</MathText></span>
            <span className="absolute bottom-1 text-xs md:text-sm font-black h-4">
              {caught && i === c.imposter && <span className="text-pink-300">🕵️ IMPOSTER! = {percentOf(label)}</span>}
              {caught && i !== c.imposter && <span className="text-emerald-300">= {percentOf(label)}</span>}
              {!caught && cleared.includes(i) && <span className="text-purple-400">= {percentOf(label)} (Matches)</span>}
              {!caught && !cleared.includes(i) && peekedCards.includes(i) && <span className="text-amber-300">🔍 = {percentOf(label)}</span>}
            </span>
          </button>
        ))}
      </div>

      {/* Tools + messages */}
      {!caught ? (
        <div className="w-full flex items-center justify-between gap-2">
          <p className="text-xs md:text-base font-black text-slate-200">
            Three cards match. <span className="text-pink-300">Tap the imposter!</span>
          </p>
          <button
            onClick={() => setMagnifier((m) => (m === 'ready' ? 'armed' : 'ready'))}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-black flex items-center gap-1.5 border-2 transition-all ${
              magnifier === 'armed'
                ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-glow-gold cursor-pointer'
                : 'bg-[#1A1333] text-amber-300 border-amber-500/60 hover:text-white cursor-pointer'
            }`}
          >
            <Search className="w-4 h-4" />
            {magnifier === 'armed' ? 'Tap card to inspect…' : 'Inspect Card 🔍'}
          </button>
        </div>
      ) : (
        <div className="w-full bg-emerald-950/70 border-2 border-emerald-500 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-glow-green">
          <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
          <p className="flex-1 text-xs md:text-base font-black text-emerald-200 leading-snug"><MathText>{c.reveal}</MathText></p>
          {!allSolved || caseIdx < detectiveCases.length - 1 ? (
            <button onClick={nextCase} className="shrink-0 bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-1.5 rounded-full text-xs md:text-sm font-black flex items-center gap-1 cursor-pointer">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="shrink-0 text-2xl">🏅</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ImposterDetective;

