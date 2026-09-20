import React, { useEffect } from 'react';
import useAppStore from './store/useAppStore';
import TopNav from './components/TopNav';
import HomeScreen from './stages/HomeScreen';
import WonderStage from './stages/WonderStage';
import StoryStage from './stages/StoryStage';
import SimulateStage from './stages/SimulateStage';
import PracticeStage from './stages/PracticeStage';
import ReflectStage from './stages/ReflectStage';

export function App() {
  const { currentStage, resetWorldsProgress } = useAppStore();

  useEffect(() => {
    // Reset all user progress whenever module mounts/loads
    resetWorldsProgress();
  }, []);

  const renderStage = () => {
    switch (currentStage) {
      case 'home':
        return <HomeScreen />;
      case 'wonder':
        return <WonderStage />;
      case 'story':
        return <StoryStage />;
      case 'simulate':
        return <SimulateStage />;
      case 'practice':
        return <PracticeStage />;
      case 'reflect':
        return <ReflectStage />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col cosmic-bg text-slate-100 select-none">
      {/* Floating Decorative Watermark Numerals Layer (Matching Screenshot) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 font-display font-black text-purple-300/10 select-none">
        {/* Top Left Stacked Fraction 54/100 */}
        <div className="absolute left-[5%] top-[8%] text-4xl md:text-6xl leading-none rotate-[-12deg] flex flex-col items-center">
          <span>54</span>
          <span className="w-full border-b-2 border-purple-300/10 my-0.5" />
          <span>100</span>
        </div>

        {/* Scattered Top Numerals */}
        <div className="absolute left-[22%] top-[6%] text-3xl md:text-5xl rotate-[-8deg]">91</div>
        <div className="absolute left-[26%] top-[9%] text-lg md:text-2xl">11</div>
        <div className="absolute left-[29%] top-[7%] text-2xl md:text-4xl rotate-[10deg]">66</div>
        <div className="absolute left-[36%] top-[5%] text-3xl md:text-5xl rotate-[-5deg]">90</div>
        <div className="absolute left-[53%] top-[4%] text-3xl md:text-5xl rotate-[8deg]">64</div>
        <div className="absolute right-[34%] top-[6%] text-2xl md:text-4xl">30</div>
        <div className="absolute right-[31%] top-[4%] text-lg md:text-2xl">69</div>
        <div className="absolute right-[24%] top-[9%] text-4xl md:text-6xl rotate-[12deg]">500</div>
        <div className="absolute right-[8%] top-[8%] text-3xl md:text-5xl rotate-[-10deg]">90</div>

        {/* Middle Numerals & Letters */}
        <div className="absolute left-[4%] top-[38%] text-4xl md:text-6xl rotate-[-15deg]">H</div>
        <div className="absolute right-[12%] top-[20%] text-[3rem] md:text-[5rem] rotate-[15deg]">347</div>
        <div className="absolute right-[7%] top-[48%] text-[2.5rem] md:text-[4rem] rotate-[-8deg]">123</div>

        {/* Bottom Numerals */}
        <div className="absolute left-[10%] bottom-[20%] text-[4rem] md:text-[6rem] rotate-[-12deg]">200</div>
        <div className="absolute right-[10%] bottom-[16%] text-[4.5rem] md:text-[6.5rem] rotate-[10deg]">999</div>
      </div>

      {/* Fixed Top Navigation Bar (Hidden on Intro / Home stage) */}
      {currentStage !== 'home' && <TopNav />}

      {/* Main Viewport Active Stage View */}
      <main className={`relative z-10 flex-1 w-full overflow-hidden ${currentStage !== 'home' ? 'h-[calc(100vh-4.5rem)]' : 'h-screen'}`}>
        {renderStage()}
      </main>
    </div>
  );
}

export default App;
