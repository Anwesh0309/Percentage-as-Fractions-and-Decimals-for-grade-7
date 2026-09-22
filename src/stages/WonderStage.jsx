import React, { useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import PizzaSlicer from '../components/PizzaSlicer';
import MathText from '../components/MathText';
import { narrationScript, wonderNarration } from '../data/narration';
import { narrate, soundEngine } from '../utils/audio';
import { Sparkles } from 'lucide-react';

// wonder_prompt looks like:  Robo cuts ... Alex says: "That's ... amounts!" Is that actually true?
// The quoted part is highlighted in gold; everything is word-for-word what Robo says.
const splitQuote = (text) => {
  const m = /^(.*?)"(.*)"(.*)$/s.exec(text);
  return m ? { before: m[1], quote: m[2], after: m[3] } : { before: text, quote: '', after: '' };
};

export const WonderStage = () => {
  const { setStage } = useAppStore();
  const { before, quote, after } = splitQuote(narrationScript.wonder_prompt);

  useEffect(() => {
    narrate(wonderNarration());
    return () => soundEngine.stop();
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-2 md:p-3 bg-transparent overflow-hidden select-none">
      {/* Centered Main Wrapper */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full my-auto space-y-1.5 md:space-y-2">

        {/* 1. Mascot Speech Header */}
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={() => narrate(wonderNarration())}
            className="w-11 h-11 md:w-13 md:h-13 rounded-full bg-[#161129] border-2 border-amber-400 flex items-center justify-center text-2xl md:text-3xl shadow-[0_0_15px_rgba(255,184,0,0.4)] shrink-0 cursor-pointer hover:scale-105 transition-transform"
            title="Listen again"
          >
            🤖
          </button>

          <div className="relative bg-white text-slate-900 rounded-full px-5 py-1.5 md:py-2 shadow-xl border border-slate-100 flex items-center justify-center">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-r-8 border-r-white border-b-6 border-b-transparent" />
            <p className="text-lg md:text-xl lg:text-2xl font-display font-bold text-slate-900">
              Hmm... I wonder... 🤔
            </p>
          </div>
        </div>

        {/* 2. Interactive Simulator Card */}
        <div className="w-full max-w-md bg-[#161129]/95 border-2 border-[#3B2D6B] rounded-2xl p-2.5 md:p-3 shadow-2xl flex flex-col items-center justify-center relative space-y-1 shrink-0">
          <div className="w-full text-left flex items-center gap-2 text-xs md:text-sm font-display font-bold tracking-widest text-amber-400 uppercase">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
            <span>PIZZA SLICER (TAP A SLICE TO SHADE IT)</span>
          </div>

          <div className="w-full flex items-center justify-center py-0.5">
            <PizzaSlicer />
          </div>
        </div>

        {/* 3. On-Screen Text Narration (100% Word-for-Word Matched to Audio) */}
        <div className="bg-[#161129]/90 border border-[#3B2D6B] rounded-2xl p-2.5 md:p-3.5 max-w-3xl shadow-xl space-y-1.5 text-center">
          <p className="text-lg md:text-xl lg:text-2xl font-body font-bold text-slate-100 leading-snug">
            <MathText>{before}</MathText>
            {quote && <span className="text-amber-300 font-display font-bold">"<MathText>{quote}</MathText>"</span>}
            <MathText>{after}</MathText>
          </p>

          <p className="text-base md:text-lg font-body font-bold text-purple-200 italic">
            {narrationScript.wonder_teaser}
          </p>
        </div>

        {/* 4. Golden Rule Pill Box */}
        <div className="inline-flex items-center gap-2.5 px-5 py-1.5 rounded-full border-2 border-amber-400/80 bg-amber-950/40 text-amber-300 font-display font-bold text-base md:text-lg lg:text-xl text-center shadow-[0_0_20px_rgba(255,184,0,0.35)]">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{narrationScript.wonder_rule}</span>
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
        </div>

        {/* 5. Primary Gold CTA Button */}
        <button
          onClick={() => setStage('story')}
          className="w-full max-w-md bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-display font-bold text-xl md:text-2xl py-3 rounded-full shadow-[0_0_25px_rgba(255,184,0,0.7)] hover:scale-105 transition-transform flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>I have a guess! 🔍 Let's Find Out!</span>
        </button>

      </div>
    </div>
  );
};

export default WonderStage;
