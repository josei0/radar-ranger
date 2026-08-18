"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitGameScore } from "../../../actions";
import { Eye, Ear, Flower2, Hand, Cookie, Music, Sparkles, Volume2, Flame, Droplets, CheckCircle, XCircle } from "lucide-react";
import { sfx } from "@/lib/audio";

interface Props {
  materialId: number;
  currentHighscore: number;
  gameData?: any;
  onProgressUpdate: (progress: any) => void;
}

type Sense = { id: string; name: string; icon: React.ReactNode; color: string };
type ObjectItem = { id: string; name: string; matchId: string; icon: React.ReactNode };

const DEFAULT_SENSES: Sense[] = [
  { id: "sight", name: "Sight", icon: <Eye className="w-8 h-8" />, color: "bg-blue-500" },
  { id: "hearing", name: "Hearing", icon: <Ear className="w-8 h-8" />, color: "bg-orange-500" },
  { id: "smell", name: "Smell", icon: <Flower2 className="w-8 h-8" />, color: "bg-pink-500" },
  { id: "taste", name: "Taste", icon: <Cookie className="w-8 h-8" />, color: "bg-yellow-500" },
  { id: "touch", name: "Touch", icon: <Hand className="w-8 h-8" />, color: "bg-green-500" },
];

const DEFAULT_OBJECTS: ObjectItem[] = [
  { id: "obj1", name: "Beautiful Rainbow", matchId: "sight", icon: <Sparkles className="w-8 h-8 text-blue-500" /> },
  { id: "obj2", name: "Loud Music", matchId: "hearing", icon: <Music className="w-8 h-8 text-orange-500" /> },
  { id: "obj3", name: "Sweet Flower", matchId: "smell", icon: <Flower2 className="w-8 h-8 text-pink-500" /> },
  { id: "obj4", name: "Delicious Cake", matchId: "taste", icon: <Cookie className="w-8 h-8 text-yellow-500" /> },
  { id: "obj5", name: "Hot Fire", matchId: "touch", icon: <Flame className="w-8 h-8 text-green-500" /> },
];

export default function SensorMatch({ materialId, currentHighscore, gameData, onProgressUpdate }: Props) {
  const [senses, setSenses] = useState<Sense[]>([]);
  const [objects, setObjects] = useState<ObjectItem[]>([]);
  const [selectedSense, setSelectedSense] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{title: string, desc: string, isPass: boolean} | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);

  useEffect(() => {
    if (gameData && gameData.sensor_match && gameData.sensor_match.length > 0) {
      const colors = ["bg-blue-500", "bg-orange-500", "bg-pink-500", "bg-yellow-500", "bg-green-500"];
      const icons = [<Sparkles className="w-8 h-8" key="1" />, <Music className="w-8 h-8" key="2" />, <Flower2 className="w-8 h-8" key="3" />, <Cookie className="w-8 h-8" key="4" />, <Flame className="w-8 h-8" key="5" />];
      
      const parsedSenses: Sense[] = [];
      const parsedObjects: ObjectItem[] = [];
      
      gameData.sensor_match.forEach((pair: any, index: number) => {
        const id = `s${index}`;
        parsedSenses.push({
          id,
          name: pair.left,
          icon: <CheckCircle className="w-8 h-8" />,
          color: colors[index % colors.length]
        });
        parsedObjects.push({
          id: `o${index}`,
          name: pair.right,
          matchId: id,
          icon: icons[index % icons.length]
        });
      });
      setSenses(parsedSenses);
      setObjects([...parsedObjects].sort(() => Math.random() - 0.5));
    } else {
      setSenses(DEFAULT_SENSES);
      setObjects([...DEFAULT_OBJECTS].sort(() => Math.random() - 0.5));
    }
  }, [gameData]);

  const handleObjectClick = (obj: ObjectItem) => {
    if (matchedPairs.has(obj.id)) return;

    if (!selectedSense) {
      alert("Please select a Sense on the left first!");
      return;
    }

    if (obj.matchId === selectedSense) {
      // Correct!
      sfx.playCorrect();
      const newScore = score + 20;
      setScore(newScore);
      setSelectedSense(null);

      const nextPairs = new Set(matchedPairs);
      nextPairs.add(obj.id);
      setMatchedPairs(nextPairs);

      if (nextPairs.size === objects.length) {
        finishGame(newScore);
      }
    } else {
      // Incorrect!
      sfx.playWrong();
      setMistakes(m => m + 1);
      setScore(s => Math.max(0, s - 5)); // Penalize 5 points for wrong match
      setShakeId(obj.id);
      setTimeout(() => setShakeId(null), 500);
      setSelectedSense(null);
    }
  };

  const finishGame = async (finalScore: number) => {
    setGameOver(true);
    setSubmitting(true);
    
    // Normalize score (max 100)
    const normalizedScore = Math.max(0, Math.min(100, finalScore));
    
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
    setSelectedSense(null);
    setObjects(prev => [...prev].sort(() => Math.random() - 0.5));
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
          <h2 className="text-2xl font-bold">Sensor Match</h2>
          <p className="text-sm opacity-70">Match the object to the correct sense!</p>
        </div>
        <div className="text-right">
          <div className="text-sm opacity-70 font-bold uppercase tracking-widest">Score</div>
          <div className="text-3xl font-black text-primary">{score}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 flex-1">
        {/* Senses Column */}
        <div className="space-y-4">
          <h3 className="font-bold text-center opacity-50 uppercase tracking-widest mb-4">1. Select a Sense</h3>
          {senses.map(sense => (
            <motion.button
              key={sense.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { sfx.playClick(); setSelectedSense(sense.id); }}
              onMouseEnter={() => sfx.playHover()}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2 ${
                selectedSense === sense.id 
                  ? `${sense.color} text-white border-transparent shadow-lg transform scale-105` 
                  : "bg-white/50 border-gray-200 hover:border-gray-300 dark:bg-black/20 dark:border-white/10 dark:hover:border-white/20"
              }`}
            >
              <div className={`p-3 rounded-xl ${selectedSense === sense.id ? 'bg-white/20' : 'bg-black/5 dark:bg-white/10'}`}>
                {sense.icon}
              </div>
              <span className="text-xl font-bold">{sense.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Objects Column */}
        <div className="space-y-4">
          <h3 className="font-bold text-center opacity-50 uppercase tracking-widest mb-4">2. Match the Object</h3>
          <AnimatePresence>
            {objects.map(obj => {
              if (matchedPairs.has(obj.id)) return null;
              
              return (
                <motion.button
                  key={obj.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    opacity: 1, 
                    x: shakeId === obj.id ? [-10, 10, -10, 10, 0] : 0 
                  }}
                  transition={{ duration: shakeId === obj.id ? 0.4 : 0.2 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => { sfx.playClick(); handleObjectClick(obj); }}
                  onMouseEnter={() => sfx.playHover()}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border-2 bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md cursor-pointer ${
                    shakeId === obj.id ? 'border-red-500 bg-red-50 dark:bg-red-500/10' : 'hover:border-primary/50'
                  }`}
                >
                  <div className="p-3 bg-black/5 dark:bg-white/10 rounded-xl">
                    {obj.icon}
                  </div>
                  <span className="text-xl font-bold">{obj.name}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
