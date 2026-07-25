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
  const [showPassword, setShowPassword] = useState(false);
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
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-4 pr-12 py-3 bg-gray-55 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1E4D2B] transition-all"
                      required
                    />
                    {password.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-405 hover:text-gray-600 dark:hover:text-white focus:outline-none p-1 rounded-md cursor-pointer"
                      >
                        {showPassword ? (
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
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
