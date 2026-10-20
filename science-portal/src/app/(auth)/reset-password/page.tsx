"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  KeyRound,
  User,
  Lock,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import {
  resetTeacherPassword,
  resetStudentPasswordPublic,
} from "./actions";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<"student" | "teacher">(
    "student"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const accessCode = formData.get("accessCode") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setError("Password baru dan konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    let result;
    if (accountType === "teacher") {
      result = await resetTeacherPassword(username, accessCode, newPassword);
    } else {
      result = await resetStudentPasswordPublic(
        username,
        accessCode,
        newPassword
      );
    }

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 relative overflow-hidden bg-black">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50 fixed"
        style={{ backgroundImage: "url('/images/auth_bg.jpg')" }}
      ></div>

      {/* Animated Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none fixed">
        <div className="absolute top-[-10%] left-[10%] w-96 h-96 bg-amber-500/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div
          className="absolute top-[40%] right-[-10%] w-96 h-96 bg-orange-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-[-20%] left-[-10%] w-[30rem] h-[30rem] bg-red-500/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob"
          style={{ animationDelay: "4s" }}
        ></div>
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
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="w-16 h-16 mx-auto bg-gradient-to-tr from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4 border border-white/20"
          >
            <KeyRound className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-lg">
            Reset Password
          </h1>
          <p className="text-amber-200 mt-2 text-sm font-medium tracking-wide uppercase">
            Atur ulang kata sandi akun Anda
          </p>
        </div>

        {/* Glass Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Password Berhasil Direset!
              </h2>
              <p className="text-gray-300 text-sm mb-8 leading-relaxed">
                Password Anda sudah diperbarui. Silakan login dengan password
                baru Anda.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3.5 px-8 rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/25"
              >
                <ArrowLeft className="w-5 h-5" />
                Kembali ke Login
              </Link>
            </motion.div>
          ) : (
            <>
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
                {/* Account Type Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Tipe Akun
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAccountType("student")}
                      className={`py-3 px-2 rounded-xl font-bold text-sm transition-all cursor-pointer border flex items-center justify-center gap-2 ${
                        accountType === "student"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] backdrop-blur-md"
                          : "bg-black/30 text-gray-400 border-white/10 hover:border-amber-500/50 hover:text-amber-200"
                      }`}
                    >
                      <GraduationCap className="w-5 h-5" />
                      Siswa
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType("teacher")}
                      className={`py-3 px-2 rounded-xl font-bold text-sm transition-all cursor-pointer border flex items-center justify-center gap-2 ${
                        accountType === "teacher"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] backdrop-blur-md"
                          : "bg-black/30 text-gray-400 border-white/10 hover:border-amber-500/50 hover:text-amber-200"
                      }`}
                    >
                      <Briefcase className="w-5 h-5" />
                      Guru
                    </button>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                    Username
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-400 transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      required
                      autoComplete="off"
                      placeholder="Masukkan username Anda"
                      className="w-full pl-11 pr-4 py-3.5 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 focus:border-amber-400 focus:bg-black/50 focus:ring-1 focus:ring-amber-400 focus:outline-none transition-all text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                {/* Access Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                    Kode Akses
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-400 transition-colors">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      name="accessCode"
                      required
                      autoComplete="off"
                      placeholder="Masukkan kode akses"
                      className="w-full pl-11 pr-4 py-3.5 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 focus:border-amber-400 focus:bg-black/50 focus:ring-1 focus:ring-amber-400 focus:outline-none transition-all text-white placeholder:text-gray-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 pl-1">
                    {accountType === "teacher"
                      ? "Masukkan Kode Akses Guru untuk verifikasi."
                      : "Minta kode akses dari guru Anda."}
                  </p>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                    Password Baru
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-400 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      name="newPassword"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-11 pr-4 py-3.5 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 focus:border-amber-400 focus:bg-black/50 focus:ring-1 focus:ring-amber-400 focus:outline-none transition-all text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-400 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Ketik ulang password baru"
                      className="w-full pl-11 pr-4 py-3.5 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 focus:border-amber-400 focus:bg-black/50 focus:ring-1 focus:ring-amber-400 focus:outline-none transition-all text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-amber-500/40 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    "Memproses..."
                  ) : (
                    <>
                      <KeyRound className="w-5 h-5" />
                      Reset Password
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center border-t border-white/10 pt-6">
                <p className="text-sm text-gray-400">
                  Sudah ingat password?{" "}
                  <Link
                    href="/login"
                    className="text-amber-400 font-bold hover:text-amber-300 hover:underline transition-colors"
                  >
                    Kembali ke Login
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
