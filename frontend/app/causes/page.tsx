"use client";
import React, { useState } from 'react';
import CauseCard from '@/components/CauseCard';
import causesData from '@/data/causes.json';

const DEFAULT_CATEGORIES = [
  "All Causes",
  "Birthday Giving",
  "Anniversary Giving",
  "Animal",
  "Giving To The Needy",
  "Nature",
  "Memorial Giving",
  "Women Care",
  "Education"
];

export default function CausesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Causes");
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [mediaSettings, setMediaSettings] = useState<Record<string, string>>({
    causes_header: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&auto=format&fit=crop&q=80"
  });
  const [textSettings, setTextSettings] = useState<Record<string, string>>({
    causes_banner_title_prefix: "Causes",
    causes_banner_title_highlight: "We Care"
  });

  React.useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const names = data.map((c: any) => c.name);
          setCategories(["All Causes", ...names]);
        }
      })
      .catch(err => {
        console.error("Error loading categories:", err);
      });

    // Fetch Page Media for Banner
    fetch('/api/page-media', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapping: Record<string, string> = {};
          data.forEach((item: any) => {
            mapping[item.key] = item.url;
          });
          setMediaSettings(prev => ({ ...prev, ...mapping }));
        }
      })
      .catch(err => console.error("Error loading causes media details:", err));

    // Fetch Page Texts for Banner
    fetch('/api/page-texts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapping: Record<string, string> = {};
          data.forEach((item: any) => {
            mapping[item.key] = item.value;
          });
          setTextSettings(prev => ({ ...prev, ...mapping }));
        }
      })
      .catch(err => console.error("Error loading causes text details:", err));
  }, []);

  // Filter logic based on query & tags
  const filteredCauses = causesData.filter((cause) => {
    const matchesCategory =
      selectedCategory === "All Causes" || cause.category === selectedCategory;
    const matchesSearch =
      cause.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cause.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#07100b] pt-[56px] md:pt-[72px]">
      
      {/* Banner Section matching user mockup */}
      <div className="relative h-[280px] sm:h-[310px] md:h-[330px] w-full overflow-hidden flex items-center justify-center">
        <img
          src={mediaSettings.causes_header}
          alt="Causes We Care"
          className="absolute inset-0 w-full h-full object-fill brightness-[0.4]"
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight drop-shadow-md flex flex-wrap justify-center items-center gap-3">
            <span>{textSettings.causes_banner_title_prefix || "Causes"}</span>
            <span className="bg-[#F3A61E] rounded-3xl px-6 py-1.5 text-black text-3xl sm:text-4xl md:text-5xl font-black shadow-lg">
              {textSettings.causes_banner_title_highlight || "We Care"}
            </span>
          </h1>
        </div>
      </div>

      {/* Explorer Grid section below banner */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        
        {/* Subheading info matching mockup */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1E4D2B] sm:text-4xl dark:text-[#52c47c]">
            Causes That Matter
          </h2>
          <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
            Choose a cause and make a difference today
          </p>
        </div>

        {/* Search Input bar */}
        <div className="max-w-xl mx-auto mb-10 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a cause or product..."
            className="w-full pl-6 pr-12 py-3.5 border border-gray-200 dark:border-zinc-800 rounded-full bg-white dark:bg-[#101412] text-gray-900 dark:text-white shadow-md focus:outline-none focus:ring-2 focus:ring-[#1E4D2B] focus:border-transparent text-sm transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Categories tag pills */}
        <div className="flex overflow-x-auto gap-3 pb-6 mb-10 scrollbar-none snap-x border-b border-gray-150 dark:border-zinc-800">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 cursor-pointer snap-start ${
                  isActive
                    ? 'bg-[#F3A61E] text-white shadow-md'
                    : 'bg-white dark:bg-[#101412] text-[#1E4D2B] border border-[#1E4D2B]/30 dark:border-[#52c47c]/30 dark:text-[#52c47c] hover:bg-[#1E4D2B]/5'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Grid display */}
        {filteredCauses.length > 0 ? (
          <div className="grid gap-3 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredCauses.map((cause) => (
              <CauseCard key={cause.id} cause={cause} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-[#101412] rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800">
            <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-sm font-bold text-gray-900 dark:text-white">No causes found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search keywords or category filters.</p>
          </div>
        )}

      </section>
    </div>
  );
}
