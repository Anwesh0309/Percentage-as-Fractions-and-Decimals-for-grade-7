import React, { useEffect, useState } from 'react';
import useAppStore from '../store/useAppStore';
import PercentDiagramSVG from '../components/PercentDiagramSVG';
import MathText from '../components/MathText';
import { worldsData } from '../data/worlds';
import { practiceWelcomeNarration, questionNarration, hintNarration, eventNarration } from '../data/narration';
import { narrate, soundEngine } from '../utils/audio';
import { Heart, Flame, Star, Lock, RotateCcw, Lightbulb, CheckCircle, XCircle, Compass, RefreshCw, LogOut, X } from 'lucide-react';

const RULE_BADGES = {
  1: 'HUNDRED GRID RULE',
  2: 'PERCENT FRACTION RULE',
  3: 'SIMPLIFY FRACTION RULE',
  4: 'DECIMAL SLIDE RULE',
  5: 'DECIMAL TO PERCENT RULE',
  6: 'DENOMINATOR 100 RULE',
  7: 'EQUIVALENT COSTUME RULE',
  8: 'COMPARE & ORDER RULE',
  9: 'BEYOND 100% RULE',
  10: 'REAL-WORLD PERCENT RULE',
};

export const PracticeStage = () => {
  const {
    activeWorldId,
    startWorldSession,
    exitWorld,
    session,
    answerQuestion,
    advanceQuestion,
    markHintUsed,
    progress,
  } = useAppStore();

  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!activeWorldId) {
      narrate(practiceWelcomeNarration());
    }
    return () => soundEngine.stop();
  }, [activeWorldId]);

  const currentQ = session.questions ? session.questions[session.currentIndex] : null;
  const activeWorld = worldsData.find(w => w.id === activeWorldId);

  // Trigger question prompt audio when activeWorldId or currentIndex changes
  useEffect(() => {
    if (activeWorldId && currentQ && !session.outOfHearts && !session.completed) {
      narrate(questionNarration(currentQ.id));
    }
    return () => soundEngine.stop();
  }, [activeWorldId, session.currentIndex]);

  // Trigger Out of Hearts narration
  useEffect(() => {
    if (session.outOfHearts) {
      narrate(eventNarration('out_of_hearts'));
    }
    return () => soundEngine.stop();
  }, [session.outOfHearts]);

  // Trigger World Complete narration
  useEffect(() => {
    if (session.completed) {
      narrate(eventNarration('world_complete'));
    }
    return () => soundEngine.stop();
  }, [session.completed]);

  const handleStartWorld = (worldId) => {
    setSelectedOption(null);
    setFeedback(null);
    startWorldSession(worldId);
  };

  const handleExitWorld = () => {
    setSelectedOption(null);
    setFeedback(null);
    exitWorld();
  };

  const handleOptionClick = (optionVal) => {
    if (feedback || session.completed || session.outOfHearts) return;

    setSelectedOption(optionVal);
    const result = answerQuestion(optionVal);

    const fb = result.isCorrect
      ? { isCorrect: true, explanation: currentQ.explanation }
      : { isCorrect: false, explanation: currentQ.explanation };

    if (result.isCorrect) {
      narrate(eventNarration('correct_cheer'));
    } else {
      narrate(eventNarration('incorrect_try_again'));
    }

    setFeedback(fb);

    // Show pop-up for 1 second then automatically advance to next question
    setTimeout(() => {
      setSelectedOption(null);
      setFeedback(null);
      advanceQuestion();
    }, 1000);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setFeedback(null);
    advanceQuestion();
  };

  const handleUseHint = () => {
    markHintUsed();
    if (activeWorldId && currentQ) {
      narrate(hintNarration(currentQ.id));
    }
  };

  // 1. World Selector List Screen (Single Frame Viewport Fitting matching screenshot)
  if (!activeWorldId) {
    return (
      <div className="relative w-full h-full flex flex-col justify-center items-center p-3 md:p-6 bg-transparent overflow-hidden select-none">
        {/* Header Title & Subtitle */}
        <div className="flex flex-col items-center text-center space-y-1 mb-4 md:mb-6 shrink-0">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white font-display flex items-center gap-2.5 justify-center">
            <span>🎮</span>
            <span>Practice — Choose Your World!</span>
          </h1>
          <p className="text-xs md:text-sm lg:text-base font-bold text-purple-200/90 text-center">
            Answer questions in each world. Earn stars and XP!
          </p>
        </div>

        {/* 2-Row x 5-Column Cards Grid (Exactly matching screenshot) */}
        <div className="grid grid-cols-5 gap-3 md:gap-4 w-full max-w-4xl px-2">
          {worldsData.map((world) => {
            const isUnlocked = progress.unlockedWorlds.includes(world.id);

            if (isUnlocked) {
              return (
                <div
                  key={world.id}
                  className="relative rounded-2xl bg-[#281859]/95 border-2 border-purple-400/80 p-3 md:p-3.5 flex flex-col items-center justify-between text-center shadow-[0_0_20px_rgba(168,85,247,0.3)] h-44 md:h-48 transition-all hover:scale-105"
                >
                  {/* World Icon */}
                  <div className="text-4xl md:text-5xl my-auto select-none flex items-center justify-center">
                    {world.icon}
                  </div>

                  {/* World Title & Question Range */}
                  <div className="my-auto space-y-0.5">
                    <h3 className="text-xs md:text-sm font-display font-black text-white leading-tight">
                      {world.title}
                    </h3>
                    <p className="text-[11px] font-body font-bold text-purple-200/90">
                      {world.questionRange}
                    </p>
                  </div>

                  {/* Action Button: Magenta Pill */}
                  <button
                    onClick={() => handleStartWorld(world.id)}
                    className="bg-[#FF2B75] hover:bg-[#FF1263] text-white font-display font-black px-3.5 py-1.5 rounded-full text-[11px] md:text-xs tracking-wider shadow-md cursor-pointer transition-transform hover:scale-105 flex items-center justify-center gap-1 uppercase mt-1 w-full"
                  >
                    <span>▶</span>
                    <span>PRACTICE</span>
                  </button>
                </div>
              );
            }

            // Locked Card (Dark purple container with top-right lock)
            return (
              <div
                key={world.id}
                className="relative rounded-2xl bg-[#180E38]/80 border border-purple-900/50 p-3 md:p-3.5 flex flex-col items-center justify-between text-center h-44 md:h-48 opacity-70"
              >
                {/* Top-Right Lock Icon */}
                <div className="absolute top-2.5 right-2.5 text-purple-400/60">
                  <Lock className="w-3.5 h-3.5" />
                </div>

                {/* World Icon (Muted) */}
                <div className="text-3xl md:text-4xl my-auto select-none opacity-50 flex items-center justify-center">
                  {world.icon}
                </div>

                {/* World Title & Question Range */}
                <div className="my-auto space-y-0.5">
                  <h3 className="text-xs md:text-sm font-display font-bold text-purple-300/80 leading-tight">
                    {world.title}
                  </h3>
                  <p className="text-[11px] font-body font-semibold text-purple-400/60">
                    {world.questionRange}
                  </p>
                </div>

                {/* Placeholder bottom spacing to keep exact alignment */}
                <div className="h-6 md:h-7" />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Out of Hearts Screen
  if (session.outOfHearts) {
    return (
      <div className="relative w-full h-full flex flex-col justify-between items-center p-3 md:p-5 bg-transparent overflow-hidden select-none">
        {/* 1. World Sub-Header Pill */}
        <div className="shrink-0 pt-0.5">
          <div className="bg-[#161129] border border-cyan-500/50 text-cyan-300 font-display font-bold text-xs md:text-sm px-4 py-1 rounded-full flex items-center gap-2 shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>{activeWorld ? activeWorld.title : 'Meet Percent'}</span>
          </div>
        </div>

        {/* 2. Status Stats Row (XP, Hearts, Streak) */}
        <div className="w-full max-w-2xl flex items-center justify-between px-2 shrink-0 my-0.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-black text-sm md:text-base">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span>{session.xp} XP</span>
          </div>

          {/* 3 Dark Lost Hearts */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((h) => (
              <Heart key={h} className="w-6 h-6 text-purple-900/60 fill-purple-950/40" />
            ))}
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1.5 text-amber-400 font-black text-sm md:text-base">
            <Flame className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span>{session.streak}x Streak</span>
          </div>
        </div>

        {/* 3. Progress Bar Track */}
        <div className="w-full max-w-2xl shrink-0">
          <div className="flex items-center justify-between text-xs md:text-sm font-black text-purple-300 mb-0.5">
            <span>Question {Math.min(session.currentIndex + 1, 10)}/10</span>
            <span>{Math.round((Math.min(session.currentIndex + 1, 10) / 10) * 100)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-purple-950/80 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
              style={{ width: `${(Math.min(session.currentIndex + 1, 10) / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* 4. Center Out of Hearts Banner */}
        <div className="my-auto flex flex-col items-center text-center space-y-4 max-w-lg w-full">
          {/* Sad Emoji Icon */}
          <button
            onClick={() => narrate(eventNarration('out_of_hearts'))}
            className="text-6xl md:text-7xl animate-bounce cursor-pointer"
            title="Listen out of hearts narration"
          >
            🥺
          </button>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-black text-rose-500 font-display">
            Out of Hearts!
          </h2>

          {/* Robo Quote */}
          <p className="text-sm md:text-base font-extrabold text-purple-200 leading-relaxed px-4">
            Robo says: "No worries! Let's practice some more. Try again to master this world!"
          </p>

          {/* Action Buttons: Retry World & Quit World */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => handleStartWorld(activeWorldId)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-7 py-3 rounded-full shadow-[0_0_20px_rgba(255,184,0,0.6)] cursor-pointer text-sm md:text-base flex items-center gap-2 transition-transform hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry World</span>
            </button>
            <button
              onClick={handleExitWorld}
              className="bg-[#161129] hover:bg-[#1A1333] border border-[#3B2D6B] text-purple-200 hover:text-white font-display font-bold px-7 py-3 rounded-full cursor-pointer text-sm md:text-base flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Quit World</span>
            </button>
          </div>
        </div>

        {/* Bottom spacing placeholder */}
        <div className="shrink-0 pb-1" />
      </div>
    );
  }

  // 3. World Complete Celebration Screen
  if (session.completed) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-transparent text-center space-y-6">
        <div className="bg-emerald-950/90 border-2 border-emerald-500 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-glow-green">
          <button
            onClick={() => narrate(eventNarration('world_complete'))}
            className="text-5xl animate-bounce cursor-pointer"
            title="Listen celebration audio"
          >
            🏆
          </button>
          <h2 className="text-2xl md:text-3xl font-display font-black text-white">World Cleared!</h2>

          {/* Stars display */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-9 h-9 ${
                  s <= session.starsEarned
                    ? 'fill-amber-400 text-amber-400 scale-110 shadow-glow-gold'
                    : 'text-slate-600'
                }`}
              />
            ))}
          </div>

          <div className="text-base font-display font-black text-emerald-300">
            Earned +{session.xp} XP ⭐
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {activeWorldId < 10 && (
              <button
                onClick={() => handleStartWorld(activeWorldId + 1)}
                className="btn-gold px-6 py-2.5 rounded-xl font-display font-bold text-sm md:text-base"
              >
                Next World 🚀
              </button>
            )}
            <button
              onClick={handleExitWorld}
              className="px-6 py-2.5 rounded-xl bg-[#161129] border border-[#3B2D6B] text-purple-200 font-display font-bold text-sm md:text-base"
            >
              World Map 🗺️
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  const ruleBadgeText = RULE_BADGES[activeWorldId] || 'PERCENT RULE';

  // 4. Per-Question Quiz Play View (Matching Screenshot layout & styling)
  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center p-2 md:p-4 bg-transparent overflow-hidden select-none">
      
      {/* Top Right Fixed Close Button ✕ */}
      <button
        onClick={handleExitWorld}
        className="fixed top-3 right-4 z-50 w-9 h-9 rounded-xl bg-[#24174D]/80 border border-purple-500/40 text-purple-200 hover:text-white hover:bg-[#2F1F63] flex items-center justify-center shadow-md cursor-pointer transition-colors"
        title="Exit to World Selection"
      >
        <X className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* 1. Sub-Header Row (Left: ← Worlds button, Center: Magenta Glowing World Badge) */}
      <div className="w-full max-w-2xl flex items-center justify-between shrink-0 pt-0.5 relative">
        <button
          onClick={handleExitWorld}
          className="bg-[#24174D]/90 border border-purple-500/40 text-white font-display font-bold text-xs md:text-sm px-4 py-1.5 rounded-full cursor-pointer hover:bg-[#2F1F63] shadow-md flex items-center gap-1.5 transition-colors"
        >
          <span>←</span>
          <span>Worlds</span>
        </button>

        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-display font-black text-sm md:text-base lg:text-lg px-7 py-2 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.6)] flex items-center gap-2 mx-auto">
          <span>⭐</span>
          <span>{activeWorld ? activeWorld.title : 'Practice World'}</span>
        </div>

        {/* Empty placeholder for flex alignment balance */}
        <div className="w-24" />
      </div>

      {/* 2. Stats Row (Stars, Glowing Hearts, Streak) & Progress Bar Track */}
      <div className="w-full max-w-2xl flex flex-col gap-1.5 shrink-0 my-1">
        {/* Stats Row */}
        <div className="flex items-center justify-between px-2">
          {/* Left: Star count */}
          <div className="flex items-center gap-1.5 text-amber-400 font-display font-black text-base md:text-lg lg:text-xl">
            <Star className="w-5 h-5 md:w-6 md:h-6 fill-amber-400 text-amber-400" />
            <span>{session.starsEarned || 0}</span>
          </div>

          {/* Center: Glowing Red Hearts */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((h) => (
              <Heart
                key={h}
                className={`w-6 h-6 md:w-7 md:h-7 transition-all ${
                  h <= session.hearts
                    ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.85)]'
                    : 'text-purple-950 fill-purple-950/40'
                }`}
              />
            ))}
          </div>

          {/* Right: Streak */}
          <div className="flex items-center gap-1.5 text-amber-400 font-display font-black text-base md:text-lg lg:text-xl">
            <Flame className="w-5 h-5 md:w-6 md:h-6 fill-amber-400 text-amber-400" />
            <span>{session.streak}x</span>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full">
          <div className="flex items-center justify-between text-xs md:text-sm font-display font-black text-purple-200 mb-0.5 px-0.5">
            <span>Question {session.currentIndex + 1}/10</span>
            <span>{Math.round(((session.currentIndex + 1) / 10) * 100)}%</span>
          </div>
          <div className="w-full h-2.5 md:h-3 rounded-full bg-[#25184B]/90 overflow-hidden border border-purple-800/50">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 transition-all duration-300 rounded-full"
              style={{ width: `${((session.currentIndex + 1) / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Main Question Card Modal (Dark Purple Card matching Screenshot) */}
      <div className="relative bg-[#1A103D]/95 border-2 border-purple-700/60 rounded-3xl p-4 md:p-6 w-full max-w-2xl shadow-2xl backdrop-blur-md flex flex-col items-center gap-3 md:gap-4 text-center my-auto shrink-0">
        
        {/* Floating Yellow Rule Badge on top border */}
        <div className="bg-[#FFB800] text-slate-950 font-display font-black text-xs md:text-sm lg:text-base px-5 py-1.5 rounded-full uppercase shadow-md flex items-center gap-1.5 -mt-7 md:-mt-8.5 z-10 shrink-0">
          <span>+</span>
          <span>{ruleBadgeText}</span>
        </div>

        {/* Inner Graphic & Question Text Box */}
        <div className="w-full bg-[#0E0727]/90 border border-cyan-500/40 rounded-2xl p-4 md:p-5 flex flex-col items-center text-center gap-3 relative shadow-inner overflow-hidden">
          {/* Top Graphic / Diagram Container with Enlarged Height Bounds */}
          <div className="w-full h-32 md:h-44 lg:h-48 max-h-[220px] flex items-center justify-center shrink-0 overflow-hidden py-1">
            {currentQ.diagram ? (
              <div className="h-full w-full flex items-center justify-center overflow-hidden">
                <PercentDiagramSVG diagram={currentQ.diagram} />
              </div>
            ) : (
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                <RefreshCw className="w-9 h-9 text-white animate-spin-slow" />
              </div>
            )}
          </div>

          {/* Question Prompt Text (Enlarged Grade 6 Font Size) */}
          <h2 className={`font-display font-black text-white leading-snug px-1 ${
            currentQ.prompt.length > 95 ? 'text-lg md:text-xl lg:text-2xl' : 'text-xl md:text-2xl lg:text-3xl'
          }`}>
            <MathText>{currentQ.prompt}</MathText>
          </h2>
        </div>

        {/* 4. 2x2 Answer Option Grid (Enlarged Option Cards & Fonts) */}
        <div className="grid grid-cols-2 gap-3.5 w-full">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            let btnStyle = "bg-[#160C35] border border-purple-700/50 hover:border-purple-400 hover:bg-[#201347] text-white";

            if (feedback) {
              if (opt === currentQ.correctAnswer) {
                btnStyle = "bg-emerald-950 border-2 border-emerald-500 text-emerald-300 font-black shadow-glow-green scale-105";
              } else if (isSelected && !feedback.isCorrect) {
                btnStyle = "bg-red-950 border-2 border-red-500 text-red-300 opacity-70";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(opt)}
                disabled={!!feedback}
                className={`py-3.5 md:py-4.5 px-5 rounded-2xl border text-2xl md:text-3xl lg:text-4xl font-display font-black transition-all flex items-center justify-center shadow-md cursor-pointer min-h-[64px] ${btnStyle}`}
              >
                <span><MathText>{opt}</MathText></span>
              </button>
            );
          })}
        </div>

        {/* 5. Pop-up Feedback Modal Overlay matching user screenshots */}
        {feedback && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all duration-300">
            {feedback.isCorrect ? (
              /* Correct Answer Popup Modal (Green) */
              <div className="bg-[#388E3C] text-white rounded-[32px] p-6 md:p-8 max-w-sm md:max-w-md w-full shadow-2xl flex flex-col items-center text-center gap-3 border border-emerald-400/30 animate-in zoom-in-95 duration-200">
                <div className="text-5xl md:text-6xl animate-bounce">
                  🎉
                </div>
                <h3 className="text-2xl md:text-3xl font-black font-display flex items-center justify-center gap-1.5">
                  Correct! 🎉
                </h3>
                <p className="text-sm md:text-base font-semibold leading-snug opacity-95">
                  <MathText>{feedback.explanation}</MathText>
                </p>
              </div>
            ) : (
              /* Incorrect Answer Popup Modal (Red) */
              <div className="bg-[#D32F2F] text-white rounded-[32px] p-6 md:p-8 max-w-sm md:max-w-md w-full shadow-2xl flex flex-col items-center text-center gap-3 border border-red-400/30 animate-in zoom-in-95 duration-200">
                <div className="text-5xl md:text-6xl animate-bounce">
                  🥺
                </div>
                <h3 className="text-2xl md:text-3xl font-black font-display">
                  Not quite!
                </h3>
                <p className="text-sm md:text-base font-semibold leading-snug opacity-95">
                  <MathText>{feedback.explanation}</MathText>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Hint Section */}
        <div className="w-full flex items-center justify-start pt-0.5">
          <button
            onClick={handleUseHint}
            className="text-xs md:text-sm font-black text-amber-400 flex items-center gap-1.5 hover:underline cursor-pointer"
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Use Hint</span>
          </button>
        </div>

        {session.hintUsed && (
          <p className="text-xs md:text-sm font-bold text-amber-300 bg-amber-950/40 p-2 rounded-xl border border-amber-500/30 w-full text-left">
            💡 <MathText>{currentQ.hint}</MathText>
          </p>
        )}

      </div>
    </div>
  );
};

export default PracticeStage;

