import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../App';
import { Page } from '../types';
import { USER_NAME } from '../constants';
import { GlassCard, ScreenWrapper, cn } from '../components/Shared';
import { CheckCircle2, Music, Mail, Cake, Gift, Volume2, VolumeX } from 'lucide-react';

// --- Stage Background Component ---
const StageBackground = () => {
    // 1. 舞台光圈 (Main Spotlight)
    // 根据需求：蛋糕在右侧偏上 (65% 35%)，需要一团暖金光
    // 底色保持深蓝黑 -> 黑的渐变
    const spotlightStyle = {
        background: `
            radial-gradient(circle at 65% 35%, rgba(251, 191, 36, 0.22) 0%, rgba(251, 191, 36, 0.05) 45%, transparent 70%),
            radial-gradient(circle at 50% 100%, rgba(251, 191, 36, 0.08) 0%, transparent 50%),
            linear-gradient(to bottom, #0f172a 0%, #020617 50%, #000000 100%)
        `
    };

    // 2. 星尘层 (Stardust) - 细微的呼吸闪烁
    const stardustStyle = {
        backgroundImage: `
            radial-gradient(1px 1px at 15% 25%, rgba(255, 255, 255, 0.8) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 75% 18%, rgba(255, 255, 255, 0.6) 0%, transparent 100%),
            radial-gradient(2px 2px at 50% 50%, rgba(255, 255, 255, 0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 85% 45%, rgba(255, 255, 255, 0.7) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 25% 65%, rgba(255, 255, 255, 0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 80%, rgba(255, 255, 255, 0.8) 0%, transparent 100%),
            radial-gradient(2px 2px at 10% 90%, rgba(255, 255, 255, 0.3) 0%, transparent 100%)
        `,
        backgroundSize: '100% 100%',
    };

    return (
        <div className="absolute inset-0 pointer-events-none -z-1 overflow-hidden">
            {/* Base & Spotlight Layer - Opaque to cover global background */}
            <div className="absolute inset-0 z-0" style={spotlightStyle} />

            {/* Stardust Layer with Breathing Animation */}
            <motion.div 
                className="absolute inset-0 z-10"
                style={stardustStyle}
                animate={{ 
                    opacity: [0.4, 0.7, 0.4],
                    scale: [1, 1.05, 1],
                }}
                transition={{ 
                    duration: 5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                }}
            />

            {/* Vignette Layer (暗角) - 聚焦视线到中心 */}
            <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(0,0,0,0.6)_90%,#000_100%)] pointer-events-none" />
        </div>
    );
};

// Custom Progress Header within Hall
const Header = () => {
    const { completed, toggleMute, mute } = useApp();
    const count = Object.values(completed).filter(Boolean).length;

    return (
        <div className="flex items-center justify-between py-4 px-1 relative z-20">
             <div className="w-8" /> {/* Spacer for centering */}
             <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gold-200/80 uppercase tracking-widest font-medium text-shadow">礼物进度 {count}/3</span>
                <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div 
                        className="h-full bg-gold-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / 3) * 100}%` }}
                    />
                </div>
             </div>
             <button onClick={toggleMute} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                {mute ? <VolumeX size={18} /> : <Volume2 size={18} />}
             </button>
        </div>
    )
}

