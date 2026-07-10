"use client";
import React from 'react';

export default function FeaturedIn() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 bg-transparent">
      {/* Centered Title in Brand Forest Green */}
      <h2 className="text-2xl sm:text-3xl font-black text-center text-[#1E4D2B] dark:text-[#52c47c] tracking-tight mb-10">
        As Featured In
      </h2>

      {/* Grid of Vector Partner Logos matching screenshot */}
      <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-75 dark:opacity-90 grayscale hover:grayscale-0 transition-all duration-300">
        
        {/* Dailyhunt Logo */}
        <div className="flex items-center gap-2 h-8">
          <svg className="h-7 w-7" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 25 C40 10, 10 40, 50 50 Z" fill="#F59E0B" />
            <path d="M50 25 C60 10, 90 40, 50 50 Z" fill="#EF4444" />
            <path d="M50 75 C40 90, 10 60, 50 50 Z" fill="#10B981" />
            <path d="M50 75 C60 90, 90 60, 50 50 Z" fill="#3B82F6" />
          </svg>
          <span className="font-extrabold text-xl tracking-tight text-gray-700 dark:text-gray-200">dailyhunt</span>
        </div>

        {/* Business Today (BT) Logo */}
        <div className="flex items-center bg-[#005580] text-white font-extrabold px-3 py-1.5 rounded-sm tracking-tight h-8">
          <span className="text-base mr-1">BT</span>
          <span className="text-[9px] leading-none uppercase border-l border-white/30 pl-1 font-semibold text-white/90">Business<br/>Today</span>
        </div>

        {/* The Tribune Logo */}
        <div className="flex flex-col items-center h-8">
          <span className="font-serif font-black text-2xl tracking-tighter text-gray-800 dark:text-gray-150">The Tribune</span>
          <div className="w-full h-[1px] bg-gray-300 dark:bg-zinc-700 mt-0.5" />
          <span className="text-[6px] tracking-[0.2em] uppercase text-gray-400 font-bold mt-0.5">Voice of the People</span>
        </div>

        {/* Hindustan Times Logo */}
        <div className="flex items-center gap-1.5 h-8">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00A4E4] text-white font-black text-xs shadow-sm">
            ht
          </div>
          <span className="font-serif font-extrabold text-lg text-gray-700 dark:text-gray-200 tracking-tight">Hindustan Times</span>
        </div>

        {/* Dailyhunt (Repeated for scrolling/spread banner layout) */}
        <div className="flex items-center gap-2 h-8">
          <svg className="h-7 w-7" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 25 C40 10, 10 40, 50 50 Z" fill="#F59E0B" />
            <path d="M50 25 C60 10, 90 40, 50 50 Z" fill="#EF4444" />
            <path d="M50 75 C40 90, 10 60, 50 50 Z" fill="#10B981" />
            <path d="M50 75 C60 90, 90 60, 50 50 Z" fill="#3B82F6" />
          </svg>
          <span className="font-extrabold text-xl tracking-tight text-gray-700 dark:text-gray-200">dailyhunt</span>
        </div>

        {/* BT Logo (Repeated) */}
        <div className="flex items-center bg-[#005580] text-white font-extrabold px-3 py-1.5 rounded-sm tracking-tight h-8">
          <span className="text-base mr-1">BT</span>
          <span className="text-[9px] leading-none uppercase border-l border-white/30 pl-1 font-semibold text-white/90">Business<br/>Today</span>
        </div>

      </div>
    </section>
  );
}
