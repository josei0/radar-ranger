"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitGameScore } from "../../../actions";
import { CheckCircle, XCircle, Heart, Keyboard } from "lucide-react";
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
  ["Z", "X", "C", "V", "B", "N", "M"]
];

export default function FallingWords({ materialId, currentHighscore, gameData, onProgressUpdate }: Props) {
  const [words, setWords] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  const [typedText, setTypedText] = useState("");
  const [lives, setLives] = useState(3);
  
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{title: string, desc: string, isPass: boolean} | null>(null);

  const [wordKey, setWordKey] = useState(0); // to force re-render/re-animate of the falling word
  const [isExploding, setIsExploding] = useState(false);

  // Time based scoring
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    let wList: string[] = [];
    if (gameData && gameData.falling_words && gameData.falling_words.length > 0) {
      wList = gameData.falling_words.map((item: any) => typeof item === 'string' ? item : item.word);
    } else {
      wList = ["FOTOSINTESIS", "KLOROFIL", "EVAPORASI", "KONDENSASI", "PRESIPITASI"];
    }
    
    // Normalize and shuffle
    const normalized = wList.filter(Boolean).map(w => w.toUpperCase().replace(/\s+/g, '')).filter(w => w.length > 0);
    setWords(normalized.sort(() => Math.random() - 0.5));
    setQuestionStartTime(Date.now());
  }, [gameData]);

  const processInputChar = (char: string) => {
    if (gameOver || isExploding || words.length === 0) return;
    
    setTypedText(prev => {
      const currentWord = words[currentIdx] || "";
      const expectedChar = currentWord[prev.length];
      
      if (char === expectedChar) {
        sfx.playHover(); // small tick for correct letter
        const newText = prev + char;
        
        // Word complete
        if (newText === currentWord) {
          handleWordComplete();
        }
        return newText;
      } else {
        // Typing mistake
        sfx.playWrong();
        setMistakes(m => m + 1);
        setScore(s => Math.max(0, s - 1)); // small penalty
        return prev; // don't add wrong character
      }
    });
  };

  // Global keydown listener
  useEffect(() => {
    if (gameOver || isExploding || words.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      
      // If alphabetical key
      if (/^[a-zA-Z]$/.test(e.key)) {
        processInputChar(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, isExploding, words, currentIdx]);

  const handleWordComplete = () => {
    setIsExploding(true);
    sfx.playCorrect();
    
    const timeTaken = Date.now() - questionStartTime;
    const maxPts = 100 / words.length;
    
    // Fast typers get bonus (under 3 seconds = max bonus)
    const speedMultiplier = Math.max(0, 1 - (timeTaken / 5000));
    const roundScore = (maxPts * 0.7) + (maxPts * 0.3 * speedMultiplier);
    
    setScore(s => s + roundScore);

    setTimeout(() => {
      if (currentIdx + 1 < words.length) {
        setCurrentIdx(prev => prev + 1);
        setTypedText("");
        setIsExploding(false);
        setWordKey(prev => prev + 1);
        setQuestionStartTime(Date.now());
      } else {
        finishGame(score + roundScore);
      }
    }, 600); // Wait for explosion animation
  };

  const handleWordHitGround = () => {
    if (isExploding || gameOver) return;
    
    sfx.playWrong();
    setLives(prev => prev - 1);
    setIsExploding(true); // kinda like it crashed

    setTimeout(() => {
      if (lives - 1 <= 0) {
        finishGame(score); // Game Over
      } else {
        if (currentIdx + 1 < words.length) {
          setCurrentIdx(prev => prev + 1);
          setTypedText("");
          setIsExploding(false);
          setWordKey(prev => prev + 1);
          setQuestionStartTime(Date.now());
        } else {
          finishGame(score);
        }
      }
    }, 1000);
  };

  const finishGame = async (finalScore: number) => {
    setGameOver(true);
    setSubmitting(true);
    
    const normalizedScore = Math.max(0, Math.min(100, Math.round(finalScore)));
    const result = await submitGameScore(materialId, normalizedScore);
    
    if (result.success) {
      if (result.perfect) {
        sfx.playUnlock();
        setResultMsg({ title: "TYPING NINJA!", desc: `Unstoppable speed! +${result.addedXp} XP`, isPass: true });
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
    setTypedText("");
    setLives(3);
    setWordKey(prev => prev + 1);
    setIsExploding(false);
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
  
  const currentWord = words[currentIdx] || "";

  return (
    <div className="flex flex-col h-[85vh] min-h-[600px] items-center max-w-4xl mx-auto w-full relative">
      <div className="flex justify-between items-center mb-4 bg-black/5 p-4 rounded-2xl w-full z-10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Keyboard className="w-6 h-6" /> Falling Words
          </h2>
          <p className="text-sm opacity-70">Type the word before it hits the ground!</p>
        </div>
        
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
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

      <div className="flex-1 w-full bg-slate-900 rounded-3xl relative overflow-hidden shadow-inner border-4 border-slate-800">
        
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Ground Line */}
        <div className="absolute bottom-16 left-0 right-0 h-1 bg-red-500/50 shadow-[0_0_10px_red]" />
        
        <AnimatePresence mode="popLayout">
          {!isExploding && (
            <motion.div
              key={`word-${wordKey}`}
              initial={{ top: "-20%" }}
              animate={{ top: "85%" }} // Move to bottom
              exit={{ scale: 2, opacity: 0, filter: "blur(10px)", color: "#10B981" }} // Explode
              transition={{ 
                top: { duration: Math.max(6, 12 - currentIdx), ease: "linear" }, 
                default: { duration: 0.4 }
              }}
              onAnimationComplete={(definition: any) => {
                // If it finished animating to 85% (hit the ground)
                if (definition && definition.top === "85%") {
                  handleWordHitGround();
                }
              }}
              className="absolute left-0 right-0 text-center z-10"
            >
              <div className="inline-block bg-white px-8 py-4 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.5)] border-4 border-primary">
                {currentWord.split("").map((char, i) => {
                  const isTyped = i < typedText.length;
                  const isCurrent = i === typedText.length;
                  
                  return (
                    <span 
                      key={i} 
                      className={`text-3xl sm:text-4xl font-mono font-black tracking-widest ${
                        isTyped ? 'text-green-500' : isCurrent ? 'text-primary animate-pulse' : 'text-gray-300'
                      }`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isExploding && (
          <motion.div 
            initial={{ scale: 0, opacity: 1 }} 
            animate={{ scale: 5, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl"
          >
            💥
          </motion.div>
        )}

        <div className="absolute bottom-4 left-0 right-0 text-center opacity-30 text-white font-mono text-sm uppercase tracking-widest">
          Type to defend
        </div>
      </div>
      
      {/* Virtual Keyboard (Visible on mobile, usable on desktop too) */}
      <div className="w-full mt-4 flex flex-col items-center gap-1 sm:gap-2 px-2 z-20">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1 w-full max-w-2xl">
            {row.map(key => {
              return (
                <button
                  key={key}
                  onClick={() => processInputChar(key)}
                  disabled={gameOver || isExploding}
                  className={`flex-1 max-w-[40px] sm:max-w-[50px] h-10 sm:h-12 rounded-lg font-bold text-sm sm:text-xl transition-all
                    bg-white/80 text-gray-800 border-b-4 border-gray-300 hover:bg-white hover:border-gray-400 active:border-b-0 active:translate-y-1`}
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
