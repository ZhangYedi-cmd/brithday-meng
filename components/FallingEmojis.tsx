import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ['🎂', '🎁', '🎈', '🎉', '🕯️', '🍰', '🥳', '👑', '✨', '🎶'];
const COUNT = 30;

export const FallingEmojis: React.FC = () => {
  const [items, setItems] = useState<{id: number, emoji: string, left: number, duration: number, delay: number}[]>([]);

  useEffect(() => {
    // Generate random falling items
    const newItems = Array.from({ length: COUNT }).map((_, i) => ({
      id: i,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      left: Math.random() * 100, // percentage
      duration: 3.5 + Math.random() * 2.5, // 3.5s - 6s
      delay: Math.random() * 2, // 0s - 2s start delay
    }));
    setItems(newItems);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-[60] overflow-hidden h-full w-full">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ y: -60, x: 0, opacity: 0, rotate: 0 }}
            animate={{ 
              y: '110vh', 
              x: (Math.random() - 0.5) * 150, // slight horizontal drift
              opacity: [0, 1, 1, 0], // fade in then out at end
              rotate: (Math.random() - 0.5) * 360 
            }}
            transition={{ 
              duration: item.duration, 
              delay: item.delay, 
              ease: "linear"
            }}
            style={{ 
              position: 'absolute', 
              left: `${item.left}%`,
              top: 0,
              fontSize: `${1.2 + Math.random()}rem`,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}
          >
            {item.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};