import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../App';
import { Page } from '../types';
import { USER_NAME } from '../constants';
import { GlassCard, ScreenWrapper } from '../components/Shared';
import { CheckCircle2, Mail, Cake, Gift, Volume2, VolumeX, Sparkles } from 'lucide-react';

// --- Stage Background Component ---
const StageBackground = () => {
    const spotlightStyle = {
        background: `
            radial-gradient(circle at 65% 35%, rgba(251, 191, 36, 0.22) 0%, rgba(251, 191, 36, 0.05) 45%, transparent 70%),
            radial-gradient(circle at 50% 100%, rgba(251, 191, 36, 0.08) 0%, transparent 50%),
            linear-gradient(to bottom, #0f172a 0%, #020617 50%, #000000 100%)
        `
    };

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
        /* Added z-0 explicitly to create a lower stacking context than the content (z-10) */
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute inset-0 z-0" style={spotlightStyle} />
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
            <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(0,0,0,0.6)_90%,#000_100%)] pointer-events-none" />
        </div>
    );
};

const Header = () => {
    const { completed, toggleMute, mute } = useApp();
    const count = Object.values(completed).filter(Boolean).length;
    // Total games is now 3
    const total = 3;

    return (
        <div className="flex items-center justify-between py-4 px-1 relative z-20 shrink-0">
             <div className="w-8" />
             <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gold-200/80 uppercase tracking-widest font-medium text-shadow">礼物进度 {count}/{total}</span>
                <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div 
                        className="h-full bg-gold-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / total) * 100}%` }}
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
    onClick,
    className
}: { 
    title: string, 
    icon: any, 
    completed: boolean, 
    onClick: () => void,
    className?: string
}) => (
    <GlassCard 
        onClick={onClick}
        className={`p-3 flex flex-col items-center justify-center gap-3 aspect-square cursor-pointer group transition-all duration-500 ${completed ? 'opacity-60 grayscale-[0.5]' : 'active:scale-95 hover:bg-white/10'} ${className || ''}`}
        highlight={!completed}
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
  // Ensure we check all 3 keys
  const progress = Object.values(completed).filter(Boolean).length;
  const allCompleted = progress === 3;

  const marqueeText = `HAPPY BIRTHDAY ${USER_NAME}  ✦  WISHING YOU JOY  ✦  STAY GOLD  ✦  平安喜乐  ✦`;

  return (
    <ScreenWrapper className="h-full relative overflow-hidden">
      {/* Background stays fixed and full screen */}
      <StageBackground />
      
      {/* Scrollable Container covering the whole screen, sitting on top of background */}
      <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden no-scrollbar px-5 pt-4 pb-24 flex flex-col">
          <Header />
          
          <div className="flex-1 flex flex-col items-center justify-center py-6 relative w-full">
            
            <div className="w-full overflow-hidden mb-2 opacity-30 select-none pointer-events-none mix-blend-screen relative z-10 shrink-0">
                <motion.div
                    className="flex whitespace-nowrap text-[10px] font-serif tracking-[0.4em] text-gold-100"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                >
                     <span className="mr-8">{marqueeText}</span>
                     <span className="mr-8">{marqueeText}</span>
                     <span className="mr-8">{marqueeText}</span>
                     <span className="mr-8">{marqueeText}</span>
                </motion.div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 1 }}
                className="text-center mb-6 relative z-20 shrink-0"
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
                className="flex justify-center mb-8 relative w-full group shrink-0"
            >
                <div className="absolute top-[50%] left-[55%] -translate-x-1/2 -translate-y-1/2 bg-gold-400/15 blur-[60px] w-48 h-48 rounded-full animate-pulse-slow mix-blend-screen pointer-events-none" />
                
                <img 
                    src="https://father-1304746462.cos.ap-nanjing.myqcloud.com/father/img/1D216DAA-0A4D-4921-81D9-BC7BD7607C4D.png" 
                    alt="Birthday Cake" 
                    className="w-48 h-48 object-contain relative z-10 animate-float drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                />
            </motion.div>

            {/* Grid for 3 games */}
            <div className="grid grid-cols-2 gap-4 w-full px-2 shrink-0">
                <GiftCardItem 
                    title="愿望邮局" 
                    icon={Mail}
                    completed={completed.post}
                    onClick={() => setPage(Page.PostOffice)}
                />
                <GiftCardItem 
                    title="许愿星瓶" 
                    icon={Sparkles}
                    completed={completed.starBottle}
                    onClick={() => setPage(Page.StarBottle)}
                />
                
                {/* Center the 3rd item (Cake) */}
                <div className="col-span-2 flex justify-center">
                    <div className="w-[calc(50%-0.5rem)] min-w-[150px]">
                        <GiftCardItem 
                            title="蛋糕点灯" 
                            icon={Cake}
                            completed={completed.cake}
                            onClick={() => setPage(Page.Cake)}
                        />
                    </div>
                </div>
            </div>
            
            {!allCompleted && (
                 <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gold-100/40 text-xs text-center mt-6 font-light tracking-[0.2em] shrink-0 pb-4"
                 >
                    {progress === 0 ? "✦ 点击图标开始拆礼物 ✦" : "✦ 还有惊喜等着你 ✦"}
                 </motion.p>
            )}

            {allCompleted ? (
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 relative z-10 shrink-0 w-full px-2"
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
          </div>
      </div>
    </ScreenWrapper>
  );
};

export default Hall;