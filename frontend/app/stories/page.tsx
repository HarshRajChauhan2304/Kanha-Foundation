"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StoriesOfHope from '@/components/StoriesOfHope';
import Counter from '@/components/Counter';

const CATEGORIES = ["All", "Food Relief", "Education", "Women Care", "Stray Care"];

const DETAILED_STORIES = [
  {
    title: "Nourishing Slum Children in Ranchi",
    category: "Food Relief",
    desc: "We distributed fresh hot meals directly to over 500 children in local settlements. Each pack includes fresh rice, pulses, and vegetables, cooked in highly hygienic kitchens. Every drive is fully tracked and updated to sponsors.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80",
    stats: "500+ Children Fed",
    date: "July 2026"
  },
  {
    title: "Empowering schoolkids with Study Kits",
    category: "Education",
    desc: "Many child students have no basic pencils or notebook supplies. Our volunteers packed and delivered comprehensive school kits containing pens, drawing blocks, bags, and pencil cases to encourage learning.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80",
    stats: "150+ Kits Distributed",
    date: "June 2026"
  },
  {
    title: "Distribution of Menstrual Kits",
    category: "Women Care",
    desc: "Providing hygienic pads and sanitary kits to adolescent girls in rural settlements to foster dignity, good health, and lower school dropout rates. Includes awareness talks by healthcare volunteers.",
    image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=600&auto=format&fit=crop&q=80",
    stats: "300+ Girls Supported",
    date: "June 2026"
  },
  {
    title: "Stray Cow & Dog Daily Feed Campaign",
    category: "Stray Care",
    desc: "Ensuring stray cows and street animals receive fresh green fodder, clean water, and food daily. Our localized teams run regular checks and coordinate volunteer feeders across major zones.",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&auto=format&fit=crop&q=80",
    stats: "100+ Animals Fed Daily",
    date: "July 2026"
  }
];

