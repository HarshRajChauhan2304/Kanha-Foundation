"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StarVolunteer {
  name: string;
  profile_photo: string;
  grade: string;
  reason: string;
  week_label: string;
  tasks_completed?: number;
  gender?: string;
}

export default function VolunteerSection() {
  const [stars, setStars] = useState<StarVolunteer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/volunteer/star')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.stars)) {
          setStars(data.stars);
        }
      })
      .catch(err => console.error("Error fetching star volunteers:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 bg-transparent">
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Weekly Star Volunteers Premium Cards (Col 7) */}
        <div className="w-full lg:col-span-7 flex flex-col items-center order-2 lg:order-1">
          {loading ? (
            <div className="h-64 w-full max-w-2xl rounded-[2.5rem] bg-white dark:bg-[#101412] flex items-center justify-center border border-gray-150/40 dark:border-zinc-800/80 shadow-md">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" />
            </div>
          ) : stars.length > 0 ? (
            <div className="w-full flex gap-2 sm:gap-6 justify-center items-stretch px-2 md:px-0">
              {stars.map((star, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-[calc(50%-4px)] sm:flex-1 bg-white dark:bg-[#101412] p-3.5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-150/45 dark:border-zinc-800/80 shadow-xl overflow-hidden text-center flex flex-col justify-between"
                >
                  {/* Glassmorphic Glowing Background blobs */}
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                  {/* Header Badge */}
                  <div className="mb-2 sm:mb-4">
                    <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-[#1E4D2B]/10 dark:bg-emerald-950/20 text-[#1E4D2B] dark:text-[#52c47c] border border-emerald-900/10 dark:border-emerald-900/30 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                      {star.gender === "Female" ? "♀️ Star Girl" : "♂️ Star Boy"}
                    </span>
                    <p className="text-[8px] sm:text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-1 sm:mt-2">
                      {star.week_label}
                    </p>
                  </div>

                  {/* Volunteer Profile Photo */}
                  <div className="relative h-16 w-16 sm:h-24 sm:w-24 mx-auto mb-2 sm:mb-4 rounded-full p-0.5 sm:p-1 border-2 border-dashed border-[#F3A61E]/40 dark:border-[#F3A61E]/20 flex items-center justify-center flex-shrink-0">
                    <img
                      src={star.profile_photo || (star.gender === "Female" 
                        ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
                        : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                      )}
                      alt={star.name}
                      className="h-full w-full object-cover rounded-full shadow-md"
                    />
                    
                    {/* Grade Badge */}
                    <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 sm:h-8 sm:w-8 bg-[#F3A61E] text-black font-black text-[9px] sm:text-xs rounded-full flex items-center justify-center shadow-lg border border-white dark:border-[#101412]">
                      {star.grade}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 sm:space-y-3 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs sm:text-base font-black text-gray-900 dark:text-white leading-tight">
                        {star.name}
                      </h3>
                      <p className="text-[8px] sm:text-[10px] text-zinc-500 font-bold mt-0.5">
                        Active Volunteer
                      </p>
                    </div>

                    <p className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic max-w-xs mx-auto bg-zinc-50 dark:bg-zinc-950/30 p-2 sm:p-3.5 rounded-lg sm:rounded-xl border border-gray-100 dark:border-zinc-900 flex-grow flex items-center justify-center">
                      "{star.reason}"
                    </p>

                    {star.tasks_completed !== undefined && star.tasks_completed > 0 && (
                      <div className="pt-0.5 flex justify-center">
                        <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-[#1E4D2B] dark:text-[#52c47c] text-[8px] sm:text-[9px] font-black rounded-md border border-emerald-900/10 dark:border-emerald-900/30">
                          🏆 {star.tasks_completed} {star.tasks_completed === 1 ? 'Task' : 'Tasks'}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-md aspect-[4/3] sm:aspect-square md:aspect-[4/3] overflow-hidden rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-zinc-800"
            >
              <img
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&auto=format&fit=crop&q=80"
                alt="Be Part of Something Meaningful"
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
        </div>

        {/* Right Side: Clean Typography & Outline Pill Button (Col 5) */}
        <div className="w-full lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left order-1 lg:order-2">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#1E4D2B] dark:text-[#52c47c] leading-tight">
            Be Part of Something Meaningful
          </h2>
          <p className="mt-3 sm:mt-6 text-xs sm:text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl font-normal">
            Join a community of people who believe in creating real change. Volunteer your time, skills, or presence and help turn compassion into action.
          </p>
          
          <button
            onClick={() => {
              window.location.href = "/volunteer";
            }}
            className="mt-4 sm:mt-8 px-6 py-2.5 sm:px-8 sm:py-3.5 border-2 border-[#1E4D2B] dark:border-[#52c47c] hover:bg-[#1E4D2B] dark:hover:bg-[#52c47c] text-[#1E4D2B] dark:text-[#52c47c] hover:text-white dark:hover:text-black text-xs sm:text-sm font-extrabold rounded-full transition-all duration-300 active:scale-98 tracking-wider uppercase cursor-pointer select-none"
          >
            Join as a Volunteer
          </button>
        </div>
      </div>
    </section>
  );
}
