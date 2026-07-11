"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import blogsDataFallback from '@/data/blogs.json';

interface BlogPost {
  id: number;
  image: string;
  title: string;
  date: string;
  excerpt: string;
}

export default function BlogCatalogPage() {
  const [blogsList, setBlogsList] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBlogsList(data);
        } else {
          setBlogsList(blogsDataFallback);
        }
      })
      .catch(err => {
        console.error("Error loading dynamic blogs:", err);
        setBlogsList(blogsDataFallback);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const displayBlogs = blogsList.length > 0 ? blogsList : blogsDataFallback;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#07100b] font-sans">
      
      {/* Header Banner Section */}
      <div className="relative h-[320px] w-full overflow-hidden flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&auto=format&fit=crop&q=80"
          alt="Books and reading background"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.3]"
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight drop-shadow-md flex flex-wrap justify-center items-center gap-3">
            <span>Our</span>
            <span className="bg-[#F3A61E] rounded-3xl px-6 py-1.5 text-black text-3xl sm:text-4xl md:text-5xl font-black shadow-lg">
              Blog
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-300 max-w-xl mx-auto drop-shadow-md font-medium">
            Read inspiring stories, expert advice, and updates from the ground about how your support is changing lives.
          </p>
        </div>
      </div>

      {/* Main Blog Post Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1E4D2B] mx-auto" />
            <p className="mt-4 text-sm text-gray-500">Loading blog articles...</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {displayBlogs.map((post) => (
              <motion.article
                key={post.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col bg-white dark:bg-[#101412] border border-gray-150 dark:border-zinc-850 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-250 transition-all duration-300 group"
              >
                {/* Header Image */}
                <div className="h-56 overflow-hidden bg-black/20 relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content Box */}
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold leading-snug text-gray-900 dark:text-white line-clamp-2 hover:text-[#1E4D2B] dark:hover:text-[#52c47c] transition-colors cursor-pointer">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-[10px] font-black text-[#F3A61E] uppercase tracking-wider">
                      {post.date}
                    </p>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <span className="text-xs font-black text-[#1E4D2B] dark:text-[#52c47c] cursor-default flex items-center gap-1">
                      Read Full Article
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
