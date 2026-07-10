"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SignUp() {
  const router = useRouter();
  
  // OTP Validation states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [simulatedOtpText, setSimulatedOtpText] = useState("");
  
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");

  // Input fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [gender, setGender] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trigger Send OTP Inline
  const handleSendOtp = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setError("");
    setOtpError("");
    setOtpSuccess("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", email })
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setOtpSent(true);
        setOtpSuccess("OTP code sent successfully.");
        if (data.simulatedOtp) {
          setSimulatedOtpText(data.simulatedOtp);
        }
      } else {
        setError(data.error || "Failed to send verification code.");
      }
    } catch (err) {
      setIsSubmitting(false);
      setError("Network error. Please try again.");
    }
  };

  // Trigger Confirm/Verify OTP Inline
  const handleVerifyOtp = async () => {
    if (!otpCode) {
      setOtpError("Please enter the 6-digit code.");
      return;
    }
    setOtpError("");
    setOtpSuccess("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", email, otp: otpCode })
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setIsEmailVerified(true);
        setOtpSent(false); // Hide code entry input
        setOtpSuccess("Email verified successfully! ✅");
        setError("");
      } else {
        setOtpError(data.error || "The code entered is incorrect.");
      }
    } catch (err) {
      setIsSubmitting(false);
      setOtpError("Network error. Please try again.");
    }
  };

  // Perform Registration (Enabled only after verification succeeds)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !phone || !gender || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (!isEmailVerified) {
      setError("Please verify your email address first.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/user/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signup", username, email, phone, password, gender })
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success && data.user) {
        localStorage.setItem("auth", "true");
        localStorage.setItem("user_name", data.user.username);
        localStorage.setItem("user_email", data.user.email);
        localStorage.setItem("user_phone", data.user.phone || "");
        router.push("/causes");
      } else {
        setError(data.error || "Failed to register.");
      }
    } catch (err) {
      setIsSubmitting(false);
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-[#07100b] px-4 font-sans py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-[2rem] bg-white dark:bg-[#101412] p-8 shadow-xl border border-gray-150/40 dark:border-zinc-800/80"
      >
        <h2 className="mb-6 text-center text-3xl font-black text-[#1E4D2B] dark:text-[#52c47c]">Sign Up</h2>
        {error && <p className="mb-4 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-200 dark:border-red-900/30">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2" htmlFor="username">Full Name</label>
            <input
              id="username"
              type="text"
              value={username}
              disabled={isEmailVerified && isSubmitting}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1E4D2B] transition-all"
              placeholder="e.g. Vikram Singh"
              required
            />
          </div>

          {/* Email Address with Inline Verification Button */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2" htmlFor="email">Email Address</label>
            <div className="flex gap-2">
              <input
                id="email"
                type="email"
                disabled={isEmailVerified || isSubmitting}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1E4D2B] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                placeholder="name@domain.com"
                required
              />
              {isEmailVerified ? (
                <span className="flex items-center px-4 py-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-[#52c47c] text-xs font-black rounded-xl border border-emerald-250/20 select-none">
                  Verified ✅
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSubmitting || !email}
                  className="px-4 py-3 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-xs font-black uppercase rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Verify
                </button>
              )}
            </div>
          </div>

          {/* Inline OTP Code Submission Area */}
          {otpSent && (
            <div className="p-4 bg-zinc-50 dark:bg-[#0c1510]/50 border border-gray-200 dark:border-zinc-800 rounded-2xl space-y-3 mt-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-bold text-center">
                Enter 6-digit OTP verification code:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="e.g. 123456"
                  className="flex-1 text-center px-4 py-2 bg-white dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold tracking-widest text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase rounded-xl cursor-pointer"
                >
                  Confirm
                </button>
              </div>
              {otpError && <p className="text-[10px] text-red-500 font-bold text-center">{otpError}</p>}
              {simulatedOtpText && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 rounded-xl text-center">
                  <p className="text-[9px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider font-bold">Simulated OTP (Terminal Log)</p>
                  <p className="text-sm font-black tracking-widest text-[#1E4D2B] dark:text-[#52c47c]">{simulatedOtpText}</p>
                </div>
              )}
            </div>
          )}

          {otpSuccess && (
            <p className="text-xs text-emerald-600 dark:text-[#52c47c] font-bold mt-1 text-left">{otpSuccess}</p>
          )}

          {/* WhatsApp Phone Number */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2" htmlFor="phone">WhatsApp Number</label>
            <input
              id="phone"
              type="text"
              value={phone}
              disabled={isEmailVerified && isSubmitting}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1E4D2B] transition-all"
              placeholder="e.g. +91 9876543210"
              required
            />
          </div>

          {/* Gender Select Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2" htmlFor="gender">Gender</label>
            <select
              id="gender"
              value={gender}
              disabled={isEmailVerified && isSubmitting}
              onChange={e => setGender(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1E4D2B] transition-all text-zinc-400"
              required
            >
              <option value="" disabled>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              disabled={isEmailVerified && isSubmitting}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1E4D2B] transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              disabled={isEmailVerified && isSubmitting}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1E4D2B] transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          
          {/* Sign Up Action (Disabled if email not verified) */}
          <button
            type="submit"
            disabled={isSubmitting || !isEmailVerified}
            className="w-full rounded-xl bg-[#1E4D2B] hover:bg-[#15381E] py-3.5 text-white font-extrabold uppercase text-xs tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg mt-2"
          >
            {isSubmitting ? "Registering account..." : isEmailVerified ? "Create Account" : "Please Verify Email First"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <a href="/signin" className="font-extrabold text-[#1E4D2B] dark:text-[#52c47c] hover:underline">
            Sign In
          </a>
        </p>
      </motion.div>
    </div>
  );
}
