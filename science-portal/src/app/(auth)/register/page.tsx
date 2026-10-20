"use client";

import { useState } from "react";
import Link from "next/link";
import { registerAction } from "../actions";
import { motion } from "framer-motion";
import { User, Lock, Sparkles, ArrowRight, UserPlus, GraduationCap, Briefcase } from "lucide-react";

const GRADE_OPTIONS = [
  { label: "Elementary Grade 1", value: 1 },
  { label: "Elementary Grade 2", value: 2 },
  { label: "Elementary Grade 3", value: 3 },
  { label: "Elementary Grade 4", value: 4 },
  { label: "Elementary Grade 5", value: 5 },
  { label: "Elementary Grade 6", value: 6 },
  { label: "Middle School Grade 7", value: 7 },
  { label: "Middle School Grade 8", value: 8 },
  { label: "Middle School Grade 9", value: 9 },
  { label: "High School Grade 10", value: 10 },
  { label: "High School Grade 11", value: 11 },
  { label: "High School Grade 12", value: 12 },
];

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"student" | "teacher">("student");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 py-12 relative overflow-hidden bg-black"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50 fixed"
        style={{ backgroundImage: "url('/images/auth_bg.jpg')" }}
      ></div>
      
      {/* Animated Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none fixed">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-pink-500/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] left-[-10%] w-96 h-96 bg-purple-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-20%] right-[20%] w-[30rem] h-[30rem] bg-indigo-500/30 rounded-full mix-blend-screen filter blur-[120px] animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-black/60 to-black/90 fixed pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Area */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-16 h-16 mx-auto bg-gradient-to-tr from-cyan-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4 border border-white/20"
          >
            <UserPlus className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-lg">
            Join the Portal
          </h1>
          <p className="text-purple-200 mt-2 text-sm font-medium tracking-wide uppercase">Create your account</p>
        </div>

        {/* Glass Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 backdrop-blur-md"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 min-w-[6px]"></div>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                Display Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-400 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="displayName"
                  required
                  maxLength={30}
                  autoComplete="off"
                  placeholder="e.g. John Doe"
                  className="w-full pl-11 pr-4 py-3.5 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 focus:border-purple-400 focus:bg-black/50 focus:ring-1 focus:ring-purple-400 focus:outline-none transition-all text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-400 transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  autoComplete="off"
                  placeholder="student123"
                  className="w-full pl-11 pr-4 py-3.5 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 focus:border-purple-400 focus:bg-black/50 focus:ring-1 focus:ring-purple-400 focus:outline-none transition-all text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-400 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  className="w-full pl-11 pr-4 py-3.5 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 focus:border-purple-400 focus:bg-black/50 focus:ring-1 focus:ring-purple-400 focus:outline-none transition-all text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`py-3 px-2 rounded-xl font-bold text-sm transition-all cursor-pointer border flex items-center justify-center gap-2 ${
                    role === "student"
                      ? "bg-purple-500/20 text-purple-300 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] backdrop-blur-md"
                      : "bg-black/30 text-gray-400 border-white/10 hover:border-purple-500/50 hover:text-purple-200"
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole("teacher")}
                  className={`py-3 px-2 rounded-xl font-bold text-sm transition-all cursor-pointer border flex items-center justify-center gap-2 ${
                    role === "teacher"
                      ? "bg-purple-500/20 text-purple-300 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] backdrop-blur-md"
                      : "bg-black/30 text-gray-400 border-white/10 hover:border-purple-500/50 hover:text-purple-200"
                  }`}
                >
                  <Briefcase className="w-5 h-5" />
                  Teacher
                </button>
              </div>
              <input type="hidden" name="role" value={role} />
            </div>

            {/* Grade Selector (only for students) */}
            {role === "student" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <label className="block text-sm font-semibold text-gray-300 mb-1.5 mt-1">
                  Grade Level
                </label>
                <select
                  name="gradeLevel"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-white/10 focus:border-purple-400 focus:outline-none transition-colors text-white bg-black/60 backdrop-blur-sm cursor-pointer appearance-none"
                >
                  <option value="" className="bg-gray-900">— Select Grade —</option>
                  {GRADE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-gray-900">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}

            {/* Teacher Access Code */}
            {role === "teacher" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <input type="hidden" name="gradeLevel" value="" />
                <label className="block text-sm font-semibold text-gray-300 mb-1.5 mt-1">
                  Teacher Access Code
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-400 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    name="teacherCode"
                    required
                    autoComplete="off"
                    placeholder="Enter secret code"
                    className="w-full pl-11 pr-4 py-3.5 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 focus:border-purple-400 focus:bg-black/50 focus:ring-1 focus:ring-purple-400 focus:outline-none transition-all text-white placeholder:text-gray-500"
                  />
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:from-purple-400 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-pink-500/40 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? "Creating Account..." : (
                <>
                  Register Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-purple-400 font-bold hover:text-purple-300 hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
