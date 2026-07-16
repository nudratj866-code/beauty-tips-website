import React, { useState } from "react";
import { X, Mail, Lock, User, Sparkles, AlertCircle, KeyRound, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User as UserType } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserType, token: string) => void;
  initialMode?: "signin" | "signup";
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "verify">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [skinType, setSkinType] = useState("Combination");
  const [hairType, setHairType] = useState("Wavy");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to sign in.");
        
        onAuthSuccess(data.user, data.token);
        onClose();
      } else if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, skinType, hairType })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to sign up.");

        onAuthSuccess(data.user, data.token);
        // Automatically set to verification view
        setMode("verify");
      } else if (mode === "forgot") {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to trigger reset.");
        
        setSuccess(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateVerification = async () => {
    setError(null);
    setLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify email.");

      setSuccess("Your email has been verified successfully! Welcome to Aura.");
      setTimeout(() => {
        if (data.user) {
          onAuthSuccess(data.user, token || "");
        }
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl dark:bg-[#25181A] border border-pink-100 dark:border-rose-950/40"
      >
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-pink-100/40 blur-3xl dark:bg-pink-900/10 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-[#FFEFEF]/30 blur-3xl dark:bg-[#3D2B2B]/10 pointer-events-none" />

        <button
          onClick={onClose}
          id="close-auth-btn"
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-pink-500 dark:bg-[#1A0F11] dark:text-pink-400 mb-3 border border-pink-100/25">
            <Sparkles size={24} />
          </div>
          
          <h2 className="text-2xl font-bold font-serif text-[#3D2B2B] dark:text-stone-50">
            {mode === "signin" && "Welcome Back"}
            {mode === "signup" && "Join Aura Beauty"}
            {mode === "forgot" && "Recover Password"}
            {mode === "verify" && "Email Verification"}
          </h2>
          <p className="text-xs text-[#4A3E3E]/75 dark:text-stone-400 mt-1">
            {mode === "signin" && "Sign in to access your customized beauty tips & favorites"}
            {mode === "signup" && "Create your beauty profile to start your radiant journey"}
            {mode === "forgot" && "Enter your email to receive simulated password details"}
            {mode === "verify" && "Verify your email to complete registration"}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
            <CheckCircle size={16} className="shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode !== "verify" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-medium text-[#4A3E3E] dark:text-stone-300 mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sophia Rose"
                      className="w-full rounded-xl border border-pink-100 bg-pink-50/10 py-2.5 pl-10 pr-4 text-sm outline-hidden transition-all focus:border-pink-300 focus:bg-white dark:border-rose-950/40 dark:bg-[#1A0F11] dark:text-stone-100 dark:focus:border-pink-800"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#4A3E3E] dark:text-stone-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-pink-100 bg-pink-50/10 py-2.5 pl-10 pr-4 text-sm outline-hidden transition-all focus:border-pink-300 focus:bg-white dark:border-rose-950/40 dark:bg-[#1A0F11] dark:text-stone-100 dark:focus:border-pink-800"
                  />
                </div>
              </div>

              {mode !== "forgot" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-[#4A3E3E] dark:text-stone-300">
                      Password
                    </label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-xs text-pink-500 hover:underline hover:text-pink-600 dark:text-pink-400 cursor-pointer"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-pink-100 bg-pink-50/10 py-2.5 pl-10 pr-4 text-sm outline-hidden transition-all focus:border-pink-300 focus:bg-white dark:border-rose-950/40 dark:bg-[#1A0F11] dark:text-stone-100 dark:focus:border-pink-800"
                    />
                  </div>
                </div>
              )}

              {mode === "signup" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#4A3E3E] dark:text-stone-300 mb-1">
                      Skin Type
                    </label>
                    <select
                      value={skinType}
                      onChange={(e) => setSkinType(e.target.value)}
                      className="w-full rounded-xl border border-pink-100 bg-pink-50/10 p-2.5 text-xs outline-hidden dark:border-rose-950/40 dark:bg-[#1A0F11] dark:text-stone-100 focus:bg-white"
                    >
                      <option>Normal</option>
                      <option>Dry</option>
                      <option>Oily</option>
                      <option>Combination</option>
                      <option>Sensitive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4A3E3E] dark:text-stone-300 mb-1">
                      Hair Type
                    </label>
                    <select
                      value={hairType}
                      onChange={(e) => setHairType(e.target.value)}
                      className="w-full rounded-xl border border-pink-100 bg-pink-50/10 p-2.5 text-xs outline-hidden dark:border-rose-950/40 dark:bg-[#1A0F11] dark:text-stone-100 focus:bg-white"
                    >
                      <option>Straight</option>
                      <option>Wavy</option>
                      <option>Curly</option>
                      <option>Coily</option>
                      <option>Fine</option>
                      <option>Thick</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium py-2.5 text-sm transition-all shadow-md shadow-pink-100 dark:shadow-none hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Please wait..." : (
                  mode === "signin" ? "Sign In" : 
                  mode === "signup" ? "Create Account" : "Get Reset Link"
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pink-50 dark:bg-[#1A0F11] text-pink-500 mb-2 border border-pink-100/30">
                <KeyRound size={28} />
              </div>
              <p className="text-sm text-stone-700 dark:text-stone-300">
                To complete registration and access premium features, click below to simulate verifying your email address.
              </p>
              <button
                onClick={handleSimulateVerification}
                disabled={loading}
                className="w-full rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-medium py-2.5 text-sm transition-all cursor-pointer"
              >
                {loading ? "Verifying..." : "Verify Email Now"}
              </button>
              <button
                onClick={onClose}
                className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:underline cursor-pointer"
              >
                Skip for now
              </button>
            </div>
          )}
        </AnimatePresence>

        <div className="mt-6 border-t border-pink-100 dark:border-rose-950/20 pt-4 text-center">
          {mode === "signin" && (
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Don't have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-pink-500 font-medium hover:underline dark:text-pink-400 cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          )}
          {mode === "signup" && (
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Already have an account?{" "}
              <button
                onClick={() => setMode("signin")}
                className="text-pink-500 font-medium hover:underline dark:text-pink-400 cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
          {mode === "forgot" && (
            <button
              onClick={() => setMode("signin")}
              className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:underline"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
