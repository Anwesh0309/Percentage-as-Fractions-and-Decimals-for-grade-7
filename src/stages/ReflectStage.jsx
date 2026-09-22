import React, { useEffect, useState } from 'react';
import useAppStore from '../store/useAppStore';
import MathText from '../components/MathText';
import { reflectTopics } from '../data/reflectTopics';
import { worldsData } from '../data/worlds';
import { narrationScript, reflectIntroNarration, reflectQuestionNarration } from '../data/narration';
import { narrate, soundEngine } from '../utils/audio';
import { Star, Check } from 'lucide-react';

export const ReflectStage = () => {
  const { progress, setStage } = useAppStore();
  const [selectedTopic, setSelectedTopic] = useState(0);

  const topics = reflectTopics;

  const currentTopic = topics[selectedTopic];

  useEffect(() => {
    narrate(reflectIntroNarration());
    return () => soundEngine.stop();
  }, []);

  const handleTopicClick = (index) => {
    setSelectedTopic(index);
    narrate(reflectQuestionNarration(index));
  };

  // 10 Worlds Icon Map
  const worldIcons = worldsData.map((w) => w.icon);

  const BADGE_ICONS = { 'Perfect World': '🌟', 'Percent Master': '💯', 'Decimal Star': '🔢', 'Costume Champion': '🎭' };
  const earnedBadges = (progress.badges || []).slice(-2);
  const badgeSlots = [earnedBadges[0] || null, earnedBadges[1] || null];

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center p-2 md:p-3 bg-transparent overflow-hidden select-none">
      
      {/* Centered Main Workspace Grid matching SS with Scaled Grade 3 Typography & Icons */}
      <div className="my-auto w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-5 items-center">
        
        {/* Left Column: Your Performance & Badges & Mascot CTA */}
        <div className="flex flex-col items-center text-center space-y-2.5 md:space-y-3">
          
          {/* Header Title (Enlarged) */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-amber-400 font-display">
            Your Performance!
          </h1>

          {/* 3 Performance Stat Cards Row (Enlarged Icons & Numbers) */}
          <div className="grid grid-cols-3 gap-2.5 md:gap-3 w-full max-w-md">
            
            {/* Card 1: Total Stars */}
            <div className="bg-[#161129]/95 border border-[#3B2D6B] p-2.5 md:p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-3xl md:text-4xl">⭐</span>
              <span className="text-3xl md:text-4xl font-display font-black text-amber-400 my-0.5">
                {progress.totalStars || 0}
              </span>
              <span className="text-xs md:text-sm font-display font-bold text-purple-300 uppercase tracking-wider">
                TOTAL STARS
              </span>
            </div>

            {/* Card 2: Correct Answers */}
            <div className="bg-[#161129]/95 border border-[#3B2D6B] p-2.5 md:p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center">
                <Check className="w-6 h-6 stroke-[3.5]" />
              </div>
              <span className="text-3xl md:text-4xl font-display font-black text-emerald-400 my-0.5">
                {progress.totalCorrect || 0}
              </span>
              <span className="text-xs md:text-sm font-display font-bold text-purple-300 uppercase tracking-wider leading-tight">
                CORRECT ANSWERS
              </span>
            </div>

            {/* Card 3: Worlds Done */}
            <div className="bg-[#161129]/95 border border-[#3B2D6B] p-2.5 md:p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-3xl md:text-4xl">🌍</span>
              <span className="text-3xl md:text-4xl font-display font-black text-cyan-400 my-0.5">
                {Object.keys(progress.worldStars || {}).length}/10
              </span>
              <span className="text-xs md:text-sm font-display font-bold text-purple-300 uppercase tracking-wider leading-tight">
                WORLDS DONE
              </span>
            </div>

          </div>

          {/* Badges Earned Section */}
          <div className="w-full max-w-md space-y-1.5 pt-0.5">
            <h3 className="text-xl md:text-2xl font-display font-bold text-white">
              Badges Earned
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {badgeSlots.map((b, i) => (
                <div
                  key={i}
                  className={`border p-2.5 md:p-3 rounded-2xl flex flex-col items-center justify-center gap-0.5 shadow-md ${
                    b ? 'bg-[#1A1333] border-amber-400/60' : 'bg-[#140F2A]/60 border-purple-900/40 opacity-60'
                  }`}
                >
                  <span className="text-3xl md:text-4xl text-amber-400">{b ? BADGE_ICONS[b] || '⭐' : '🔒'}</span>
                  <span className="text-base md:text-lg font-display font-bold text-purple-200">
                    {b || 'Badge Locked'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mascot Speech Bubble Row */}
          <div className="flex items-center gap-3 pt-1 max-w-md w-full">
            <button
              onClick={() => narrate(reflectIntroNarration())}
              className="w-12 h-12 md:w-13 md:h-13 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center text-white text-2xl md:text-3xl shrink-0 shadow-lg cursor-pointer hover:scale-105 transition-transform"
              title="Listen reflection intro"
            >
              🤖
            </button>
            <div className="bg-white text-slate-900 font-body font-bold text-base md:text-lg px-4 py-2.5 rounded-2xl shadow-md text-left flex items-center gap-1.5 flex-1 leading-snug">
              <span>{narrationScript.reflect_intro}</span>
              <span>📋</span>
            </div>
          </div>

          {/* Begin New Journey CTA Button */}
          <div className="pt-1">
            <button
              onClick={() => setStage('home')}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold px-10 py-3 rounded-full text-xl md:text-2xl shadow-[0_0_25px_rgba(255,184,0,0.6)] cursor-pointer transition-transform hover:scale-105"
            >
              Begin New Journey
            </button>
          </div>

        </div>

        {/* Right Column: World Progress Grid & Time to Reflect Card */}
        <div className="flex flex-col space-y-2.5 md:space-y-3">
          
          {/* World Progress Box (2x5 Grid) */}
          <div className="bg-[#161129]/95 border border-[#3B2D6B] p-3 md:p-4 rounded-3xl space-y-2 shadow-xl">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-display font-bold text-white text-center">
              World Progress
            </h2>

            {/* 10 Worlds Grid (5 columns x 2 rows with enlarged icons & stars) */}
            <div className="grid grid-cols-5 gap-2 md:gap-2.5">
              {worldIcons.map((icon, idx) => {
                const worldId = idx + 1;
                const stars = progress.worldStars[worldId] || 0;
                const isUnlocked = progress.unlockedWorlds.includes(worldId);

                return (
                  <div
                    key={idx}
                    className={`p-2 md:p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-0.5 transition-all ${
                      isUnlocked
                        ? 'bg-[#1A1333] border-purple-700/60 text-white'
                        : 'bg-[#140F2A]/60 border-purple-900/40 opacity-50'
                    }`}
                  >
                    <span className="text-2xl md:text-3xl">{icon}</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((starNum) => (
                        <Star
                          key={starNum}
                          className={`w-3.5 h-3.5 ${
                            starNum <= stars
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-purple-900/60'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time to Reflect! Card */}
          <div className="bg-[#161129]/95 border border-[#3B2D6B] p-3 md:p-4.5 rounded-3xl space-y-2.5 shadow-xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-amber-400 text-center">
              Time to Reflect!
            </h2>

            {/* 6 Topic Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {topics.map((t, idx) => {
                const isSelected = selectedTopic === idx;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleTopicClick(idx)}
                    className={`px-4 py-2 rounded-full text-base md:text-lg font-display font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-glow-gold scale-105'
                        : 'bg-[#1A1333] text-purple-300 hover:text-white border border-purple-800/60'
                    }`}
                  >
                    {t.title}
                  </button>
                );
              })}
            </div>

            {/* Selected Question */}
            <h3 className="text-base md:text-lg lg:text-xl font-display font-bold text-white text-center leading-snug px-1">
              <MathText>{currentTopic.question}</MathText>
            </h3>

            {/* Answer Card */}
            <div className="bg-[#0C061E] border border-[#3B2D6B] p-3 md:p-4 rounded-2xl text-purple-100 text-base md:text-lg font-body font-bold leading-relaxed shadow-inner">
              <MathText>{currentTopic.answer}</MathText>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ReflectStage;
