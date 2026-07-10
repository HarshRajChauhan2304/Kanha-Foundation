"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface BirthdayCampaignProps {
  imageUrl?: string;
}

export default function BirthdayCampaign({
  imageUrl = "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80"
}: BirthdayCampaignProps) {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 md:px-8 overflow-visible">
      {/* Container with brand forest green background and smiley pattern */}
      <div className="relative w-full rounded-[2.5rem] bg-[#103E1C] overflow-hidden px-6 py-12 md:py-20 md:px-16 shadow-2xl flex flex-col md:flex-row gap-8 md:gap-12 items-center">
        
        {/* Subtle repeating smiley face outline pattern background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="smiley-pattern-bday" width="90" height="90" patternUnits="userSpaceOnUse">
                <circle cx="45" cy="45" r="16" fill="none" stroke="white" strokeWidth="1.5"/>
                <circle cx="39" cy="39" r="2" fill="white"/>
                <circle cx="51" cy="39" r="2" fill="white"/>
                <path d="M38 48c2.5 3.5 7.5 3.5 10 0" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#smiley-pattern-bday)"/>
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
              alt="A Birthday They'll Always Remember"
              className="w-full h-full object-cover rounded-[2.5rem] shadow-xl border border-white/5"
            />
          </div>
        </div>

        {/* Right Side: Campaign Content Details */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left relative z-10 text-white">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#F3A61E] leading-tight">
            A Birthday They'll Always Remember
          </h2>
          <p className="mt-6 text-sm sm:text-base md:text-lg text-gray-200/90 leading-relaxed font-normal max-w-xl">
            Celebrate your birthday by creating real impact. Feed children, support lives, and receive genuine photos and videos that show exactly how your celebration made a difference.
          </p>
          
          <button
            onClick={() => {
              window.location.href = "/causes";
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