export default function StoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [detailedStories, setDetailedStories] = useState<any[]>([]);

  // Dynamic metrics stats cards list state
  const [statsCards, setStatsCards] = useState<any[]>([
    { id: 1, title: "Donations Raised", base_value: 100000000, prefix: "₹", suffix: "+", icon: "rupee", category: "raised" },
    { id: 2, title: "Active Donors", base_value: 100000, prefix: "", suffix: "+", icon: "users", category: "donors" },
    { id: 3, title: "Birthday Giving", base_value: 700000, prefix: "", suffix: "+", icon: "cake", category: "birthday" },
    { id: 4, title: "Lives Impacted", base_value: 2000000, prefix: "", suffix: "+", icon: "heart", category: "lives" },
    { id: 5, title: "Meals Served", base_value: 3500000, prefix: "", suffix: "+", icon: "meals", category: "meals" }
  ]);

  const [extraData, setExtraData] = useState({
    extraAmount: 0,
    uniqueDonors: 0,
    extraBirthday: 0,
    extraMeals: 0,
    extraLives: 0,
    extraStudykit: 0
  });

  useEffect(() => {
    fetch('/api/stories/detailed')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDetailedStories(data);
        } else {
          setDetailedStories(DETAILED_STORIES);
        }
      })
      .catch(err => {
        console.error("Error loading dynamic detailed stories:", err);
        setDetailedStories(DETAILED_STORIES);
      });

    // Fetch active stats cards configurations dynamically
    fetch('/api/stats-cards')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStatsCards(data);
        }
      })
      .catch(err => console.error("Error fetching stats cards configuration:", err));

    // Fetch and aggregate dynamic donations statistics
    fetch('/api/donations')
      .then(res => res.json())
      .then((data: any[]) => {
        if (!Array.isArray(data)) return;

        let extraAmount = 0;
        let extraBirthday = 0;
        let extraMeals = 0;
        let extraLives = 0;
        let extraStudykit = 0;
        const uniqueNames = new Set<string>();

        data.forEach(d => {
          // Parse amount, e.g. "₹10,000" -> 10000
          const clean = d.amount ? d.amount.replace(/[^\d.]/g, "") : "0";
          const amt = parseFloat(clean) || 0;
          extraAmount += amt;

          if (d.name) {
            uniqueNames.add(d.name.trim().toLowerCase());
          }

          // Parse metadata in time field: "time_string|metadata_json"
          if (d.time && d.time.includes('|')) {
            try {
              const metaStr = d.time.split('|')[1];
              const meta = JSON.parse(metaStr);
              if (meta) {
                if (meta.birthday) extraBirthday += meta.birthday;
                if (meta.meals) extraMeals += meta.meals;
                if (meta.lives) extraLives += meta.lives;
                if (meta.studykit) extraStudykit += meta.studykit;
              }
            } catch (e) {
              console.error("Failed to parse donation metadata:", e);
            }
          }
        });

        setExtraData({
          extraAmount,
          uniqueDonors: uniqueNames.size,
          extraBirthday,
          extraMeals,
          extraLives,
          extraStudykit
        });
      })
      .catch(err => console.error("Error loading dynamic donations metrics:", err));
  }, []);

  const filteredStories = selectedCategory === "All" 
    ? detailedStories 
    : detailedStories.filter(s => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#07100b] pt-28 pb-20 font-sans transition-all duration-300">
      
      {/* 1. Header Hero Banner with glassmorphism & gradients */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16 overflow-visible">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#1E4D2B] via-[#15381E] to-zinc-950 text-white p-8 sm:p-16 text-center shadow-2xl border border-emerald-800/10">
          {/* Abstract light effects background */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-80 h-80 rounded-full bg-amber-500/5 blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md text-emerald-300 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest animate-pulse"
            >
              ❤️ Verified Transparency
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight"
            >
              Stories of <span className="text-[#F3A61E]">Hope & Love</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs sm:text-base text-zinc-300 font-normal leading-relaxed max-w-xl mx-auto"
            >
              At Kanha Foundation, every single contribution translates to an on-ground drive that is verified, documented, and delivered. See the real transformation.
            </motion.p>
          </div>
        </div>
      </div>

      {/* 2. Dynamic Slide Carousel */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-white dark:bg-[#101412] rounded-[2.5rem] border border-gray-150/40 dark:border-zinc-800/80 shadow-sm p-6 sm:p-10">
          <StoriesOfHope />
        </div>
      </div>

      {/* 3. Real Impact Stats Section - Dynamically integrated with Homepage Stats */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {statsCards.map((card, idx) => {
            const base = parseFloat(card.base_value) || 0;
            const cat = card.category;
            let target = base;
            if (cat === "raised") {
              target = base + extraData.extraAmount;
            } else if (cat === "donors") {
              target = base + extraData.uniqueDonors;
            } else if (cat === "birthday") {
              target = base + extraData.extraBirthday;
            } else if (cat === "lives") {
              target = base + extraData.extraLives;
            } else if (cat === "meals") {
              target = base + extraData.extraMeals;
            } else if (cat === "studykit") {
              target = base + extraData.extraStudykit;
            }

            return (
              <motion.div
                key={card.id || idx}
                whileHover={{ y: -3 }}
                className="bg-white dark:bg-[#101412] border border-gray-150/40 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between items-center"
              >
                <div className="text-xl sm:text-2xl font-black text-[#1E4D2B] dark:text-[#52c47c]">
                  <Counter 
                    target={target} 
                    prefix={card.prefix || ""} 
                    suffix={card.suffix || ""} 
                    decimals={0} 
                    className="text-[#1E4D2B] dark:text-[#52c47c] text-xl sm:text-2xl font-black"
                  />
                </div>
                <p className="text-[10px] sm:text-xs text-zinc-400 font-bold uppercase tracking-wider mt-2">{card.title}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 4. Filter Tabs and Story Grid Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Category Tabs list */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer border select-none ${
                  isActive
                    ? "bg-[#1E4D2B] border-[#1E4D2B] text-white shadow-md shadow-emerald-950/15"
                    : "bg-white dark:bg-[#101412] text-gray-550 dark:text-zinc-400 border-gray-200 dark:border-zinc-800 hover:border-emerald-500"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Stories Listing Grid Layout */}
        <div className="grid gap-8 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredStories.map((story, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                key={story.title}
                className="bg-white dark:bg-[#101412] overflow-hidden rounded-[2.5rem] border border-gray-150/40 dark:border-zinc-800/80 shadow-sm flex flex-col hover:shadow-md transition-shadow group text-left"
              >
                {/* Story Banner */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-850">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <span className="px-3 py-1 bg-black/55 backdrop-blur-md text-white border border-white/10 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {story.category}
                    </span>
                    <span className="px-3 py-1 bg-[#F3A61E]/90 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                      {story.stats}
                    </span>
                  </div>
                </div>

                {/* Content Box */}
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-405 dark:text-zinc-550 uppercase tracking-widest">
                      <span>📆 {story.date}</span>
                      <span>•</span>
                      <span>Verified Drive</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white group-hover:text-[#1E4D2B] dark:group-hover:text-[#52c47c] transition-colors leading-snug">
                      {story.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed font-normal">
                      {story.desc}
                    </p>
                  </div>
                  
                  {/* Share button wrapper */}
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-850 flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-450 tracking-wider uppercase flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      100% Transparency Verified
                    </span>
                    
                    <button
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          const msg = `Check out this amazing story of hope: "${story.title}" by Kanha Foundation! ❤️\n\n`;
                          const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg + window.location.origin + "/stories")}`;
                          window.open(url, "_blank");
                        }
                      }}
                      className="text-xs font-black text-gray-400 hover:text-[#25d366] transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      Share Story
                      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.247 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.3 1.592 5.548 0 10.061-4.512 10.064-10.066.002-2.69-1.043-5.22-2.937-7.113-1.894-1.892-4.425-2.935-7.11-2.936-5.549 0-10.06 4.514-10.064 10.066-.002 2.037.547 3.568 1.524 5.21l-.997 3.64 3.734-.979zm12.315-7.126c-.329-.165-1.95-.963-2.253-1.074-.303-.11-.523-.165-.742.165-.22.33-.848 1.074-1.039 1.294-.19.22-.382.247-.711.082-.33-.165-1.391-.512-2.651-1.637-.98-.874-1.642-1.953-1.834-2.282-.19-.33-.02-.508.145-.671.149-.147.33-.384.495-.577.165-.192.22-.33.329-.55.11-.22.055-.412-.028-.577-.082-.165-.742-1.787-1.018-2.447-.269-.646-.543-.559-.742-.569-.193-.01-.413-.012-.633-.012s-.577.082-.88.412c-.303.33-1.155 1.127-1.155 2.748s1.183 3.161 1.348 3.381c.165.22 2.328 3.555 5.64 4.982.788.34 1.403.542 1.884.695.792.251 1.513.216 2.083.13.636-.096 1.95-.798 2.225-1.568.275-.77.275-1.43.193-1.568-.083-.138-.303-.22-.633-.385z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 5. Back Button to Homepage */}
        <div className="mt-20 text-center">
          <button
            onClick={() => window.location.href = "/"}
            className="px-8 py-3.5 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-xs font-black uppercase tracking-wider rounded-full transition-all cursor-pointer border border-emerald-800/40 shadow-md active:scale-98 select-none"
          >
            &larr; Return to Home
          </button>
        </div>

      </div>
    </div>
  );
}
