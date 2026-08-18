"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation, PanInfo, AnimatePresence } from "framer-motion";
import { submitGameScore } from "../../../actions";
import { CheckCircle, XCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { sfx } from "@/lib/audio";

interface Props {
  materialId: number;
  currentHighscore: number;
  gameData?: any;
  onProgressUpdate: (progress: any) => void;
}

type Card = { statement: string; isTruth: boolean };

export default function TruthOrMyth({ materialId, currentHighscore, gameData, onProgressUpdate }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{title: string, desc: string, isPass: boolean} | null>(null);

  const controls = useAnimation();
  const [exitX, setExitX] = useState(0);

  // Time based scoring
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    let cList: Card[] = [];
    if (gameData && gameData.truth_or_myth && gameData.truth_or_myth.length > 0) {
      cList = gameData.truth_or_myth;
    } else {
      cList = [
        { statement: "Kelelawar adalah burung peliharaan yang buta.", isTruth: false },
        { statement: "Matahari terbit dari arah timur.", isTruth: true },
        { statement: "Paus bernapas menggunakan insang.", isTruth: false },
        { statement: "Air membeku pada suhu 0 derajat Celcius.", isTruth: true },
        { statement: "Suara bisa merambat di ruang angkasa hampa udara.", isTruth: false }
      ];
    }
    setCards(cList.sort(() => Math.random() - 0.5));
    setQuestionStartTime(Date.now());
  }, [gameData]);

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentCard = cards[currentIdx];
    const isTruthGuess = direction === 'right';
    
    // Animate out
    setExitX(direction === 'right' ? 300 : -300);

    const timeTaken = Date.now() - questionStartTime;
    const maxPts = 100 / cards.length;
    
    if (isTruthGuess === currentCard.isTruth) {
      sfx.playCorrect();
      
      const speedMultiplier = Math.max(0, 1 - (timeTaken / 5000));
      const roundScore = (maxPts * 0.7) + (maxPts * 0.3 * speedMultiplier);
      setScore(s => s + roundScore);
      
      setTimeout(() => proceedNext(score + roundScore), 300);
    } else {
      sfx.playWrong();
      setMistakes(m => m + 1);
      
      setTimeout(() => proceedNext(score), 300);
    }
  };

  const proceedNext = (currentScore: number) => {
    if (currentIdx + 1 < cards.length) {
      setCurrentIdx(prev => prev + 1);
      setExitX(0);
      setQuestionStartTime(Date.now());
    } else {
      finishGame(currentScore);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      handleSwipe('right'); // Truth
    } else if (info.offset.x < -100) {
      handleSwipe('left'); // Myth
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
        setResultMsg({ title: "TRUTH SEEKER!", desc: `Perfect judgment! +${result.addedXp} XP`, isPass: true });
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
    setExitX(0);
    setQuestionStartTime(Date.now());
    setCards([...cards].sort(() => Math.random() - 0.5));
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

  if (cards.length === 0) return null;
  const currentCard = cards[currentIdx];

  return (
    <div className="flex flex-col h-[75vh] min-h-[500px] items-center max-w-4xl mx-auto w-full relative">
      <div className="flex justify-between items-center mb-4 bg-black/5 p-4 rounded-2xl w-full z-10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Truth or Myth</h2>
          <p className="text-sm opacity-70">Card {currentIdx + 1} of {cards.length}</p>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-70 font-bold uppercase tracking-widest">Score</div>
          <div className="text-3xl font-black text-primary">{Math.round(score)}</div>
        </div>
      </div>

      <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden px-4">
        
        {/* Indicators */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 hidden sm:flex flex-col items-center text-red-500 font-bold text-2xl tracking-widest text-center">
          <ThumbsDown className="w-16 h-16 mb-2" />
          SWIPE LEFT<br/>MYTH
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 hidden sm:flex flex-col items-center text-green-500 font-bold text-2xl tracking-widest text-center">
          <ThumbsUp className="w-16 h-16 mb-2" />
          SWIPE RIGHT<br/>TRUTH
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
            exit={{ x: exitX, opacity: 0, scale: 0.8, rotate: exitX > 0 ? 20 : -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 1.05, cursor: "grabbing" }}
            style={{ originX: 0.5, originY: 1 }}
            className="w-full max-w-sm h-80 sm:h-96 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-4 border-gray-100 flex flex-col items-center justify-center p-8 text-center cursor-grab active:cursor-grabbing z-20 relative select-none"
          >
            <div className="absolute top-4 left-4 right-4 flex justify-between px-2 text-xs font-black uppercase tracking-widest opacity-20">
              <span className="text-red-500">Mitos</span>
              <span className="text-green-500">Fakta</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">
              "{currentCard?.statement}"
            </h3>
            
            <div className="absolute bottom-6 left-0 right-0 text-center opacity-30 animate-pulse text-sm font-bold">
              Swipe to answer
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-sm flex justify-between gap-4 mt-4 pb-4">
        <button 
          onClick={() => handleSwipe('left')}
          className="flex-1 py-4 bg-red-100 text-red-600 font-black text-xl rounded-2xl hover:bg-red-200 active:scale-95 transition-all border-4 border-red-200 flex items-center justify-center gap-2"
        >
          <XCircle className="w-6 h-6" /> MYTH
        </button>
        <button 
          onClick={() => handleSwipe('right')}
          className="flex-1 py-4 bg-green-100 text-green-600 font-black text-xl rounded-2xl hover:bg-green-200 active:scale-95 transition-all border-4 border-green-200 flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-6 h-6" /> TRUTH
        </button>
      </div>
    </div>
  );
}
