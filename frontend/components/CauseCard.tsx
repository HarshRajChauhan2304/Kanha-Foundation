"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

interface Cause {
  id: number;
  image: string;
  video?: string;
  title: string;
  price: string;
  originalPrice?: number;
  category?: string;
}

interface CauseCardProps {
  cause: Cause;
}

export default function CauseCard({ cause }: CauseCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [favorited, setFavorited] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      className="bg-white dark:bg-[#101412] border border-gray-100 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 shadow-sm flex flex-col justify-between transition-all duration-300 w-full snap-start"
    >
      {/* Top Image/Video Container */}
      <div className="relative w-full aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-zinc-900 shadow-inner">
        {cause.video ? (
          <video
            src={cause.video}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <img
            src={cause.image}
            alt={cause.title}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        )}

        {/* Favorite Heart Badge (Top-Left) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setFavorited(!favorited);
          }}
          className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5 z-20 flex h-7.5 w-7.5 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/70 hover:bg-white text-gray-700 hover:text-red-500 shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer"
          aria-label="Add to favorites"
        >
          {favorited ? (
            <svg className="h-4.5 w-4.5 sm:h-5.5 sm:w-5.5 text-red-500 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 .81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          ) : (
            <svg className="h-4.5 w-4.5 sm:h-5.5 sm:w-5.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          )}
        </button>

        {/* Live Green Badge (Top-Right matching screenshot) - Linked to WhatsApp */}
        <a
          href={`https://wa.me/917488164529?text=Hello,%20I%20want%20to%20know%20more%20about%20the%20cause:%20${encodeURIComponent(cause.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 sm:top-3.5 sm:right-3.5 z-20 flex h-7.5 w-7.5 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-emerald-500 border-2 border-white dark:border-[#101412] shadow-md hover:bg-emerald-600 active:scale-95 transition-all cursor-pointer"
          title="Inquire on WhatsApp"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.636-1.023-5.115-2.885-6.978C16.584 1.9 14.113.876 11.48.876c-5.437 0-9.861 4.421-9.864 9.865-.001 1.748.46 3.454 1.336 4.975L1.87 20.354l4.777-1.2zm11.375-7.628s-.363-.18-1.222-.61c-.859-.43-.88-.41-.98-.26c-.1.15-.38.48-.46.58-.08.1-.17.11-.34.02-.34-.17-1.12-.42-1.95-1.16-.64-.57-1.08-1.28-1.2-1.49-.12-.22-.01-.33.1-.42.1-.09.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.03-.28-.02-.39-.05-.1-.46-1.1-.63-1.51-.17-.41-.35-.35-.48-.35h-.41c-.14 0-.36.05-.55.26-.19.21-.73.71-.73 1.74s.75 2.02.86 2.16c.11.14 1.48 2.26 3.58 3.17.5.22.89.35 1.2.45.5.16.96.14 1.32.09.4-.06 1.22-.5 1.39-.98.17-.48.17-.89.12-.98-.05-.09-.18-.14-.36-.23z"/>
          </svg>
        </a>
      </div>

      {/* Cause Title & Pricing Details */}
      <div className="flex-1 flex flex-col justify-between mt-3">
        <div>
          <h3 className="text-left text-gray-900 dark:text-white font-extrabold text-xs sm:text-base leading-snug tracking-tight line-clamp-2 min-h-[2rem] sm:min-h-[2.75rem]">
            {cause.title}
          </h3>
          <p className="text-left text-gray-900 dark:text-white font-bold text-sm sm:text-base mt-1.5 sm:mt-2">
            {cause.price}
          </p>
        </div>

        {/* Action button in Purple theme matching screenshot */}
        <button
          onClick={() => {
            const auth = localStorage.getItem('auth');
            const adminAuth = localStorage.getItem('admin_auth');
            const volunteerSession = localStorage.getItem('volunteer_session');
            const isLoggedIn = auth === 'true' || adminAuth === 'true' || !!volunteerSession;

            if (!isLoggedIn) {
              router.push(`/signin?redirect=/causes/${cause.id}`);
              return;
            }

            router.push(`/causes/${cause.id}`);
          }}
          className="w-full mt-3 sm:mt-4 bg-[#1E4D2B] hover:bg-[#15381E] text-white font-bold py-2 sm:py-3.5 px-2.5 sm:px-4 rounded-xl transition-all duration-300 text-center text-xs sm:text-sm shadow-md shadow-emerald-950/10 hover:shadow-lg active:scale-98 cursor-pointer select-none"
        >
          Sponsor Now &rarr;
        </button>
      </div>
    </motion.div>
  );
}
