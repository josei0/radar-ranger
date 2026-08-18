"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { gradeToCategory, Profile } from "@/lib/types";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Gamepad2, Trophy, Star, Sparkles, BookCheck, Flame, Users, Lock } from "lucide-react";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      setProfile(profileData);

      const category = profileData?.grade_level ? gradeToCategory(profileData.grade_level) : null;
      const isTeacher = profileData?.role === "teacher";

      let materialsQuery = supabase
        .from("materials")
        .select("*")
        .order("topic_order", { ascending: true });

      if (!isTeacher && category) {
        materialsQuery = materialsQuery.eq("category", category);
      }

      const { data: materialsData } = await materialsQuery;
      setMaterials(materialsData || []);

      if (!isTeacher) {
        const { data: progressData } = await supabase
          .from("progress")
          .select("*")
          .eq("user_id", user.id);
          
        setProgressMap(new Map((progressData || []).map((p) => [p.material_id, p])));
      }
      
      setLoading(false);
    }
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isTeacher = profile?.role === "teacher";
  const category = profile?.grade_level ? gradeToCategory(profile.grade_level) : null;

  const categoryLabels: Record<string, string> = {
    sd_1_3: "Elementary 1-3",
    sd_4_6: "Elementary 4-6",
    smp_7_9: "Middle School 7-9",
    sma_10_12: "High School 10-12",
  };

  const bannerImages: Record<string, string> = {
    sd_1_3: "url('/images/banner_playful.jpg')",
    sd_4_6: "url('/images/banner_playful.jpg')",
    smp_7_9: "url('/images/banner_sciencelab.jpg')",
    sma_10_12: "url('/images/banner_futuristic.jpg')",
  };

  const getBannerImage = () => {
    if (isTeacher) return "url('/images/banner_sciencelab.jpg')";
    return category && bannerImages[category] ? bannerImages[category] : "url('/images/banner_playful.jpg')";
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden border border-white/20 p-8 sm:p-12 shadow-2xl bg-black" 
        style={{ borderRadius: "var(--radius-lg)" }}
      >
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700 hover:scale-105"
          style={{ backgroundImage: getBannerImage() }}
        ></div>
        
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        
        <div className="relative z-20 text-white">
          <h2
            className="text-3xl sm:text-5xl font-black mb-3 tracking-tight drop-shadow-md"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {isTeacher
              ? `Welcome, ${profile?.display_name ?? "Teacher"}!`
              : `Hi, ${profile?.display_name ?? "Student"}!`}
          </h2>
          <p className="text-lg opacity-90 max-w-xl font-medium drop-shadow-md">
            {isTeacher
              ? "Monitor your students' progress and manage learning materials from your dashboard."
              : `You are in the ${
                  categoryLabels[category ?? ""] ?? "undetermined"
                } category. Let's explore new knowledge today!`}
          </p>

          {/* Stats row for students */}
          {!isTeacher ? (
            <div className="flex flex-wrap gap-4 mt-8">
              <div className="bg-black/40 backdrop-blur-md px-5 py-3 flex items-center gap-3 font-bold border border-white/20 shadow-lg relative group overflow-hidden" style={{ borderRadius: "var(--radius)" }}>
                <div className="absolute inset-0 bg-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-2 bg-yellow-400/20 rounded-lg animate-pulse-glow relative z-10">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                </div>
                <div className="relative z-10">
                  <div className="text-xs opacity-80 uppercase tracking-wider">Total XP</div>
                  <div className="text-xl">{profile?.xp ?? 0}</div>
                </div>
              </div>
              
              <div className="bg-black/40 backdrop-blur-md px-5 py-3 flex items-center gap-3 font-bold border border-white/20 shadow-lg relative group overflow-hidden" style={{ borderRadius: "var(--radius)" }}>
                <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-2 bg-orange-500/20 rounded-lg animate-pulse-glow relative z-10" style={{ animationDelay: '1s' }}>
                  <Flame className="w-5 h-5 text-orange-400 fill-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]" />
                </div>
                <div className="relative z-10">
                  <div className="text-xs opacity-80 uppercase tracking-wider">Streak</div>
                  <div className="text-xl">{profile?.weekly_streak ?? 0} <span className="text-sm font-medium">weeks</span></div>
                </div>
              </div>
              
              <div className="bg-black/40 backdrop-blur-md px-5 py-3 flex items-center gap-3 font-bold border border-white/20 shadow-lg" style={{ borderRadius: "var(--radius)" }}>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <BookCheck className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                </div>
                <div>
                  <div className="text-xs opacity-80 uppercase tracking-wider">Modules</div>
                  <div className="text-xl">{Array.from(progressMap.values()).filter((p) => p.is_module_completed).length} / {materials.length}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/dashboard/teacher/students" className="bg-black/40 hover:bg-black/60 backdrop-blur-md px-6 py-4 flex items-center gap-3 font-bold border border-white/20 shadow-lg transition-all transform hover:scale-105" style={{ borderRadius: "var(--radius)" }}>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-lg">Manage Students</div>
              </Link>
              <Link href="/dashboard/teacher/materials" className="bg-black/40 hover:bg-black/60 backdrop-blur-md px-6 py-4 flex items-center gap-3 font-bold border border-white/20 shadow-lg transition-all transform hover:scale-105" style={{ borderRadius: "var(--radius)" }}>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <BookOpen className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-lg">Manage Materials</div>
              </Link>
            </div>
          )}

        </div>
      </motion.div>

      {/* Materials Grid */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-primary" />
          <h3
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {isTeacher ? "All Learning Modules" : "Your Learning Path"}
          </h3>
        </div>

        {!materials || materials.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-card-bg/50 backdrop-blur-sm border border-white/10 p-12 text-center" 
            style={{ borderRadius: "var(--radius-lg)" }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
              <Sparkles className="w-8 h-8 opacity-50" />
            </div>
            <p className="font-bold text-xl mb-1">No modules available yet.</p>
            <p className="opacity-60">Check back later when new content is added!</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {materials.map((material) => {
              const progress = progressMap.get(material.id);
              const theoryDone = progress?.is_theory_completed ?? false;
              const gameDone = progress?.is_module_completed ?? false;
              const score = progress?.highscore ?? 0;

              return (
                <motion.div
                  variants={item}
                  key={material.id}
                  className={`group relative bg-card-bg/80 backdrop-blur-md border border-white/10 p-1 overflow-hidden transition-all ${
                    (material.is_published ?? true) || isTeacher
                      ? "hover:shadow-2xl hover:-translate-y-1"
                      : "opacity-60 grayscale cursor-not-allowed"
                  }`}
                  style={{ borderRadius: "var(--radius-lg)" }}
                >
                  {!(material.is_published ?? true) && !isTeacher && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                      <div className="bg-black/80 p-4 rounded-full mb-3 border border-white/10">
                        <Lock className="w-8 h-8 text-gray-400" />
                      </div>
                      <span className="font-bold text-gray-300 uppercase tracking-widest text-sm">Locked by Teacher</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="p-5 h-full flex flex-col relative z-10">
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-3 py-1.5" style={{ borderRadius: "var(--radius)" }}>
                        {categoryLabels[material.category] ?? material.category}
                      </span>
                      {gameDone && (
                        <div className="bg-green-500/10 p-1.5 rounded-full border border-green-500/20">
                          <Trophy className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h4 className="font-black text-xl mb-2 group-hover:text-primary transition-colors leading-tight">
                      {material.title}
                    </h4>
                    <p className="text-sm opacity-70 mb-6 flex-grow line-clamp-2">
                      {material.description ?? "Description not available."}
                    </p>

                    {/* Visual Progress Bar */}
                    {!isTeacher && (
                      <div className="mb-5 space-y-2">
                        <div className="flex justify-between text-xs font-bold opacity-70">
                          <span>Progress</span>
                          <span>{theoryDone && gameDone ? '100%' : theoryDone ? '50%' : '0%'}</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
                          <div className={`h-full transition-all duration-1000 ${theoryDone ? 'bg-primary w-1/2' : 'w-0'}`}></div>
                          <div className={`h-full transition-all duration-1000 ${gameDone ? 'bg-secondary w-1/2' : 'w-0'}`}></div>
                        </div>
                        <div className="flex justify-between text-[10px] uppercase tracking-wider opacity-60 font-bold mt-1">
                          <span className={theoryDone ? 'text-primary opacity-100' : ''}>Theory</span>
                          <span className={gameDone ? 'text-secondary opacity-100' : ''}>
                            {gameDone ? `Score: ${score}` : "Game"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {((material.is_published ?? true) || isTeacher) ? (
                      <Link
                        href={`/dashboard/module/${material.id}`}
                        className="relative overflow-hidden block w-full text-center py-3 bg-gradient-to-r from-primary to-accent text-white font-bold transition-all shadow-lg hover:shadow-primary/25 text-sm group/btn"
                        style={{ borderRadius: "var(--radius)" }}
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform"></div>
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {isTeacher
                            ? "View Details"
                            : gameDone
                            ? "Play Again"
                            : theoryDone
                            ? "Start Game"
                            : "Start Learning"}
                          {!isTeacher && (gameDone ? <Gamepad2 className="w-4 h-4" /> : theoryDone ? <Gamepad2 className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />)}
                        </span>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="relative w-full text-center py-3 bg-gray-800 text-gray-400 font-bold shadow-lg text-sm cursor-not-allowed"
                        style={{ borderRadius: "var(--radius)" }}
                      >
                        <span className="flex items-center justify-center gap-2">
                          Locked
                          <Lock className="w-4 h-4" />
                        </span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
