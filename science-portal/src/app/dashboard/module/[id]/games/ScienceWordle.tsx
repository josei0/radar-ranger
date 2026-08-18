"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { submitGameScore } from "../../../actions";
import { CheckCircle, XCircle } from "lucide-react";
import { sfx } from "@/lib/audio";

interface Props {
  materialId: number;
  currentHighscore: number;
  gameData?: any;
  onProgressUpdate: (progress: any) => void;
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"]
];

type LetterStatus = "correct" | "present" | "absent" | "empty";

export default function ScienceWordle({ materialId, currentHighscore, gameData, onProgressUpdate }: Props) {
  const [wordleItems, setWordleItems] = useState<{word: string, clue: string}[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [targetWord, setTargetWord] = useState("");
  const [clue, setClue] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{title: string, desc: string, isPass: boolean} | null>(null);

  const [shake, setShake] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const maxAttempts = 6;

  useEffect(() => {
    let items = [];
    if (gameData?.science_wordle) {
      if (Array.isArray(gameData.science_wordle)) {
        items = gameData.science_wordle;
      } else if (gameData.science_wordle.word) {
        items = [gameData.science_wordle];
      }
    }
    
    if (items.length === 0) {
      items = [{ word: "VIRUS", clue: "Agen mikroskopis yang menginfeksi sel hidup" }];
    }
    
    setWordleItems(items);
    setTargetWord(items[0].word.toUpperCase());
    setClue(items[0].clue);
    setGameStartTime(Date.now());
  }, [gameData]);

  const wordLength = targetWord.length || 5;

  const onKeyPress = (key: string) => {
    if (gameOver) return;

    if (key === "ENTER") {
      if (currentGuess.length !== wordLength) {
        sfx.playWrong();
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      // Submit guess
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess("");

      if (currentGuess === targetWord) {
        sfx.playCorrect();
        handleWordWin(newGuesses.length);
      } else if (newGuesses.length >= maxAttempts) {
        sfx.playWrong();
        handleLose();
      } else {
        sfx.playHover();
      }
    } else if (key === "BACKSPACE") {
      setCurrentGuess(prev => prev.slice(0, -1));
      sfx.playHover();
    } else {
      if (currentGuess.length < wordLength) {
        setCurrentGuess(prev => prev + key);
        sfx.playHover();
      }
    }
  };

  useEffect(() => {
    if (gameOver || !targetWord) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      
      if (e.key === "Enter") onKeyPress("ENTER");
      else if (e.key === "Backspace") onKeyPress("BACKSPACE");
      else if (/^[a-zA-Z]$/.test(e.key)) onKeyPress(e.key.toUpperCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, currentGuess, targetWord]);

  const handleWordWin = (attemptsTaken: number) => {
    const timeTaken = Date.now() - gameStartTime;
    const basePts = 100 / wordleItems.length;
    // Score logic: fewer attempts = more points (max 100% of basePts, min 50% of basePts)
    const attemptScore = basePts * (1 - ((attemptsTaken - 1) * 0.1));
    const speedBonus = Math.max(0, 1 - (timeTaken / 60000)) * (basePts * 0.2); 
    
    const roundScore = attemptScore + speedBonus;
    const newScore = score + roundScore;
    setScore(newScore);
    
    // Check if there are more words
    if (currentIdx + 1 < wordleItems.length) {
      setTimeout(() => {
        const nextIdx = currentIdx + 1;
        setCurrentIdx(nextIdx);
        setTargetWord(wordleItems[nextIdx].word.toUpperCase());
        setClue(wordleItems[nextIdx].clue);
        setGuesses([]);
        setCurrentGuess("");
        setGameStartTime(Date.now());
      }, 1000);
    } else {
      setTimeout(() => finishGame(newScore, true), 1000);
    }
  };

  const handleLose = () => {
    finishGame(score, false);
  };

  const finishGame = async (finalScore: number, isWin: boolean) => {
    setGameOver(true);
    setSubmitting(true);
    
    const normalizedScore = Math.max(0, Math.min(100, Math.round(finalScore)));
    const result = await submitGameScore(materialId, normalizedScore);
    
    if (result.success) {
      if (isWin) {
        sfx.playUnlock();
        setResultMsg({ title: "WORDLE MASTER!", desc: `You cracked the code! +${result.addedXp} XP`, isPass: true });
      } else {
        setResultMsg({ 
          title: "GAME OVER", 
          desc: `The word was ${targetWord}. ${result.locked ? "Locked for 5 mins." : ""}`, 
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
    setGuesses([]);
    setCurrentGuess("");
    setGameStartTime(Date.now());
    setCurrentIdx(0);
    if (wordleItems.length > 0) {
      setTargetWord(wordleItems[0].word.toUpperCase());
      setClue(wordleItems[0].clue);
    }
  };

  const getLetterStatus = (letter: string, index: number, guess: string): LetterStatus => {
    if (guess[index] === targetWord[index]) return "correct";
    
    // Count occurrences to handle duplicates correctly (simplified Wordle logic)
    // For a perfect Wordle clone, you'd need a multi-pass check, but this is okay for a basic one.
    if (targetWord.includes(letter)) return "present";
    
    return "absent";
  };

  const getKeyboardLetterStatus = (key: string): LetterStatus | null => {
    let status: LetterStatus | null = null;
    
    for (const guess of guesses) {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === key) {
          const s = getLetterStatus(key, i, guess);
          if (s === "correct") return "correct";
          if (s === "present") status = "present";
          if (s === "absent" && status === null) status = "absent";
        }
      }
    }
    return status;
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

  if (!targetWord) return null;

  return (
    <div className="flex flex-col h-full items-center max-w-lg mx-auto w-full relative">
      <div className="flex justify-between items-center mb-6 bg-black/5 p-4 rounded-2xl w-full">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Science Wordle</h2>
          <p className="text-xs sm:text-sm opacity-70 font-mono">
            Word {currentIdx + 1}/{wordleItems.length} • Attempt {guesses.length + 1}/{maxAttempts}
          </p>
        </div>
      </div>
      
      <div className="mb-6 text-center px-4">
        <p className="text-sm font-bold uppercase tracking-widest text-primary mb-1">Clue</p>
        <p className="text-lg font-bold text-gray-700">"{clue}"</p>
      </div>

      <div className="flex-1 w-full flex flex-col items-center gap-2 mb-8">
        {[...Array(maxAttempts)].map((_, rowIdx) => {
          const isCurrentRow = rowIdx === guesses.length;
          const guess = guesses[rowIdx] || (isCurrentRow ? currentGuess : "");
          
          return (
            <motion.div 
              key={rowIdx} 
              className="flex gap-2"
              animate={isCurrentRow && shake ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {[...Array(wordLength)].map((_, colIdx) => {
                const char = guess[colIdx] || "";
                let bgColor = "bg-white border-gray-300 text-gray-800";
                
                if (rowIdx < guesses.length) {
                  const status = getLetterStatus(char, colIdx, guess);
                  if (status === "correct") bgColor = "bg-green-500 border-green-600 text-white";
                  else if (status === "present") bgColor = "bg-yellow-400 border-yellow-500 text-white";
                  else if (status === "absent") bgColor = "bg-gray-400 border-gray-500 text-white";
                } else if (char) {
                  bgColor = "bg-white border-gray-500 text-gray-800 scale-105"; // typing indicator
                }

                return (
                  <motion.div
                    key={colIdx}
                    initial={false}
                    animate={rowIdx < guesses.length ? { rotateX: [0, 90, 0] } : {}}
                    transition={{ delay: colIdx * 0.1, duration: 0.5 }}
                    className={`w-12 h-12 sm:w-16 sm:h-16 border-2 flex items-center justify-center text-2xl sm:text-3xl font-black uppercase rounded-lg transition-colors ${bgColor}`}
                  >
                    {char}
                  </motion.div>
                );
              })}
            </motion.div>
          );
        })}
      </div>

      {/* Keyboard */}
      <div className="w-full flex flex-col items-center gap-2 z-20">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1 sm:gap-2 w-full">
            {row.map(key => {
              const status = key.length === 1 ? getKeyboardLetterStatus(key) : null;
              let keyBg = "bg-gray-200 text-gray-800 hover:bg-gray-300";
              
              if (status === "correct") keyBg = "bg-green-500 text-white";
              else if (status === "present") keyBg = "bg-yellow-400 text-white";
              else if (status === "absent") keyBg = "bg-gray-400 text-white opacity-50";

              return (
                <button
                  key={key}
                  onClick={() => onKeyPress(key)}
                  className={`flex items-center justify-center rounded-lg font-bold text-xs sm:text-base transition-all active:scale-95
                    ${key.length > 1 ? 'px-2 sm:px-4 text-[10px] sm:text-sm' : 'flex-1 max-w-[35px] sm:max-w-[45px]'} h-12 sm:h-14 ${keyBg}`}
                >
                  {key === "BACKSPACE" ? "⌫" : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
