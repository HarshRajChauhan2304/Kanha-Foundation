"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function TrustSection() {
  const [topLeftImage, setTopLeftImage] = useState("https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&auto=format&fit=crop&q=80");
  const [bottomRightImage, setBottomRightImage] = useState("https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80");

  useEffect(() => {
    fetch('/api/page-media', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const topImg = data.find((m: any) => m.key === 'home_trust_top_left');
          if (topImg && topImg.url) {
            setTopLeftImage(topImg.url);
          }
          const bottomImg = data.find((m: any) => m.key === 'home_trust_bottom_right');
          if (bottomImg && bottomImg.url) {
            setBottomRightImage(bottomImg.url);
          }
        }
      })
      .catch(err => console.error("Error loading trust section images:", err));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 bg-transparent overflow-visible">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Overlapping Images Layout matching screenshot */}
        <div className="relative w-full h-[380px] sm:h-[480px] md:h-[420px] lg:h-[480px] overflow-visible px-4">
          
          {/* Top-Left Image with offset yellow frame */}
          <div className="absolute top-0 left-0 w-[68%] aspect-[4/3] z-10">
            <div className="absolute inset-0 translate-x-3.5 translate-y-3.5 border-2 border-[#F3A61E] rounded-[2rem] -z-10" />
            <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 dark:border-zinc-800">
              <img
                src={topLeftImage}
                alt="Volunteers helping"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Bottom-Right Overlapping Image with offset yellow frame */}
          <div className="absolute bottom-4 right-4 w-[62%] aspect-[4/3] z-20">
            <div className="absolute inset-0 translate-x-3.5 translate-y-3.5 border-2 border-[#F3A61E] rounded-[2rem] -z-10" />
            <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-[#07100b]">
              <img
                src={bottomRightImage}
                alt="Trust and Transparency"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>

        {/* Right Side: Clean Typography & Outline Pill Button */}
        <div className="w-full flex flex-col items-start text-left">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#1E4D2B] dark:text-[#52c47c] leading-tight">
            Why People Trust Us
          </h2>
          <p className="mt-6 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl font-normal">
            We believe trust is built through transparency. From verified impact to real photo and video updates, every action is open, honest, and accountable.
          </p>
          
          <button
            onClick={() => {
              window.location.href = "/stories";
            }}
            className="mt-8 px-8 py-3.5 border-2 border-[#1E4D2B] dark:border-[#52c47c] hover:bg-[#1E4D2B] dark:hover:bg-[#52c47c] text-[#1E4D2B] dark:text-[#52c47c] hover:text-white dark:hover:text-black text-sm font-extrabold rounded-full transition-all duration-300 active:scale-98 tracking-wider uppercase cursor-pointer select-none"
          >
            Read More
          </button>
        </div>

      </div>
    </section>
  );
}
