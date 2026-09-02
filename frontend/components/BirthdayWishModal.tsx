"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface BirthdayWishModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userType?: 'user' | 'volunteer';
}

export default function BirthdayWishModal({ isOpen, onClose, userName, userType = 'user' }: BirthdayWishModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleDonateClick = () => {
    onClose();
    router.push('/donate?cause=birthday');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg overflow-hidden bg-gradient-to-br from-amber-900/90 via-zinc-900 to-rose-950/90 border border-amber-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 text-center text-white"
        >
          {/* Glowing Background Orbs */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Decorative Header Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4 animate-pulse">
            <span>🎉 Special Birthday Celebration</span>
          </div>

          {/* Birthday Cake Graphic Icon */}
          <div className="relative mx-auto w-24 h-24 mb-4 flex items-center justify-center bg-gradient-to-tr from-amber-500 to-rose-500 rounded-full shadow-lg shadow-amber-500/30">
            <span className="text-5xl">🎂</span>
          </div>

          {/* Greeting */}
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl mb-2">
            Happy Birthday, <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-amber-200 bg-clip-text text-transparent">{userName}</span>! 🎈
          </h2>

          <p className="text-zinc-300 text-sm sm:text-base mb-6 leading-relaxed">
            The entire <strong className="text-amber-400 font-semibold">Kanha Foundation</strong> family wishes you endless joy, peace, and health on your special day! {userType === 'volunteer' ? 'Thank you for your incredible dedication as a volunteer.' : 'Thank you for being part of our journey.'}
          </p>

          {/* Donation Call To Action Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-amber-500/20 text-left mb-6 relative overflow-hidden group">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🎁</span>
              <div>
                <h4 className="font-bold text-amber-300 text-base">Make Your Birthday Extra Meaningful</h4>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-snug">
                  Celebrate your birthday by bringing smiles to slum children! Sponsor a birthday cake, nutritious meals, or study kits for kids in need today.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleDonateClick}
              className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Donate on My Birthday</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
            >
              Thank You!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
