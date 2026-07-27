"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function OurValuesPage() {
  const VALUES_LIST = [
    {
      id: "transparency",
      icon: "💎",
      title: "100% On-Ground Transparency",
      highlight: "Real-time Photo & Video Proofs",
      description: "We believe that trust is the cornerstone of effective charity. Every single rupee donated on our platform is deployed directly into field operations. Donors receive real-time distribution photos, videos, and GPS-tagged field completion proofs for total peace of mind.",
      points: [
        "GPS-tagged photo and video distribution proofs",
        "Personalized dedication tags printed on kits for donors",
        "Public monthly impact reports and open financial ledger auditing"
      ]
    },
    {
      id: "dignity",
      icon: "❤️",
      title: "Compassion & Human Dignity",
      highlight: "Respectful Service for All Lives",
      description: "Giving is not a gesture of pity; it is an act of solidarity and human respect. We serve underprivileged children, women in need, destitute families, and stray animals with the utmost honor, warmth, and dignity.",
      points: [
        "Dignified food and ration kit distribution without degrading queues",
        "Environmentally responsible menstrual hygiene kits and awareness drives",
        "Loving care, feeding, and medical rescue support for stray animals"
      ]
    },
    {
      id: "compliance",
      icon: "🏛️",
      title: "Section 8 Central Compliance",
      highlight: "Regulated Non-Profit Governance",
      description: "Incorporated under Section 8 of the Indian Companies Act, 2013 enacted by the Central Government of India, and registered on NITI Aayog (NGO Darpan), Kanha Foundation maintains 100% statutory compliance.",
      points: [
        "Section 80G Tax Exemption receipts under Income Tax Act, 1961",
        "Annual financial reporting submitted to MCA and Income Tax Department",
        "Strict non-profit dividend prohibition—all surplus is reinvested into public welfare"
      ]
    },
    {
      id: "sustainability",
      icon: "🌱",
      title: "Sustainable Community Empowerment",
      highlight: "Long-term Transformation Beyond Relief",
      description: "Immediate relief saves lives, but sustainable empowerment builds futures. We combine emergency aid with long-term education drives, tree sapling plantations, and skill mentoring to create self-reliant communities.",
      points: [
        "School kit distribution and mentoring for underprivileged children",
        "Mass tree sapling plantations for ecological restoration",
        "Vocational guidance and youth volunteer leadership programs"
      ]
    },
    {
      id: "stewardship",
      icon: "🤝",
      title: "Ethical Resource Stewardship",
      highlight: "Maximum Impact per Contribution",
      description: "Every contribution entrusted to us is treated as a sacred commitment. We optimize procurement and logistics to ensure maximum value reaches beneficiaries without unnecessary overheads.",
      points: [
        "Direct wholesale kit procurement to eliminate middlemen markups",
        "Volunteer-driven field execution network across regional hubs",
        "Zero-waste distribution planning for meal and ration drives"
      ]
    },
    {
      id: "reach",
      icon: "🌐",
      title: "Pan-India Multi-State Reach",
      highlight: "Greater Noida HQ • Multi-Regional Network",
      description: "Headquartered in Greater Noida, U.P., Kanha Foundation operates active field coordinator networks and volunteer teams across Bihar, Jharkhand, Delhi NCR, Uttar Pradesh, and Pan-India.",
      points: [
        "Multi-state regional branch execution hubs",
        "Local volunteer mobilization in rural and urban settlements",
        "Rapid disaster and emergency relief response capabilities"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-zinc-100 font-sans py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Banner Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <span className="px-4 py-1.5 bg-emerald-950/20 text-[#52c47c] border border-emerald-900/40 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4 shadow-sm">
            Section 8 Non-Profit Organization • Core Ethos
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tight">
            Our Core Values
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mt-4 font-medium leading-relaxed">
            The fundamental ethical pillars guiding Kanha Foundation's ground operations, donor relationships, field executions, and non-profit governance across India.
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {VALUES_LIST.map((val, idx) => (
            <motion.div
              key={val.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-850 p-8 rounded-[2.5rem] shadow-xl hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-4xl p-3 bg-emerald-950/20 dark:bg-emerald-950/40 border border-emerald-900/30 rounded-2xl inline-block">
                    {val.icon}
                  </span>
                  <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {val.highlight}
                  </span>
                </div>

                <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-3">
                  {val.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                  {val.description}
                </p>
              </div>

              {/* Bullet Points */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 space-y-2">
                {val.points.map((pt, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    <span className="text-emerald-500 font-black text-sm">✓</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action Footer Card */}
        <div className="mt-16 bg-gradient-to-r from-emerald-950/60 via-emerald-900/30 to-zinc-950 border border-emerald-500/30 p-8 sm:p-10 rounded-[2.5rem] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <span className="px-3 py-1 bg-emerald-500/20 text-[#52c47c] border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-2">
              Join Our Mission
            </span>
            <h3 className="text-xl font-black text-white">Experience Transparent Giving Today</h3>
            <p className="text-xs text-zinc-300 mt-1 max-w-lg">
              Sponsor meals, education kits, or tree saplings and receive real-time distribution proof photos directly on your dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/causes"
              className="px-6 py-3 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg border border-emerald-500/40 whitespace-nowrap"
            >
              Browse Causes & Donate &rarr;
            </a>
            <a
              href="/volunteer"
              className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-zinc-700 whitespace-nowrap"
            >
              Become a Volunteer
            </a>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-center">
          <a 
            href="/" 
            className="px-6 py-2.5 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
          >
            Back to Home
          </a>
        </div>

      </div>
    </div>
  );
}
