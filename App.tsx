import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppState, Page } from './types';
import Starfield from './components/Starfield';
import { USER_NAME, BG_MUSIC_URL } from './constants';
import { ModalWrapper, Button, cn } from './components/Shared';

// Pages
import Loading from './pages/Loading';
import Hall from './pages/Hall';
import RadioGame from './pages/RadioGame';
import PostOfficeGame from './pages/PostOfficeGame';
import CakeGame from './pages/CakeGame';
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
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('birthday_app_state_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Reset page to Hall if reloading in middle of game, or Loading if fresh
      return { 
        ...parsed, 
        page: Page.Loading,
        showIntroModal: true // Always show modal on refresh for better DX/UX
      };
    }
    return {
      page: Page.Loading,
      completed: { radio: false, post: false, cake: false },
      mute: true, // Default mute as per req
      showIntroModal: true
    };
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('birthday_app_state_v1', JSON.stringify(state));
  }, [state]);

  // Audio Control Effect
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = 0.4; // Set a reasonable volume
        if (state.mute) {
            audioRef.current.pause();
        } else {
            // Attempt to play. Note: user interaction is required first, 
            // which is handled by startExperience()
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
    // Specific action to start music AND close modal
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
        <p>不用很久，3 分钟就能拆完。</p>
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
        {/* Audio Element */}
        <audio ref={audioRef} src={BG_MUSIC_URL} loop preload="auto" />
        
        {/* Only show Starfield if NOT on Hall page (Hall has its own StageBackground) */}
        {state.page !== Page.Hall && (
             <Starfield paused={state.page !== Page.Loading} />
        )}
        
        <AnimatePresence mode="wait">
          {state.page === Page.Loading && <Loading key="loading" />}
          
          {state.page === Page.Hall && (
            <>
              <Hall key="hall" />
              {state.showIntroModal && <IntroModal />}
            </>
          )}

          {state.page === Page.Radio && <RadioGame key="radio" />}
          {state.page === Page.PostOffice && <PostOfficeGame key="post" />}
          {state.page === Page.Cake && <CakeGame key="cake" />}
          {state.page === Page.Finale && <Finale key="finale" />}
        </AnimatePresence>
      </div>
    </AppContext.Provider>
  );
};

export default App;