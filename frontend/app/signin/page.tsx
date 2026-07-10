"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const [redirectPath, setRedirectPath] = useState("/causes");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      if (redirect) {
        setRedirectPath(redirect);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setError("");
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success && data.user) {
          // Clear any conflicting session states first
          localStorage.removeItem("auth");
          localStorage.removeItem("admin_auth");
          localStorage.removeItem("volunteer_session");

          if (data.role === "admin") {
            localStorage.setItem("admin_auth", "true");
            localStorage.setItem("admin_username", data.user.username);
            localStorage.setItem("admin_email", data.user.email);
            router.push('/admin');
          } else if (data.role === "volunteer") {
            localStorage.setItem("volunteer_session", JSON.stringify(data.user));
            router.push('/volunteer/profile');
          } else {
            localStorage.setItem("auth", "true");
            localStorage.setItem("user_name", data.user.username);
            localStorage.setItem("user_email", data.user.email);
            localStorage.setItem("user_phone", data.user.phone || "");
            localStorage.setItem("user_gender", data.user.gender || "");
            localStorage.setItem("user_avatar", data.user.avatar || "");
            localStorage.setItem("user_bio", data.user.bio || "");
            
            // Respect previous redirect path if checking out or sponsoring causes
            if (redirectPath && (redirectPath.startsWith('/donate') || redirectPath.startsWith('/causes'))) {
              router.push(redirectPath);
            } else {
              router.push('/profile');
            }
          }
        } else {
          setError(data.error || "Invalid credentials.");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      }
    } else {
      setError("Please fill in both fields.");
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetEmail.trim()) {
      try {
        const res = await fetch('/api/user/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: "reset", email: resetEmail })
        });
        const data = await res.json();
        if (data.success) {
          setResetSuccess("A password reset link has been sent to your email.");
          setTimeout(() => {
            setShowForgot(false);
            setResetSuccess("");
            setResetEmail("");
          }, 3500);
        } else {
          setError(data.error || "Reset failed.");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      }
    } else {
      setError("Please enter your registered email address.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-[#07100b] px-4 font-sans">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#101412] p-8 shadow-xl border border-gray-150/40 dark:border-zinc-800/80">
        
        <AnimatePresence mode="wait">
          {!showForgot ? (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <h2 className="mb-6 text-center text-3xl font-black text-[#1E4D2B] dark:text-[#52c47c]">Sign In</h2>
              {error && <p className="mb-4 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-200 dark:border-red-900/30">{error}</p>}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1E4D2B] transition-all"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider" htmlFor="password">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgot(true);
                        setError("");
                      }}
                      className="text-xs font-bold text-[#1E4D2B] dark:text-[#52c47c] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1E4D2B] transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#1E4D2B] hover:bg-[#15381E] text-white font-extrabold text-sm rounded-xl transition-all duration-300 active:scale-98 shadow-lg shadow-emerald-900/10 cursor-pointer"
                >
                  Sign In
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                Don’t have an account?{' '}
                <a href="/signup" className="font-extrabold text-[#1E4D2B] dark:text-[#52c47c] hover:underline">
                  Sign Up
                </a>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <h2 className="mb-4 text-center text-2xl font-black text-[#1E4D2B] dark:text-[#52c47c]">Reset Password</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 text-center leading-relaxed">
                Enter your email address below and we'll send you a recovery link to reset your account password.
              </p>

              {resetSuccess ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-4 rounded-xl text-xs font-bold text-[#1E4D2B] dark:text-[#52c47c] mb-6 text-center">
                  {resetSuccess}
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2" htmlFor="resetEmail">Email Address</label>
                    <input
                      id="resetEmail"
                      type="email"
                      required
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1E4D2B] transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#1E4D2B] hover:bg-[#15381E] text-white font-extrabold text-sm rounded-xl transition-all duration-300 active:scale-98 shadow-lg cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </form>
              )}

              <button
                onClick={() => {
                  setShowForgot(false);
                  setError("");
                  setResetSuccess("");
                }}
                className="mt-6 w-full text-center text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
