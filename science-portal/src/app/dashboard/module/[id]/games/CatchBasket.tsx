"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitGameScore } from "../../../actions";
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, ShoppingBasket, Heart } from "lucide-react";
import { sfx } from "@/lib/audio";

interface Props {
  materialId: number;
  currentHighscore: number;
  gameData?: any;
  onProgressUpdate: (progress: any) => void;
}

type DropItem = { id: string; text: string; isTarget: boolean; lane: number };

export default function CatchBasket({ materialId, currentHighscore, gameData, onProgressUpdate }: Props) {
  const [targetCategory, setTargetCategory] = useState("");
  const [items, setItems] = useState<DropItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  const [basketLane, setBasketLane] = useState(1); // 0: left, 1: center, 2: right
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{title: string, desc: string, isPass: boolean} | null>(null);

  const [itemKey, setItemKey] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(Date.now());

  useEffect(() => {
    let rawCategory = "";
    let rawItems: { text: string; isTarget: boolean }[] = [];

    if (gameData && gameData.catch_basket && gameData.catch_basket.items) {
      rawCategory = gameData.catch_basket.targetCategory;
      rawItems = gameData.catch_basket.items;
    } else {
      rawCategory = "Hewan Herbivora";
      rawItems = [
        { text: "Sapi", isTarget: true },
        { text: "Kambing", isTarget: true },
        { text: "Kuda", isTarget: true },
        { text: "Singa", isTarget: false },
        { text: "Harimau", isTarget: false },
        { text: "Gajah", isTarget: true },
        { text: "Hiu", isTarget: false },
        { text: "Jerapah", isTarget: true },
      ];
    }

    setTargetCategory(rawCategory);

    // Generate lanes
    const generated: DropItem[] = rawItems.map((item, i) => ({
      ...item,
      id: `drop-${i}`,
      lane: Math.floor(Math.random() * 3) // 0, 1, or 2
    }));

    setItems(generated.sort(() => Math.random() - 0.5));
    setGameStartTime(Date.now());
  }, [gameData]);

  const handleItemLanded = (itemLane: number, isTarget: boolean) => {
    if (gameOver) return;
    
    const caught = basketLane === itemLane;
    
    if (caught) {
      if (isTarget) {
        // Caught a good item
        sfx.playCorrect();
        setScore(s => s + (100 / items.filter(i => i.isTarget).length));
      } else {
        // Caught a bad item (bomb/poison)
        sfx.playWrong();
        setLives(l => l - 1);
      }
    } else {
      if (isTarget) {
        // Missed a good item
        sfx.playWrong();
        setLives(l => l - 1);
      } else {
        // Successfully ignored a bad item
        sfx.playHover(); // small tick
      }
    }

    setTimeout(() => {
      if (lives - (caught && !isTarget || !caught && isTarget ? 1 : 0) <= 0) {
        finishGame(score);
      } else if (currentIdx + 1 < items.length) {
        setCurrentIdx(prev => prev + 1);
        setItemKey(prev => prev + 1);
      } else {
        finishGame(score + (caught && isTarget ? (100 / items.filter(i => i.isTarget).length) : 0));
      }
    }, 100);
  };

  const finishGame = async (finalScore: number) => {
    setGameOver(true);
    setSubmitting(true);
    
    const normalizedScore = Math.max(0, Math.min(100, Math.round(finalScore)));
    const result = await submitGameScore(materialId, normalizedScore);
    
    if (result.success) {
      if (result.perfect) {
        sfx.playUnlock();
        setResultMsg({ title: "MASTER CATCHER!", desc: `Perfect run! +${result.addedXp} XP`, isPass: true });
      } else if (result.passed) {
        sfx.playAchievement();
        setResultMsg({ title: "Great Job!", desc: `You passed with ${normalizedScore} points. +${result.addedXp} XP`, isPass: true });
      } else {
        sfx.playWrong();
        setResultMsg({ 
          title: "Try Again", 
          desc: result.locked 
            ? "You missed too many times. Take a break and review the theory (Locked for 5 mins)." 
            : `You got ${normalizedScore} points. You need 70 to pass.`, 
          isPass: false 
        });
      }
      
      onProgressUpdate({
        highscore: result.newHighscore,
        consecutive_fails: result.locked ? 3 : 0,
        locked_until: result.locked ? new Date(Date.now() + 5 * 60000).toISOString() : null,
        addedXp: result.addedXp || 0,
      });
    }
    setSubmitting(false);
  };

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setResultMsg(null);
    setCurrentIdx(0);
    setLives(3);
    setBasketLane(1);
    setItemKey(prev => prev + 1);
    setGameStartTime(Date.now());
    
    setItems([...items].map(i => ({ ...i, lane: Math.floor(Math.random() * 3) })).sort(() => Math.random() - 0.5));
  };

  // Keydown listener for arrow keys
  useEffect(() => {
    if (gameOver) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setBasketLane(prev => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setBasketLane(prev => Math.min(2, prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver]);

  if (gameOver) {
    if (submitting) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-full">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-2xl font-bold opacity-70">Calculating your score...</h2>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6">
          {resultMsg?.isPass ? <CheckCircle className="w-24 h-24 text-green-500" /> : <XCircle className="w-24 h-24 text-red-500" />}
        </motion.div>
        <h2 className="text-3xl font-black mb-2" style={{ fontFamily: "var(--font-heading)" }}>{resultMsg?.title}</h2>
        <p className="text-xl opacity-80 mb-8">{resultMsg?.desc}</p>
        <p className="text-sm opacity-60 mb-8">Current Highscore: {Math.round(Math.max(currentHighscore, score))}</p>
        {!resultMsg?.isPass && !resultMsg?.desc.includes("Locked") && (
          <button onClick={() => { sfx.playClick(); resetGame(); }} onMouseEnter={() => sfx.playHover()} className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg">
            Play Again
          </button>
        )}
      </div>
    );
  }

  if (items.length === 0) return null;

  const currentItem = items[currentIdx];

  return (
    <div className="flex flex-col h-[85vh] min-h-[600px] items-center max-w-4xl mx-auto w-full relative">
      <div className="flex justify-between items-center mb-4 bg-black/5 p-4 rounded-2xl w-full z-10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <ShoppingBasket className="w-6 h-6" /> Catch the Basket
          </h2>
          <p className="text-sm opacity-70">Catch ONLY: <span className="font-bold underline text-primary">{targetCategory}</span></p>
        </div>
        
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <motion.div key={i} animate={i >= lives ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}>
              <Heart className={`w-6 h-6 sm:w-8 sm:h-8 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} />
            </motion.div>
          ))}
        </div>

        <div className="text-right">
          <div className="text-sm opacity-70 font-bold uppercase tracking-widest">Score</div>
          <div className="text-3xl font-black text-primary">{Math.round(score)}</div>
        </div>
      </div>

      <div className="flex-1 w-full bg-blue-50/50 dark:bg-slate-900 rounded-3xl relative overflow-hidden shadow-inner border-4 border-blue-100 flex">
        
        {/* 3 Lanes background */}
        <div className="flex-1 border-r border-dashed border-blue-200/50" onClick={() => setBasketLane(0)}></div>
        <div className="flex-1 border-r border-dashed border-blue-200/50" onClick={() => setBasketLane(1)}></div>
        <div className="flex-1" onClick={() => setBasketLane(2)}></div>

        {/* Falling Item */}
        {currentItem && (
          <motion.div
            key={`drop-${itemKey}`}
            initial={{ top: "-20%", left: `${(currentItem.lane * 33.33) + 16.66}%` }}
            animate={{ top: "85%" }}
            transition={{ duration: Math.max(1.5, 3 - (currentIdx * 0.1)), ease: "linear" }}
            onAnimationComplete={(def: any) => {
              if (def && def.top === "85%") {
                handleItemLanded(currentItem.lane, currentItem.isTarget);
              }
            }}
            className="absolute -translate-x-1/2 z-10"
          >
            <div className={`px-4 sm:px-8 py-3 sm:py-6 rounded-2xl shadow-xl border-4 font-black text-xl sm:text-2xl text-center
              ${currentItem.isTarget ? 'bg-white border-green-400 text-green-700' : 'bg-red-50 border-red-400 text-red-700'}`}
            >
              {currentItem.text}
            </div>
          </motion.div>
        )}

        {/* Basket */}
        <motion.div
          className="absolute bottom-4 w-1/3 flex justify-center z-20 transition-all duration-150"
          animate={{ left: `${basketLane * 33.33}%` }}
        >
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-orange-200 border-4 border-orange-400 rounded-b-3xl rounded-t-lg shadow-lg flex flex-col items-center justify-end pb-4 relative">
            <div className="absolute top-0 left-0 right-0 h-4 bg-orange-400 rounded-t-lg opacity-50"></div>
            <ShoppingBasket className="w-12 h-12 text-orange-600 opacity-50" />
          </div>
        </motion.div>
      </div>
      
      {/* Mobile Controls */}
      <div className="w-full mt-4 flex justify-between gap-4 z-20">
        <button 
          onClick={() => setBasketLane(prev => Math.max(0, prev - 1))}
          className="flex-1 py-4 bg-white/80 border-4 border-gray-200 rounded-2xl flex justify-center active:bg-gray-200"
        >
          <ArrowLeft className="w-8 h-8 text-gray-600" />
        </button>
        <button 
          onClick={() => setBasketLane(prev => Math.min(2, prev + 1))}
          className="flex-1 py-4 bg-white/80 border-4 border-gray-200 rounded-2xl flex justify-center active:bg-gray-200"
        >
          <ArrowRight className="w-8 h-8 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
