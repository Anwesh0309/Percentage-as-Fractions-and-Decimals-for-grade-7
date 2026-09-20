import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { RotateCcw, CheckCircle, ArrowRight, Lightbulb } from 'lucide-react';
import soundEngine from '../utils/audio';
import MathText from './MathText';
import { sorterRounds } from '../data/stationData';

const fmtPct = (v) => `${v}%`;

// A single card. `status`: idle | selected | locked | wrong
const CardChip = ({ card, status = 'idle', onPointerDown, ghost = false, dim = false }) => {
  const styles = {
    idle: 'bg-[#1A1333] border-cyan-400/70 text-white hover:border-amber-400 hover:scale-105',
    selected: 'bg-amber-950/70 border-amber-400 text-amber-200 scale-105 shadow-glow-gold',
    locked: 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-glow-green',
    wrong: 'bg-red-950/80 border-red-500 text-red-200 animate-[shake_0.4s]',
  }[status];
  return (
    <div
      data-card={card.id}
      data-status={status}
      onPointerDown={onPointerDown}
      className={`w-full h-full min-h-11 rounded-xl border-2 flex items-center justify-center font-black font-display text-base md:text-xl select-none touch-none transition-all ${
        status === 'locked' ? 'cursor-default' : ghost ? 'cursor-grabbing' : 'cursor-grab'
      } ${styles} ${dim ? 'opacity-30' : ''} ${ghost ? 'shadow-2xl scale-110 !border-amber-400' : ''}`}
    >
      <MathText>{card.label}</MathText>
    </div>
  );
};

