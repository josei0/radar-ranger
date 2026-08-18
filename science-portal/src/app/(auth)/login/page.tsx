"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAction } from "../actions";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{ backgroundImage: "url('/images/auth_bg.jpg')" }}
      ></div>
      
      {/* Animated Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-500/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-blue-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[30rem] h-[30rem] bg-purple-500/30 rounded-full mix-blend-screen filter blur-[120px] animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none"></div>

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
            className="w-20 h-20 mx-auto bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-4 border border-white/20"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-lg">
            Science Portal
          </h1>
          <p className="text-cyan-200 mt-2 text-sm font-medium tracking-wide uppercase">Interactive Learning Platform</p>
        </div>

        {/* Glass Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Welcome Back
          </h2>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 backdrop-blur-md"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-cyan-400 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  autoComplete="off"
                  placeholder="student123"
                  className="w-full pl-11 pr-4 py-3.5 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 focus:border-cyan-400 focus:bg-black/50 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-cyan-400 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  autoComplete="off"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 focus:border-cyan-400 focus:bg-black/50 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-cyan-500/40 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? "Authenticating..." : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <p className="text-sm text-gray-400">
              New to Science Portal?{" "}
              <Link
                href="/register"
                className="text-cyan-400 font-bold hover:text-cyan-300 hover:underline transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
