import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App';
import { Page } from '../types';
import { ScreenWrapper, Button, ModalWrapper } from '../components/Shared';
import { CanvasScene } from '../components/StarBottle/CanvasScene';
import { BlessingPanel } from '../components/StarBottle/BlessingPanel';
import { Controls } from '../components/StarBottle/Controls';
import { getRandomMessage } from '../data/starMessages';
import { ArrowLeft, Sparkles, Star } from 'lucide-react';

const TARGET_STARS = 18;
const SHAKE_COOLDOWN_SEC = 3;
const VACUUM_COOLDOWN_SEC = 3;

const StarBottleGame: React.FC = () => {
    const { setPage, markCompleted, completed } = useApp();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<CanvasScene | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Game State
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'result'>('intro');
    const [progress, setProgress] = useState(0);
    const [currentMessage, setCurrentMessage] = useState('');
    
    // Skills State
    const [canShake, setCanShake] = useState(true);
    const [shakeCD, setShakeCD] = useState(0);
    
    const [canVacuum, setCanVacuum] = useState(true);
    const [isVacuuming, setIsVacuuming] = useState(false);
    const [vacuumCD, setVacuumCD] = useState(0);
    const vacuumTimerRef = useRef<number>(0);

    // Intro Timer
    useEffect(() => {
        if (gameState === 'intro') {
            const timer = setTimeout(() => {
                setGameState('playing');
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [gameState]);

    // Initialization
    useEffect(() => {
        if (!canvasRef.current) return;
        
        const scene = new CanvasScene(canvasRef.current, (star) => {
            // Callback when star hits bottle
            setProgress(prev => Math.min(prev + 1, TARGET_STARS));
            setCurrentMessage(getRandomMessage(star.isLucky));
        });
        
        scene.initStars(25);
        scene.start();
        sceneRef.current = scene;

        const handleResize = () => scene.resize();
        window.addEventListener('resize', handleResize);

        return () => {
            scene.stop();
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Win Condition
    useEffect(() => {
        if (progress >= TARGET_STARS) {
            setTimeout(() => {
                setGameState('result');
                if (sceneRef.current) {
                    sceneRef.current.spawnExplosion(sceneRef.current.width/2, sceneRef.current.height - 50, 50, '#fbbf24');
                }
            }, 1000);
        }
    }, [progress]);

    // Cooldown Timers
    useEffect(() => {
        let t1: ReturnType<typeof setTimeout>, t2: ReturnType<typeof setTimeout>;
        if (shakeCD > 0) t1 = setTimeout(() => setShakeCD(p => p - 1), 1000);
        if (vacuumCD > 0) t2 = setTimeout(() => setVacuumCD(p => p - 1), 1000);
        
        if (shakeCD === 0) setCanShake(true);
        if (vacuumCD === 0) setCanVacuum(true);

        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [shakeCD, vacuumCD]);

    // Interaction Handlers
    const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
        if (gameState !== 'playing') return;
        if (progress >= TARGET_STARS) return;
        
        // Normalize coordinates
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const rect = canvasRef.current!.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        sceneRef.current?.handleClick(x, y);
    };

    const handleShake = () => {
        if (!canShake) return;
        sceneRef.current?.triggerShake();
        setCanShake(false);
        setShakeCD(SHAKE_COOLDOWN_SEC);
    };

    const handleVacuumStart = () => {
        if (!canVacuum || progress >= TARGET_STARS) return;
        setIsVacuuming(true);
        
        // Loop for vacuum physics
        const interval = setInterval(() => {
            // Find touch point (simplified: center of screen for ease, or track touch)
            // For better UX on mobile without complex touch tracking in React state:
            // Pull towards center of screen where thumb likely is, or bottle mouth
            if (sceneRef.current) {
                sceneRef.current.magnetPull(sceneRef.current.width / 2, sceneRef.current.height / 2);
            }
        }, 16); // 60fps
        
        vacuumTimerRef.current = Number(interval);
    };

    const handleVacuumEnd = () => {
        if (!isVacuuming) return;
        setIsVacuuming(false);
        clearInterval(vacuumTimerRef.current);
        
        // Capture up to 3 stars
        if (sceneRef.current) {
            const stars = sceneRef.current.getClosestStars(sceneRef.current.width / 2, sceneRef.current.height / 2, 3);
            sceneRef.current.collectStars(stars);
        }
        
        setCanVacuum(false);
        setVacuumCD(VACUUM_COOLDOWN_SEC);
    };

    const handleFinish = () => {
        markCompleted('starBottle');
        setPage(Page.Hall);
    };

    const isLastGame = completed.post && completed.cake;

    return (
        <ScreenWrapper className="px-0 relative h-full flex flex-col bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#0f172a]">
            {/* Intro Overlay */}
            <AnimatePresence>
                {gameState === 'intro' && (
                    <motion.div 
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-night-950/90 backdrop-blur-sm cursor-pointer"
                        onClick={() => setGameState('playing')}
                    >
                         <motion.div
                            initial={{ scale: 0.9, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center px-6"
                        >
                            <div className="w-20 h-20 mx-auto bg-gold-400/10 rounded-full flex items-center justify-center mb-8 border border-gold-400/20 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
                                <Star className="text-gold-300 w-8 h-8" fill="currentColor" />
                            </div>
                            <h2 className="text-2xl font-serif text-white mb-6 tracking-wide">把散落在银河的星星装进瓶子</h2>
                            <div className="space-y-4 text-gold-100/60 font-light text-sm tracking-widest leading-loose">
                                <p>收集满 18 颗，就能兑换一个好运 ✨</p>
                                <p>轻轻摇晃，还能捕捉流星</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="absolute top-4 left-4 z-20 flex items-center">
                <button onClick={() => setPage(Page.Hall)} className="p-2 text-white/50 hover:text-white">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="ml-2 text-lg font-serif text-gold-100">许愿星瓶</h2>
            </div>

            {/* Canvas Layer */}
            <div 
                ref={containerRef}
                className="relative w-full h-[65%] touch-none"
                onClick={handleCanvasClick}
                onTouchStart={handleCanvasClick} // Initial touch
            >
                <canvas ref={canvasRef} className="block w-full h-full" />
                
                {/* Bottle Visual Anchor (CSS only) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-32 opacity-80 pointer-events-none">
                     {/* Bottle Neck */}
                     <div className="w-12 h-6 border-2 border-white/20 border-b-0 rounded-t-lg mx-auto bg-white/5 backdrop-blur-sm" />
                     {/* Bottle Body */}
                     <div className="w-full h-full border-2 border-white/20 rounded-b-3xl rounded-t-xl bg-white/5 backdrop-blur-md shadow-[0_0_30px_rgba(251,191,36,0.1)] relative overflow-hidden">
                        {/* Inner glow increases with progress */}
                        <div 
                            className="absolute bottom-0 left-0 w-full bg-gold-400/20 blur-xl transition-all duration-1000"
                            style={{ height: `${(progress / TARGET_STARS) * 80}%` }} 
                        />
                        {/* Reflections */}
                        <div className="absolute top-4 right-3 w-2 h-16 bg-white/10 rounded-full rotate-3" />
                     </div>
                </div>
            </div>

            {/* UI Layer */}
            <div className="flex-1 bg-gradient-to-t from-black/80 to-transparent p-5 flex flex-col justify-end pb-8">
                <BlessingPanel 
                    text={currentMessage} 
                    progress={progress} 
                    total={TARGET_STARS} 
                />
                
                <Controls 
                    onShake={handleShake}
                    canShake={canShake}
                    shakeCooldown={shakeCD}
                    isVacuuming={isVacuuming}
                    canVacuum={canVacuum}
                    vacuumCooldown={vacuumCD}
                    onVacuumStart={handleVacuumStart}
                    onVacuumEnd={handleVacuumEnd}
                />
            </div>

            {/* Result Modal */}
            <AnimatePresence>
                {gameState === 'result' && (
                    <ModalWrapper>
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto bg-gold-400/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <Sparkles className="text-gold-300 w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-serif text-white mb-2">星光已收好 ✨</h3>
                            <p className="text-gold-100/70 mb-8 leading-relaxed">
                                所有的星星都落进了瓶子里，<br/>
                                所有的温柔都会落在你身上。
                            </p>
                            {isLastGame && (
                                <p className="text-gold-300 text-sm mb-6 animate-pulse font-serif">快去领取最终的礼物吧～</p>
                            )}
                            <Button fullWidth onClick={handleFinish}>收下这份星光</Button>
                        </div>
                    </ModalWrapper>
                )}
            </AnimatePresence>
        </ScreenWrapper>
    );
};

export default StarBottleGame;