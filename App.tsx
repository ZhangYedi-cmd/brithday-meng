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

const App: React.FC = () => {
  // Audio Ref
  const audioRef = useRef<HTMLAudioElement>(null);

  // State initialization with localStorage
  // Updated key to v3 to reset state due to removing 'radio'
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('birthday_app_state_v3'); 
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        ...parsed, 
        page: Page.Loading,
        showIntroModal: true 
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

  // Intro Modal Component
  const IntroModal = () => (
    <ModalWrapper onClose={actions.startExperience}>
      <h2 className="text-2xl font-serif text-gold-200 mb-4">{USER_NAME}，生日快乐 ✨</h2>
      <div className="space-y-3 text-gold-100/80 mb-8 font-light leading-relaxed">
        <p>我给你准备了三份小礼物。</p>
        <p>今天你只负责开心。</p>
        <p className="text-xs text-white/40 mt-2">* 点击开始后，会有背景音乐哦 🎵</p>
      </div>
      <div className="flex flex-col gap-3">
        <Button onClick={actions.startExperience}>开始拆礼物 →</Button>
        <Button variant="ghost" onClick={actions.startExperience} className="text-sm">先看一眼页面</Button>
      </div>
    </ModalWrapper>
  );

  return (
    <AppContext.Provider value={{ ...state, ...actions }}>
      <div className="relative min-h-[100dvh] w-full text-base font-sans antialiased overflow-hidden">
        <audio ref={audioRef} src={BG_MUSIC_URL} loop preload="auto" />
        
        {state.page !== Page.Hall && state.page !== Page.StarBottle && (
             <Starfield paused={state.page !== Page.Loading} />
        )}
        
        {/* Main Page Transitions */}
        <AnimatePresence mode="wait">
          {state.page === Page.Loading && <Loading key="loading" />}
          
          {/* Hall is now a direct child, ensuring stable transitions */}
          {state.page === Page.Hall && <Hall key="hall" />}

          {state.page === Page.PostOffice && <PostOfficeGame key="post" />}
          {state.page === Page.Cake && <CakeGame key="cake" />}
          {state.page === Page.StarBottle && <StarBottleGame key="starbottle" />}
          {state.page === Page.Finale && <Finale key="finale" />}
        </AnimatePresence>

        {/* Modal Layer rendered independently to avoid interfering with page transitions */}
        <AnimatePresence>
            {state.page === Page.Hall && state.showIntroModal && (
                <IntroModal key="intro-modal" />
            )}
        </AnimatePresence>
      </div>
    </AppContext.Provider>
  );
};

export default App;