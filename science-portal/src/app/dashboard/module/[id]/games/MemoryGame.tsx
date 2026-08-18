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

type Pair = { id: string; textA: string; textB: string; iconA: string; iconB: string };
type Card = { uniqueId: string; pairId: string; text: string; icon: string; isFlipped: boolean; isMatched: boolean };

export default function MemoryGame({ materialId, currentHighscore, gameData, onProgressUpdate }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{title: string, desc: string, isPass: boolean} | null>(null);

  // Time based scoring
  const [gameStartTime, setGameStartTime] = useState(Date.now());

  useEffect(() => {
    let pairs: Pair[] = [];
    if (gameData && gameData.memory_match && gameData.memory_match.pairs && gameData.memory_match.pairs.length > 0) {
      pairs = gameData.memory_match.pairs.map((p: any, i: number) => ({
        id: i.toString(),
        textA: p.match1,
        textB: p.match2,
        iconA: "🔹",
        iconB: "🔸"
      }));
    } else if (gameData && gameData.pairs && gameData.pairs.length > 0) {
      pairs = gameData.pairs;
    } else {
      pairs = [
        { id: "1", textA: "Matahari", textB: "Pusat Tata Surya", iconA: "☀️", iconB: "🔭" },
        { id: "2", textA: "Bumi", textB: "Planet Kehidupan", iconA: "🌍", iconB: "🌱" },
        { id: "3", textA: "Klorofil", textB: "Zat Hijau Daun", iconA: "🍃", iconB: "🧪" }
      ];
    }

    const generatedCards: Card[] = [];
    pairs.forEach(p => {
      generatedCards.push({ uniqueId: `A-${p.id}`, pairId: p.id, text: p.textA, icon: p.iconA, isFlipped: false, isMatched: false });
      generatedCards.push({ uniqueId: `B-${p.id}`, pairId: p.id, text: p.textB, icon: p.iconB, isFlipped: false, isMatched: false });
    });

    setCards(generatedCards.sort(() => Math.random() - 0.5));
    setGameStartTime(Date.now());
  }, [gameData]);

  const handleCardClick = (card: Card) => {
    if (card.isFlipped || card.isMatched || flippedIds.length >= 2) return;

    sfx.playClick();
    
    const newFlipped = [...flippedIds, card.uniqueId];
    setFlippedIds(newFlipped);
    
    setCards(prev => prev.map(c => c.uniqueId === card.uniqueId ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      const card1 = cards.find(c => c.uniqueId === newFlipped[0]);
      const card2 = card; // current card being clicked

      if (card1 && card2 && card1.pairId === card2.pairId) {
        // Match
        setTimeout(() => {
          sfx.playCorrect();
          setCards(prev => prev.map(c => 
            c.pairId === card1.pairId ? { ...c, isMatched: true } : c
          ));
          setFlippedIds([]);
          
          // Add score
          const pts = 100 / (cards.length / 2);
          setScore(s => s + pts);

          // Check Win
          const allMatched = cards.every(c => c.isMatched || c.pairId === card1.pairId);
          if (allMatched) {
            finishGame(score + pts);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          sfx.playWrong();
          setMistakes(m => m + 1);
          setScore(s => Math.max(0, s - 2)); // minor penalty for bad memory
          setCards(prev => prev.map(c => 
            newFlipped.includes(c.uniqueId) ? { ...c, isFlipped: false } : c
          ));
          setFlippedIds([]);
        }, 1000);
      }
    }
  };

  const finishGame = async (finalScore: number) => {
    setGameOver(true);
    setSubmitting(true);
    
    // Add speed bonus for completing the whole board fast
    const timeTaken = Date.now() - gameStartTime;
    // 30 seconds max for full bonus, diminishes to 0 after 60 seconds
    const speedMultiplier = Math.max(0, 1 - (timeTaken - 30000) / 30000);
    const speedBonus = 20 * speedMultiplier; // max 20 extra points

    const normalizedScore = Math.max(0, Math.min(100, Math.round(finalScore + speedBonus)));
    const result = await submitGameScore(materialId, normalizedScore);
    
    if (result.success) {
      if (result.perfect) {
        sfx.playUnlock();
        setResultMsg({ title: "MASTER MEMORY!", desc: `You remembered everything! +${result.addedXp} XP`, isPass: true });
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
    setFlippedIds([]);
    setGameOver(false);
    setResultMsg(null);
    setGameStartTime(Date.now());
    
    const unflip = cards.map(c => ({...c, isFlipped: false, isMatched: false}));
    setCards(unflip.sort(() => Math.random() - 0.5));
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
    <div className="flex flex-col h-full items-center max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8 bg-black/5 p-4 rounded-2xl w-full">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Memory Match</h2>
          <p className="text-sm opacity-70">Find the matching pairs!</p>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-70 font-bold uppercase tracking-widest">Score</div>
          <div className="text-3xl font-black text-primary">{Math.round(score)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full perspective-1000">
        <AnimatePresence>
          {cards.map(card => {
            const isFlipped = card.isFlipped || card.isMatched;
            return (
              <motion.div
                key={card.uniqueId}
                layout
                onClick={() => handleCardClick(card)}
                onMouseEnter={() => !isFlipped && sfx.playHover()}
                className={`relative w-full aspect-square sm:aspect-[4/3] rounded-2xl cursor-pointer preserve-3d transition-all duration-500 ${
                  isFlipped ? 'rotate-y-180' : 'hover:-translate-y-1 hover:shadow-lg'
                }`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Back of card (Face Down) */}
                <div className={`absolute inset-0 backface-hidden bg-primary/10 border-2 border-primary/20 rounded-2xl flex items-center justify-center text-primary/30 ${isFlipped ? 'opacity-0' : 'opacity-100'}`} style={{ backfaceVisibility: 'hidden' }}>
                  <span className="text-4xl font-black">?</span>
                </div>

                {/* Front of card (Face Up) */}
                <div className={`absolute inset-0 backface-hidden bg-white border-2 border-gray-200 rounded-2xl flex flex-col items-center justify-center p-2 text-center shadow-md rotate-y-180 ${card.isMatched ? 'ring-4 ring-green-400 border-green-400 bg-green-50' : ''}`} style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <span className="text-3xl sm:text-4xl mb-2">{card.icon}</span>
                  <span className="text-sm font-bold leading-tight">{card.text}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
