"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BookOpen, BrainCircuit, Gamepad2, Medal, Rocket, Sparkles, Star, Telescope, Users } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export default function LandingClient() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

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
    <div className="min-h-screen bg-[#050510] text-white overflow-hidden selection:bg-primary selection:text-white relative" ref={containerRef}>
      
      {/* Background Gradients & Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
        <div className="absolute top-[20%] right-[-20%] w-[40rem] h-[40rem] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60rem] h-[60rem] bg-primary/5 rounded-full blur-[150px] mix-blend-screen animate-blob" style={{ animationDelay: '4s' }}></div>
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center opacity-20"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-xl text-white">⚗️</span>
            </div>
            <span className="font-black text-xl tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Science Portal
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/login" className="text-sm font-bold px-5 py-2.5 rounded-full bg-white text-black hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Floating Icons Parallax */}
        <motion.div style={{ y: y1, opacity }} className="absolute left-[10%] top-[10%] hidden lg:block text-primary/30">
          <Rocket className="w-24 h-24 rotate-45" />
        </motion.div>
        <motion.div style={{ y: y2, opacity }} className="absolute right-[15%] top-[20%] hidden lg:block text-secondary/30">
          <Telescope className="w-32 h-32 -rotate-12" />
        </motion.div>
        <motion.div style={{ y: y3, opacity }} className="absolute left-[20%] bottom-[0%] hidden lg:block text-purple-500/20">
          <BrainCircuit className="w-40 h-40" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-bold text-primary mb-8 backdrop-blur-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>A New Way to Learn Science</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Explore the Universe of<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
            Knowledge
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl opacity-60 max-w-2xl font-medium mb-12"
        >
          Leave boring textbooks behind! Explore the world of science through interactive modules, fun games, and collect champion badges.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link href="/login" className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold text-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-[0_0_40px_rgba(var(--primary),0.4)] group">
            Start Learning
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#features" className="px-8 py-4 rounded-full bg-white/5 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-colors border border-white/10">
            Learn More
          </a>
        </motion.div>
      </section>

      {/* Bento Box Features Section */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Learning Has Never Been This Fun
          </h2>
          <p className="opacity-60 text-lg max-w-2xl mx-auto">
            Our platform is specially designed using gamification techniques proven to increase student engagement.
          </p>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]"
        >
          {/* Bento Item 1 - Large */}
          <motion.div variants={item} className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:bg-white/10 hover:border-primary/50 transition-colors backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] group-hover:bg-primary/30 transition-colors"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6">
                <Gamepad2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2">Interactive Games</h3>
                <p className="opacity-60 text-lg">Practice theories directly through fun mini-games designed to strengthen your memory.</p>
              </div>
            </div>
          </motion.div>

          {/* Bento Item 2 */}
          <motion.div variants={item} className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:bg-white/10 hover:border-yellow-500/50 transition-colors backdrop-blur-xl">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-500/10 rounded-full blur-[60px] group-hover:bg-yellow-500/20 transition-colors"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-400 mb-6">
                <Medal className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black mb-2">Champion Badges</h3>
                <p className="opacity-60">Collect rare badges every time you get a perfect score.</p>
              </div>
            </div>
          </motion.div>

          {/* Bento Item 3 */}
          <motion.div variants={item} className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:bg-white/10 hover:border-secondary/50 transition-colors backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-40 h-40 bg-secondary/10 rounded-full blur-[60px] group-hover:bg-secondary/20 transition-colors"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary mb-6">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black mb-2">XP Level System</h3>
                <p className="opacity-60">Complete modules and level up your character.</p>
              </div>
            </div>
          </motion.div>

          {/* Bento Item 4 - Large */}
          <motion.div variants={item} className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:bg-white/10 hover:border-blue-500/50 transition-colors backdrop-blur-xl">
            <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center opacity-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] group-hover:bg-blue-500/30 transition-colors"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2">Teacher Dashboard & Leaderboard</h3>
                <p className="opacity-60 text-lg">Teachers can monitor student progress in real-time. Students can compete healthily on the global Leaderboard!</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: "var(--font-heading)" }}>
            Ready to Start Your Journey?
          </h2>
          <p className="opacity-60 text-lg mb-10 max-w-xl mx-auto">
            Join other students in learning science in a much more fun and interactive way.
          </p>
          <Link href="/login" className="px-10 py-5 rounded-full bg-white text-black font-black text-xl hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.3)] inline-block">
            Sign Up for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/50 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 text-sm">
          <div className="flex items-center gap-2 font-bold">
            <span className="text-lg">⚗️</span> Science Portal
          </div>
          <p>© 2026 Science Portal Education. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
