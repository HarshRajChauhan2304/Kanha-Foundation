"use client";
import React from 'react';
import { motion } from 'framer-motion';

const VALUES = [
  {
    id: 1,
    icon: (
      <svg className="h-10 w-10 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z M9 10l2 2 4-4" />
      </svg>
    ),
    title: "Radical Transparency",
    subtitle: "See exactly where your giving goes.",
    desc: "Every contribution is backed by real photos, videos, and clear updates—no vague promises, no hidden layers."
  },
  {
    id: 2,
    icon: (
      <svg className="h-10 w-10 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: "Dignity First",
    subtitle: "Help with respect, not pity.",
    desc: "We ensure every act of giving preserves dignity and humanity, because impact without respect is not impact."
  },
  {
    id: 3,
    icon: (
      <svg className="h-10 w-10 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Verified Impact",
    subtitle: "Proof beats promises.",
    desc: "From food distribution to celebrations, every outcome is documented and verifiable—impact you can see and trust."
  },
  {
    id: 4,
    icon: (
      <svg className="h-10 w-10 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Purpose-Driven Giving",
    subtitle: "Every rupee has a reason.",
    desc: "We design giving experiences that create meaningful change, not just momentary relief."
  },
  {
    id: 5,
    icon: (
      <svg className="h-10 w-10 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: "People Over Process",
    subtitle: "Compassion before complexity.",
    desc: "Systems support us, but people drive us—donors, beneficiaries, and volunteers always come first."
  },
  {
    id: 6,
    icon: (
      <svg className="h-10 w-10 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: "Celebrate Humanity",
    subtitle: "Giving can be joyful.",
    desc: "Birthdays, anniversaries, milestones—because spreading happiness is also a powerful form of impact."
  }
];

export default function CoreValues() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 bg-transparent">
      {/* Centered Heading and Subheading matching screenshot */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1E4D2B] sm:text-4xl dark:text-[#52c47c]">
          Our core values
        </h2>
      </div>

      {/* 3-Column Responsive Grid matching screenshot */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {VALUES.map((val) => (
          <motion.div
            key={val.id}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-[#101412] border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-8 text-center flex flex-col items-center shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Value Icon */}
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-gray-700 dark:text-gray-300 shadow-inner">
              {val.icon}
            </div>

            {/* Content info */}
            <h3 className="text-lg font-bold text-[#1E4D2B] dark:text-[#52c47c] tracking-tight">
              {val.title}
            </h3>
            <p className="mt-2 text-sm font-extrabold text-gray-900 dark:text-white leading-snug">
              {val.subtitle}
            </p>
            <p className="mt-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {val.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
