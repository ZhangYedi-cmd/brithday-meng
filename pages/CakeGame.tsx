import React, { useMemo, useRef, useReducer, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App';
import { Page, Decoration } from '../types';
import { ScreenWrapper, Button, cn } from '../components/Shared';
import { ArrowLeft, Flame, Sparkles, Ban, Cake as CakeIcon } from 'lucide-react';

// -----------------------------
// Assets
// -----------------------------
const ASSETS = {
  CAKE: 'https://father-1304746462.cos.ap-nanjing.myqcloud.com/father/img/cake_plain_wide.svg',
  CANDLE_BODY: 'https://father-1304746462.cos.ap-nanjing.myqcloud.com/father/img/candle_body.svg',
  FLAME: 'https://father-1304746462.cos.ap-nanjing.myqcloud.com/father/img/flame.svg',
  STRAWBERRY: 'https://father-1304746462.cos.ap-nanjing.myqcloud.com/father/img/strawberry.svg',
  COOKIE_STAR: 'https://father-1304746462.cos.ap-nanjing.myqcloud.com/father/img/cookie_star.svg',
};

const DEBUG_ANCHOR = false;
const MAX_CANDLES = 18;

// -----------------------------
// Types
// -----------------------------
type Step = 'intro' | 'decor' | 'lighting' | 'wishing';
type DecorType = 'candle' | 'strawberry' | 'cookie';

type Decor = Decoration & {
  type: DecorType;
  createdAt: number;
};

interface FlyingWish {
  id: number;
  text: string;
  track: number; // 0..2
}

type State = {
  step: Step;
  decorations: Decor[];
  litCount: number;
  flyingWishes: FlyingWish[];
};

type Action =
  | { type: 'TO_DECOR' }
  | { type: 'ADD_DECOR'; payload: Decor }
  | { type: 'REMOVE_DECOR'; payload: { id: number } }
  | { type: 'TO_LIGHTING' }
  | { type: 'LIGHT_ALL'; payload: { candleCount: number } }
  | { type: 'TO_WISHING' }
  | { type: 'RESET_LIGHTING' }
  | { type: 'DANMU_ADD'; payload: FlyingWish }
  | { type: 'DANMU_REMOVE'; payload: { id: number } };

// -----------------------------
// Copy: Wishes
// -----------------------------

// candles.ts
// 点蜡烛阶段：生活化文案（18句）

export const WISH_TEXTS: string[] = [
  "这一根，给温温柔柔、慢慢生活的大萌 🕯️",
  "这一根，给今天也在认真过日子的萌儿",
  "这一根，给不慌不忙、心里很稳的你",
  "这一根，给穿着 Lululemon、踩着小拖鞋、很自在的阿萌",
  "这一根，给捧着奶茶啵啵、慢慢喝的那个瞬间",
  "这一根，给冰美式第一口下去、清醒又清爽的你",
  "这一根，给嘴上不说、心里却很明白的那份成熟",
  "这一根，给看起来松弛、其实很有力量的温柔",
  "这一根，给灵灵的抹茶小仙女 🧚‍♀️",
  "这一根，给偶尔犯懒、但从不敷衍生活的你",
  "这一根，给情绪来过、但依然向前走的那股韧劲",
  "这一根，给精灵小蜜蜂一样忙碌又可爱的你 🐝",
  "这一根，给懂得照顾别人、也开始照顾自己的大萌",
  "这一根，给慢慢长大、却没有丢掉童心的你",
  "这一根，给不张扬、却很容易被记住的那种存在感",
  "这一根，给今天也值得被奖励一下的你",
  "这一根，给认真生活本身这件事",
  "这一根，偷偷给嘴上嫌弃、心里很软的油炸小肥肠 😋",
];

// 可选：最后一根蜡烛固定收束（如果你想“最后一句”更有仪式感）
export const FINAL_CANDLE_MESSAGE =
  "最后这一根，给今天的你：愿你一直被温柔照亮 ✨";

// -----------------------------
// Decor Catalog
// -----------------------------
const DECOR_CATALOG: Record<
  DecorType,
  { label: string; icon: string; buttonScale: number; render: (lit: boolean) => React.ReactNode }
> = {
  candle: {
    label: '蜡烛',
    icon: ASSETS.CANDLE_BODY,
    buttonScale: 0.8,
    render: (lit) => <Candle lit={lit} />,
  },
  strawberry: {
    label: '草莓',
    icon: ASSETS.STRAWBERRY,
    buttonScale: 1.2,
    render: () => (
      <div className="relative w-10 h-10 pointer-events-none">
        <img
          src={ASSETS.STRAWBERRY}
          alt="Strawberry"
          className="absolute inset-0 w-full h-full object-contain object-bottom drop-shadow-md filter brightness-105"
          draggable={false}
        />
      </div>
    ),
  },
  cookie: {
    label: '星星饼干',
    icon: ASSETS.COOKIE_STAR,
    buttonScale: 1.2,
    render: () => (
      <div className="relative w-9 h-9 pointer-events-none">
        <img
          src={ASSETS.COOKIE_STAR}
          alt="Cookie"
          className="absolute inset-0 w-full h-full object-contain object-bottom drop-shadow-md"
          draggable={false}
        />
      </div>
    ),
  },
};

// -----------------------------
// Reducer
// -----------------------------
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'TO_DECOR':
      return { ...state, step: 'decor' };

    case 'ADD_DECOR':
      return { ...state, decorations: [...state.decorations, action.payload] };

    case 'REMOVE_DECOR':
      if (state.step !== 'decor') return state;
      return { ...state, decorations: state.decorations.filter((d) => d.id !== action.payload.id) };

    case 'TO_LIGHTING':
      return { ...state, step: 'lighting' };

    case 'RESET_LIGHTING':
      return { ...state, litCount: 0 };

    case 'LIGHT_ALL':
      if (state.step !== 'lighting') return state;
      return { ...state, litCount: action.payload.candleCount };

    case 'DANMU_ADD':
      return { ...state, flyingWishes: [...state.flyingWishes, action.payload] };

    case 'DANMU_REMOVE':
      return { ...state, flyingWishes: state.flyingWishes.filter((w) => w.id !== action.payload.id) };

    case 'TO_WISHING':
      return { ...state, step: 'wishing' };

    default:
      return state;
  }
}

