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

type CategoryItem = { id: string; label: string; icon: string; color?: string };
type MatchItem = { id: string; label: string; matchId: string; icon: string };

export default function DynamicMatch({ materialId, currentHighscore, gameData, onProgressUpdate }: Props) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [items, setItems] = useState<MatchItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{title: string, desc: string, isPass: boolean} | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);

  useEffect(() => {
    let parsedCategories: CategoryItem[] = [];
    let parsedItems: MatchItem[] = [];

    if (gameData?.dynamic_match?.pairs && gameData.dynamic_match.pairs.length > 0) {
      const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500"];
      
      gameData.dynamic_match.pairs.forEach((pair: any, index: number) => {
        const catId = `c${index}`;
        parsedCategories.push({
          id: catId,
          label: pair.category,
          icon: "📌",
          color: colors[index % colors.length]
        });

        pair.items.forEach((itemText: string, itemIdx: number) => {
          if (itemText.trim()) {
            parsedItems.push({
              id: `i${index}-${itemIdx}`,
              label: itemText,
              matchId: catId,
              icon: "🔹"
            });
          }
        });
      });

      setCategories(parsedCategories);
      setItems(parsedItems.sort(() => Math.random() - 0.5));
    } else if (gameData?.leftItems && gameData?.rightItems) {
      setCategories(gameData.leftItems);
      setItems([...gameData.rightItems].sort(() => Math.random() - 0.5));
    } else {
      // Fallback data if none provided
      setCategories([
        { id: "c1", label: "Example A", icon: "🍎", color: "bg-red-500" },
        { id: "c2", label: "Example B", icon: "🍌", color: "bg-yellow-500" }
      ]);
      setItems([
        { id: "i1", label: "Apple", matchId: "c1", icon: "🍎" },
        { id: "i2", label: "Banana", matchId: "c2", icon: "🍌" }
      ]);
    }
  }, [gameData]);

  const handleItemClick = (item: MatchItem) => {
    if (matchedPairs.has(item.id)) return;

    if (!selectedCategory) {
      alert("Please select a Category on the left first!");
      return;
    }

    if (item.matchId === selectedCategory) {
      // Correct!
      sfx.playCorrect();
      const newScore = score + (100 / items.length); // Dynamic scoring based on item count
      setScore(newScore);
      setSelectedCategory(null);

      const nextPairs = new Set(matchedPairs);
      nextPairs.add(item.id);
      setMatchedPairs(nextPairs);

      if (nextPairs.size === items.length) {
        finishGame(newScore);
      }
    } else {
      // Incorrect!
      sfx.playWrong();
      setMistakes(m => m + 1);
      setScore(s => Math.max(0, s - 5)); // Penalize 5 points for wrong match
      setShakeId(item.id);
      setTimeout(() => setShakeId(null), 500);
      setSelectedCategory(null);
    }
  };

  const finishGame = async (finalScore: number) => {
    setGameOver(true);
    setSubmitting(true);
    
    // Normalize score (max 100)
    const normalizedScore = Math.max(0, Math.min(100, Math.round(finalScore)));
    
    const result = await submitGameScore(materialId, normalizedScore);
    
    if (result.success) {
      if (result.perfect) {
        sfx.playUnlock();
        setResultMsg({ title: "PERFECT!", desc: `You got all of them right! +${result.addedXp} XP`, isPass: true });
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
    setMatchedPairs(new Set());
    setScore(0);
    setMistakes(0);
    setGameOver(false);
    setResultMsg(null);
    setSelectedCategory(null);
    setItems([...items].sort(() => Math.random() - 0.5));
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
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-6"
        >
          {resultMsg?.isPass ? (
            <CheckCircle className="w-24 h-24 text-green-500" />
          ) : (
            <XCircle className="w-24 h-24 text-red-500" />
          )}
        </motion.div>
        
        <h2 className="text-3xl font-black mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          {resultMsg?.title}
        </h2>
        <p className="text-xl opacity-80 mb-8">{resultMsg?.desc}</p>
        
        <p className="text-sm opacity-60 mb-8">
          Current Highscore: {Math.round(Math.max(currentHighscore, score))}
        </p>

        {!resultMsg?.isPass && !resultMsg?.desc.includes("Locked") && (
          <button 
            onClick={() => { sfx.playClick(); resetGame(); }}
            onMouseEnter={() => sfx.playHover()}
            className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg"
          >
            Play Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-8 bg-black/5 p-4 rounded-2xl">
        <div>
          <h2 className="text-2xl font-bold">Category Match</h2>
          <p className="text-sm opacity-70">Match the item to the correct category!</p>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-70 font-bold uppercase tracking-widest">Score</div>
          <div className="text-3xl font-black text-primary">{Math.round(score)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 flex-1">
        {/* Categories Column */}
        <div className="space-y-4">
          <h3 className="font-bold text-center opacity-50 uppercase tracking-widest mb-4">1. Select a Category</h3>
          {categories.map(cat => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { sfx.playClick(); setSelectedCategory(cat.id); }}
              onMouseEnter={() => sfx.playHover()}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2 ${
                selectedCategory === cat.id 
                  ? "bg-primary text-white border-transparent shadow-lg transform scale-105" 
                  : "bg-white/50 border-gray-200 hover:border-gray-300 dark:bg-black/20 dark:border-white/10 dark:hover:border-white/20"
              }`}
            >
              <div className={`p-3 rounded-xl flex items-center justify-center text-3xl ${selectedCategory === cat.id ? 'bg-white/20' : cat.color || 'bg-black/5 dark:bg-white/10'}`}>
                {cat.icon}
              </div>
              <span className="text-xl font-bold">{cat.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Items Column */}
        <div className="space-y-4">
          <h3 className="font-bold text-center opacity-50 uppercase tracking-widest mb-4">2. Match the Item</h3>
          <AnimatePresence>
            {items.map(item => {
              if (matchedPairs.has(item.id)) return null;
              
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    opacity: 1, 
                    x: shakeId === item.id ? [-10, 10, -10, 10, 0] : 0 
                  }}
                  transition={{ duration: shakeId === item.id ? 0.4 : 0.2 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => { sfx.playClick(); handleItemClick(item); }}
                  onMouseEnter={() => sfx.playHover()}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2 bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md cursor-pointer ${
                    shakeId === item.id ? 'border-red-500 bg-red-50 dark:bg-red-500/10' : 'hover:border-primary/50'
                  }`}
                >
                  <div className="p-3 bg-black/5 dark:bg-white/10 rounded-xl flex items-center justify-center text-3xl">
                    {item.icon}
                  </div>
                  <span className="text-xl font-bold">{item.label}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
