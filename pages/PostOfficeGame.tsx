import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App';
import { Page, EnvelopeCategory } from '../types';
import { ENVELOPES } from '../constants';
import { ScreenWrapper, GlassCard, Button } from '../components/Shared';
import { 
    ArrowLeft, 
    Send, 
    Check, 
    Smile, 
    Sparkles, 
    HeartPulse, 
    Briefcase, 
    Users, 
    Heart,
    Mail
} from 'lucide-react';

const Stamp = () => (
  <div className="absolute top-4 right-4 w-16 h-20 bg-red-900/5 border-2 border-red-900/10 rounded flex items-center justify-center rotate-3 overflow-hidden select-none pointer-events-none">
     <div className="absolute inset-0 border-[3px] border-dashed border-red-900/20 m-1 rounded-sm" />
     <Heart className="text-red-900/20" size={24} />
  </div>
);

const Postmark = () => {
    const year = new Date().getFullYear();
    return (
        <div className="absolute top-6 right-12 w-20 h-20 border-2 border-stone-800/20 rounded-full flex items-center justify-center -rotate-12 opacity-50 mix-blend-multiply select-none pointer-events-none">
            <div className="text-[9px] font-mono text-stone-800 text-center leading-tight">
                POST OFFICE<br/>
                {year}<br/>
                DREAM
            </div>
            <div className="absolute inset-0 border border-stone-800/10 rounded-full m-1" />
            <div className="absolute top-1/2 -left-4 w-28 h-[1px] bg-stone-800/20" />
            <div className="absolute top-1/2 -left-4 w-28 h-[1px] bg-stone-800/20 rotate-6" />
        </div>
    );
};

