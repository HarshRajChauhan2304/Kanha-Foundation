"use client";
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import storiesDataFallback from '@/data/stories.json';

export default function StoriesOfHope() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);
  const [storiesList, setStoriesList] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/stories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setStoriesList(data);
        } else {
          setStoriesList(storiesDataFallback);
        }
      })
      .catch(err => {
        console.error("Error loading dynamic stories:", err);
        setStoriesList(storiesDataFallback);
      });
  }, []);

  const displayStories = storiesList.length > 0 ? storiesList : storiesDataFallback;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const cardWidth = scrollRef.current.scrollWidth / displayStories.length;
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
      const cardWidth = scrollRef.current.scrollWidth / displayStories.length;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveDot(index % displayStories.length);
    }
  };

  // Auto-scroll loop for Stories Carousel
  useEffect(() => {
    if (displayStories.length === 0) return;
    const timer = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const cardWidth = scrollRef.current.scrollWidth / displayStories.length;
        const step = clientWidth > 640 ? cardWidth : clientWidth;
        let nextScroll = scrollLeft + step;
        
        if (nextScroll >= maxScroll + 10) {
          nextScroll = 0;
        }
        
        scrollRef.current.scrollTo({
          left: nextScroll,
          behavior: 'smooth',
        });
      }
    }, 4500);

    return () => clearInterval(timer);
  }, [displayStories]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 bg-transparent">
      {/* Centered Heading and Subheading matching screenshot */}
      <div className="text-center mb-10 max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1E4D2B] sm:text-4xl dark:text-[#52c47c]">
          Stories of Hope in Pictures
        </h2>
        <p className="mt-4 text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
          Real moments. Real people. Real impact. Each image captures a story of care, dignity, and hope—made possible by people who chose to give with heart.
        </p>
      </div>

      {/* Slider Carousel Wrapper */}
      <div className="relative group px-1">
        
        {/* Horizontal Scrollable Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-6 scroll-smooth scrollbar-none snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {displayStories.map((img: any) => (
            <div 
              key={img.id} 
              className="w-[calc(50%-6px)] sm:w-[calc(33.33%-11px)] md:w-[calc(25%-12px)] flex-shrink-0 snap-start"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden shadow-md hover:shadow-lg border border-gray-150 dark:border-zinc-800"
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
              </motion.div>
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
            {displayStories.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (scrollRef.current) {
                    const cardWidth = scrollRef.current.scrollWidth / displayStories.length;
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
    </section>
  );
}
