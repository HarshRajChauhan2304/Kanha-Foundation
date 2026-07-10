"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


export default function LiveDonationsToast() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [donationsList, setDonationsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/donations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDonationsList(data);
        } else {
          setDonationsList([]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error loading dynamic donations:", err);
        setDonationsList([]);
        setIsLoading(false);
      });
  }, []);

  const displayDonations = donationsList;

  useEffect(() => {
    if (displayDonations.length === 0) return;
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % displayDonations.length);
        setIsVisible(true);
      }, 600); // Wait for exit transition
    }, 10000); // Shift every 10 seconds

    return () => clearInterval(interval);
  }, [displayDonations]);

  if (isLoading) return null;
  if (donationsList.length === 0) {
    return (
      <div className="fixed bottom-6 left-6 z-50 text-sm text-gray-500 dark:text-gray-400">
        No recent donations
      </div>
    );
  }
  const current = displayDonations[index];

  return (
    <div className="fixed bottom-6 left-6 z-50 pointer-events-auto">
      <AnimatePresence>
        {isVisible && current && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-full px-5 py-3.5 shadow-2xl backdrop-blur-md max-w-sm"
          >
            {/* Heart Badge Icon matching screenshot exactly */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFFBEB] text-[#F3A61E] shadow-inner select-none flex-shrink-0">
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 .81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>

            {/* Content Details */}
            <div className="text-left pr-2 flex-grow min-w-0">
              <p className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white leading-tight truncate">
                {current.name} donated <span className="text-[#F3A61E]">{current.amount}</span>
              </p>
              <p className="text-[10px] sm:text-xs text-gray-400 font-bold mt-0.5">
                {current.time ? current.time.split('|')[0] : ""}
              </p>
            </div>

            {/* Dismiss Close Icon */}
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer flex-shrink-0"
              aria-label="Dismiss notification"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