const PostOfficeGame: React.FC = () => {
    const { setPage, markCompleted } = useApp();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [phase, setPhase] = useState<'select' | 'animating' | 'reading' | 'summary'>('select');
    const [currentReadingIndex, setCurrentReadingIndex] = useState(0);
    // Store selected messages to persist through reading phase
    const [replies, setReplies] = useState<{title: string, msg: string}[]>([]);

    const getIcon = (id: string) => {
        switch(id) {
            case 'mood': return Smile;
            case 'luck': return Sparkles;
            case 'body': return HeartPulse;
            case 'work': return Briefcase;
            case 'friendship': return Users;
            case 'love': return Heart;
            default: return Mail;
        }
    };

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(i => i !== id));
        } else if (selectedIds.length < 3) {
            setSelectedIds(prev => [...prev, id]);
        }
    };

    const handleSend = () => {
        // Generate replies
        const generated = selectedIds.map(id => {
            const category = ENVELOPES.find(e => e.id === id)!;
            const randomMsg = category.messages[Math.floor(Math.random() * category.messages.length)];
            return { title: category.label, msg: randomMsg };
        });
        setReplies(generated);
        setPhase('animating');

        // Animation delay
        setTimeout(() => {
            setPhase('reading');
        }, 2000);
    };

    const handleNextCard = () => {
        if (currentReadingIndex < 2) {
            setCurrentReadingIndex(prev => prev + 1);
        } else {
            setPhase('summary');
        }
    };

    const handleFinish = () => {
        markCompleted('post');
        setPage(Page.Hall);
    };

    const handleReplay = () => {
        setCurrentReadingIndex(0);
        setPhase('reading');
    }

    return (
        <ScreenWrapper className="px-5 py-6">
            <AnimatePresence mode="wait">
                {phase === 'select' && (
                    <motion.div 
                        key="select"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col h-full"
                    >
                        <div className="flex items-center mb-6">
                            <button onClick={() => setPage(Page.Hall)} className="p-2 -ml-2 text-white/50 hover:text-white">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="ml-4 text-xl font-serif text-white">挑 3 封信投进邮筒</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {ENVELOPES.map((env) => {
                                const Icon = getIcon(env.id);
                                const isSelected = selectedIds.includes(env.id);
                                return (
                                    <motion.button
                                        key={env.id}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => toggleSelection(env.id)}
                                        className={`p-4 rounded-lg border flex flex-col items-center gap-3 transition-all ${
                                            isSelected
                                            ? 'bg-gold-400/10 border-gold-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]' 
                                            : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className={`p-3 rounded-full transition-colors ${isSelected ? 'bg-gold-400/20 text-gold-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-white/10 text-gold-100'}`}>
                                            <Icon size={24} />
                                        </div>
                                        <span className={`text-sm font-medium ${isSelected ? 'text-gold-300' : 'text-gold-100/80'}`}>
                                            {env.label}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>

                        <div className="mt-auto">
                            <div className="text-center text-white/30 text-xs mb-4">已选择 {selectedIds.length}/3</div>
                            <Button 
                                fullWidth 
                                disabled={selectedIds.length < 3} 
                                onClick={handleSend}
                            >
                                投递愿望
                                <Send size={16} />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {phase === 'animating' && (
                    <motion.div 
                        key="animating"
                        className="flex flex-col items-center justify-center h-[60vh]"
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ y: 0, opacity: 1 }}
                            animate={{ y: -200, opacity: 0 }}
                            transition={{ duration: 1.5, ease: "easeIn" }}
                            className="relative"
                        >
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Mail size={64} className="text-gold-400" />
                            </div>
                            <div className="w-32 h-32 border-4 border-gold-400/30 rounded-full animate-ping absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </motion.div>
                        <p className="mt-8 text-gold-200/50 animate-pulse">正在等待回信...</p>
                    </motion.div>
                )}

                {phase === 'reading' && (
                    <motion.div 
                        key="reading"
                        className="flex flex-col justify-center h-full pb-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                         {/* 使用 popLayout 模式让卡片切换无缝衔接，消除闪烁 */}
                         <div className="relative w-full min-h-[420px] md:min-h-[480px] flex items-center">
                             <AnimatePresence mode="popLayout" initial={false}>
                                <motion.div
                                    key={currentReadingIndex}
                                    className="w-full h-full absolute inset-0 perspective-1000" // 绝对定位让它们重叠在一起进行动画
                                    initial={{ opacity: 0, x: 100, rotate: 2 }}
                                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                                    exit={{ opacity: 0, x: -100, rotate: -2 }}
                                    transition={{ 
                                        type: "spring", 
                                        stiffness: 260, 
                                        damping: 20
                                    }}
                                >
                                    <div className="relative h-full w-full bg-[#fdfbf7] rounded-xl overflow-hidden shadow-2xl border border-stone-200">
                                        {/* Paper Texture Effect */}
                                        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none" />
                                        
                                        {/* Decorative frames */}
                                        <div className="absolute inset-2 border border-stone-800/5 rounded-lg pointer-events-none" />
                                        <div className="absolute inset-3 border border-stone-800/5 rounded-lg pointer-events-none" />

                                        {/* Header Elements */}
                                        <div className="absolute top-8 left-8">
                                            <span className="text-[10px] font-serif tracking-[0.2em] text-stone-400 uppercase block mb-2">To You</span>
                                            <span className="text-lg font-serif text-stone-800 border-b border-stone-300 pb-1 pr-4 inline-block">
                                                RE: {replies[currentReadingIndex].title}
                                            </span>
                                        </div>

                                        <Stamp />
                                        <Postmark />

                                        {/* Message Body */}
                                        <div className="absolute inset-0 flex items-center justify-center p-10 mt-6">
                                            <div className="relative">
                                                <Sparkles className="absolute -top-6 -left-4 text-gold-400/40 w-6 h-6 animate-pulse" />
                                                <p className="text-xl md:text-2xl font-serif text-stone-800 leading-loose text-center whitespace-pre-line drop-shadow-sm select-none">
                                                    “ {replies[currentReadingIndex].msg} ”
                                                </p>
                                                <Sparkles className="absolute -bottom-4 -right-2 text-gold-400/40 w-5 h-5 animate-pulse delay-700" />
                                            </div>
                                        </div>
                                        
                                        {/* Footer Control */}
                                        <div className="absolute bottom-0 left-0 w-full p-6 pb-8 flex justify-center bg-gradient-to-t from-[#fdfbf7] via-[#fdfbf7]/90 to-transparent">
                                            <button 
                                                onClick={handleNextCard}
                                                className="group/btn flex flex-col items-center gap-2 transition-all cursor-pointer"
                                            >
                                                <span className="text-[10px] tracking-[0.2em] text-stone-400 uppercase group-hover/btn:text-stone-600 transition-colors">
                                                    {currentReadingIndex < 2 ? 'Next Letter' : 'Finish'}
                                                </span>
                                                <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 group-hover/btn:bg-stone-800 group-hover/btn:text-stone-100 group-hover/btn:scale-110 group-active/btn:scale-95 transition-all shadow-sm">
                                                    <ArrowLeft size={20} className="rotate-180" />
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                             </AnimatePresence>
                         </div>
                    </motion.div>
                )}

                {phase === 'summary' && (
                    <motion.div 
                        key="summary"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center h-[60vh] gap-6"
                    >
                        <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.2)]">
                            <Check size={40} />
                        </div>
                        <h2 className="text-2xl font-serif text-white">你的 3 封回信已送达</h2>
                        
                        <div className="w-full space-y-3 mt-8">
                            <Button fullWidth onClick={handleFinish}>收好回信，回大厅</Button>
                            <Button fullWidth variant="ghost" onClick={handleReplay}>再读一遍</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ScreenWrapper>
    );
};

export default PostOfficeGame;