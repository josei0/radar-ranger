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

type QuizOption = { text: string; isCorrect: boolean; id: string };
type VisualQuestion = { question: string; image: string; options: QuizOption[] };

export default function VisualQuiz({ materialId, currentHighscore, gameData, onProgressUpdate }: Props) {
  const [questions, setQuestions] = useState<VisualQuestion[]>([]);
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
    let qList: VisualQuestion[] = [];
    if (gameData && gameData.visual_quiz && gameData.visual_quiz.length > 0) {
      qList = gameData.visual_quiz.map((q: any, i: number) => ({
        ...q,
        options: q.options.map((opt: any, j: number) => ({ ...opt, id: `q${i}-o${j}` })).sort(() => Math.random() - 0.5)
      }));
    } else {
      qList = [
        {
          question: "Hewan mamalia terbesar di Bumi",
          image: "🐋",
          options: [
            { text: "Gajah", isCorrect: false, id: "1" },
            { text: "Jerapah", isCorrect: false, id: "2" },
            { text: "Paus Biru", isCorrect: true, id: "3" },
            { text: "Hiu Putih", isCorrect: false, id: "4" }
          ].sort(() => Math.random() - 0.5)
        },
        {
          question: "Proses tumbuhan memasak makanan",
          image: "🍃",
          options: [
            { text: "Respirasi", isCorrect: false, id: "5" },
            { text: "Fotosintesis", isCorrect: true, id: "6" },
            { text: "Transpirasi", isCorrect: false, id: "7" },
            { text: "Evaporasi", isCorrect: false, id: "8" }
          ].sort(() => Math.random() - 0.5)
        }
      ];
    }
    setQuestions(qList);
    setQuestionStartTime(Date.now());
  }, [gameData]);

  const handleOptionClick = (option: QuizOption) => {
    if (revealed) return;
    
    setSelectedId(option.id);
    const timeTaken = Date.now() - questionStartTime;

    if (option.isCorrect) {
      sfx.playCorrect();
      setRevealed(true);
      
      const maxPts = 100 / questions.length;
      const basePts = maxPts * 0.7; 
      const bonusPts = maxPts * 0.3; 
      
      const speedMultiplier = Math.max(0, 1 - (timeTaken / 5000));
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
      }, 1500); // 1.5s delay to show correct answer
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
        setResultMsg({ title: "QUIZ MASTER!", desc: `Flawless victory! +${result.addedXp} XP`, isPass: true });
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
    
    const newQ = questions.map(q => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5)
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

  return (
    <div className="flex flex-col h-full items-center max-w-3xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6 bg-black/5 p-4 rounded-2xl w-full">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Visual Quiz</h2>
          <p className="text-sm opacity-70">Question {currentIdx + 1} of {questions.length}</p>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-70 font-bold uppercase tracking-widest">Score</div>
          <div className="text-3xl font-black text-primary">{Math.round(score)}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full mb-8">
        <motion.div 
          key={`img-${currentIdx}`}
          initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-[120px] sm:text-[160px] leading-none mb-6 filter drop-shadow-xl"
        >
          {currentQ.image}
        </motion.div>
        <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 bg-white/80 px-8 py-4 rounded-3xl shadow-sm border border-gray-200">
          {currentQ.question}
        </h3>
      </div>

      <motion.div 
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full"
      >
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedId === opt.id;
          const isCorrectAndRevealed = revealed && opt.isCorrect;
          
          return (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={!revealed ? { scale: 1.03 } : {}}
              whileTap={!revealed ? { scale: 0.97 } : {}}
              onClick={() => handleOptionClick(opt)}
              onMouseEnter={() => !revealed && sfx.playHover()}
              disabled={revealed}
              className={`flex items-center justify-center p-5 sm:p-6 rounded-2xl border-4 font-bold text-xl sm:text-2xl transition-all ${
                isCorrectAndRevealed ? 'border-green-500 bg-green-50 text-green-700 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 
                isSelected ? 'border-red-500 bg-red-50 text-red-700' :
                'border-gray-200 bg-white text-gray-700 hover:border-primary/50 hover:bg-primary/5 hover:text-primary shadow-sm'
              }`}
            >
              {opt.text}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
