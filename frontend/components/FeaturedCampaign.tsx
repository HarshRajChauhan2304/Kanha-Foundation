"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LIVE_DONATIONS = [
  { name: "Raj Sharma", amount: "₹17,046", time: "8 minutes ago" },
  { name: "Pooja Patel", amount: "₹5,000", time: "12 minutes ago" },
  { name: "Vikram Singh", amount: "₹10,000", time: "2 minutes ago" },
  { name: "Neha Sharma", amount: "₹7,500", time: "5 minutes ago" },
  { name: "Amit Verma", amount: "₹2,500", time: "15 minutes ago" }
];

interface FeaturedCampaignProps {
  imageUrl?: string;
}

export default function FeaturedCampaign({
  imageUrl = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80"
}: FeaturedCampaignProps) {
  const [toastIndex, setToastIndex] = useState(0);
  const [showToast, setShowToast] = useState(true);

  // Rotation logic for live donation toast
  useEffect(() => {
    const timer = setInterval(() => {
      setShowToast(false);
      setTimeout(() => {
        setToastIndex((prevIndex) => (prevIndex + 1) % LIVE_DONATIONS.length);
        setShowToast(true);
      }, 500); // Allow exit animation to play before updating content
    }, 12000);

    return () => clearInterval(timer);
  }, []);

  const currentDonation = LIVE_DONATIONS[toastIndex];

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 md:px-8 overflow-visible">
      {/* Container with deep purple background and smiley pattern */}
      <div className="relative w-full rounded-[2.5rem] bg-[#103E1C] overflow-hidden px-6 py-12 md:py-20 md:px-16 shadow-2xl flex flex-col md:flex-row gap-8 md:gap-12 items-center">
        
        {/* Subtle repeating smiley face outline pattern background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="smiley-pattern" width="90" height="90" patternUnits="userSpaceOnUse">
                <circle cx="45" cy="45" r="16" fill="none" stroke="white" strokeWidth="1.5"/>
                <circle cx="39" cy="39" r="2" fill="white"/>
                <circle cx="51" cy="39" r="2" fill="white"/>
                <path d="M38 48c2.5 3.5 7.5 3.5 10 0" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#smiley-pattern)"/>
          </svg>
        </div>

        {/* Left Side: Campaign Image with Offset Yellow Frame */}
        <div className="w-full md:w-1/2 flex justify-center relative z-10 px-2 md:px-4 pb-4 pr-4 md:pb-0 md:pr-0">
          <div className="relative w-full max-w-md aspect-[4/5] sm:aspect-square md:aspect-[4/5]">
            {/* Offset Gold Border Frame */}
            <div className="absolute inset-0 translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4 border-2 border-[#F3A61E] rounded-[2.5rem] -z-10" />
            
            {/* Main Crop Image */}
            <img
              src={imageUrl}
              alt="Shaping Futures Through Education"
              className="w-full h-full object-cover rounded-[2.5rem] shadow-xl border border-white/5"
            />
          </div>
        </div>

        {/* Right Side: Campaign Content Details */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left relative z-10 text-white">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#F3A61E] leading-tight">
            Shaping Futures Through Education
          </h2>
          <p className="mt-6 text-sm sm:text-base md:text-lg text-gray-200/90 leading-relaxed font-normal max-w-xl">
            Education creates opportunity where it's needed most. Your support helps children access learning, confidence, and the tools to build a better future.
          </p>
          
          <button
            onClick={() => {
              const auth = localStorage.getItem('auth');
              const adminAuth = localStorage.getItem('admin_auth');
              const volunteerSession = localStorage.getItem('volunteer_session');
              const isLoggedIn = auth === 'true' || adminAuth === 'true' || !!volunteerSession;

              if (!isLoggedIn) {
                window.location.href = "/signin?redirect=/causes";
              } else {
                window.location.href = "/causes";
              }
            }}
            className="mt-8 px-10 py-3.5 border-2 border-[#F3A61E] hover:bg-[#F3A61E] text-white hover:text-[#103E1C] text-sm sm:text-base font-bold rounded-full transition-all duration-300 active:scale-98 shadow-lg shadow-yellow-500/5 cursor-pointer"
          >
            Donate NOW
          </button>
        </div>
      </div>

    </section>
  );
}
