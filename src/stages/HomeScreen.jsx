import React, { useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import { narrationScript, homeNarration } from '../data/narration';
import { narrate, soundEngine } from '../utils/audio';
import { Sparkles, Search, BookOpen, Sliders, Gamepad2, Trophy, ArrowRight } from 'lucide-react';

export const HomeScreen = () => {
  const { setStage } = useAppStore();

  useEffect(() => {
    return () => soundEngine.stop();
  }, []);

  const handleMascotSpeak = () => {
    narrate(homeNarration());
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-2 md:p-3 bg-transparent overflow-hidden select-none">
      {/* Decorative Faint Symbols in Background */}
      <div className="absolute top-6 left-12 text-7xl md:text-9xl font-black text-purple-900/10 rotate-[-15deg] pointer-events-none font-display">
        %
      </div>
      <div className="absolute top-8 right-16 text-7xl md:text-9xl font-black text-purple-900/10 rotate-[12deg] pointer-events-none font-display">
        ½
      </div>
      <div className="absolute bottom-10 left-16 text-7xl md:text-9xl font-black text-purple-900/10 rotate-[-8deg] pointer-events-none font-display">
        0.5
      </div>

      {/* Main Centered Wrapper */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full my-auto space-y-2 md:space-y-2.5">

        {/* 1. MOE Curriculum Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-[#161129]/95 border border-amber-400/50 text-amber-300 font-display font-bold text-xs md:text-sm lg:text-base shadow-md">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>MOE Curriculum • Grade 7</span>
        </div>

        {/* 2. Large Two-Tone Title */}
        <div className="flex flex-col items-center leading-none">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tight text-white drop-shadow-md">
            Percentage as
          </h1>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-amber-400 mt-0.5 drop-shadow-[0_4px_25px_rgba(255,184,0,0.5)]">
            Fractions & Decimals!
          </h1>
        </div>

        {/* 3. Mascot Speech Bubble */}
        <div className="flex items-center gap-3 max-w-2xl w-full justify-center">
          <button
            onClick={handleMascotSpeak}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#161129] border-2 border-amber-400 flex items-center justify-center text-2xl md:text-3xl shadow-[0_0_20px_rgba(255,184,0,0.5)] shrink-0 hover:scale-105 transition-transform cursor-pointer"
            title="Listen narration"
          >
            🤖
          </button>

          <div className="relative flex-1 bg-white text-slate-900 rounded-2xl px-5 py-2.5 shadow-xl border border-slate-100 flex flex-col items-center justify-center">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-r-8 border-r-white border-b-6 border-b-transparent" />

            <p className="text-sm md:text-base lg:text-lg font-body font-bold text-slate-900 text-center leading-snug">
              {narrationScript.home_intro}
            </p>
          </div>
        </div>

        {/* 4. Sub-Description Paragraph */}
        <p className="text-base md:text-xl lg:text-2xl font-body font-bold text-white max-w-3xl leading-snug px-2">
          Discover how percents, fractions and decimals are three ways to write the same amount — and how to switch between them like a pro!
        </p>

        {/* 5. "YOUR LEARNING JOURNEY" Card */}
        <div className="w-full bg-[#161129]/95 border border-[#3B2D6B] rounded-2xl p-2.5 md:p-3.5 shadow-2xl space-y-2">
          <h2 className="text-xs md:text-sm font-display font-bold uppercase tracking-widest text-amber-400 text-center">
            YOUR LEARNING JOURNEY
          </h2>

          {/* Top Row: 3 Steps (Wonder, Story, Simulate) */}
          <div className="flex items-center justify-center gap-3 md:gap-6">
            <button onClick={() => setStage('wonder')} className="flex items-center gap-2 md:gap-3 group cursor-pointer">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-cyan-400 bg-cyan-950/40 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Search className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm md:text-base lg:text-lg font-display font-bold text-white group-hover:text-amber-400 transition-colors">Wonder</h3>
                <p className="text-[10px] md:text-xs text-purple-300 font-body font-semibold">Spark curiosity</p>
              </div>
            </button>

            <ArrowRight className="w-4 h-4 text-purple-500 shrink-0" />

            <button onClick={() => setStage('story')} className="flex items-center gap-2 md:gap-3 group cursor-pointer">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-amber-400 bg-amber-950/40 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,184,0,0.4)]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm md:text-base lg:text-lg font-display font-bold text-white group-hover:text-amber-400 transition-colors">Story</h3>
                <p className="text-[10px] md:text-xs text-purple-300 font-body font-semibold">Hear the tale</p>
              </div>
            </button>

            <ArrowRight className="w-4 h-4 text-purple-500 shrink-0" />

            <button onClick={() => setStage('simulate')} className="flex items-center gap-2 md:gap-3 group cursor-pointer">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-emerald-400 bg-emerald-950/40 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <Sliders className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm md:text-base lg:text-lg font-display font-bold text-white group-hover:text-amber-400 transition-colors">Simulate</h3>
                <p className="text-[10px] md:text-xs text-purple-300 font-body font-semibold">Explore & discover</p>
              </div>
            </button>
          </div>

          {/* Bottom Row: 2 Steps Centered (Practice, Reflect) */}
          <div className="flex items-center justify-center gap-4 md:gap-8 pt-0.5">
            <button onClick={() => setStage('practice')} className="flex items-center gap-2 md:gap-3 group cursor-pointer">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-purple-400 bg-purple-950/40 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm md:text-base lg:text-lg font-display font-bold text-white group-hover:text-amber-400 transition-colors">Practice</h3>
                <p className="text-[10px] md:text-xs text-purple-300 font-body font-semibold">Test your skills</p>
              </div>
            </button>

            <ArrowRight className="w-4 h-4 text-purple-500 shrink-0" />

            <button onClick={() => setStage('reflect')} className="flex items-center gap-2 md:gap-3 group cursor-pointer">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-pink-400 bg-pink-950/40 text-pink-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm md:text-base lg:text-lg font-display font-bold text-white group-hover:text-amber-400 transition-colors">Reflect</h3>
                <p className="text-[10px] md:text-xs text-purple-300 font-body font-semibold">What did you learn?</p>
              </div>
            </button>
          </div>
        </div>

        {/* 6. Glowing Primary CTA Button */}
        <button
          onClick={() => setStage('wonder')}
          className="w-full max-w-md bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-display font-black text-xl md:text-2xl py-3 rounded-full shadow-[0_0_30px_rgba(255,184,0,0.75)] hover:scale-105 transition-transform flex items-center justify-center gap-3 cursor-pointer"
        >
          <span>🚀 Begin Your Journey!</span>
        </button>

        {/* 7. Bottom 3 Stat Cards */}
        <div className="grid grid-cols-3 gap-2.5 md:gap-4 w-full">
          <div className="bg-[#161129]/95 border border-[#3B2D6B] rounded-2xl p-2 md:p-2.5 flex flex-col items-center justify-center text-center space-y-0.5">
            <span className="text-3xl md:text-4xl">🎭</span>
            <h4 className="text-sm md:text-base lg:text-lg font-display font-bold text-white">3 Number Forms</h4>
            <p className="text-[10px] md:text-xs text-purple-300 font-body font-semibold">Fraction • Decimal • Percent</p>
          </div>

          <div className="bg-[#161129]/95 border border-[#3B2D6B] rounded-2xl p-2 md:p-2.5 flex flex-col items-center justify-center text-center space-y-0.5">
            <span className="text-3xl md:text-4xl">🧩</span>
            <h4 className="text-sm md:text-base lg:text-lg font-display font-bold text-white">4 Simulations</h4>
            <p className="text-[10px] md:text-xs text-purple-300 font-body font-semibold">Interactive labs</p>
          </div>

          <div className="bg-[#161129]/95 border border-[#3B2D6B] rounded-2xl p-2 md:p-2.5 flex flex-col items-center justify-center text-center space-y-0.5">
            <span className="text-3xl md:text-4xl">🏆</span>
            <h4 className="text-sm md:text-base lg:text-lg font-display font-bold text-white">10 Game Worlds</h4>
            <p className="text-[10px] md:text-xs text-purple-300 font-body font-semibold">Quizzes & rewards</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeScreen;
