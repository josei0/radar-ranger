"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitGameScore } from "../../../actions";
import { CheckCircle, XCircle, Heart } from "lucide-react";
import { sfx } from "@/lib/audio";

interface Props {
  materialId: number;
  currentHighscore: number;
  gameData?: any;
  onProgressUpdate: (progress: any) => void;
}

type WordItem = { word: string; clue: string };

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"]
];

export default function WordGuess({ materialId, currentHighscore, gameData, onProgressUpdate }: Props) {
  const [words, setWords] = useState<WordItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [lives, setLives] = useState(5);
  
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{title: string, desc: string, isPass: boolean} | null>(null);
  
  const [shake, setShake] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    let wList: WordItem[] = [];
    if (gameData && gameData.word_guess && gameData.word_guess.length > 0) {
      wList = gameData.word_guess;
    } else {
      wList = [
        { word: "FOTOSINTESIS", clue: "Proses tumbuhan membuat makanan sendiri" },
        { word: "KLOROFIL", clue: "Zat hijau daun" },
        { word: "MATAHARI", clue: "Pusat tata surya kita" }
      ];
    }
    setWords(wList.sort(() => Math.random() - 0.5));
    setQuestionStartTime(Date.now());
  }, [gameData]);

  const handleLetterClick = (letter: string) => {
    if (guessedLetters.includes(letter) || lives <= 0 || gameOver || words.length === 0) return;

    const currentWord = words[currentIdx].word.toUpperCase();
    const newGuessed = [...guessedLetters, letter];
    setGuessedLetters(newGuessed);

    if (currentWord.includes(letter)) {
      sfx.playCorrect();
      
      // Check if word is complete
      const isComplete = currentWord.split("").every(char => char === " " || newGuessed.includes(char));
      
      if (isComplete) {
        const timeTaken = Date.now() - questionStartTime;
        const maxPts = 100 / words.length;
        const basePts = maxPts * 0.6;
        const livesBonus = (lives / 5) * (maxPts * 0.2); // 20% max bonus for perfect lives
        const speedBonus = Math.max(0, 1 - (timeTaken / 10000)) * (maxPts * 0.2); // 20% max bonus for speed (under 10s)
        
        const roundScore = basePts + livesBonus + speedBonus;
        setScore(s => s + roundScore);

        setTimeout(() => {
          if (currentIdx + 1 < words.length) {
            setCurrentIdx(prev => prev + 1);
            setGuessedLetters([]);
            setLives(5); // reset lives for next word? Or keep it? Let's reset it to be forgiving.
            setQuestionStartTime(Date.now());
          } else {
            finishGame(score + roundScore);
          }
        }, 1000);
      }
    } else {
      sfx.playWrong();
      setShake(true);
      setMistakes(m => m + 1);
      setLives(prev => prev - 1);
      
      setTimeout(() => setShake(false), 500);

      if (lives - 1 <= 0) {
        // Lost this word
        setTimeout(() => {
          if (currentIdx + 1 < words.length) {
            setCurrentIdx(prev => prev + 1);
            setGuessedLetters([]);
            setLives(5);
            setQuestionStartTime(Date.now());
          } else {
            finishGame(score); // no points added for this round
          }
        }, 1500);
      }
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
        setResultMsg({ title: "SPELLING MASTER!", desc: `Flawless victory! +${result.addedXp} XP`, isPass: true });
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
    setGuessedLetters([]);
    setLives(5);
    setQuestionStartTime(Date.now());
    
    setWords([...words].sort(() => Math.random() - 0.5));
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

  if (words.length === 0) return null;

  const currentWord = words[currentIdx].word.toUpperCase();
  const isComplete = currentWord.split("").every(char => char === " " || guessedLetters.includes(char));
  const isFailed = lives <= 0;

  return (
    <div className="flex flex-col h-full items-center max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6 bg-black/5 p-4 rounded-2xl w-full">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Word Guess</h2>
          <p className="text-sm opacity-70">Word {currentIdx + 1} of {words.length}</p>
        </div>
        
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <motion.div key={i} animate={i >= lives ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}>
              <Heart className={`w-8 h-8 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} />
            </motion.div>
          ))}
        </div>

        <div className="text-right">
          <div className="text-sm opacity-70 font-bold uppercase tracking-widest">Score</div>
          <div className="text-3xl font-black text-primary">{Math.round(score)}</div>
        </div>
      </div>

      <motion.div 
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="bg-white p-6 sm:p-10 rounded-3xl w-full text-center border-2 border-primary/20 shadow-sm mb-8"
      >
        <div className="text-sm font-bold opacity-50 uppercase tracking-widest mb-4 text-gray-600">Clue</div>
        <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-8">{words[currentIdx].clue}</p>
        
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {currentWord.split("").map((char, i) => {
            if (char === " ") return <div key={i} className="w-4 sm:w-8" />;
            
            const isRevealed = guessedLetters.includes(char) || isFailed;
            
            return (
              <motion.div 
                key={i}
                className={`w-10 h-14 sm:w-14 sm:h-16 border-b-4 flex items-center justify-center text-3xl sm:text-4xl font-black ${
                  isRevealed 
                    ? isFailed && !guessedLetters.includes(char) ? 'text-red-500 border-red-200' : 'text-primary border-primary' 
                    : 'text-transparent border-gray-300'
                }`}
              >
                {isRevealed ? char : "_"}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Keyboard */}
      <div className="w-full max-w-3xl flex flex-col items-center gap-2">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1 sm:gap-2 w-full">
            {row.map(key => {
              const isGuessed = guessedLetters.includes(key);
              const isCorrect = isGuessed && currentWord.includes(key);
              const isWrong = isGuessed && !currentWord.includes(key);
              
              return (
                <button
                  key={key}
                  onClick={() => handleLetterClick(key)}
                  disabled={isGuessed || isComplete || isFailed}
                  className={`flex-1 sm:flex-none sm:w-14 h-12 sm:h-16 rounded-lg sm:rounded-xl font-bold text-lg sm:text-2xl transition-all ${
                    isCorrect ? 'bg-green-500 text-white border-b-4 border-green-700' :
                    isWrong ? 'bg-gray-300 text-gray-500 opacity-50' :
                    'bg-white text-gray-800 border-b-4 border-gray-200 hover:bg-primary/10 hover:border-primary active:border-b-0 active:translate-y-1'
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