// Station B — Number Line Sorter
export const NumberLineSorter = ({ onEvent }) => {
  const [roundIdx, setRoundIdx] = useState(0);
  const [placements, setPlacements] = useState({});      // cardId -> slot index
  const [locked, setLocked] = useState([]);
  const [wrong, setWrong] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [drag, setDrag] = useState(null);                 // { id, x, y, moved }
  const [hoverSlot, setHoverSlot] = useState(null);
  const [showLabels, setShowLabels] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [roundDone, setRoundDone] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [busy, setBusy] = useState(false);

  const round = sorterRounds[roundIdx];
  const slots = round.slots;
  const n = slots.length;
  const isLastRound = roundIdx === sorterRounds.length - 1;
  const allDone = completed.length === sorterRounds.length;

  const slotRefs = useRef([]);
  const dragRef = useRef(null);
  const latest = useRef({});

  const cardAtSlot = (i) => Object.keys(placements).find((id) => placements[id] === i) || null;
  const trayCards = round.cards.filter((c) => placements[c.id] === undefined);
  const unlockedCards = round.cards.filter((c) => !locked.includes(c.id));
  const allPlaced = unlockedCards.every((c) => placements[c.id] !== undefined);

  const slotAt = (x, y) => {
    let best = null, bestD = Infinity;
    slotRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = Math.abs(x - cx), dy = Math.abs(y - cy);
      if (dx <= r.width / 2 + 8 && dy <= r.height / 2 + 30) {
        const d = dx + dy * 0.3;
        if (d < bestD) { bestD = d; best = i; }
      }
    });
    return best;
  };

  const placeCard = (cardId, slotIdx) => {
    const occupant = cardAtSlot(slotIdx);
    if (occupant && locked.includes(occupant)) return;
    soundEngine.playPop();
    setFeedback('');
    setPlacements((prev) => {
      const next = { ...prev };
      const from = next[cardId];
      if (occupant && occupant !== cardId) {
        if (from !== undefined) next[occupant] = from; else delete next[occupant];
      }
      next[cardId] = slotIdx;
      return next;
    });
    setSelectedId(null);
  };

  const handleTap = (cardId) => {
    if (placements[cardId] !== undefined) {
      soundEngine.playDragClick();
      setPlacements((prev) => { const next = { ...prev }; delete next[cardId]; return next; });
      setSelectedId(null);
    } else {
      soundEngine.playDragClick();
      setSelectedId((cur) => (cur === cardId ? null : cardId));
    }
  };

  latest.current = { placeCard, handleTap };

  const startDrag = (e, cardId) => {
    if (locked.includes(cardId) || busy) return;
    e.preventDefault();
    dragRef.current = { id: cardId, sx: e.clientX, sy: e.clientY, moved: false };
    setDrag({ id: cardId, x: e.clientX, y: e.clientY, moved: false });
  };

  const dragging = !!drag;
  useEffect(() => {
    if (!dragging) return undefined;
    const move = (e) => {
      const d = dragRef.current;
      if (!d) return;
      d.moved = d.moved || Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 6;
      setDrag({ id: d.id, x: e.clientX, y: e.clientY, moved: d.moved });
      setHoverSlot(d.moved ? slotAt(e.clientX, e.clientY) : null);
    };
    const up = (e) => {
      const d = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      setHoverSlot(null);
      if (!d) return;
      if (!d.moved) { latest.current.handleTap(d.id); return; }
      const s = slotAt(e.clientX, e.clientY);
      if (s !== null) latest.current.placeCard(d.id, s);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  const handleCheck = () => {
    if (!allPlaced || busy) return;
    const results = unlockedCards.map((c) => ({ c, ok: slots[placements[c.id]] === c.value }));
    const okIds = results.filter((r) => r.ok).map((r) => r.c.id);
    const bad = results.filter((r) => !r.ok).map((r) => r.c);
    setLocked((prev) => [...prev, ...okIds]);

    if (bad.length === 0) {
      soundEngine.playSuccess();
      confetti({ particleCount: 70, spread: 75, origin: { y: 0.6 } });
      setRoundDone(true);
      setFeedback('');
      const done = completed.includes(round.id) ? completed : [...completed, round.id];
      setCompleted(done);
      onEvent?.(done.length === sorterRounds.length ? 'sorter_all_rounds' : 'sorter_round_correct');
      return;
    }

    soundEngine.playWrong();
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setWrong(bad.map((c) => c.id));
    setBusy(true);
    setFeedback(
      nextAttempts >= 2
        ? bad.map((c) => `${c.label} = ${fmtPct(c.value)}`).join('   •   ')
        : `Change ${bad.map((c) => c.label).join(' and ')} into a percent, then find it on the line.`,
    );
    onEvent?.('sorter_some_wrong');
    setTimeout(() => {
      setPlacements((prev) => {
        const next = { ...prev };
        bad.forEach((c) => delete next[c.id]);
        return next;
      });
      setWrong([]);
      setBusy(false);
    }, 1100);
  };

  const resetRound = (idx = roundIdx) => {
    setRoundIdx(idx);
    setPlacements({});
    setLocked([]);
    setWrong([]);
    setSelectedId(null);
    setAttempts(0);
    setFeedback('');
    setRoundDone(false);
    setBusy(false);
  };

  const nextRound = () => resetRound(roundIdx + 1);
  const playAgain = () => { setCompleted([]); resetRound(0); };

  const showTickLabel = (v) => showLabels || v === 0 || v === 50 || v === 100;
  const slotW = `min(58px, calc(${100 / (n - 1)}% - 4px))`;
  const draggedCard = drag && drag.moved ? round.cards.find((c) => c.id === drag.id) : null;

  return (
    <div className="w-full max-w-3xl flex flex-col items-center gap-2 md:gap-2.5">
      {/* Round pills + tools */}
      <div className="w-full flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5">
          {sorterRounds.map((r, i) => {
            const done = completed.includes(r.id);
            const active = i === roundIdx;
            return (
              <button
                key={r.id}
                onClick={() => resetRound(i)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] md:text-xs font-black border-2 cursor-pointer transition-transform hover:scale-105 ${
                  done ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                    : active ? 'bg-amber-400 border-amber-300 text-slate-950'
                    : 'bg-[#1A1333] border-purple-800/60 text-purple-400'
                }`}
              >
                {done ? '✓' : ''} Round {r.id}
              </button>
            );
          })}
        </div>
        <span className="text-[11px] md:text-xs font-black text-cyan-300 truncate">{round.subtitle}</span>
        <button
          onClick={() => setShowLabels((v) => !v)}
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] md:text-xs font-black border-2 cursor-pointer transition-colors ${
            showLabels ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-[#1A1333] text-amber-300 border-amber-500/50 hover:text-white'
          }`}
          title="Show a label on every tick"
        >
          <Lightbulb className="w-3 h-3" /> Labels
        </button>
      </div>

      {/* Number line */}
      <div className="relative w-full h-[112px] md:h-[124px] px-9 md:px-12 select-none">
        <div className="relative w-full h-full">
          {/* line */}
          <div className="absolute left-[-14px] right-[-14px] top-[68px] md:top-[74px] h-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 shadow-[0_0_14px_rgba(255,184,0,0.6)]" />
          {slots.map((v, i) => {
            const id = cardAtSlot(i);
            const card = id ? round.cards.find((c) => c.id === id) : null;
            const status = card ? (locked.includes(card.id) ? 'locked' : wrong.includes(card.id) ? 'wrong' : 'idle') : 'idle';
            const isHover = hoverSlot === i;
            return (
              <div key={v} className="absolute top-0" style={{ left: `${(i / (n - 1)) * 100}%`, transform: 'translateX(-50%)', width: slotW }}>
                <div
                  ref={(el) => { slotRefs.current[i] = el; }}
                  data-slot={i}
                  onClick={() => { if (selectedId && !card) placeCard(selectedId, i); }}
                  className={`w-full h-[48px] md:h-[54px] rounded-xl border-2 transition-all ${
                    card ? 'border-transparent' : isHover ? 'border-amber-400 bg-amber-400/20 scale-105' : selectedId ? 'border-dashed border-amber-400/80 bg-amber-400/5 cursor-pointer' : 'border-dashed border-purple-500/50 bg-purple-950/20'
                  }`}
                >
                  {card && (
                    <CardChip
                      card={card}
                      status={status}
                      dim={drag?.id === card.id && drag.moved}
                      onPointerDown={(e) => startDrag(e, card.id)}
                    />
                  )}
                </div>
                {/* tick + label */}
                <div className="flex flex-col items-center" style={{ marginTop: '2px' }}>
                  <div className="w-1 h-5 bg-white rounded-full" />
                  <span className={`mt-1 text-[9px] md:text-xs font-black whitespace-nowrap ${showTickLabel(v) ? 'text-purple-200' : 'text-transparent'}`}>{fmtPct(v)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card tray */}
      <div className="w-full flex flex-col items-center gap-2 bg-[#161129]/95 border border-[#3B2D6B] rounded-2xl px-4 py-2.5">
        
        {/* Selected Card Step Conversion Helper Pill */}
        {selectedId ? (
          <div className="w-full bg-amber-950/80 border border-amber-400/70 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs md:text-sm font-black text-amber-200 shadow-glow-gold animate-pulse-subtle">
            <span className="flex items-center gap-1.5">
              <span>💡 Helper:</span>
              <span className="text-white font-display font-black text-sm md:text-base">
                <MathText>{round.cards.find(c => c.id === selectedId)?.label}</MathText>
              </span>
              <span className="text-amber-300">
                = {round.cards.find(c => c.id === selectedId)?.value}%
              </span>
            </span>
            <span className="text-[11px] font-bold text-amber-300/90 hidden sm:inline">
              Tap a dashed slot on the line! 🎯
            </span>
          </div>
        ) : (
          <div className="text-[11px] md:text-xs font-black text-purple-300/80 text-center">
            💡 Tap any card to see its conversion, or drag it straight onto the line!
          </div>
        )}

        <div className="w-full min-h-[56px] flex items-center justify-center gap-2.5 md:gap-4 flex-wrap">
          {trayCards.length === 0 ? (
            <span className="text-xs md:text-base font-black text-purple-300">
              {roundDone ? '🎉 Every card is on the right spot!' : 'All cards placed — press Check!'}
            </span>
          ) : (
            trayCards.map((c) => (
              <div key={c.id} className="w-[76px] h-[52px] md:w-[92px] md:h-[60px]">
                <CardChip
                  card={c}
                  status={selectedId === c.id ? 'selected' : 'idle'}
                  dim={drag?.id === c.id && drag.moved}
                  onPointerDown={(e) => startDrag(e, c.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions + feedback */}
      <div className="w-full flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => resetRound()}
            className="px-5 py-2 rounded-full bg-[#161129] border border-[#3B2D6B] text-purple-200 hover:text-white font-black text-xs md:text-base flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>

          {!roundDone && (
            <button
              onClick={handleCheck}
              disabled={!allPlaced || busy}
              className={`px-7 py-2 rounded-full font-black text-xs md:text-base flex items-center gap-2 transition-all ${
                allPlaced && !busy
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-glow-gold cursor-pointer hover:scale-105'
                  : 'bg-purple-950/60 text-purple-500 border border-purple-900/60 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-4.5 h-4.5" /> Check
            </button>
          )}

          {roundDone && !isLastRound && (
            <button onClick={nextRound} className="px-7 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs md:text-base flex items-center gap-2 shadow-glow-green cursor-pointer hover:scale-105 transition-transform">
              Next Round <ArrowRight className="w-4.5 h-4.5" />
            </button>
          )}
          {roundDone && isLastRound && (
            <button onClick={playAgain} className="px-7 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs md:text-base flex items-center gap-2 shadow-glow-green cursor-pointer hover:scale-105 transition-transform">
              🏅 All done! Play again
            </button>
          )}
        </div>

        <div className="h-6 text-center">
          {feedback && <p className="text-xs md:text-base font-black text-amber-300"><MathText>{feedback}</MathText></p>}
          {!feedback && allDone && <p className="text-xs md:text-base font-black text-emerald-300">🏅 You sorted every round!</p>}
        </div>
      </div>

      {/* Floating card while dragging */}
      {draggedCard && createPortal(
        <div style={{ position: 'fixed', left: drag.x, top: drag.y, transform: 'translate(-50%, -65%)', width: 76, height: 52, pointerEvents: 'none', zIndex: 9999 }}>
          <CardChip card={draggedCard} ghost />
        </div>,
        document.body,
      )}
    </div>
  );
};

export default NumberLineSorter;
