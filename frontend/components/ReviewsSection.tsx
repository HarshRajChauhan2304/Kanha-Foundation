"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import reviewsDataFallback from '@/data/reviews.json';

export default function ReviewsSection() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [reviewsList, setReviewsList] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setReviewsList(data);
        } else {
          setReviewsList(reviewsDataFallback);
        }
      })
      .catch(err => {
        console.error("Error loading dynamic reviews:", err);
        setReviewsList(reviewsDataFallback);
      });
  }, []);

  const displayReviews = reviewsList.length > 0 ? reviewsList : reviewsDataFallback;

  return (
    <section className="bg-gradient-to-b from-[#0B2512] to-[#051409] border-t border-emerald-950/40 py-20 px-4 md:px-8 text-white relative overflow-hidden">
      
      {/* Dynamic ambient blur background design blobs */}
      <div className="absolute top-1/4 left-1/4 h-[35rem] w-[35rem] -translate-x-1/2 rounded-full bg-emerald-700/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[40rem] w-[40rem] translate-x-1/2 rounded-full bg-yellow-600/5 blur-[150px] pointer-events-none" />

      {/* Decorative premium dotted mesh overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dot-mesh" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-mesh)"/>
        </svg>
      </div>

      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* Centered Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#F3A61E] sm:text-4xl">
            Reviews
          </h2>
          <p className="mt-3 text-base text-gray-300 max-w-xl mx-auto font-normal">
            Hear from our community of donors and volunteers
          </p>
        </div>

        {/* 4-Column Responsive Grid matching screenshot */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayReviews.map((review) => (
            <motion.div
              key={review.id}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.3 }}
              onClick={() => setActiveVideo(review.video)}
              className="relative aspect-[9/16] rounded-[2rem] overflow-hidden bg-black/40 border border-white/10 shadow-2xl group cursor-pointer"
            >
              {/* Loop Video playing muted in background */}
              <video
                src={review.video}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              />

              {/* Dark Gradients for text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-10" />

              {/* Top Text Details */}
              <div className="absolute top-6 inset-x-6 z-20 text-left">
                <p className="text-sm font-black tracking-wide text-white leading-tight drop-shadow-md">
                  {review.title}
                </p>
                <div className="mt-2 flex items-center gap-1.5 opacity-80">
                  <span className="text-[10px] font-bold text-[#F3A61E]">Verified Giver | Give with Heart</span>
                </div>
              </div>

              {/* Middle Play Button Badge (YouTube Shorts Red play icon style from screenshot) */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF0000] text-white shadow-xl shadow-red-600/30 group-hover:bg-[#CC0000] transition-colors"
                >
                  <svg className="h-7 w-7 fill-current ml-1" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </motion.div>
              </div>

              {/* Bottom Text Details */}
              <div className="absolute bottom-8 inset-x-6 z-20 text-left">
                <p className="text-xs sm:text-sm font-medium text-gray-200 leading-snug drop-shadow-md">
                  "{review.desc}"
                </p>
                <p className="mt-3 text-[10px] sm:text-xs font-black text-[#F3A61E] tracking-wider uppercase">
                  {review.author}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Video Lightbox Modal popup */}
      <AnimatePresence>
        {activeVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div 
              className="fixed inset-0" 
              onClick={() => setActiveVideo(null)}
            />
            <div className="relative w-full max-w-sm rounded-[2.5rem] bg-black border border-white/10 overflow-hidden shadow-2xl z-10 aspect-[9/16] max-h-[85vh]">
              {/* Close Button */}
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-all border border-white/25 cursor-pointer"
                aria-label="Close video"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Video Player */}
              <video
                src={activeVideo}
                controls
                autoPlay
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
