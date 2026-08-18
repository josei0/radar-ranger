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

type OddItem = { text: string; icon: string; isOdd: boolean; reason?: string; id: string };
type OddQuestion = { category: string; items: OddItem[] };

export default function OddOneOut({ materialId, currentHighscore, gameData, onProgressUpdate }: Props) {
  const [questions, setQuestions] = useState<OddQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{title: string, desc: string, isPass: boolean} | null>(null);

  const [shake, setShake] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Time based scoring
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    let qList: OddQuestion[] = [];
    if (gameData && gameData.odd_one_out && gameData.odd_one_out.length > 0) {
      qList = gameData.odd_one_out.map((q: any, i: number) => {
        const items = q.options.map((opt: string, j: number) => ({
          id: `q${i}-i${j}`,
          text: opt,
          icon: "💡",
          isOdd: j === q.answerIndex,
          reason: j === q.answerIndex ? q.explanation : undefined
        }));
        
        return {
          category: "Temukan yang Berbeda",
          items: items.sort(() => Math.random() - 0.5)
        };
      });
    } else if (gameData && gameData.odd_out && gameData.odd_out.length > 0) {
      // Legacy structure
      qList = gameData.odd_out.map((q: any, i: number) => ({
        ...q,
        items: q.items.map((item: any, j: number) => ({ ...item, id: `q${i}-i${j}` })).sort(() => Math.random() - 0.5)
      }));
    } else {
      qList = [
        {
          category: "Benda Padat",
          items: [
            { text: "Batu", icon: "🪨", isOdd: false, id: "1" },
            { text: "Kayu", icon: "🪵", isOdd: false, id: "2" },
            { text: "Besi", icon: "🔩", isOdd: false, id: "3" },
            { text: "Air", icon: "💧", isOdd: true, reason: "Air adalah benda cair, bukan padat.", id: "4" }
          ].sort(() => Math.random() - 0.5)
        },
        {
          category: "Planet Gas",
          items: [
            { text: "Jupiter", icon: "🪐", isOdd: false, id: "5" },
            { text: "Saturnus", icon: "🪐", isOdd: false, id: "6" },
            { text: "Uranus", icon: "🪐", isOdd: false, id: "7" },
            { text: "Bumi", icon: "🌍", isOdd: true, reason: "Bumi adalah planet berbatu.", id: "8" }
          ].sort(() => Math.random() - 0.5)
        }
      ];
    }
    setQuestions(qList);
    setQuestionStartTime(Date.now());
  }, [gameData]);

  const handleItemClick = (item: OddItem) => {
    if (revealed) return;
    
    setSelectedId(item.id);
    const timeTaken = Date.now() - questionStartTime;

    if (item.isOdd) {
      sfx.playCorrect();
      setRevealed(true);
      
      const maxPts = 100 / questions.length;
      const basePts = maxPts * 0.7; 
      const bonusPts = maxPts * 0.3; 
      
      const speedMultiplier = Math.max(0, 1 - (timeTaken / 5000)); // 5 seconds for max bonus
      const roundScore = basePts + (bonusPts * speedMultiplier);
      
      setScore(s => s + roundScore);

      setTimeout(() => {
        if (currentIdx + 1 < questions.length) {
          setRevealed(false);
          setSelectedId(null);
          setCurrentIdx(prev => prev + 1);
          setQuestionStartTime(Date.now());
        } else {
          finishGame(score + roundScore);
        }
      }, 3000); // 3 seconds to read the reason
    } else {
      sfx.playWrong();
      setShake(true);
      setMistakes(m => m + 1);
      setTimeout(() => setShake(false), 500);
      setSelectedId(null);
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
        setResultMsg({ title: "SHERLOCK HOLMES!", desc: `You found all imposters! +${result.addedXp} XP`, isPass: true });
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
    setRevealed(false);
    setSelectedId(null);
    setQuestionStartTime(Date.now());
    
    // Reshuffle items
    const newQ = questions.map(q => ({
      ...q,
      items: [...q.items].sort(() => Math.random() - 0.5)
    }));
    setQuestions(newQ.sort(() => Math.random() - 0.5));
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

  if (questions.length === 0) return null;

  const currentQ = questions[currentIdx];
  const oddItem = currentQ.items.find(i => i.isOdd);

  return (
    <div className="flex flex-col h-full items-center max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8 bg-black/5 p-4 rounded-2xl w-full">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Odd One Out</h2>
          <p className="text-sm opacity-70">Question {currentIdx + 1} of {questions.length}</p>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-70 font-bold uppercase tracking-widest">Score</div>
          <div className="text-3xl font-black text-primary">{Math.round(score)}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl w-full text-center border-2 border-primary/20 shadow-sm mb-8 relative overflow-hidden">
        <AnimatePresence>
          {revealed && oddItem?.reason && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 bg-green-500 text-white flex flex-col items-center justify-center p-6 z-10"
            >
              <span className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">CORRECT!</span>
              <p className="text-xl sm:text-2xl font-bold">{oddItem.reason}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="text-sm font-bold opacity-50 uppercase tracking-widest mb-2 text-gray-600">Find the Imposter</div>
        <p className="text-xl sm:text-2xl font-bold text-gray-800">
          Which one is NOT a part of <span className="text-primary">"{currentQ.category}"</span>?
        </p>
      </div>

      <motion.div 
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full"
      >
        {currentQ.items.map(item => {
          const isSelected = selectedId === item.id;
          const isFaded = revealed && !item.isOdd;
          
          return (
            <motion.button
              key={item.id}
              whileHover={!revealed ? { scale: 1.05 } : {}}
              whileTap={!revealed ? { scale: 0.95 } : {}}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => !revealed && sfx.playHover()}
              disabled={revealed}
              className={`flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl border-4 transition-all ${
                isFaded ? 'opacity-30 scale-95 border-gray-100 bg-gray-50' : 
                isSelected ? (item.isOdd ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') :
                'border-gray-200 bg-white hover:border-primary/50 shadow-sm'
              }`}
            >
              <span className="text-6xl sm:text-7xl mb-4">{item.icon}</span>
              <span className="font-bold text-gray-800 text-lg sm:text-xl">{item.text}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