const GiftCardItem = ({ 
    title, 
    icon: Icon, 
    completed, 
    onClick 
}: { 
    title: string, 
    icon: any, 
    completed: boolean, 
    onClick: () => void 
}) => (
    <GlassCard 
        onClick={onClick}
        className={`p-3 flex flex-col items-center justify-center gap-3 aspect-square cursor-pointer group transition-all duration-500 ${completed ? 'opacity-60 grayscale-[0.5]' : 'active:scale-95 hover:bg-white/10'}`}
        highlight={!completed}
        // Increase border contrast slightly for the new dark background
        style={{ borderColor: completed ? 'rgba(255,255,255,0.05)' : 'rgba(251, 191, 36, 0.3)' }}
    >
        <div className={`p-3 rounded-full transition-colors duration-500 ${completed ? 'bg-green-500/10 text-green-400' : 'bg-gold-400/10 text-gold-300 group-hover:bg-gold-400/20 group-hover:text-gold-200 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.4)]'}`}>
            {completed ? <CheckCircle2 size={22} /> : <Icon size={24} />}
        </div>
        <h3 className="text-sm font-medium text-white/90 text-center tracking-wide">{title}</h3>
        
        {!completed && (
            <div className="absolute inset-0 bg-gradient-to-t from-gold-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
    </GlassCard>
);

const Hall: React.FC = () => {
  const { setPage, completed } = useApp();
  const progress = Object.values(completed).filter(Boolean).length;
  const allCompleted = progress === 3;

  const marqueeText = `HAPPY BIRTHDAY ${USER_NAME}  ✦  WISHING YOU JOY  ✦  STAY GOLD  ✦  平安喜乐  ✦`;

  return (
    <ScreenWrapper className="px-5 pt-4 pb-8 min-h-[100dvh] relative overflow-hidden">
      {/* 替换旧的 AmbientEffects，使用新的舞台背景 */}
      <StageBackground />
      
      <Header />
      
      <div className="flex-1 flex flex-col items-center justify-center py-6 relative z-10">
        
        {/* Cinematic Scrolling Marquee */}
        <div className="w-full overflow-hidden mb-2 opacity-30 select-none pointer-events-none mix-blend-screen relative z-10">
            <motion.div
                className="flex whitespace-nowrap text-[10px] font-serif tracking-[0.4em] text-gold-100"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
                 {/* Repeat text pattern 4 times to ensure seamless loop on mobile/tablet */}
                 <span className="mr-8">{marqueeText}</span>
                 <span className="mr-8">{marqueeText}</span>
                 <span className="mr-8">{marqueeText}</span>
                 <span className="mr-8">{marqueeText}</span>
            </motion.div>
        </div>

        {/* NEW: Greeting Typography - Fills the top blank space */}
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="text-center mb-6 relative z-20"
        >
             <h1 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-gold-100 via-gold-200 to-gold-400 drop-shadow-sm tracking-wide">
                祝{USER_NAME}生日快乐
             </h1>
             <div className="flex items-center justify-center gap-3 mt-3 opacity-60">
                 <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-gold-200" />
                 <span className="text-[10px] tracking-[0.3em] text-gold-100 uppercase font-light">
                    May you always be happy
                 </span>
                 <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-gold-200" />
            </div>
        </motion.div>

        {/* Hero Cake Image */}
        <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="flex justify-center mb-10 relative w-full group"
        >
            {/* Glow behind cake - Spotlight reinforcement */}
            <div className="absolute top-[50%] left-[55%] -translate-x-1/2 -translate-y-1/2 bg-gold-400/15 blur-[60px] w-64 h-64 rounded-full animate-pulse-slow mix-blend-screen pointer-events-none" />
            
            {/* Floating particles around cake (Close up magic dust) */}
            <div className="absolute inset-0 pointer-events-none">
                {Array.from({length: 6}).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-[2px] h-[2px] bg-gold-200 rounded-full shadow-[0_0_4px_rgba(253,230,138,0.8)]"
                        style={{
                            left: `${50 + (Math.random() - 0.5) * 60}%`,
                            top: `${50 + (Math.random() - 0.5) * 60}%`
                        }}
                        animate={{
                            y: [0, -15, 0],
                            opacity: [0, 0.8, 0],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            <img 
                src="https://father-1304746462.cos.ap-nanjing.myqcloud.com/father/img/1D216DAA-0A4D-4921-81D9-BC7BD7607C4D.png" 
                alt="Birthday Cake" 
                className="w-72 h-72 object-contain relative z-10 animate-float drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
            />
        </motion.div>

        {/* Horizontal Buttons Grid */}
        <div className="grid grid-cols-3 gap-4 w-full">
            <GiftCardItem 
                title="情绪电台" 
                icon={Music}
                completed={completed.radio}
                onClick={() => setPage(Page.Radio)}
            />
            <GiftCardItem 
                title="愿望邮局" 
                icon={Mail}
                completed={completed.post}
                onClick={() => setPage(Page.PostOffice)}
            />
            <GiftCardItem 
                title="蛋糕点灯" 
                icon={Cake}
                completed={completed.cake}
                onClick={() => setPage(Page.Cake)}
            />
        </div>
        
        {!allCompleted && (
             <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gold-100/40 text-xs text-center mt-8 font-light tracking-[0.2em]"
             >
                {progress === 0 ? "✦ 点击图标开始拆礼物 ✦" : "✦ 还有惊喜等着你 ✦"}
             </motion.p>
        )}
      </div>

      {allCompleted ? (
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-auto pt-6 relative z-10"
         >
             <GlassCard 
                className="p-4 flex items-center justify-between cursor-pointer bg-gradient-to-r from-gold-400/20 via-gold-400/10 to-transparent border-gold-400/40 group shadow-[0_0_30px_rgba(251,191,36,0.15)]"
                onClick={() => setPage(Page.Finale)}
                highlight
             >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gold-400/20 rounded-full text-gold-300 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                        <Gift size={20} />
                    </div>
                    <span className="font-serif text-gold-100 font-medium tracking-wide">领取最终礼物</span>
                </div>
                <span className="text-gold-300 group-hover:translate-x-1 transition-transform">→</span>
             </GlassCard>
         </motion.div>
      ) : null}
    </ScreenWrapper>
  );
};

export default Hall;