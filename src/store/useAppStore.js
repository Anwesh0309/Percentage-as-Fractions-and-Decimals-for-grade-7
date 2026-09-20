import { create } from 'zustand';
import { buildWorldSession } from '../data/questionBank';
import { soundEngine } from '../utils/audio';

const STORAGE_KEY = 'percent_fractions_decimals_progress_v1';

const emptySession = () => ({
  questions: [],
  currentIndex: 0,
  hearts: 3,
  xp: 0,
  streak: 0,
  correctCount: 0,
  hintUsed: false,
  outOfHearts: false,
  completed: false,
  starsEarned: 0,
});

// Always reset progress whenever user enters the module
function getFreshInitialProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* storage unavailable */ }
  return {
    unlockedWorlds: [1],
    worldStars: {},
    totalXP: 0,
    totalStars: 0,
    totalCorrect: 0,
    badges: [],
  };
}

export const useAppStore = create((set, get) => ({
  // Stage & Sub-Navigation State
  currentStage: 'home',
  storySlideIndex: 0,
  simulateStation: 'A',
  activeWorldId: null,
  audioEnabled: true,

  // Saved Progress (Fresh state on entry)
  progress: getFreshInitialProgress(),

  // Current World Quiz Session State
  session: emptySession(),

  // Actions
  setStage: (stage) => {
    soundEngine.stop();
    set({ currentStage: stage });
  },

  setStorySlideIndex: (idx) => {
    set({ storySlideIndex: idx });
  },

  setSimulateStation: (station) => {
    soundEngine.stop();
    set({ simulateStation: station });
  },

  toggleAudio: () => {
    const nextState = !get().audioEnabled;
    soundEngine.setAudioEnabled(nextState);
    set({ audioEnabled: nextState });
  },

  startWorldSession: (worldId) => {
    soundEngine.stop();
    const questions = buildWorldSession(worldId, 10);
    set({
      activeWorldId: worldId,
      session: { ...emptySession(), questions },
    });
  },

  exitWorld: () => {
    soundEngine.stop();
    set({ activeWorldId: null, session: emptySession() });
  },

  answerQuestion: (selectedOption) => {
    const { session, activeWorldId } = get();
    if (session.completed || session.outOfHearts) return;

    const currentQ = session.questions[session.currentIndex];
    const isCorrect = selectedOption === currentQ.correctAnswer;

    if (isCorrect) {
      const nextStreak = session.streak + 1;
      const baseXP = 50 + (activeWorldId * 10);
      const streakBonus = Math.min(nextStreak * 10, 50);
      const totalQuestionXP = baseXP + streakBonus;

      set({
        session: {
          ...session,
          xp: session.xp + totalQuestionXP,
          streak: nextStreak,
          correctCount: session.correctCount + 1,
        },
      });
      return { isCorrect: true };
    }

    const nextHearts = session.hearts - 1;
    const isOutOfHearts = nextHearts <= 0;
    set({
      session: { ...session, hearts: nextHearts, streak: 0, outOfHearts: isOutOfHearts },
    });
    return { isCorrect: false, isOutOfHearts };
  },

  advanceQuestion: () => {
    const { session, activeWorldId, progress } = get();
    if (session.completed || session.outOfHearts) return;

    const nextIndex = session.currentIndex + 1;
    const isWorldFinished = nextIndex >= session.questions.length;

    let starsEarned = 0;
    if (isWorldFinished) {
      if (session.hearts === 3) starsEarned = 3;
      else if (session.hearts === 2) starsEarned = 2;
      else starsEarned = 1;
    }

    const updatedSession = {
      ...session,
      currentIndex: nextIndex,
      hintUsed: false,
      completed: isWorldFinished,
      starsEarned,
    };

    let updatedProgress = { ...progress };

    if (isWorldFinished) {
      const nextWorldId = activeWorldId + 1;
      const unlockedWorlds = new Set([...progress.unlockedWorlds]);
      if (nextWorldId <= 10) unlockedWorlds.add(nextWorldId);

      const prevStars = progress.worldStars[activeWorldId] || 0;
      const newStarsMap = {
        ...progress.worldStars,
        [activeWorldId]: Math.max(prevStars, starsEarned),
      };
      const totalStars = Object.values(newStarsMap).reduce((a, b) => a + b, 0);

      // Badges
      const badges = new Set([...progress.badges]);
      if (starsEarned === 3) badges.add('Perfect World');
      if (totalStars >= 10) badges.add('Percent Master');
      if (activeWorldId >= 4) badges.add('Decimal Star');
      if (activeWorldId >= 7) badges.add('Costume Champion');

      updatedProgress = {
        ...progress,
        unlockedWorlds: Array.from(unlockedWorlds),
        worldStars: newStarsMap,
        totalXP: progress.totalXP + updatedSession.xp,
        totalStars,
        totalCorrect: (progress.totalCorrect || 0) + session.correctCount,
        badges: Array.from(badges),
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProgress));
      } catch { /* storage unavailable */ }
    }

    set({ session: updatedSession, progress: updatedProgress });
  },

  markHintUsed: () => {
    set((state) => ({
      session: { ...state.session, hintUsed: true },
    }));
  },

  resetWorldsProgress: () => {
    set({
      progress: getFreshInitialProgress(),
      currentStage: 'home',
      storySlideIndex: 0,
      simulateStation: 'A',
      activeWorldId: null,
      session: emptySession(),
    });
  },
}));

export default useAppStore;
