"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitGameScore } from "../../../actions";
import { CheckCircle, XCircle, Check, X } from "lucide-react";
import { sfx } from "@/lib/audio";

interface Props {
  materialId: number;
  currentHighscore: number;
  gameData?: any;
  onProgressUpdate: (progress: any) => void;
}

type Statement = { text: string; isTrue: boolean };

export default function TrueFalseGame({ materialId, currentHighscore, gameData, onProgressUpdate }: Props) {
  const [statements, setStatements] = useState<Statement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{title: string, desc: string, isPass: boolean} | null>(null);
  
  // Scoring mechanics
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  
  // Animation states
  const [direction, setDirection] = useState<"left" | "right" | "none">("none");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    let stmtList: Statement[] = [];
    if (gameData && gameData.true_false && gameData.true_false.length > 0) {
      stmtList = gameData.true_false.map((q: any) => ({
        text: q.statement,
        isTrue: q.isCorrect !== undefined ? q.isCorrect : q.isTrue
      }));
    } else if (gameData && gameData.statements && gameData.statements.length > 0) {
      stmtList = gameData.statements;
    } else {
      stmtList = [
        { text: "Bumi adalah planet ketiga dari matahari.", isTrue: true },
        { text: "Matahari mengelilingi Bumi setiap hari.", isTrue: false },
        { text: "Air membeku pada suhu 100 derajat Celcius.", isTrue: false },
        { text: "Tumbuhan bernapas menggunakan Karbon Dioksida.", isTrue: true }
      ];
    }
    // Shuffle the statements on start
    setStatements([...stmtList].sort(() => Math.random() - 0.5));
    setQuestionStartTime(Date.now());
  }, [gameData]);

  const handleAnswer = (answer: boolean) => {
    if (currentIndex >= statements.length) return;
    
    const currentStmt = statements[currentIndex];
    const isCorrect = answer === currentStmt.isTrue;
    const timeTaken = Date.now() - questionStartTime;

    setDirection(answer ? "right" : "left"); // purely for swipe out animation logic if we want

    let roundScore = 0;
    if (isCorrect) {
      sfx.playCorrect();
      
      const maxPts = 100 / statements.length;
      const basePts = maxPts * 0.7; // 70% for just getting it right
      const bonusPts = maxPts * 0.3; // 30% speed bonus
      
      // Speed bonus drops to 0 after 3 seconds (3000ms)
      const speedMultiplier = Math.max(0, 1 - (timeTaken / 3000));
      roundScore = basePts + (bonusPts * speedMultiplier);
      
      setScore(s => s + roundScore);
    } else {
      sfx.playWrong();
      setShake(true);
      setMistakes(m => m + 1);
      setTimeout(() => setShake(false), 500);
    }

    // Move to next after a tiny delay for animation
    setTimeout(() => {
      setDirection("none");
      if (currentIndex + 1 < statements.length) {
        setCurrentIndex(prev => prev + 1);
        setQuestionStartTime(Date.now());
      } else {
        // add the points from this round to the total before finishing
        const newScore = isCorrect ? score + roundScore : score;
        finishGame(newScore);
      }
    }, 400);
  };

  const finishGame = async (finalScore: number) => {
    setGameOver(true);
    setSubmitting(true);
    const normalizedScore = Math.max(0, Math.min(100, Math.round(finalScore)));
    const result = await submitGameScore(materialId, normalizedScore);
    
    if (result.success) {
      if (result.perfect) {
        sfx.playUnlock();
        setResultMsg({ title: "FLAWLESS!", desc: `You have lightning fast instincts! +${result.addedXp} XP`, isPass: true });
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
    setCurrentIndex(0);
    setStatements([...statements].sort(() => Math.random() - 0.5));
    setQuestionStartTime(Date.now());
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

  if (statements.length === 0) return null;

  const currentStmt = statements[currentIndex];

  return (
    <div className="flex flex-col h-full items-center max-w-2xl mx-auto w-full">
      <div className="flex justify-between items-center mb-12 bg-black/5 p-4 rounded-2xl w-full">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Rapid True/False</h2>
          <p className="text-sm opacity-70">Answer as fast as you can!</p>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-70 font-bold uppercase tracking-widest">Score</div>
          <div className="text-3xl font-black text-primary">{Math.round(score)}</div>
        </div>
      </div>

      <div className="relative w-full aspect-video sm:aspect-[2/1] mb-12">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              x: shake ? [-10, 10, -10, 10, 0] : 0,
              rotate: shake ? [-2, 2, -2, 2, 0] : 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              x: direction === "left" ? -200 : (direction === "right" ? 200 : 0),
              rotate: direction === "left" ? -15 : (direction === "right" ? 15 : 0)
            }}
            transition={{ duration: 0.3 }}
            className={`absolute inset-0 flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl shadow-2xl border-4 ${
              shake ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200'
            }`}
          >
            <span className="text-sm font-bold opacity-50 uppercase tracking-widest mb-4">
              Statement {currentIndex + 1} of {statements.length}
            </span>
            <h3 className="text-2xl sm:text-4xl font-black leading-tight">
              "{currentStmt.text}"
            </h3>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex w-full gap-4 sm:gap-8 justify-center">
        <button
          onClick={() => handleAnswer(false)}
          onMouseEnter={() => sfx.playHover()}
          className="flex-1 max-w-[200px] flex items-center justify-center gap-2 py-6 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white dark:bg-red-900/30 dark:hover:bg-red-600 rounded-3xl font-black text-2xl transition-all shadow-lg transform hover:scale-105 active:scale-95"
        >
          <X className="w-8 h-8" /> SALAH
        </button>
        <button
          onClick={() => handleAnswer(true)}
          onMouseEnter={() => sfx.playHover()}
          className="flex-1 max-w-[200px] flex items-center justify-center gap-2 py-6 bg-green-100 hover:bg-green-500 text-green-600 hover:text-white dark:bg-green-900/30 dark:hover:bg-green-600 rounded-3xl font-black text-2xl transition-all shadow-lg transform hover:scale-105 active:scale-95"
        >
          <Check className="w-8 h-8" /> BENAR
        </button>
      </div>
    </div>
  );
}