// -----------------------------
// Placement engine
// -----------------------------
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function randomPointInEllipse(cx: number, cy: number, rX: number, rY: number) {
  const angle = Math.random() * Math.PI * 2;
  const rr = Math.sqrt(Math.random());
  return {
    x: cx + rr * rX * Math.cos(angle),
    y: cy + rr * rY * Math.sin(angle),
  };
}

function computePlacement(areaW: number, areaH: number) {
  const baseX = areaW * 0.5;
  const baseY = areaH * 0.68;

  const rX = areaW * 0.26;
  const rY = areaH * 0.08;

  const p = randomPointInEllipse(baseX, baseY, rX, rY);

  return {
    x: clamp(p.x, areaW * 0.22, areaW * 0.78),
    y: clamp(p.y, areaH * 0.52, areaH * 0.80),
  };
}

// -----------------------------
// Candle (visual)
// -----------------------------
const Candle: React.FC<{ lit: boolean }> = ({ lit }) => {
  const FLAME_WIDTH_PX = 32;
  const FLAME_TOP_PX = 10;
  const FLAME_Y_SHIFT_PX = -26;

  return (
    <div className="relative w-10 h-28 pointer-events-none">
      <img
        src={ASSETS.CANDLE_BODY}
        alt="Candle"
        className="absolute inset-0 w-full h-full object-contain object-bottom drop-shadow-xl"
        draggable={false}
      />

      <AnimatePresence>
        {lit && (
          <motion.div
            key="flame"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: [1, 1.06, 0.98, 1] }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute z-40 pointer-events-none origin-bottom"
            style={{
              left: '50%',
              top: FLAME_TOP_PX,
              width: FLAME_WIDTH_PX,
              transform: `translate(-50%, ${FLAME_Y_SHIFT_PX}px)`,
            }}
          >
            <img
              src={ASSETS.FLAME}
              alt="Flame"
              className="w-full h-full drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]"
              draggable={false}
            />
            <div className="absolute inset-0 top-1/4 bg-gold-400/50 blur-xl rounded-full animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// -----------------------------
// Danmu
// -----------------------------
const DanmuItem: React.FC<{ wish: FlyingWish; onComplete: () => void }> = ({ wish, onComplete }) => {
  const topPercent = 10 + wish.track * 15;
  return (
    <motion.div
      initial={{ x: '120%' }}
      animate={{ x: '-150%' }}
      transition={{ duration: 5, ease: 'linear' }}
      onAnimationComplete={onComplete}
      className="absolute left-0 w-full pointer-events-none z-50 whitespace-nowrap"
      style={{ top: `${topPercent}%` }}
    >
      <div className="inline-block bg-black/40 backdrop-blur-md px-5 py-2 rounded-full border border-gold-400/20 text-gold-100 font-serif text-lg shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
        {wish.text}
      </div>
    </motion.div>
  );
};

// -----------------------------
// Main
// -----------------------------
const CakeGame: React.FC = () => {
  const { setPage, markCompleted, completed } = useApp();
  const cakeAreaRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [state, dispatch] = useReducer(reducer, {
    step: 'intro',
    decorations: [],
    litCount: 0,
    flyingWishes: [],
  });

  // Intro Timer
  useEffect(() => {
    if (state.step === 'intro') {
        const timer = setTimeout(() => {
            dispatch({ type: 'TO_DECOR' });
        }, 2500);
        return () => clearTimeout(timer);
    }
  }, [state.step]);

  const candleDecorations = useMemo(
    () => state.decorations.filter((d) => d.type === 'candle'),
    [state.decorations]
  );
  const candleCount = candleDecorations.length;

  const candleIndexMap = useMemo(() => {
    const m = new Map<number, number>();
    candleDecorations.forEach((d, idx) => m.set(d.id, idx));
    return m;
  }, [candleDecorations]);

  const sortedDecorations = useMemo(() => {
    return [...state.decorations].sort((a, b) => (a.y - b.y) || (a.createdAt - b.createdAt));
  }, [state.decorations]);

  const pushWishDanmu = () => {
    const id = Date.now() + Math.floor(Math.random() * 100000);
    const nextIndex = candleCount; 
    const text = WISH_TEXTS[nextIndex % WISH_TEXTS.length];
    const track = nextIndex % 3;

    dispatch({ type: 'DANMU_ADD', payload: { id, text, track } });
  };

  const addDecor = (type: DecorType) => {
    if (type === 'candle' && candleCount >= MAX_CANDLES) {
        setToast("大萌永远18岁 🎂");
        setTimeout(() => setToast(null), 2500);
        return;
    }

    const rect = cakeAreaRef.current?.getBoundingClientRect();
    const w = rect?.width ?? 320;
    const h = rect?.height ?? 180;

    const { x, y } = computePlacement(w, h);

    const now = Date.now();
    const id = now + Math.floor(Math.random() * 100000);

    const newDecor: Decor = {
      id,
      type,
      x,
      y,
      createdAt: now,
    };

    dispatch({ type: 'ADD_DECOR', payload: newDecor });

    if (type === 'candle') {
      pushWishDanmu();
    }
  };

  const removeDecor = (id: number) => {
    dispatch({ type: 'REMOVE_DECOR', payload: { id } });
  };

  const toLighting = () => {
    dispatch({ type: 'RESET_LIGHTING' });
    dispatch({ type: 'TO_LIGHTING' });
  };

  const lightAll = () => {
    dispatch({ type: 'LIGHT_ALL', payload: { candleCount } });
  };

  const blowCandles = () => {
    dispatch({ type: 'TO_WISHING' });
    setTimeout(() => {
      markCompleted('cake');
      setPage(Page.Hall);
    }, 3500);
  };

  const isLastGame = completed.post && completed.starBottle;

  return (
    <ScreenWrapper className="px-5 py-6 overflow-hidden relative">
      <AnimatePresence>
        {toast && (
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="absolute top-24 left-1/2 -translate-x-1/2 z-[60] bg-gold-400/90 text-night-950 px-6 py-3 rounded-full shadow-[0_4px_20px_rgba(251,191,36,0.4)] backdrop-blur-md flex items-center gap-2 whitespace-nowrap"
            >
                <Ban size={18} className="text-red-900" />
                <span className="font-serif font-bold text-sm">{toast}</span>
            </motion.div>
        )}
        
        {/* Intro Overlay */}
        {state.step === 'intro' && (
            <motion.div 
                key="intro"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-night-950/90 backdrop-blur-sm cursor-pointer"
                onClick={() => dispatch({ type: 'TO_DECOR' })}
            >
                    <motion.div
                    initial={{ scale: 0.9, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center px-6"
                >
                    <div className="w-20 h-20 mx-auto bg-gold-400/10 rounded-full flex items-center justify-center mb-8 border border-gold-400/20 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
                        <CakeIcon className="text-gold-300 w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-serif text-white mb-6 tracking-wide">亲手做一个独一无二的蛋糕</h2>
                    <div className="space-y-4 text-gold-100/60 font-light text-sm tracking-widest leading-loose">
                        <p>插满 {MAX_CANDLES} 根蜡烛，许个愿</p>
                        <p>呼气吹灭～ 🕯️</p>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center mb-4 z-10 relative">
        <button
          onClick={() => setPage(Page.Hall)}
          className="p-2 -ml-2 text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="ml-4 text-xl font-serif text-white">
          {state.step === 'intro' || state.step === 'decor'
            ? `让我们来DIY一个蛋糕吧 (需插满${MAX_CANDLES}根)`
            : state.step === 'lighting'
              ? '点亮生日蜡烛'
              : '许个愿吧'}
        </h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px] select-none mt-12">
        <div className="relative w-80 h-auto flex flex-col items-center justify-end">
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            src={ASSETS.CAKE}
            alt="Birthday Cake"
            className="w-full relative z-10 drop-shadow-2xl"
            draggable={false}
          />

          <div ref={cakeAreaRef} className="absolute top-[15%] left-0 w-full h-[60%] z-20">
            {state.step === 'decor' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-white/5 rounded-[50%] opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center border border-white/10">
                <span className="text-white/40 text-[10px] font-medium tracking-widest bg-black/20 px-2 rounded-full backdrop-blur-sm">
                  点击按钮放置装饰
                </span>
              </div>
            )}

            <AnimatePresence>
              {sortedDecorations.map((d) => {
                const candleIndex = d.type === 'candle' ? (candleIndexMap.get(d.id) ?? -1) : -1;
                const isLit =
                  d.type === 'candle' &&
                  state.step !== 'decor' &&
                  state.step !== 'intro' &&
                  candleIndex >= 0 &&
                  candleIndex < state.litCount;

                const zIndex = Math.floor(d.y) + 30;

                return (
                  <motion.div
                    key={d.id}
                    layoutId={`decor-${d.id}`}
                    initial={{ opacity: 0, scale: 0.6, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    className="absolute"
                    style={{
                      left: d.x,
                      top: d.y,
                      zIndex,
                      translate: '-50% -100%', 
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDecor(d.id);
                    }}
                  >
                    {DEBUG_ANCHOR && (
                      <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 z-[999]" />
                    )}

                    <motion.div
                      className={cn(
                        'cursor-pointer hover:brightness-110 transition-all',
                        state.step !== 'decor' ? 'cursor-default' : ''
                      )}
                      whileHover={state.step === 'decor' ? { scale: 1.08 } : undefined}
                      whileTap={state.step === 'decor' ? { scale: 0.92 } : undefined}
                    >
                      {DECOR_CATALOG[d.type].render(!!isLit)}
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {state.step !== 'wishing' &&
            state.flyingWishes.map((wish) => (
              <DanmuItem
                key={wish.id}
                wish={wish}
                onComplete={() => dispatch({ type: 'DANMU_REMOVE', payload: { id: wish.id } })}
              />
            ))}
        </AnimatePresence>

        {state.step === 'wishing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-50 rounded-xl"
          >
            <Sparkles className="w-16 h-16 text-gold-400 mb-6 animate-pulse" />
            <p className="text-gold-100 text-2xl font-serif mb-2">生日愿望已许下</p>
            <p className="text-white/50 text-sm">愿你所得皆所期</p>
            {isLastGame && (
                <p className="text-gold-300 text-sm mt-4 animate-pulse font-serif">快去领取最终的礼物吧～</p>
            )}
          </motion.div>
        )}
      </div>

      {/* Control Panel */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl relative z-30">
        {(state.step === 'decor' || state.step === 'intro') ? (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {(Object.keys(DECOR_CATALOG) as DecorType[]).map((type) => {
                const item = DECOR_CATALOG[type];
                return (
                  <button
                    key={type}
                    onClick={() => addDecor(type)}
                    className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all active:scale-95 border border-white/5 group"
                  >
                    <div className="h-8 flex items-center justify-center">
                      <img
                        src={item.icon}
                        alt={item.label}
                        className="h-full w-auto object-contain drop-shadow-sm group-hover:scale-110 transition-transform"
                        style={{ transform: `scale(${item.buttonScale})` }}
                        draggable={false}
                      />
                    </div>
                    <span className="text-[10px] text-white/60">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <Button
              fullWidth
              disabled={candleCount < MAX_CANDLES}
              onClick={toLighting}
              className={cn(candleCount < MAX_CANDLES ? 'opacity-50' : '')}
            >
              {candleCount < MAX_CANDLES 
                ? `请插满 ${MAX_CANDLES} 根蜡烛 (${candleCount}/${MAX_CANDLES})` 
                : '插好了，去点亮'}
            </Button>
          </>
        ) : state.step === 'lighting' ? (
          <div className="flex flex-col gap-4">
            {state.litCount < candleCount ? (
              <Button fullWidth onClick={lightAll} className="text-lg py-4">
                <Flame className="mr-2 fill-current" size={20} />
                一键点亮全部蜡烛
              </Button>
            ) : (
              <Button
                fullWidth
                onMouseDown={blowCandles}
                onTouchStart={blowCandles}
                className="bg-gradient-to-r from-gold-400 to-orange-400 text-night-950 font-bold text-lg py-4 shadow-[0_0_20px_rgba(251,191,36,0.4)] animate-pulse"
              >
                呼气～吹灭蜡烛 🌬️
              </Button>
            )}
            <p className="text-center text-xs text-white/40">
              {state.litCount < candleCount ? '准备好了吗？一口气点亮所有心愿' : '长按按钮许愿吹灭'}
            </p>
          </div>
        ) : (
          <div className="h-16" />
        )}
      </div>
    </ScreenWrapper>
  );
};

export default CakeGame;