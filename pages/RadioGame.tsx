import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App';
import { Page } from '../types';
import { RADIO_QUOTES, USER_NAME } from '../constants';
import { ScreenWrapper, GlassCard, Button } from '../components/Shared';
import { 
    ArrowLeft, 
    Sun, 
    CloudSun, 
    CloudRain, 
    Wind, 
    MoonStar, 
    Disc3, 
    SkipForward, 
    Heart,
    Radio
} from 'lucide-react';

const WeatherOption = ({ icon: Icon, label, selected, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`relative overflow-hidden group w-full aspect-[1.1] rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-3 border ${
            selected 
            ? 'bg-gold-400/10 border-gold-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]' 
            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
        }`}
    >
        <div className={`p-3 rounded-full transition-all duration-300 ${selected ? 'bg-gold-400 text-night-950 scale-110 shadow-lg' : 'bg-white/5 text-white/50 group-hover:text-gold-200 group-hover:bg-white/10'}`}>
            <Icon size={28} strokeWidth={1.5} />
        </div>
        <span className={`text-sm font-medium transition-colors ${selected ? 'text-gold-300' : 'text-white/40 group-hover:text-white/80'}`}>
            {label}
        </span>
    </button>
);

const RadioGame: React.FC = () => {
    const { setPage } = useApp();
    const [step, setStep] = useState<'weather' | 'player' | 'done'>('weather');
    const [weather, setWeather] = useState('');
    const [quoteIndex, setQuoteIndex] = useState(-1);
    const [quoteHistory, setQuoteHistory] = useState<number[]>([]);

    const getRandomQuote = () => {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * RADIO_QUOTES.length);
        } while (quoteHistory.includes(newIndex) && quoteHistory.length < RADIO_QUOTES.length);
        
        setQuoteHistory(prev => [...prev, newIndex]);
        setQuoteIndex(newIndex);
    };

    const handleWeatherSelect = (w: string) => {
        setWeather(w);
        getRandomQuote();
        setStep('player');
    };

    const handleComplete = () => {
        setStep('done');
        setTimeout(() => {
            setPage(Page.Hall);
        }, 2000);
    };

    return (
        <ScreenWrapper className="px-5 py-6">
            <div className="flex items-center mb-2">
                <button onClick={() => setPage(Page.Hall)} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {step === 'weather' && (
                    <motion.div 
                        key="weather"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col h-full"
                    >
                        <div className="mb-8">
                            <h2 className="text-2xl font-serif text-white mb-2">心情电台</h2>
                            <p className="text-white/40 text-sm">选择你现在的状态，接收今日频段</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <WeatherOption icon={Sun} label="晴朗" selected={weather === 'sunny'} onClick={() => handleWeatherSelect('sunny')} />
                            <WeatherOption icon={CloudSun} label="多云" selected={weather === 'cloudy'} onClick={() => handleWeatherSelect('cloudy')} />
                            <WeatherOption icon={CloudRain} label="下雨" selected={weather === 'rainy'} onClick={() => handleWeatherSelect('rainy')} />
                            <WeatherOption icon={Wind} label="起风" selected={weather === 'windy'} onClick={() => handleWeatherSelect('windy')} />
                            <div className="col-span-2">
                                <WeatherOption icon={MoonStar} label="想躲进洞里" selected={weather === 'hide'} onClick={() => handleWeatherSelect('hide')} />
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'player' && (
                    <motion.div 
                        key="player"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col h-full justify-center pb-8"
                    >
                        {/* Player Visualization */}
                        <div className="flex flex-col items-center justify-center flex-1">
                            {/* Vinyl Record Animation */}
                            <div className="relative mb-12">
                                <div className="absolute inset-0 bg-gold-400/20 blur-2xl rounded-full" />
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="relative z-10 p-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm"
                                >
                                    <Disc3 size={180} className="text-gold-400/90" strokeWidth={1} />
                                </motion.div>
                                {/* Center Arm/Dot */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gold-400 rounded-full z-20 flex items-center justify-center shadow-lg border-4 border-black/50">
                                     <div className="w-4 h-4 bg-night-950 rounded-full" />
                                </div>
                            </div>

                            {/* Quote Display */}
                            <div className="w-full relative min-h-[160px] flex items-center justify-center">
                                <AnimatePresence mode="wait">
                                    <motion.div 
                                        key={quoteIndex}
                                        initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                                        className="text-center px-2"
                                    >
                                        <p className="text-xl font-serif text-gold-100 leading-loose drop-shadow-md">
                                            {RADIO_QUOTES[quoteIndex]}
                                        </p>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Audio Wave Visual (Static for aesthetics) */}
                            <div className="flex items-center gap-1 h-8 mt-4 mb-8 opacity-50">
                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1 bg-gold-400 rounded-full"
                                        animate={{ height: [8, 16 + Math.random() * 16, 8] }}
                                        transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="secondary" onClick={getRandomQuote} className="py-4 rounded-2xl">
                                <SkipForward size={18} />
                                换一首
                            </Button>
                            <Button onClick={handleComplete} className="py-4 rounded-2xl">
                                <Heart size={18} className="fill-night-950" />
                                收藏这句
                            </Button>
                        </div>
                        
                        <div className="mt-6 flex items-center justify-center gap-2 text-white/30 text-xs tracking-widest uppercase">
                            <Radio size={12} />
                            <span>FM 92.5 · {USER_NAME} Birthday Radio</span>
                        </div>
                    </motion.div>
                )}

                {step === 'done' && (
                    <motion.div 
                        key="done"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-[60vh] text-center"
                    >
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-24 h-24 bg-gradient-to-tr from-gold-400 to-gold-300 text-night-950 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(251,191,36,0.4)]"
                        >
                            <Sun size={48} />
                        </motion.div>
                        <h3 className="text-xl font-serif text-white mb-2">收听完毕</h3>
                        <p className="text-gold-200/60 font-serif leading-relaxed px-8">
                            无论今天天气如何，<br/>
                            希望你的心里永远是晴天。
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </ScreenWrapper>
    );
};

export default RadioGame;