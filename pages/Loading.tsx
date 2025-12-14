import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../App';
import { Page } from '../types';
import { USER_NAME } from '../constants';

const Loading: React.FC = () => {
  const { setPage } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(Page.Hall);
    }, 1500); // 1.5s
    return () => clearTimeout(timer);
  }, [setPage]);

  return (
    <motion.div 
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <div className="w-16 h-16 rounded-full bg-gold-400/20 flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
            <span className="text-3xl">✉️</span>
        </div>
        <h1 className="text-lg text-gold-100 font-light tracking-widest mb-2">正在把星光装进信封里…</h1>
      </motion.div>
      
      <div className="absolute bottom-8 right-8 text-xs text-white/30 font-light">
        给{USER_NAME}的一份生日礼物
      </div>
    </motion.div>
  );
};

export default Loading;