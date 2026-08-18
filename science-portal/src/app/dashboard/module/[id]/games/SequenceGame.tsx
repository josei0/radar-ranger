"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitGameScore } from "../../../actions";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { sfx } from "@/lib/audio";

interface Props {
  materialId: number;
  currentHighscore: number;
  gameData?: any;
  onProgressUpdate: (progress: any) => void;
}

type SequenceItem = { id: string; label: string; icon: string };

export default function SequenceGame({ materialId, currentHighscore, gameData, onProgressUpdate }: Props) {
  const [correctSequence, setCorrectSequence] = useState<SequenceItem[]>([]);
  const [shuffledItems, setShuffledItems] = useState<SequenceItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SequenceItem[]>([]);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{title: string, desc: string, isPass: boolean} | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);

  useEffect(() => {
    if (gameData && gameData.sequence && gameData.sequence.length > 0) {
      const seq = gameData.sequence.map((item: any, index: number) => ({
        id: item.id?.toString() || index.toString(),
        label: item.content || item.label || "",
        icon: item.icon || ""
      }));
      setCorrectSequence(seq);
      setShuffledItems([...seq].sort(() => Math.random() - 0.5));
    } else {
      // Fallback
      const seq = [
        { id: "1", label: "First", icon: "1️⃣" },
        { id: "2", label: "Second", icon: "2️⃣" },
        { id: "3", label: "Third", icon: "3️⃣" }
      ];
      setCorrectSequence(seq);
      setShuffledItems([...seq].sort(() => Math.random() - 0.5));
    }
  }, [gameData]);

  const handleItemClick = (item: SequenceItem) => {
    // If already selected, ignore
    if (selectedItems.find(i => i.id === item.id)) return;

    const expectedIndex = selectedItems.length;
    const expectedItem = correctSequence[expectedIndex];

    if (item.id === expectedItem.id) {
      // Correct!
      sfx.playClick(); // or playCorrect if we want it for every step, but click is less annoying for a sequence
      const newSelected = [...selectedItems, item];
      setSelectedItems(newSelected);
      
      const newScore = score + (100 / correctSequence.length);
      setScore(newScore);

      if (newSelected.length === correctSequence.length) {
        sfx.playCorrect();
        finishGame(newScore);
      }
    } else {
      // Incorrect!
      sfx.playWrong();
      setMistakes(m => m + 1);
      setScore(s => Math.max(0, s - 5));
      setShakeId(item.id);
      setTimeout(() => setShakeId(null), 500);
    }
  };

  const finishGame = async (finalScore: number) => {
    setGameOver(true);
    setSubmitting(true);
    
    // Normalize score (max 100)
    const normalizedScore = Math.max(0, Math.min(100, Math.round(finalScore)));
    
    const result = await submitGameScore(materialId, normalizedScore);
    
    if (result.success) {
      if (result.perfect) {
        sfx.playUnlock();
        setResultMsg({ title: "PERFECT!", desc: `You got the correct order without mistakes! +${result.addedXp} XP`, isPass: true });
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
    setSelectedItems([]);
    setScore(0);
    setMistakes(0);
    setGameOver(false);
    setResultMsg(null);
    setShuffledItems([...correctSequence].sort(() => Math.random() - 0.5));
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
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-6"
        >
          {resultMsg?.isPass ? (
            <CheckCircle className="w-24 h-24 text-green-500" />
          ) : (
            <XCircle className="w-24 h-24 text-red-500" />
          )}
        </motion.div>
        
        <h2 className="text-3xl font-black mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          {resultMsg?.title}
        </h2>
        <p className="text-xl opacity-80 mb-8">{resultMsg?.desc}</p>
        
        <p className="text-sm opacity-60 mb-8">
          Current Highscore: {Math.round(Math.max(currentHighscore, score))}
        </p>

        {!resultMsg?.isPass && !resultMsg?.desc.includes("Locked") && (
          <button 
            onClick={() => { sfx.playClick(); resetGame(); }}
            onMouseEnter={() => sfx.playHover()}
            className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg"
          >
            Play Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-8 bg-black/5 p-4 rounded-2xl">
        <div>
          <h2 className="text-2xl font-bold">Sequence Order</h2>
          <p className="text-sm opacity-70">Select the items in the correct order!</p>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-70 font-bold uppercase tracking-widest">Score</div>
          <div className="text-3xl font-black text-primary">{Math.round(score)}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-8">
        {/* Target Sequence Display */}
        <div className="bg-black/5 dark:bg-white/5 p-6 rounded-3xl border border-black/10 dark:border-white/10">
          <h3 className="font-bold text-center opacity-50 uppercase tracking-widest mb-6">Correct Sequence</h3>
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
            {correctSequence.map((item, idx) => {
              const isSelected = selectedItems.length > idx;
              const selectedItem = isSelected ? selectedItems[idx] : null;

              return (
                <div key={item.id} className="flex items-center">
                  <div className={`w-20 h-24 sm:w-28 sm:h-32 flex flex-col items-center justify-center rounded-2xl border-2 transition-all ${
                    isSelected ? 'bg-primary text-white border-primary shadow-lg' : 'border-dashed border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                        <span className="text-3xl mb-2">{selectedItem?.icon}</span>
                        <span className="text-xs font-bold text-center px-1 leading-tight">{selectedItem?.label}</span>
                      </motion.div>
                    ) : (
                      <span className="text-2xl opacity-20 font-black">{idx + 1}</span>
                    )}
                  </div>
                  {idx < correctSequence.length - 1 && (
                    <div className="px-2 opacity-30">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Available Options */}
        <div>
          <h3 className="font-bold text-center opacity-50 uppercase tracking-widest mb-6">Select Next Item</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <AnimatePresence>
              {shuffledItems.map((item) => {
                const isSelected = selectedItems.find(i => i.id === item.id);
                if (isSelected) return null;

                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      x: shakeId === item.id ? [-10, 10, -10, 10, 0] : 0 
                    }}
                    transition={{ duration: shakeId === item.id ? 0.4 : 0.2 }}
                    exit={{ opacity: 0, scale: 0 }}
                    onClick={() => { handleItemClick(item); }}
                    onMouseEnter={() => sfx.playHover()}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      shakeId === item.id 
                        ? 'border-red-500 bg-red-50 dark:bg-red-500/10' 
                        : 'bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 hover:border-primary/50 hover:shadow-md'
                    }`}
                  >
                    <span className="text-4xl mb-3">{item.icon}</span>
                    <span className="font-bold text-sm text-center">{item.label}</span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
