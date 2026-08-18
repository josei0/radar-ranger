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

export default function FillBlanksGame({ materialId, currentHighscore, gameData, onProgressUpdate }: Props) {
  const [passage, setPassage] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [wordBank, setWordBank] = useState<{id: string, word: string, used: boolean}[]>([]);
  
  const [filledBlanks, setFilledBlanks] = useState<Record<string, string>>({});
  const [activeBlankId, setActiveBlankId] = useState<string | null>(null);

  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{title: string, desc: string, isPass: boolean} | null>(null);

  const [shakeId, setShakeId] = useState<string | null>(null);

  useEffect(() => {
    let rawPassage = "";
    let rawAnswers: Record<string, string> = {};
    let rawDecoys: string[] = [];

    if (gameData && gameData.fill_blanks && gameData.fill_blanks.length > 0) {
      const qList = gameData.fill_blanks;
      let combinedPassage = "";
      
      qList.forEach((q: any, i: number) => {
        // Replace [BLANK] with [b{i}]
        const sentence = (q.sentence || "").replace(/\[BLANK\]/g, `[b${i}]`);
        combinedPassage += sentence + " ";
        
        rawAnswers[`b${i}`] = q.answer;
        if (q.options && Array.isArray(q.options)) {
          rawDecoys.push(...q.options);
        }
      });
      
      rawPassage = combinedPassage.trim();
    } else if (gameData && gameData.passage && gameData.answers) {
      rawPassage = gameData.passage;
      rawAnswers = gameData.answers;
      rawDecoys = gameData.decoys || [];
    } else {
      rawPassage = "Tumbuhan memasak makanan melalui proses [b1]. Tumbuhan menyerap gas [b2] dari udara dan [b3] dari dalam tanah.";
      rawAnswers = {
        "b1": "Fotosintesis",
        "b2": "Karbon Dioksida",
        "b3": "Air"
      };
      rawDecoys = ["Oksigen", "Tanah"];
    }

    setPassage(rawPassage);
    setAnswers(rawAnswers);

    // Create Word Bank
    const bankWords = [...Object.values(rawAnswers), ...rawDecoys];
    const bank = bankWords.map((word, i) => ({ id: `w-${i}`, word, used: false })).sort(() => Math.random() - 0.5);
    setWordBank(bank);
    
    // Auto select first blank
    const matches = Array.from(rawPassage.matchAll(/\[(.*?)\]/g));
    if (matches.length > 0) {
      setActiveBlankId(matches[0][1]);
    }
  }, [gameData]);

  const handleBankWordClick = (bankItem: {id: string, word: string, used: boolean}) => {
    if (bankItem.used || !activeBlankId) return;

    const correctAnswer = answers[activeBlankId];
    if (bankItem.word === correctAnswer) {
      // Correct Match
      sfx.playCorrect();
      setFilledBlanks(prev => ({ ...prev, [activeBlankId]: bankItem.word }));
      setWordBank(prev => prev.map(w => w.id === bankItem.id ? { ...w, used: true } : w));
      
      const totalBlanks = Object.keys(answers).length;
      const pts = 100 / totalBlanks;
      setScore(s => s + pts);

      // Find next empty blank
      const newFilled = { ...filledBlanks, [activeBlankId]: bankItem.word };
      const matches = Array.from(passage.matchAll(/\[(.*?)\]/g));
      const nextBlank = matches.find(m => !newFilled[m[1]]);
      
      if (nextBlank) {
        setActiveBlankId(nextBlank[1]);
      } else {
        setActiveBlankId(null);
        setTimeout(() => finishGame(score + pts), 1000); // Game completed
      }
    } else {
      // Wrong Match
      sfx.playWrong();
      setMistakes(m => m + 1);
      setScore(s => Math.max(0, s - 5));
      setShakeId(activeBlankId);
      setTimeout(() => setShakeId(null), 500);
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
        setResultMsg({ title: "PERFECT LITERACY!", desc: `You filled all blanks correctly! +${result.addedXp} XP`, isPass: true });
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
    setFilledBlanks({});
    setWordBank(prev => prev.map(w => ({ ...w, used: false })).sort(() => Math.random() - 0.5));
    
    const matches = Array.from(passage.matchAll(/\[(.*?)\]/g));
    if (matches.length > 0) {
      setActiveBlankId(matches[0][1]);
    }
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

  // Parse passage into renderable segments
  const renderPassage = () => {
    const segments: React.ReactNode[] = [];
    const regex = /\[(.*?)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(passage)) !== null) {
      // Text before the blank
      if (match.index > lastIndex) {
        segments.push(<span key={`text-${lastIndex}`}>{passage.substring(lastIndex, match.index)}</span>);
      }

      const blankId = match[1];
      const isFilled = filledBlanks[blankId];
      const isActive = activeBlankId === blankId;
      const isShaking = shakeId === blankId;

      segments.push(
        <motion.span
          key={`blank-${blankId}`}
          onClick={() => { if(!isFilled) { sfx.playClick(); setActiveBlankId(blankId); } }}
          animate={{ x: isShaking ? [-5, 5, -5, 5, 0] : 0 }}
          transition={{ duration: 0.3 }}
          className={`inline-block mx-1 px-3 py-1 min-w-[100px] text-center rounded-lg border-b-4 font-bold transition-all ${
            isFilled 
              ? 'bg-green-100 text-green-800 border-green-500 dark:bg-green-900/30 dark:text-green-300'
              : isActive
                ? 'bg-primary/20 border-primary text-primary cursor-pointer ring-2 ring-primary ring-offset-2 ring-offset-background scale-105'
                : 'bg-black/5 dark:bg-white/10 border-gray-300 dark:border-gray-600 text-transparent cursor-pointer hover:bg-black/10'
          } ${isShaking ? 'bg-red-100 border-red-500 ring-red-500' : ''}`}
        >
          {isFilled || "____"}
        </motion.span>
      );

      lastIndex = regex.lastIndex;
    }

    // Text after the last blank
    if (lastIndex < passage.length) {
      segments.push(<span key={`text-${lastIndex}`}>{passage.substring(lastIndex)}</span>);
    }

    return segments;
  };

  return (
    <div className="flex flex-col h-full items-center max-w-3xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8 bg-black/5 p-4 rounded-2xl w-full">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Fill in the Blanks</h2>
          <p className="text-sm opacity-70">Select a blank, then choose the correct word!</p>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-70 font-bold uppercase tracking-widest">Score</div>
          <div className="text-3xl font-black text-primary">{Math.round(score)}</div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl w-full border-2 border-gray-200 shadow-sm mb-12">
        <p className="text-xl sm:text-2xl leading-loose sm:leading-loose text-gray-800 font-medium">
          {renderPassage()}
        </p>
      </div>

      <div className="w-full">
        <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest mb-4 text-center">Word Bank</h3>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          <AnimatePresence>
            {wordBank.map(bankItem => (
              <motion.button
                key={bankItem.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: bankItem.used ? 0.3 : 1, scale: 1 }}
                whileHover={!bankItem.used ? { scale: 1.05 } : {}}
                whileTap={!bankItem.used ? { scale: 0.95 } : {}}
                onClick={() => handleBankWordClick(bankItem)}
                onMouseEnter={() => !bankItem.used && sfx.playHover()}
                disabled={bankItem.used || !activeBlankId}
                className={`px-4 py-3 sm:px-6 sm:py-4 rounded-xl font-bold text-lg border-2 transition-colors ${
                  bankItem.used
                    ? 'bg-gray-100 border-gray-200 text-gray-400 dark:bg-white/5 dark:border-white/5 dark:text-gray-600'
                    : 'bg-white border-primary/30 text-primary hover:bg-primary hover:text-white shadow-sm'
                }`}
              >
                {bankItem.word}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
