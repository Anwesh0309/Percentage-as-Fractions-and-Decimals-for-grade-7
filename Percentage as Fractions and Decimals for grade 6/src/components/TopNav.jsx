import React from 'react';
import useAppStore from '../store/useAppStore';
import { Volume2, VolumeX } from 'lucide-react';

const STAGES = [
  { id: 'wonder', label: 'Wonder', number: '01', icon: '🧙' },
  { id: 'story', label: 'Story', number: '02', icon: '📖' },
  { id: 'simulate', label: 'Simulate', number: '03', icon: '✏️' },
  { id: 'practice', label: 'Practice', number: '04', icon: '🎮' },
  { id: 'reflect', label: 'Reflect', number: '05', icon: '📝' },
];

export const TopNav = () => {
  const { currentStage, setStage, audioEnabled, toggleAudio } = useAppStore();

  const activeIndex = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <header className="w-full pt-3 px-4 flex items-center justify-center z-50 shrink-0 select-none bg-transparent">
      <div className="flex items-center gap-2 md:gap-3">
        {/* 1. Standalone Home Pill Button */}
        <button
          onClick={() => setStage('home')}
          className="flex items-center gap-1.5 px-3.5 md:px-4 py-1.5 rounded-full bg-[#24174D]/90 border border-purple-500/40 hover:bg-[#2F1F63] text-white font-display font-bold text-xs md:text-sm shadow-md transition-colors cursor-pointer"
        >
          <span className="text-sm md:text-base">🏠</span>
          <span>Home</span>
        </button>

        {/* 2. Connected Stage Navigation Capsule Bar */}
        <div className="flex items-center gap-2 md:gap-2.5 bg-[#120A2C]/90 border border-purple-800/60 rounded-full px-3.5 md:px-4 py-1.5 shadow-2xl backdrop-blur-md">
          {STAGES.map((st, index) => {
            const isActive = currentStage === st.id;
            const isCompleted = activeIndex !== -1 && index < activeIndex;

            return (
              <React.Fragment key={st.id}>
                <button
                  onClick={() => setStage(st.id)}
                  className={`flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FFB800] text-slate-950 font-black px-3.5 py-1 rounded-full shadow-[0_0_15px_rgba(255,184,0,0.5)] text-xs md:text-sm'
                      : 'text-purple-200 hover:text-white font-bold text-xs md:text-sm px-1.5 py-1'
                  }`}
                >
                  {/* Left Badge: Green checkmark for completed, number circle for active/uncompleted */}
                  {isCompleted && !isActive ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm">
                      ✓
                    </span>
                  ) : (
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        isActive
                          ? 'bg-[#120A2C] text-amber-400'
                          : 'bg-[#24174D] border border-purple-600/40 text-purple-300'
                      }`}
                    >
                      {st.number}
                    </span>
                  )}

                  {/* Icon & Stage Name */}
                  <span className="text-sm md:text-base">{st.icon}</span>
                  <span className="font-display">{st.label}</span>
                </button>

                {/* Em-dash separator between stages */}
                {index < STAGES.length - 1 && (
                  <span className="text-purple-400/40 font-bold text-xs md:text-sm select-none">—</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* 3. Standalone Mute / Sound Toggle Button */}
        <button
          onClick={toggleAudio}
          className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#24174D]/90 border border-purple-500/40 hover:bg-[#2F1F63] text-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
          title={audioEnabled ? 'Mute Audio' : 'Enable Audio'}
        >
          {audioEnabled ? (
            <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white stroke-[2.5]" />
          ) : (
            <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-purple-300 stroke-[2.5]" />
          )}
        </button>
      </div>
    </header>
  );
};

export default TopNav;

