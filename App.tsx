import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppState, Page } from './types';
import Starfield from './components/Starfield';
import { USER_NAME, BG_MUSIC_URL } from './constants';
import { ModalWrapper, Button, cn } from './components/Shared';

// Pages
import Loading from './pages/Loading';
import Hall from './pages/Hall';
// RadioGame removed
import PostOfficeGame from './pages/PostOfficeGame';
import CakeGame from './pages/CakeGame';
import StarBottleGame from './pages/StarBottleGame';
import Finale from './pages/Finale';

// Context definition
interface AppContextType extends AppState {
  setPage: (page: Page) => void;
  markCompleted: (game: keyof AppState['completed']) => void;
  toggleMute: () => void;
  startExperience: () => void;
  closeIntroModal: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// Intro Modal Component defined outside to maintain reference
const IntroModal: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <ModalWrapper onClose={onStart}>
    <h2 className="text-2xl font-serif text-gold-200 mb-4">{USER_NAME}，生日快乐 ✨</h2>
    <div className="space-y-3 text-gold-100/80 mb-8 font-light leading-relaxed">
      <p>我给你准备了三份小礼物。</p>
      <p>今天你只负责开心。</p>
      <p className="text-xs text-white/40 mt-2">* 点击开始后，会有背景音乐哦 🎵</p>
    </div>
    <div className="flex flex-col gap-3">
      <Button onClick={onStart}>开始拆礼物 →</Button>
      <Button variant="ghost" onClick={onStart} className="text-sm">先看一眼页面</Button>
    </div>
  </ModalWrapper>
);

const App: React.FC = () => {
  // Audio Ref
  const audioRef = useRef<HTMLAudioElement>(null);

  // State initialization with localStorage
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('birthday_app_state_v3'); 
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        ...parsed, 
        page: Page.Loading, // Always reload with animation
        showIntroModal: true // Always verify modal on reload
      };
    }
    return {
      page: Page.Loading,
      completed: { post: false, cake: false, starBottle: false },
      mute: true,
      showIntroModal: true
    };
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('birthday_app_state_v3', JSON.stringify(state));
  }, [state]);

  // Audio Control Effect
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = 0.4; // Set a reasonable volume
        if (state.mute) {
            audioRef.current.pause();
        } else {
            // Attempt to play
            audioRef.current.play().catch(e => {
                console.log("Audio autoplay prevented:", e);
            });
        }
    }
  }, [state.mute]);

  const actions = {
    setPage: (page: Page) => setState(prev => ({ ...prev, page })),
    markCompleted: (game: keyof AppState['completed']) => 
      setState(prev => ({ ...prev, completed: { ...prev.completed, [game]: true } })),
    toggleMute: () => setState(prev => ({ ...prev, mute: !prev.mute })),
    closeIntroModal: () => setState(prev => ({ ...prev, showIntroModal: false })),
    startExperience: () => {
        setState(prev => ({ ...prev, showIntroModal: false, mute: false }));
    }
  };

  return (
    <AppContext.Provider value={{ ...state, ...actions }}>
      {/* 
         CRITICAL FIX: Changed min-h-[100dvh] to h-[100dvh].
         Standard 'h-full' on children requires an explicit height on the parent.
         Without this, absolute positioned children inside relative containers in Hall.tsx collapse to 0 height.
      */}
      <div className="relative h-[100dvh] w-full text-base font-sans antialiased overflow-hidden bg-night-950">
        <audio ref={audioRef} src={BG_MUSIC_URL} loop preload="auto" />
        
        {state.page !== Page.Hall && state.page !== Page.StarBottle && (
             <Starfield paused={state.page !== Page.Loading} />
        )}
        
        {/* Main Page Transitions */}
        <AnimatePresence mode="wait">
          {state.page === Page.Loading && <Loading key="loading" />}
          
          {state.page === Page.Hall && <Hall key="hall" />}

          {state.page === Page.PostOffice && <PostOfficeGame key="post" />}
          {state.page === Page.Cake && <CakeGame key="cake" />}
          {state.page === Page.StarBottle && <StarBottleGame key="starbottle" />}
          {state.page === Page.Finale && <Finale key="finale" />}
        </AnimatePresence>

        {/* Modal Layer */}
        <AnimatePresence>
            {state.page === Page.Hall && state.showIntroModal && (
                <IntroModal key="intro-modal" onStart={actions.startExperience} />
            )}
        </AnimatePresence>
      </div>
    </AppContext.Provider>
  );
};

export default App;