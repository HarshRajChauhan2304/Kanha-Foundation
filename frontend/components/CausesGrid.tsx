"use client";
import React, { useRef, useState, useEffect } from 'react';
import CauseCard from '@/components/CauseCard';
import causesDataFallback from '@/data/causes.json';

export default function CausesGrid() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);
  const [causesList, setCausesList] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/causes')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCausesList(data);
        } else {
          setCausesList(causesDataFallback);
        }
      })
      .catch(err => {
        console.error("Error loading dynamic causes:", err);
        setCausesList(causesDataFallback);
      });
  }, []);

  const displayCauses = causesList.length > 0 ? causesList : causesDataFallback;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const offset = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollTo({
        left: scrollLeft + offset,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const index = Math.round(scrollLeft / 380);
      setActiveDot(index % displayCauses.length);
    }
  };

  // Auto scroll loop for Causes Carousel
  useEffect(() => {
    if (displayCauses.length === 0) return;
    const timer = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        let nextScroll = scrollLeft + 380;
        
        if (nextScroll >= maxScroll + 50) {
          nextScroll = 0;
        }
        
        scrollRef.current.scrollTo({
          left: nextScroll,
          behavior: 'smooth',
        });
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [displayCauses]);

  return (
    <div className="relative group px-1">
      {/* Left Circular Arrow Button */}
      <button
        onClick={() => scroll('left')}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-lg active:scale-95 transition-all cursor-pointer dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
        aria-label="Previous slide"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Horizontal Scrollable Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex space-x-6 overflow-x-auto pb-6 scroll-smooth scrollbar-none snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {displayCauses.map((cause) => (
          <div key={cause.id} className="w-72 sm:w-80 md:w-[355px] flex-shrink-0 snap-start">
            <CauseCard cause={cause} />
          </div>
        ))}
      </div>

      {/* Right Circular Arrow Button */}
      <button
        onClick={() => scroll('right')}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-lg active:scale-95 transition-all cursor-pointer dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
        aria-label="Next slide"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Carousel Pagination Dots */}
      <div className="mt-6 flex justify-center items-center space-x-2">
        {displayCauses.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTo({
                  left: index * 380,
                  behavior: 'smooth',
                });
              }
            }}
            className={`h-2.5 w-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              activeDot === index
                ? 'bg-[#1E4D2B] w-6'
                : 'bg-gray-300 hover:bg-gray-400 dark:bg-zinc-700'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
