"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Star, Zap } from "lucide-react";
import { sfx } from "@/lib/audio";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldLevel: number;
  newLevel: number;
}

export default function LevelUpModal({ isOpen, onClose, oldLevel, newLevel }: LevelUpModalProps) {
  useEffect(() => {
    if (isOpen) {
      sfx.playLevelUp();
      // Confetti burst
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#00E5A0', '#FF6B6B', '#00B4D8', '#7C3AED']
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#FFD700', '#00E5A0', '#FF6B6B', '#00B4D8', '#7C3AED']
        });
      }, 250);

      // Auto close after 5 seconds
      const timeout = setTimeout(() => {
        onClose();
      }, 6000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="relative z-10 w-full max-w-sm bg-gradient-to-b from-yellow-400 to-orange-500 rounded-3xl p-1 pointer-events-auto shadow-[0_0_50px_rgba(250,204,21,0.5)]"
          >
            <div className="bg-card-bg rounded-[22px] p-6 sm:p-8 flex flex-col items-center text-center overflow-hidden relative">
              {/* Spinning background rays */}
              <div className="absolute inset-0 z-0 opacity-10 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="w-[200%] h-[200%] bg-[url('/images/rays.svg')] bg-center bg-no-repeat"
                />
              </div>

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-yellow-500/40 mb-6 mx-auto border-4 border-card-bg"
                >
                  <Zap className="w-12 h-12 text-white fill-white" />
                </motion.div>

                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-black text-foreground mb-2"
                >
                  LEVEL UP!
                </motion.h2>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-muted mb-6"
                >
                  You've reached a new milestone! Keep up the great work!
                </motion.p>

                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="flex items-center justify-center gap-4 mb-8"
                >
                  <div className="text-2xl font-bold text-muted opacity-50">{oldLevel}</div>
                  <div className="w-8 h-1 bg-gradient-to-r from-gray-500 to-yellow-500 rounded-full relative">
                    <motion.div 
                      className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 text-yellow-500"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      ▶
                    </motion.div>
                  </div>
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-sm">
                    {newLevel}
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  onClick={onClose}
                  className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
                >
                  Awesome!
                  <Sparkles className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
