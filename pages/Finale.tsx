import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { useApp } from '../App';
import { Page } from '../types';
import { FINALE_MESSAGE, USER_NAME } from '../constants';
import { ScreenWrapper, GlassCard, Button } from '../components/Shared';
import { Download, RefreshCw } from 'lucide-react';

const Finale: React.FC = () => {
    const { setPage } = useApp();
    const cardRef = useRef<HTMLDivElement>(null);
    const dateStr = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');

    const handleSave = async () => {
        if (cardRef.current) {
            try {
                const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
                const link = document.createElement('a');
                link.download = `${USER_NAME}-birthday-card.png`;
                link.href = dataUrl;
                link.click();
            } catch (err) {
                console.error('Failed to save image', err);
                alert("保存失败，请手动截图哦");
            }
        }
    };

    return (
        <ScreenWrapper className="px-5 py-8 justify-center min-h-[100dvh]">
             <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
             >
                <h2 className="text-center text-2xl font-serif text-white mb-2">今天的你，值得被偏爱</h2>
                <p className="text-center text-gold-200/50 text-xs mb-8">三份礼物已全部拆完</p>

                {/* The Card to be Saved */}
                <div className="mb-8 p-1 bg-white/5 rounded-2xl">
                    <div 
                        ref={cardRef} 
                        className="bg-gradient-to-br from-[#1a1f35] to-[#0f1225] p-8 rounded-xl border border-gold-400/20 shadow-2xl relative overflow-hidden text-center"
                    >
                        {/* Decorative elements for the image */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold-400/10 rounded-full blur-2xl" />
                        
                        <h3 className="text-3xl mb-8 mt-4">✨</h3>
                        
                        <div className="text-gold-100 font-serif leading-loose text-lg whitespace-pre-line mb-12 opacity-90">
                            {FINALE_MESSAGE}
                        </div>

                        <div className="flex justify-between items-end text-xs text-gold-200/40 font-mono border-t border-white/10 pt-4">
                            <span>From: 业頔</span>
                            <span>{dateStr}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Button fullWidth onClick={handleSave}>
                        <Download size={18} />
                        保存这张卡
                    </Button>
                    <Button fullWidth variant="secondary" onClick={() => setPage(Page.Hall)}>
                        <RefreshCw size={18} />
                        再看一次三份礼物
                    </Button>
                </div>
                
                <p className="text-center text-white/20 text-xs mt-6">今天你最大。</p>
             </motion.div>
        </ScreenWrapper>
    );
};

export default Finale;