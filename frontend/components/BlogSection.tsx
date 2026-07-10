"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import blogsDataFallback from '@/data/blogs.json';

export default function BlogSection() {
  const [blogsList, setBlogsList] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBlogsList(data.slice(0, 3)); // Display only first 3 on homepage
        } else {
          setBlogsList(blogsDataFallback.slice(0, 3));
        }
      })
      .catch(err => {
        console.error("Error loading homepage blogs:", err);
        setBlogsList(blogsDataFallback.slice(0, 3));
      });
  }, []);

  const displayBlogs = blogsList.length > 0 ? blogsList : blogsDataFallback.slice(0, 3);

  return (
    <section className="bg-[#0B2512] dark:bg-[#07150a] border-t border-emerald-950 py-20 px-4 md:px-8 text-white relative overflow-hidden">
      
      {/* Subtle overlay decorative gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* Centered Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black tracking-tight text-[#F3A61E] sm:text-5xl uppercase">
            Our Blog
          </h2>
        </div>

        {/* 3-Column Grid matching screenshot */}
        <div className="grid gap-8 md:grid-cols-3">
          {displayBlogs.map((post) => (
            <motion.article
              key={post.id}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-white/20 transition-all duration-300 group"
            >
              {/* Post Header Image */}
              <div className="h-56 overflow-hidden bg-black/20 relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Post Content */}
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-lg md:text-xl font-bold leading-snug text-white line-clamp-2 hover:text-[#F3A61E] transition-colors cursor-pointer">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs font-bold text-[#F3A61E] uppercase tracking-wider">
                    {post.date}
                  </p>
                  <p className="mt-4 text-sm text-gray-300/95 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Centered Solid Yellow Button matching screenshot */}
        <div className="mt-16 text-center">
          <button
            onClick={() => {
              window.location.href = "/blog";
            }}
            className="inline-flex px-10 py-4 bg-[#F3A61E] hover:bg-[#e0981b] text-[#0B2512] text-sm md:text-base font-black uppercase tracking-wider rounded-full transition-all duration-300 active:scale-98 shadow-xl shadow-yellow-500/10 cursor-pointer"
          >
            View More
          </button>
        </div>

      </div>
    </section>
  );
}
