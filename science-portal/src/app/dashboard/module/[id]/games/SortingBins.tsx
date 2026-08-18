"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitGameScore } from "../../../actions";
import { CheckCircle, XCircle } from "lucide-react";
import { sfx } from "@/lib/audio";

interface Props {
  materialId: number;
  currentHighscore: number;
  gameData?: any;
  onProgressUpdate: (progress: any) => void;
}

type Bin = { id: string; label: string; icon: string; color: string };
type SortItem = { id: string; text: string; binId: string };

export default function SortingBins({ materialId, currentHighscore, gameData, onProgressUpdate }: Props) {
  const [bins, setBins] = useState<Bin[]>([]);
  const [items, setItems] = useState<SortItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{title: string, desc: string, isPass: boolean} | null>(null);

  const [shake, setShake] = useState(false);
  const [animatingId, setAnimatingId] = useState<string | null>(null); // target bin id for animation
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    let rawBins: Bin[] = [];
    let rawItems: SortItem[] = [];

    if (gameData && gameData.sorting_bins && gameData.sorting_bins.bins) {
      const colors = ["border-red-500 bg-red-50 text-red-700", "border-blue-500 bg-blue-50 text-blue-700"];
      rawBins = gameData.sorting_bins.bins.map((b: any, index: number) => ({
        id: b.id,
        label: b.title || b.label || `Keranjang ${index + 1}`,
        icon: "📦",
        color: colors[index % colors.length]
      }));
      rawItems = gameData.sorting_bins.items.map((i: any) => ({
        id: i.id,
        text: i.title || i.text || "Item",
        binId: i.correctBinId || i.binId
      }));
    } else {
      rawBins = [
        { id: "b1", label: "Karnivora", icon: "🍖", color: "border-red-500 bg-red-50 text-red-700" },
        { id: "b2", label: "Herbivora", icon: "🌿", color: "border-green-500 bg-green-50 text-green-700" },
        { id: "b3", label: "Omnivora", icon: "🐻", color: "border-blue-500 bg-blue-50 text-blue-700" }
      ];
      rawItems = [
        { id: "i1", text: "Singa", binId: "b1" },
        { id: "i2", text: "Sapi", binId: "b2" },
        { id: "i3", text: "Beruang", binId: "b3" },
        { id: "i4", text: "Harimau", binId: "b1" },
        { id: "i5", text: "Kambing", binId: "b2" },
        { id: "i6", text: "Ayam", binId: "b3" }
      ];
    }

    setBins(rawBins);
    setItems(rawItems.sort(() => Math.random() - 0.5));
    setQuestionStartTime(Date.now());
  }, [gameData]);

  const handleBinClick = (bin: Bin) => {
    if (animatingId || currentIdx >= items.length) return;

    const currentItem = items[currentIdx];
    const timeTaken = Date.now() - questionStartTime;

    if (currentItem.binId === bin.id) {
      // Correct Bin
      sfx.playCorrect();
      setAnimatingId(bin.id);

      const maxPts = 100 / items.length;
      const basePts = maxPts * 0.7; 
      const bonusPts = maxPts * 0.3; 
      
      const speedMultiplier = Math.max(0, 1 - (timeTaken / 4000)); // 4s for max bonus
      const roundScore = basePts + (bonusPts * speedMultiplier);
      
      setScore(s => s + roundScore);

      setTimeout(() => {
        setAnimatingId(null);
        if (currentIdx + 1 < items.length) {
          setCurrentIdx(prev => prev + 1);
          setQuestionStartTime(Date.now());
        } else {
          finishGame(score + roundScore);
        }
      }, 500); // 500ms animation time to throw item in bin

    } else {
      // Wrong Bin
      sfx.playWrong();
      setShake(true);
      setMistakes(m => m + 1);
      setTimeout(() => setShake(false), 500);
    }
  };

  const finishGame = async (finalScore: number) => {
    setGameOver(true);
    setSubmitting(true);
    
    const normalizedScore = Math.max(0, Math.min(100, Math.round(finalScore)));
    const result = await submitGameScore(materialId, normalizedScore);
    
    if (result.success) {
      if (result.perfect) {
        sfx.playUnlock();
        setResultMsg({ title: "MASTER SORTER!", desc: `Perfect categorization! +${result.addedXp} XP`, isPass: true });
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
    setMistakes(0);
    setGameOver(false);
    setResultMsg(null);
    setCurrentIdx(0);
    setAnimatingId(null);
    setQuestionStartTime(Date.now());
    
    setItems([...items].sort(() => Math.random() - 0.5));
  };

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
    <div className="flex flex-col h-full items-center max-w-4xl mx-auto w-full relative">
      <div className="flex justify-between items-center mb-4 bg-black/5 p-4 rounded-2xl w-full">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Sorting Bins</h2>
          <p className="text-sm opacity-70">Item {currentIdx + 1} of {items.length}</p>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-70 font-bold uppercase tracking-widest">Score</div>
          <div className="text-3xl font-black text-primary">{Math.round(score)}</div>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col justify-center items-center relative mb-8 min-h-[250px]">
        <AnimatePresence mode="popLayout">
          {!animatingId && (
            <motion.div
              key={currentItem.id}
              initial={{ scale: 0, y: -50, opacity: 0 }}
              animate={shake ? { x: [-10, 10, -10, 10, 0] } : { scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0, y: 100, opacity: 0 }} // Fly down into bin
              transition={shake ? { duration: 0.4 } : { type: "spring", bounce: 0.5 }}
              className="bg-white px-12 py-8 rounded-3xl shadow-xl border-4 border-primary/20 text-center relative z-10"
            >
              <h3 className="text-4xl sm:text-5xl font-black text-gray-800">{currentItem.text}</h3>
              <p className="mt-4 text-sm font-bold opacity-50 uppercase tracking-widest text-gray-500">
                Put in the correct bin
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
        {bins.map(bin => {
          const isTarget = animatingId === bin.id;
          return (
            <motion.button
              key={bin.id}
              whileHover={!animatingId ? { scale: 1.05, y: -10 } : {}}
              whileTap={!animatingId ? { scale: 0.95 } : {}}
              onClick={() => handleBinClick(bin)}
              onMouseEnter={() => !animatingId && sfx.playHover()}
              disabled={!!animatingId}
              className={`flex flex-col items-center justify-center p-6 rounded-t-3xl border-4 transition-all ${
                isTarget ? 'scale-110 shadow-2xl z-20 ' + bin.color : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400 opacity-90'
              } ${bin.color.replace('bg-', 'hover:bg-').replace('border-', 'hover:border-').replace('text-', 'hover:text-')}`}
            >
              <div className="text-5xl mb-2">{bin.icon}</div>
              <div className="font-bold text-lg sm:text-xl uppercase tracking-wider">{bin.label}</div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
