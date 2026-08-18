"use client";

import { Profile } from "@/lib/types";
import { calculateLevel } from "@/lib/utils/level";
import { motion } from "framer-motion";
import { Trophy, Medal, Star, Flame, Crown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface LeaderboardClientProps {
  topStudents: Profile[];
  currentUser: Profile;
}

export default function LeaderboardClient({ topStudents, currentUser }: LeaderboardClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Tiny confetti pop on load
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.2 },
      colors: ['#FFD700', '#FFA500', '#FF6347']
    });
  }, []);

  const top3 = topStudents.slice(0, 3);
  const rest = topStudents.slice(3);

  const getPodiumColor = (index: number) => {
    if (index === 0) return "from-yellow-400 to-yellow-600 border-yellow-300 shadow-yellow-500/50"; // Gold
    if (index === 1) return "from-gray-300 to-gray-500 border-gray-200 shadow-gray-400/50"; // Silver
    if (index === 2) return "from-amber-600 to-orange-800 border-amber-500 shadow-orange-700/50"; // Bronze
    return "bg-card-bg";
  };

  const getPodiumHeight = (index: number) => {
    if (index === 0) return "h-48 sm:h-56";
    if (index === 1) return "h-40 sm:h-48";
    if (index === 2) return "h-32 sm:h-40";
    return "h-20";
  };

  const getPodiumOrder = (index: number) => {
    // Reorder for display: Silver (1) - Gold (0) - Bronze (2)
    if (index === 0) return "order-2 z-10";
    if (index === 1) return "order-1 z-0";
    if (index === 2) return "order-3 z-0";
    return "";
  };

  if (!mounted) return <div className="min-h-screen"></div>;

  return (
    <div className="min-h-[calc(100vh-80px)] relative overflow-hidden bg-background">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[10%] w-[30rem] h-[30rem] rounded-full mix-blend-screen filter blur-[100px] animate-blob bg-yellow-500/20"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[20rem] h-[20rem] rounded-full mix-blend-screen filter blur-[120px] animate-blob bg-orange-500/10" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center gap-4 mb-10">
          <Link href="/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              Leaderboard
            </h1>
            <p className="text-sm opacity-70 mt-1 font-medium">Top students ranked by XP</p>
          </div>
        </div>

        {/* Podium for Top 3 */}
        {top3.length > 0 && (
          <div className="flex justify-center items-end gap-2 sm:gap-4 mb-12 mt-16 px-2">
            {top3.map((student, index) => {
              const { level } = calculateLevel(student.xp);
              const isCurrentUser = student.id === currentUser.id;
              
              return (
                <motion.div 
                  key={student.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, type: "spring", stiffness: 100 }}
                  className={`flex flex-col items-center ${getPodiumOrder(index)} flex-1 max-w-[140px]`}
                >
                  <div className="relative mb-3 flex flex-col items-center group">
                    {index === 0 && (
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -top-10"
                      >
                        <Crown className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                      </motion.div>
                    )}
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 flex items-center justify-center font-bold text-xl sm:text-2xl shadow-xl z-10 bg-black/50 backdrop-blur-md ${isCurrentUser ? 'border-primary ring-4 ring-primary/30' : 'border-white/20'}`}>
                      {student.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="mt-3 font-bold text-center text-sm sm:text-base leading-tight truncate w-full px-1">
                      {student.display_name}
                    </div>
                    <div className="text-xs opacity-70 mt-0.5">Level {level}</div>
                  </div>

                  <div className={`w-full ${getPodiumHeight(index)} bg-gradient-to-t ${getPodiumColor(index)} rounded-t-2xl border-t border-x relative flex flex-col items-center justify-start pt-4 sm:pt-6`}>
                    <div className="text-2xl sm:text-4xl font-black drop-shadow-md text-white/90">
                      {index + 1}
                    </div>
                    <div className="mt-2 flex items-center gap-1 bg-black/20 px-2 py-1 rounded-full border border-white/10 text-white font-bold text-xs sm:text-sm">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300 fill-yellow-300" />
                      {student.xp}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* List for Rank 4+ */}
        {rest.length > 0 && (
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between font-bold text-sm opacity-70 uppercase tracking-wider">
              <span>Rank & Student</span>
              <span>Total XP</span>
            </div>
            <div className="divide-y divide-white/5">
              {rest.map((student, i) => {
                const rank = i + 4;
                const { level } = calculateLevel(student.xp);
                const isCurrentUser = student.id === currentUser.id;

                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (i * 0.05) }}
                    key={student.id} 
                    className={`flex items-center justify-between p-4 sm:px-6 transition-colors hover:bg-white/5 ${isCurrentUser ? 'bg-primary/10 border-l-4 border-primary' : ''}`}
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="w-8 font-bold text-lg opacity-50 text-center">
                        #{rank}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 flex items-center justify-center font-bold">
                        {student.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          {student.display_name}
                          {isCurrentUser && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-widest">You</span>}
                        </div>
                        <div className="text-xs opacity-60">Level {level} • {student.grade_level ? `Grade ${student.grade_level}` : 'Student'}</div>
                      </div>
                    </div>
                    <div className="font-black flex items-center gap-1.5 text-lg">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      {student.xp}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
        
        {topStudents.length === 0 && (
          <div className="text-center py-20 bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl">
            <Trophy className="w-16 h-16 mx-auto opacity-20 mb-4" />
            <h2 className="text-xl font-bold opacity-70">No students yet!</h2>
            <p className="opacity-50 mt-2">Be the first to earn XP and climb the leaderboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}
