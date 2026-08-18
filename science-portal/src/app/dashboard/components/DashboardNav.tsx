"use client";

import { useState } from "react";
import { Profile, ThemeVariant } from "@/lib/types";
import { logoutAction } from "@/app/(auth)/actions";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Zap, Flame, User, Trophy } from "lucide-react";
import { calculateLevel } from "@/lib/utils/level";
import { getAvatarUrl } from "@/lib/utils/avatar";
import Link from "next/link";

interface DashboardNavProps {
  profile: Profile | null;
  theme: ThemeVariant;
}

export default function DashboardNav({ profile, theme }: DashboardNavProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { level, currentXp, progressPercent } = calculateLevel(profile?.xp ?? 0);

  return (
    <nav className="sticky top-0 z-50 bg-nav-bg/80 backdrop-blur-xl border-b border-white/10 text-nav-text shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <span className="text-xl text-white">
                {theme === "playful" ? "🔬" : theme === "sciencelab" ? "⚗️" : "🧬"}
              </span>
            </div>
            <div>
              <h1
                className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-nav-text to-nav-text/70"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Science Portal
              </h1>
            </div>
          </Link>
        </motion.div>

        {/* User Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 sm:gap-5"
        >
          {/* Stats Group */}
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/dashboard/leaderboard" className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 transition-colors px-3 py-1.5 rounded-full text-sm backdrop-blur-md border border-white/5 group">
              <Trophy className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold hidden md:inline">Leaderboard</span>
            </Link>

            <div className="flex flex-col justify-center bg-white/10 px-3 py-1 rounded-xl backdrop-blur-md border border-white/5 cursor-default group relative overflow-hidden min-w-[100px]">
              <div className="flex justify-between items-center gap-2 text-xs font-bold w-full z-10 relative">
                <span className="flex items-center gap-1 whitespace-nowrap"><Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" /> Lv {level}</span>
                <span className="opacity-70 whitespace-nowrap">{progressPercent}%</span>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
                <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 transition-colors px-3 py-1.5 rounded-full text-sm backdrop-blur-md border border-white/5 cursor-default group">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 group-hover:scale-110 transition-transform" />
              <span className="font-bold">{profile?.weekly_streak ?? 0}</span>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block w-px h-8 bg-white/10"></div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 group cursor-pointer p-1.5 pr-3 hover:bg-white/5 rounded-full transition-colors border border-transparent hover:border-white/10"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-white/20 to-white/5 border border-white/20 flex items-center justify-center font-bold text-sm shadow-inner group-hover:shadow-primary/30 transition-all overflow-hidden">
                {profile?.avatar_id ? (
                  <img src={getAvatarUrl(profile.avatar_id)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold leading-tight group-hover:text-primary transition-colors">
                  {profile?.display_name ?? "User"}
                </p>
                <p className="text-xs font-medium opacity-60">
                  {profile?.role === "teacher"
                    ? "Teacher"
                    : profile?.grade_level
                    ? `Grade ${profile.grade_level}`
                    : "Student"}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-card-bg/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl py-2 overflow-hidden z-50 text-foreground"
                >
                  <div className="px-4 py-2 border-b border-white/10 sm:hidden">
                    <p className="font-bold text-sm">{profile?.display_name}</p>
                    <p className="text-xs opacity-60 capitalize">{profile?.role}</p>
                  </div>
                  
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors cursor-pointer group text-sm font-semibold"
                  >
                    <User className="w-4 h-4 group-hover:text-primary transition-colors" />
                    <span className="group-hover:text-primary transition-colors">My Profile</span>
                  </Link>

                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer group text-sm font-semibold border-t border-white/5"
                    >
                      <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Sign Out
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </nav>
  );
}
