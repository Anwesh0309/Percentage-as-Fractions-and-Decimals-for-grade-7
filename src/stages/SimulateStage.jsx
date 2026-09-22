import React, { useEffect, useState } from 'react';
import useAppStore from '../store/useAppStore';
import HundredGrid from '../components/HundredGrid';
import NumberLineSorter from '../components/NumberLineSorter';
import ImposterDetective from '../components/ImposterDetective';
import RealWorldLab from '../components/RealWorldLab';
import { narrationScript, stationIntroNarration, eventNarration } from '../data/narration';
import { narrate, soundEngine } from '../utils/audio';
import MathText from '../components/MathText';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const stations = [
  { id: 'A', name: 'Grid Lab', badge: 'A' },
  { id: 'B', name: 'Line Sorter', badge: 'B' },
  { id: 'C', name: 'Imposter Detective', badge: 'C' },
  { id: 'D', name: 'Real-World Lab', badge: 'D' },
];

const stationHeaders = {
  A: { icon: '🎨', title: 'Percent Grid Lab', text: 'Shade squares on the hundred grid — watch the fraction, decimal and percent change together!' },
  B: { icon: '🎯', title: 'Number Line Sorter', text: 'Drag each card to its spot on the 0% to 100% number line!' },
  C: { icon: '🕵️', title: 'Imposter Detective', text: 'Three cards show the same amount. Can you catch the imposter?' },
  D: { icon: '🌍', title: 'Real-World Percent Lab', text: 'Set batteries, bottles, votes and scores to the amount in each mission!' },
};

export const SimulateStage = () => {
  const { simulateStation, setSimulateStation, setStage } = useAppStore();

  // The Robo bubble at the bottom always shows exactly what Robo is saying (text = audio).
  const introKey = `station_${simulateStation.toLowerCase()}_intro`;
  const [override, setOverride] = useState({ station: null, key: null });
  const botKey = override.station === simulateStation ? override.key : introKey;

  useEffect(() => {
    narrate(stationIntroNarration(simulateStation));
    return () => soundEngine.stop();
  }, [simulateStation]);

  const handleEvent = (key) => {
    setOverride({ station: simulateStation, key });
    narrate(eventNarration(key));
  };

  const handleMascotSpeak = () => {
    narrate(eventNarration(botKey));
  };

  const stationIndex = stations.findIndex((s) => s.id === simulateStation);

  const handleNextStation = () => {
    if (stationIndex < stations.length - 1) {
      setSimulateStation(stations[stationIndex + 1].id);
    } else {
      setStage('practice');
    }
  };

  const handlePrevStation = () => {
    if (stationIndex > 0) {
      setSimulateStation(stations[stationIndex - 1].id);
    } else {
      setStage('story');
    }
  };

  const header = stationHeaders[simulateStation];

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center p-2.5 md:p-4 bg-transparent overflow-hidden select-none">
      {/* Decorative Rotated Watermark Symbols in Background */}
      <div className="absolute top-8 left-8 text-7xl font-black text-purple-900/10 rotate-[-12deg] pointer-events-none font-display">
        %
      </div>
      <div className="absolute top-6 right-12 text-7xl font-black text-purple-900/10 rotate-[15deg] pointer-events-none font-display">
        ¾
      </div>
      <div className="absolute bottom-10 right-10 text-7xl font-black text-purple-900/10 rotate-[-15deg] pointer-events-none font-display">
        0.25
      </div>

      {/* 1. Main Header Title & Subtitle */}
      <div className="flex flex-col items-center text-center space-y-0.5 pt-0.5 shrink-0">
        <h1 className="text-4xl md:text-5xl lg:text-6xl short:text-3xl font-display font-black text-amber-400 flex items-center gap-2">
          <span>✏️</span>
          <span>Simulate</span>
        </h1>
        <p className="text-base md:text-lg font-body font-bold text-purple-200">
          Explore, try and discover — mistakes help you learn!
        </p>
      </div>

      {/* 2. Transparent 4 Lab Station Switcher Tab Bar */}
      <div className="flex items-center justify-center gap-3 md:gap-4 bg-transparent p-1.5 md:p-2 max-w-4xl w-full shrink-0 my-1">
        {stations.map((st) => {
          const isActive = simulateStation === st.id;
          return (
            <button
              key={st.id}
              onClick={() => setSimulateStation(st.id)}
              className={`flex-1 py-2.5 px-3.5 md:px-5 rounded-xl font-display font-bold text-sm md:text-base lg:text-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(255,184,0,0.6)] scale-105'
                  : 'bg-[#161129]/90 border border-purple-900/60 text-purple-200 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              <span className={`w-6 h-6 md:w-7 md:h-7 rounded-full text-xs md:text-sm font-display font-bold flex items-center justify-center ${isActive ? 'bg-slate-950 text-amber-400' : 'bg-purple-900 text-amber-300'}`}>
                {st.badge}
              </span>
              <span className="truncate">{st.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Active Station Content Workspace */}
      <div className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center my-auto overflow-hidden px-2">
        <div className="w-full flex flex-col items-center justify-center space-y-2 my-auto">
          <div className="text-center space-y-1">
            <h3 className="text-2xl md:text-3xl lg:text-4xl short:text-2xl font-display font-bold text-amber-400 flex items-center justify-center gap-2">
              <span>{header.icon}</span>
              <span>{header.title}</span>
            </h3>
            <p className="text-sm md:text-base font-body font-bold text-slate-200 max-w-2xl mx-auto">
              {header.text}
            </p>
          </div>

          <div className="w-full flex items-center justify-center my-1">
            {simulateStation === 'A' && <HundredGrid onEvent={handleEvent} />}
            {simulateStation === 'B' && <NumberLineSorter onEvent={handleEvent} />}
            {simulateStation === 'C' && <ImposterDetective onEvent={handleEvent} />}
            {simulateStation === 'D' && <RealWorldLab onEvent={handleEvent} />}
          </div>
        </div>
      </div>

      {/* 4. Mascot Speech Bubble Footer (text is exactly what Robo says) */}
      <div className="flex items-center gap-3 max-w-3xl w-full justify-center shrink-0 my-1">
        <button
          onClick={handleMascotSpeak}
          className="w-11 h-11 rounded-full bg-[#161129] border-2 border-amber-400 flex items-center justify-center text-xl shadow-[0_0_12px_rgba(255,184,0,0.5)] shrink-0 hover:scale-105 transition-transform cursor-pointer"
          title="Listen narration"
        >
          🤖
        </button>
        <div className="bg-white text-slate-900 rounded-3xl px-5 py-2 shadow-xl border border-slate-100 font-body font-bold text-xs md:text-sm lg:text-base text-center flex-1 leading-snug">
          <MathText>{narrationScript[botKey]}</MathText>
        </div>
      </div>

      {/* 5. Bottom Station Navigation Buttons */}
      <div className="w-full max-w-2xl flex items-center justify-between gap-4 pb-0.5 shrink-0">
        <button
          onClick={handlePrevStation}
          className="bg-[#161129] hover:bg-[#1A1333] border border-[#3B2D6B] text-purple-200 hover:text-white px-8 py-2.5 rounded-full font-display font-bold text-sm md:text-base cursor-pointer flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Station</span>
        </button>

        <button
          onClick={handleNextStation}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-8 py-2.5 rounded-full font-display font-bold text-sm md:text-base cursor-pointer flex items-center gap-2 shadow-glow-gold transition-transform hover:scale-105"
        >
          <span>Next Station</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

export default SimulateStage;
