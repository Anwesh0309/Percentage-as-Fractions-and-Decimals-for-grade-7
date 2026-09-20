import React from 'react';
import { Volume2 } from 'lucide-react';
import soundEngine from '../utils/audio';
import MathText from './MathText';

export const Mascot = ({
  text,
  pose = 'normal', // normal | thinking | excited | celebrating | explaining
  narrationText = null,
  compact = false,
}) => {
  const speechText = narrationText || text;

  const handleSpeak = () => {
    if (speechText) soundEngine.playText(speechText);
  };

  const getMascotEmoji = () => {
    switch (pose) {
      case 'thinking': return '🤖🔍';
      case 'excited': return '🤖✨';
      case 'celebrating': return '🤖🎉';
      case 'explaining': return '🤖💡';
      default: return '🤖';
    }
  };

  return (
    <div className={`flex items-start gap-3 ${compact ? 'max-w-full' : 'max-w-3xl'}`}>
      {/* Robo Avatar */}
      <div onClick={handleSpeak} className="relative group cursor-pointer shrink-0">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-glow-purple transition-transform group-hover:scale-105">
          <div className="w-full h-full bg-[#161129] rounded-[14px] flex items-center justify-center text-2xl md:text-3xl">
            {getMascotEmoji()}
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
          <Volume2 className="w-3 h-3" />
        </div>
      </div>

      {/* Speech Bubble */}
      <div className="relative flex-1 bg-[#161129]/95 border border-[#3B2D6B] rounded-2xl p-3.5 md:p-4 shadow-xl">
        <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-[#3B2D6B] border-b-8 border-b-transparent" />
        <div className="absolute -left-[7px] top-4 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-[#161129] border-b-8 border-b-transparent" />

        <div className="flex items-start justify-between gap-2">
          <p className="text-sm md:text-base font-bold text-slate-100 leading-relaxed"><MathText>{text}</MathText></p>
          {speechText && (
            <button
              onClick={handleSpeak}
              className="shrink-0 p-1.5 rounded-lg text-purple-300 hover:text-amber-400 hover:bg-purple-900/40 transition-colors"
              title="Listen again"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mascot;
