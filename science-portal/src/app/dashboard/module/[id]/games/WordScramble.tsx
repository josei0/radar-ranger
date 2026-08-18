"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitGameScore } from "../../../actions";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { sfx } from "@/lib/audio";

interface Props {
  materialId: number;
  currentHighscore: number;
  gameData?: any;
  onProgressUpdate: (progress: any) => void;
}

type WordData = { word: string; clue: string };

export default function WordScramble({ materialId, currentHighscore, gameData, onProgressUpdate }: Props) {
  const [words, setWords] = useState<WordData[]>([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  
  const [shuffledLetters, setShuffledLetters] = useState<{char: string, id: number}[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<{char: string, id: number}[]>([]);
  
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{title: string, desc: string, isPass: boolean} | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    let wordList: WordData[] = [];
    if (gameData && gameData.word_scramble && gameData.word_scramble.length > 0) {
      wordList = gameData.word_scramble;
    } else if (gameData && gameData.words && gameData.words.length > 0) {
      wordList = gameData.words;
    } else {
      wordList = [
        { word: "BUMI", clue: "Planet ketiga dari matahari, tempat tinggal kita." },
        { word: "AIR", clue: "Cairan bening yang kita minum setiap hari." }
      ];
    }
    setWords(wordList);
    loadWord(wordList[0]);
  }, [gameData]);

  const loadWord = (wordData: WordData) => {
    setSelectedLetters([]);
    const letters = wordData.word.toUpperCase().split("").map((char, index) => ({ char, id: index }));
    setShuffledLetters([...letters].sort(() => Math.random() - 0.5));
  };

  const handleLetterClick = (letter: {char: string, id: number}) => {
    sfx.playClick();
    const newSelected = [...selectedLetters, letter];
    setSelectedLetters(newSelected);
    
    // Remove from shuffled
    setShuffledLetters(shuffledLetters.filter(l => l.id !== letter.id));

    // Check if word is complete
    const currentTarget = words[currentWordIdx].word.toUpperCase();
    if (newSelected.length === currentTarget.length) {
      const spelledWord = newSelected.map(l => l.char).join("");
      if (spelledWord === currentTarget) {
        // Correct
        sfx.playCorrect();
        const pts = 100 / words.length;
        setScore(s => s + pts);
        
        setTimeout(() => {
          if (currentWordIdx + 1 < words.length) {
            setCurrentWordIdx(prev => prev + 1);
            loadWord(words[currentWordIdx + 1]);
          } else {
            finishGame(score + pts);
          }
        }, 800);
      } else {
        // Incorrect
        sfx.playWrong();
        setShake(true);
        setScore(s => Math.max(0, s - 5)); // penalty
        setTimeout(() => {
          setShake(false);
          resetCurrentWord();
        }, 800);
      }
    }
  };

  const resetCurrentWord = () => {
    sfx.playHover();
    loadWord(words[currentWordIdx]);
  };

  const handleRemoveLetter = (letter: {char: string, id: number}) => {
    sfx.playClick();
    setSelectedLetters(selectedLetters.filter(l => l.id !== letter.id));
    setShuffledLetters([...shuffledLetters, letter]);
  };

  const finishGame = async (finalScore: number) => {
    setGameOver(true);
    setSubmitting(true);
    const normalizedScore = Math.max(0, Math.min(100, Math.round(finalScore)));
    const result = await submitGameScore(materialId, normalizedScore);
    
    if (result.success) {
      if (result.perfect) {
        sfx.playUnlock();
        setResultMsg({ title: "PERFECT!", desc: `You scrambled everything perfectly! +${result.addedXp} XP`, isPass: true });
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
    setGameOver(false);
    setResultMsg(null);
    setCurrentWordIdx(0);
    loadWord(words[0]);
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
  const currentTargetLength = words[currentWordIdx].word.length;

  return (
    <div className="flex flex-col h-full items-center max-w-2xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8 bg-black/5 p-4 rounded-2xl w-full">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Word Scramble ({currentWordIdx + 1}/{words.length})</h2>
          <p className="text-sm opacity-70">Unscramble the letters to find the hidden word.</p>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-70 font-bold uppercase tracking-widest">Score</div>
          <div className="text-3xl font-black text-primary">{Math.round(score)}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl w-full text-center border-2 border-primary/20 shadow-sm mb-12">
        <div className="text-sm font-bold opacity-50 uppercase tracking-widest mb-2 text-gray-600">Clue</div>
        <p className="text-xl sm:text-2xl font-bold text-gray-800">{words[currentWordIdx].clue}</p>
      </div>

      <motion.div 
        animate={{ x: shake ? [-10, 10, -10, 10, 0] : 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12 min-h-[4rem]"
      >
        {/* Answer Slots */}
        {Array.from({ length: currentTargetLength }).map((_, i) => {
          const letter = selectedLetters[i];
          return (
            <motion.button
              key={`slot-${i}`}
              onClick={() => letter && handleRemoveLetter(letter)}
              className={`w-12 h-14 sm:w-16 sm:h-20 flex items-center justify-center rounded-xl text-2xl font-black border-b-4 ${
                letter 
                  ? shake ? 'bg-red-500 text-white border-red-700' : 'bg-primary text-white border-primary-hover hover:brightness-110' 
                  : 'bg-black/5 border-black/10'
              } transition-colors cursor-pointer`}
            >
              {letter ? letter.char : ""}
            </motion.button>
          );
        })}
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8">
        <AnimatePresence>
          {shuffledLetters.map((letter) => (
            <motion.button
              key={`shuf-${letter.id}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleLetterClick(letter)}
              onMouseEnter={() => sfx.playHover()}
              className="w-12 h-14 sm:w-16 sm:h-20 bg-white border-2 border-gray-200 shadow-sm rounded-xl flex items-center justify-center text-2xl font-black text-gray-800 hover:border-primary transition-colors cursor-pointer"
            >
              {letter.char}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <button 
        onClick={resetCurrentWord}
        className="flex items-center gap-2 px-6 py-3 bg-black/5 hover:bg-black/10 rounded-full font-bold opacity-70 hover:opacity-100 transition-all text-gray-800"
      >
        <RotateCcw className="w-4 h-4" /> Reset Letters
      </button>
    </div>
  );
}
