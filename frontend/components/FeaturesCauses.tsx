"use client";
import React, { useEffect, useState, useRef } from 'react';
import CauseCard from '@/components/CauseCard';
import causesDataFallback from '@/data/causes.json';

export default function FeaturesCauses() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [causesList, setCausesList] = useState<any[]>([]);
  const [activeDot, setActiveDot] = useState(0);

  // Fetch causes data
  useEffect(() => {
    fetch('/api/causes')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCausesList(data);
        } else {
          setCausesList(causesDataFallback);
        }
      })
      .catch(() => setCausesList(causesDataFallback));
  }, []);

  const display = causesList.length > 0 ? causesList : causesDataFallback;
  
  // Dynamic ordering of featured categories requested by user:
  // 1. Giving To The Needy (Food/Needy)
  // 2. Education (Study kit)
  // 3. Women Care (Menstrual kit)
  // 4. Nature (Tree planting)
  // 5. Birthday Giving (Birthday celebration)
  const categoriesOrder = [
    "Giving To The Needy",
    "Education",
    "Women Care",
    "Nature",
    "Birthday Giving"
  ];

  const featuredItems: any[] = [];
  const usedIds = new Set<number>();

  categoriesOrder.forEach(catName => {
    const found = display.find(item => 
      !usedIds.has(item.id) && 
      (item.category === catName || 
       (item.category || "").toLowerCase() === catName.toLowerCase() ||
       (item.category || "").toLowerCase().includes(catName.toLowerCase()))
    );
    if (found) {
      featuredItems.push(found);
      usedIds.add(found.id);
    }
  });

  const items = featuredItems.length > 0 ? featuredItems : display.slice(0, 5);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const cardWidth = scrollRef.current.scrollWidth / items.length;
      const step = clientWidth > 640 ? cardWidth * 2 : cardWidth;
      const offset = direction === 'left' ? -step : step;
      scrollRef.current.scrollTo({
        left: scrollLeft + offset,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const cardWidth = scrollRef.current.scrollWidth / items.length;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveDot(index % items.length);
    }
  };

  // Auto‑scroll loop (every 5 s)
  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const cardWidth = scrollRef.current.scrollWidth / items.length;
        const step = clientWidth > 640 ? cardWidth : clientWidth;
        const next = scrollLeft + step;
        scrollRef.current.scrollTo({
          left: next >= maxScroll + 10 ? 0 : next,
          behavior: 'smooth',
        });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [items]);

  return (
    <div className="relative group px-1">
      
      {/* Horizontal Scrollable Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-6 scroll-smooth scrollbar-none snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((cause) => (
          <div 
            key={cause.id} 
            className="w-[calc(50%-6px)] sm:w-[calc(33.33%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)] flex-shrink-0 snap-start"
          >
            <CauseCard cause={cause} />
          </div>
        ))}
      </div>

      {/* Unified Bottom Navigation (Arrows + Dots Centered in a single row) */}
      <div className="mt-8 flex justify-center items-center gap-4">
        
        {/* Left Angle Navigation Bracket */}
        <button
          onClick={() => scroll('left')}
          className="text-gray-400 hover:text-[#1E4D2B] dark:hover:text-[#52c47c] transition-colors p-1 cursor-pointer"
          aria-label="Previous slide"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="flex items-center space-x-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (scrollRef.current) {
                  const cardWidth = scrollRef.current.scrollWidth / items.length;
                  scrollRef.current.scrollTo({
                    left: index * cardWidth,
                    behavior: 'smooth',
                  });
                }
              }}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeDot === index
                  ? 'bg-[#1E4D2B] dark:bg-[#52c47c] w-5'
                  : 'bg-gray-300 hover:bg-gray-400 dark:bg-zinc-700'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Right Angle Navigation Bracket */}
        <button
          onClick={() => scroll('right')}
          className="text-gray-400 hover:text-[#1E4D2B] dark:hover:text-[#52c47c] transition-colors p-1 cursor-pointer"
          aria-label="Next slide"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

      </div>

    </div>
  );
}
