import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../Shared';

interface BlessingPanelProps {
    text: string;
    progress: number;
    total: number;
}

export const BlessingPanel: React.FC<BlessingPanelProps> = ({ text, progress, total }) => {
    const [display, setDisplay] = useState('');
    
    // Typewriter effect
    useEffect(() => {
        setDisplay('');
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplay(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, 50);
        return () => clearInterval(timer);
    }, [text]);

    const handleQuickShow = () => {
        setDisplay(text);
    };

    return (
        <GlassCard className="p-4 md:p-6 mb-4 relative overflow-hidden" onClick={handleQuickShow}>
            <div className="flex justify-between items-start mb-2 border-b border-white/10 pb-2">
                <span className="text-xs text-gold-200/60 uppercase tracking-widest">Star Message</span>
                <span className="text-xs font-mono text-gold-400">{progress} / {total}</span>
            </div>
            
            <div className="min-h-[3rem] flex items-center">
                 <AnimatePresence mode="wait">
                    {text ? (
                        <motion.p 
                            key={text} // Re-animate on new text
                            className="text-white/90 font-serif text-lg leading-relaxed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {display}
                            <span className="inline-block w-0.5 h-4 bg-gold-400 ml-1 animate-pulse align-middle"/>
                        </motion.p>
                    ) : (
                        <p className="text-white/30 text-sm italic">点击夜空中的星星，收集祝福...</p>
                    )}
                 </AnimatePresence>
            </div>
            
            {/* Progress Bar background */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
                <motion.div 
                    className="h-full bg-gold-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(progress / total) * 100}%` }}
                />
            </div>
        </GlassCard>
    );
};
