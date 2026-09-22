import React, { useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import MathText from '../components/MathText';
import { storySlides } from '../data/storySlides';
import { storyNarration } from '../data/narration';
import { narrate, soundEngine } from '../utils/audio';
import { ArrowRight, ArrowLeft, Volume2 } from 'lucide-react';

export const StoryStage = () => {
  const { storySlideIndex, setStorySlideIndex, setStage } = useAppStore();

  const currentSlide = storySlides[storySlideIndex] || storySlides[0];

  // Narrates the paragraph, then the key-point sentence (styled segments, preloaded back-to-back)
  useEffect(() => {
    narrate(storyNarration(storySlideIndex));
    return () => soundEngine.stop();
  }, [storySlideIndex]);

  const handleMascotSpeak = () => {
    narrate(storyNarration(storySlideIndex));
  };

  const handleNext = () => {
    if (storySlideIndex < storySlides.length - 1) {
      setStorySlideIndex(storySlideIndex + 1);
    } else {
      setStage('simulate');
    }
  };

  const handlePrev = () => {
    if (storySlideIndex > 0) {
      setStorySlideIndex(storySlideIndex - 1);
    } else {
      setStage('wonder');
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center p-2 md:p-3 bg-transparent overflow-hidden select-none">

      {/* 1. Main Stage Header Title & Subtitle */}
      <div className="flex flex-col items-center text-center space-y-0.5 pt-0.5 shrink-0 w-full max-w-2xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-amber-400 flex items-center gap-2">
          <span>📖</span>
          <span>Concept Story</span>
        </h1>
        <p className="text-base md:text-lg lg:text-xl font-body font-bold text-purple-200">
          Discover how one amount can be a fraction, a decimal and a percent!
        </p>

        {/* Story Progress Bar */}
        <div className="w-full bg-[#161129] rounded-full h-3.5 p-0.5 border border-purple-700/60 shadow-inner mt-0.5">
          <div
            className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(255,184,0,0.8)] flex items-center justify-end pr-2 text-[10px] md:text-xs font-display font-bold text-slate-950"
            style={{ width: `${((storySlideIndex + 1) / storySlides.length) * 100}%` }}
          />
        </div>
        <span className="text-xs md:text-sm font-display font-bold text-amber-300 tracking-wider">
          SLIDE {storySlideIndex + 1} OF {storySlides.length} ({Math.round(((storySlideIndex + 1) / storySlides.length) * 100)}%)
        </span>
      </div>

      {/* 2. Main Story Card Workspace */}
      <div className="w-full max-w-5xl flex-1 flex flex-col items-center justify-center my-auto overflow-hidden px-2">
        <div className="w-full bg-[#161129]/95 border-2 border-[#3B2D6B] rounded-3xl p-3 md:p-5 flex flex-col md:flex-row items-center gap-4 md:gap-6 shadow-[0_0_30px_rgba(139,92,246,0.3)] my-auto">

          {/* Left Column: Story Illustration Image */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
            <div className="relative w-full h-44 md:h-[30vh] lg:h-[34vh] max-h-[350px] rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-2xl bg-[#1A1333]">
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column: Slide Text, Highlight Pill & Audio Trigger */}
          <div className="w-full md:w-1/2 flex flex-col space-y-3 text-left">

            {/* Slide Badge & Replay */}
            <div className="flex items-center gap-2">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs md:text-sm font-display font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {currentSlide.badge || `Slide ${storySlideIndex + 1} of 4`}
              </span>
              <button
                onClick={handleMascotSpeak}
                className="p-1.5 rounded-full text-purple-300 hover:text-amber-400 hover:bg-purple-900/40 transition-colors cursor-pointer"
                title="Listen again"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-amber-400">
              {currentSlide.title}
            </h2>

            {/* Main Narrative Body Text */}
            <p className="text-base md:text-lg lg:text-xl font-body font-bold text-slate-100 leading-relaxed whitespace-pre-line">
              <MathText>{currentSlide.narrative}</MathText>
            </p>

            {/* Key Takeaway Highlight Pill */}
            <div className="bg-[#1A1333] border-l-4 border-amber-400 p-3 rounded-r-2xl shadow-md">
              <p className="text-sm md:text-base lg:text-lg font-body font-bold text-amber-300">
                ✨ <span className="text-xs md:text-sm tracking-widest text-amber-400/80 mr-1 font-display font-bold">{currentSlide.keyLabel}:</span>
                <MathText>{currentSlide.keyPoint}</MathText>
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* 3. Bottom Slide Controls Row */}
      <div className="w-full max-w-5xl flex items-center justify-between gap-4 pb-0.5 shrink-0">

        <button
          onClick={handlePrev}
          className="bg-[#161129] hover:bg-[#1A1333] border border-purple-800/80 text-purple-200 hover:text-white font-display font-bold text-base md:text-lg px-7 py-2.5 rounded-full transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Previous</span>
        </button>

        {/* Slide Indicator Dots (4 Slides) */}
        <div className="flex items-center gap-2.5">
          {storySlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setStorySlideIndex(idx)}
              className={`transition-all cursor-pointer ${
                storySlideIndex === idx
                  ? 'w-4.5 h-4.5 bg-amber-400 rounded-full shadow-[0_0_12px_rgba(255,184,0,0.9)] scale-110'
                  : 'w-3 h-3 bg-purple-900/60 rounded-full hover:bg-purple-700'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Next / Step into Lab Button */}
        <button
          onClick={handleNext}
          className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-display font-bold text-base md:text-lg lg:text-xl px-8 py-2.5 rounded-full shadow-[0_0_22px_rgba(255,184,0,0.7)] hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
        >
          <span>{storySlideIndex === storySlides.length - 1 ? 'Step into Lab 🔬' : 'Next'}</span>
          <ArrowRight className="w-5 h-5 text-slate-950" />
        </button>
      </div>

    </div>
  );
};

export default StoryStage;
