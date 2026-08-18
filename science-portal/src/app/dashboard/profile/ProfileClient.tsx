"use client";

import { Profile } from "@/lib/types";
import { calculateLevel } from "@/lib/utils/level";
import { motion } from "framer-motion";
import { useState } from "react";
import { Trophy, Star, Shield, ArrowLeft, Loader2, Sparkles, Medal } from "lucide-react";
import Link from "next/link";
import { updateAvatar } from "../actions/profile";
import { getAvatarUrl } from "@/lib/utils/avatar";

interface EarnedBadge {
  materialId: number;
  title: string;
  badgeName: string;
  category: string;
  earnedAt: string;
}

interface ProfileClientProps {
  profile: Profile;
  earnedBadges: EarnedBadge[];
}

interface AvatarOption {
  style: string;
  seed: string;
}

const STYLES = ["bottts", "fun-emoji", "adventurer", "lorelei"];
const SEEDS = [
  "Felix", "Aneka", "Mimi", "Jasper", "Tinkerbell", "Buster", "Bella", "Oliver", "Leo", "Cleo",
  "Chloe", "Oreo", "Daisy", "Charlie", "Max", "Luna", "Simba", "Nala", "Milo", "Coco",
  "Lola", "Buddy", "Lucy", "Rocky", "Jack"
];

const AVATAR_OPTIONS: AvatarOption[] = STYLES.flatMap(style => 
  SEEDS.map(seed => ({ style, seed }))
);

export default function ProfileClient({ profile, earnedBadges }: ProfileClientProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(profile.avatar_id || "bottts:Felix");
  const [isSaving, setIsSaving] = useState(false);
  const { level, progressPercent } = calculateLevel(profile.xp);

  const handleSaveAvatar = async (seed: string) => {
    if (seed === profile.avatar_id) return;
    
    setIsSaving(true);
    setSelectedAvatar(seed);
    await updateAvatar(seed);
    setIsSaving(false);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] relative overflow-hidden bg-background">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[10%] w-[30rem] h-[30rem] rounded-full mix-blend-screen filter blur-[100px] animate-blob bg-blue-500/20"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[20rem] h-[20rem] rounded-full mix-blend-screen filter blur-[120px] animate-blob bg-purple-500/10" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10 space-y-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              My Profile
            </h1>
            <p className="text-sm opacity-70 mt-1 font-medium">Customize your avatar and view your badges</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Stats */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card-bg/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center"
            >
              <div className="relative mb-4 group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-accent p-1 shadow-[0_0_30px_rgba(var(--primary),0.3)]">
                  <div className="w-full h-full rounded-full bg-card-bg flex items-center justify-center overflow-hidden relative">
                    {isSaving && (
                      <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                      </div>
                    )}
                    <img 
                      src={getAvatarUrl(selectedAvatar)} 
                      alt="Avatar" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                    />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-black">{profile.display_name}</h2>
              <p className="text-sm opacity-60 capitalize font-medium mb-6">
                {profile.role === 'teacher' ? 'Teacher' : `Grade ${profile.grade_level} Student`}
              </p>

              <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/10 space-y-4">
                <div className="flex justify-between items-center font-bold">
                  <span className="opacity-70">Level {level}</span>
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-yellow-400" /> {profile.xp} XP
                  </span>
                </div>
                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="text-xs opacity-50 text-right">{progressPercent}% to next level</div>
              </div>
            </motion.div>

            {/* Avatar Selector */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card-bg/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
            >
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                Choose Avatar
              </h3>
              <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2">
                {AVATAR_OPTIONS.map((opt) => {
                  const id = `${opt.style}:${opt.seed}`;
                  return (
                    <button
                      key={id}
                      onClick={() => handleSaveAvatar(id)}
                      className={`aspect-square rounded-xl p-1 transition-all ${
                        selectedAvatar === id 
                          ? 'bg-gradient-to-tr from-primary to-accent scale-110 shadow-lg' 
                          : 'bg-white/5 hover:bg-white/10 border border-white/5 hover:scale-105'
                      }`}
                    >
                      <div className="w-full h-full rounded-lg bg-card-bg overflow-hidden">
                        <img src={getAvatarUrl(id)} alt={opt.seed} loading="lazy" className="w-full h-full object-cover" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Badges */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card-bg/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl h-full"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-2xl font-black flex items-center gap-3">
                    <Medal className="w-7 h-7 text-yellow-400" />
                    Badge Gallery
                  </h3>
                  <p className="text-sm opacity-60 mt-1">Earn badges by completing modules with a Perfect Score (100)!</p>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-xl font-bold border border-white/5">
                  <span className="text-yellow-400">{earnedBadges.length}</span> Badges
                </div>
              </div>

              {earnedBadges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {earnedBadges.map((badge, i) => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                      key={badge.materialId}
                      className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-2xl p-4 flex gap-4 items-center group hover:bg-white/10 transition-colors"
                    >
                      <div className="w-16 h-16 shrink-0 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-110 transition-transform">
                        <Trophy className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-1">
                          {badge.badgeName}
                        </div>
                        <h4 className="font-bold leading-tight mb-1">{badge.title}</h4>
                        <div className="text-xs opacity-50" suppressHydrationWarning>
                          Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                    <Trophy className="w-10 h-10 opacity-20" />
                  </div>
                  <h4 className="text-xl font-bold opacity-70 mb-2">No badges yet</h4>
                  <p className="opacity-50 max-w-sm">
                    Play interactive games and get a perfect score to start collecting awesome badges!
                  </p>
                  <Link href="/dashboard" className="mt-6 px-6 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary-hover transition-colors text-sm">
                    Find Modules
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
