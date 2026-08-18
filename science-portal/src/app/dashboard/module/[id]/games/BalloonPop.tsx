"use client";

import { useState, useEffect, useRef } from "react";
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

type PopItem = { id: string; text: string; isTarget: boolean; x: number; y: number; delay: number; popped: boolean };

export default function BalloonPop({ materialId, currentHighscore, gameData, onProgressUpdate }: Props) {
  const [targetCategory, setTargetCategory] = useState("");
  const [balloons, setBalloons] = useState<PopItem[]>([]);
  
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{title: string, desc: string, isPass: boolean} | null>(null);

  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rawCategory = "";
    let rawItems: { text: string; isTarget: boolean }[] = [];

    if (gameData && gameData.balloon_pop && gameData.balloon_pop.items) {
      rawCategory = gameData.balloon_pop.targetCategory;
      rawItems = gameData.balloon_pop.items;
    } else {
      rawCategory = "Hewan Karnivora";
      rawItems = [
        { text: "Singa", isTarget: true },
        { text: "Harimau", isTarget: true },
        { text: "Serigala", isTarget: true },
        { text: "Sapi", isTarget: false },
        { text: "Kambing", isTarget: false },
        { text: "Kuda", isTarget: false },
        { text: "Gajah", isTarget: false },
        { text: "Hiu", isTarget: true },
        { text: "Elang", isTarget: true },
        { text: "Ayam", isTarget: false },
      ];
    }

    setTargetCategory(rawCategory);

    // Generate positions (0 to 100 for percentage)
    const generated: PopItem[] = rawItems.map((item, i) => ({
      ...item,
      id: `b-${i}`,
      x: 10 + Math.random() * 80, // 10% to 90%
      y: 10 + Math.random() * 70, // 10% to 80%
      delay: Math.random() * 2,
      popped: false
    }));

    setBalloons(generated);
    setGameStartTime(Date.now());
  }, [gameData]);

  const handlePop = (balloon: PopItem) => {
    if (balloon.popped) return;

    if (balloon.isTarget) {
      sfx.playCorrect();
      setBalloons(prev => prev.map(b => b.id === balloon.id ? { ...b, popped: true } : b));
      
      const totalTargets = balloons.filter(b => b.isTarget).length;
      const pts = 100 / totalTargets;
      setScore(s => s + pts);

      // Check win condition
      const poppedCount = balloons.filter(b => b.isTarget && b.popped).length + 1;
      if (poppedCount >= totalTargets) {
        const timeTaken = Date.now() - gameStartTime;
        const speedBonus = Math.max(0, 1 - (timeTaken / 20000)) * 20; // up to 20 bonus points for under 20s
        setTimeout(() => finishGame(score + pts + speedBonus), 500);
      }
    } else {
      sfx.playWrong();
      setMistakes(m => m + 1);
      setScore(s => Math.max(0, s - 5)); // penalty
      // Don't pop it, or maybe pop it with a red color? Let's just shake it visually
      // For simplicity, we just deduct score.
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
        setResultMsg({ title: "SHARPSHOOTER!", desc: `You popped them all perfectly! +${result.addedXp} XP`, isPass: true });
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
    setGameStartTime(Date.now());
    
    setBalloons(prev => prev.map(b => ({
      ...b,
      popped: false,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 70,
    })));
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

  return (
    <div className="flex flex-col h-[700px] max-h-[80vh] items-center max-w-5xl mx-auto w-full relative select-none">
      <div className="flex justify-between items-center mb-4 bg-white/80 backdrop-blur-sm p-4 rounded-3xl w-full z-10 shadow-sm border border-gray-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Balloon Pop</h2>
          <p className="text-sm sm:text-lg opacity-80">
            Pop all <span className="font-black text-primary underline decoration-wavy">{targetCategory}</span>!
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-70 font-bold uppercase tracking-widest">Score</div>
          <div className="text-3xl font-black text-primary">{Math.round(score)}</div>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 w-full bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl relative overflow-hidden border-2 border-dashed border-blue-200">
        <AnimatePresence>
          {balloons.map(balloon => {
            if (balloon.popped) return null;
            
            return (
              <motion.button
                key={balloon.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  y: ["0%", "-15%", "0%", "15%", "0%"],
                  x: ["0%", "5%", "0%", "-5%", "0%"]
                }}
                exit={{ scale: 2, opacity: 0, filter: "blur(10px)" }} // Popping animation
                transition={{ 
                  scale: { type: "spring", bounce: 0.5 },
                  opacity: { duration: 0.2 },
                  y: { repeat: Infinity, duration: 4 + Math.random() * 2, ease: "easeInOut", delay: balloon.delay },
                  x: { repeat: Infinity, duration: 3 + Math.random() * 2, ease: "easeInOut", delay: balloon.delay }
                }}
                onClick={() => handlePop(balloon)}
                style={{ 
                  left: `${balloon.x}%`, 
                  top: `${balloon.y}%`,
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)'
                }}
                className={`flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 shadow-xl font-bold text-center p-2 leading-tight transition-colors focus:outline-none ${
                  balloon.isTarget 
                    ? 'bg-gradient-to-br from-blue-300 to-primary border-white text-white hover:brightness-110' 
                    : 'bg-gradient-to-br from-orange-300 to-red-400 border-white text-white hover:brightness-110'
                }`}
              >
                {balloon.text}
              </motion.button>
            );
          })}
        </AnimatePresence>

        {balloons.filter(b => !b.popped).length === 0 && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <h3 className="text-2xl font-bold opacity-50 animate-pulse">Checking results...</h3>
          </div>
        )}
      </div>
    </div>
  );
}
