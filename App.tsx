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
const IntroModal: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  // Removed auto-timer to allow user interaction to trigger audio playback
  return (
    <ModalWrapper>
      <div className="text-center py-6 px-4">
        <h2 className="text-2xl font-serif text-gold-200 mb-6">{USER_NAME}，生日快乐 ✨</h2>
        <div className="space-y-4 text-gold-100/80 font-light leading-relaxed mb-8">
          <p>我给你准备了三份小礼物。</p>
          <p>今天你只负责开心。</p>
        </div>
        <Button fullWidth onClick={onStart} className="animate-pulse shadow-[0_0_20px_rgba(251,191