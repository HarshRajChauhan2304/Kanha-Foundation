"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import pageMediaData from '@/data/page_media.json';

const getFallbackMedia = (key: string, defaultUrl: string) => {
  const item = pageMediaData.find((m: any) => m.key === key);
  return item ? item.url : defaultUrl;
};

const TIMELINE_STEPS = [
  {
    step: "STEP 01",
    title: "Choose a Cause",
    desc: "Pick a cause that resonates with you from our verified impact initiatives.",
    icon: (
      <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    bgColor: "bg-purple-100",
    side: "left"
  },
  {
    step: "STEP 02",
    title: "Add to Your Giving Basket",
    desc: "Select the items or contribution amount required and add them to your giving basket.",
    icon: (
      <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0h4a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h4" />
      </svg>
    ),
    bgColor: "bg-orange-100",
    side: "right"
  },
  {
    step: "STEP 03",
    title: "Review & Customise",
    desc: "Click Review & Customise to personalise your giving before proceeding.",
    icon: (
      <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    bgColor: "bg-purple-100",
    side: "left"
  },
  {
    step: "STEP 04",
    title: "Fill Details or Skip",
    desc: "Add Name to be printed, select a suitable delivery date and premium options (if eligible). Or choose Make My Donation Anonymous to skip customisation.",
    icon: (
      <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    bgColor: "bg-orange-100",
    side: "right"
  },
  {
    step: "STEP 05",
    title: "Checkout & Pay Securely",
    desc: "Pay via UPI, cards, net banking or wallets using secure payment methods.",
    icon: (
      <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    bgColor: "bg-purple-100",
    side: "left"
  },
  {
    step: "STEP 06",
    title: "Ground Team in Action",
    desc: "Our partnered team executes on-ground and shares proof by 8:00 PM on your selected date (where applicable).",
    icon: (
      <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    bgColor: "bg-orange-100",
    side: "right"
  },
  {
    step: "STEP 07",
    title: "Receive Updates",
    desc: "We send photos and videos directly to your WhatsApp and email by 8 PM on you selected delivery date.",
    icon: (
      <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    bgColor: "bg-purple-100",
    side: "left"
  }
];

export default function OurImpactsPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [tutorialVideo, setTutorialVideo] = useState("/DIL%20KAHTA%20HAI.mp4");
  const [mediaSettings, setMediaSettings] = useState<Record<string, string>>({
    impacts_header: getFallbackMedia("impacts_header", "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&auto=format&fit=crop&q=80")
  });
  const [textSettings, setTextSettings] = useState<Record<string, string>>({
    impacts_banner_title_prefix: "1394+",
    impacts_banner_title_highlight: "Lives Impacted",
    impacts_banner_subtitle: "Real people. Real stories. Real change — powered by everyday givers like you.",
  });
  const [successStories, setSuccessStories] = useState<any[]>([
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80",
      title: "1200+ Birthday Giving",
      desc: "1200+ Moments of Meaningful Giving"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80",
      title: "Giving With Proof",
      desc: "Transparent impact you can see and trust."
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80",
      title: "1394+ Lives Impacted",
      desc: "Impacting Lives. Creating Hope."
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80",
      title: "59+ Meals Served",
      desc: "59+ Meals of Dignity"
    }
  ]);

  useEffect(() => {
    fetch('/api/page-media', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapping: Record<string, string> = {};
          data.forEach((item: any) => {
            mapping[item.key] = item.url;
          });
          setMediaSettings(prev => ({ ...prev, ...mapping }));

          const tutorial = data.find((m: any) => m.key === 'about_tutorial_video');
          if (tutorial && tutorial.url) {
            setTutorialVideo(tutorial.url);
          }
        }
      })
      .catch(err => console.error("Error fetching impacts media settings:", err));

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
      .catch(err => console.error("Error loading impacts text layouts:", err));

    fetch('/api/success-stories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSuccessStories(data);
        }
      })
      .catch(err => console.error("Error loading success stories:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#07100b] pt-[56px] md:pt-[72px]">
      
      {/* Header Banner matching mockup screenshot */}
      <div className="relative h-[280px] sm:h-[310px] md:h-[330px] w-full overflow-hidden flex items-center justify-center">
        <img
          src={mediaSettings.impacts_header}
          alt="Stacked Hands Background"
          className="absolute inset-0 w-full h-full object-fill brightness-[0.3]"
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight drop-shadow-md flex flex-wrap justify-center items-center gap-3">
            <span>{textSettings.impacts_banner_title_prefix || "1.2 cr+"}</span>
            <span className="bg-[#F3A61E] rounded-3xl px-6 py-1.5 text-black text-2xl sm:text-4xl md:text-5xl font-black shadow-lg">
              {textSettings.impacts_banner_title_highlight || "Lives Impacted"}
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-200/90 font-medium tracking-wide">
            {textSettings.impacts_banner_subtitle || "Real people. Real stories. Real change — powered by everyday givers like you."}
          </p>
        </div>
      </div>

      {/* Intro Description section */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-snug">
          {textSettings.impacts_intro_title || "At Kanha Foundation, impact isn't a promise — it's a responsibility."}
        </h2>
        
        <div className="mt-8 space-y-6 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
          <p>
            {textSettings.impacts_intro_desc_1 || "Every contribution made on Kanha Foundation turns into action on the ground. From feeding hungry children and supporting women's hygiene, to caring for stray animals and planting trees — each cause is executed with transparency, speed, and heart."}
          </p>
          <p>
            {textSettings.impacts_intro_desc_2 || "We work closely with on-ground teams and partner organizations to ensure that every donation reaches where it's needed the most. What makes us different is simple: you don't just give — you see your impact."}
          </p>
          <p className="font-bold text-gray-800 dark:text-gray-200 border-t border-gray-150 dark:border-zinc-800 pt-6">
            {textSettings.impacts_intro_proof || "Photos, videos, names printed on food packets, birthday celebrations, feeding drives — because generosity deserves proof, not just gratitude."}
          </p>
        </div>
      </section>

      {/* Green Banner Watch Now block */}
      <section className="bg-[#103E1C] text-white py-6 px-4 md:px-8 text-center flex items-center justify-center gap-4">
        <button
          onClick={() => setIsVideoOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#103E1C] hover:scale-105 transition-all shadow-md cursor-pointer"
          aria-label="Watch how it works video"
        >
          <svg className="h-6 w-6 fill-current ml-1" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <span className="font-extrabold text-sm sm:text-base tracking-wide text-[#F3A61E] hover:underline cursor-pointer" onClick={() => setIsVideoOpen(true)}>
          How to Donate? Watch Now!
        </span>
      </section>

      {/* HOW IT WORKS Vertical Timeline Section */}
      <section className="mx-auto max-w-5xl px-4 py-20 relative overflow-hidden rounded-[2.5rem]">
        {/* Transparent watermark picture background */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.02] pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&auto=format&fit=crop&q=80"
            alt="Timeline Background Watermark"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center mb-16 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1E4D2B] dark:text-[#52c47c]">
            How it works
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl mt-3">
            {textSettings.impacts_timeline_title || "Follow these simple steps to support a cause."}
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {textSettings.impacts_timeline_subtitle || "Choose a cause, customise if you want, pay securely — then receive proof on WhatsApp and email."}
          </p>
        </div>

        {/* Vertical Timeline Tree */}
        <div className="relative">
          {/* Vertical central divider line (left on mobile, center on desktop) */}
          <div className="absolute left-4 md:left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] border-l border-dashed border-gray-300 dark:border-zinc-700" />

          <div className="space-y-12">
            {TIMELINE_STEPS.map((item, idx) => (
              <div key={idx} className={`flex flex-col md:flex-row items-center w-full relative z-10 ${item.side === 'left' ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Empty buffer box to take half the width */}
                <div className="hidden md:block w-1/2" />

                {/* Timeline center node dot (left on mobile, center on desktop) */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border-4 border-[#F3A61E] shadow-sm" />

                {/* Card Container block (padding-left on mobile to clear the dot) */}
                <div className="w-full md:w-1/2 pl-12 pr-2 md:px-8 mt-2 md:mt-0">
                  <motion.div
                    whileHover={{ y: -3 }}
                    className="bg-white dark:bg-[#101412] border border-gray-150 dark:border-zinc-850 p-6 sm:p-8 rounded-3xl shadow-sm hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center gap-3.5 mb-4">
                      <span className="text-xs font-black uppercase text-[#F3A61E] bg-[#FFFBEB] px-2.5 py-1 rounded-md">
                        {item.step}
                      </span>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${item.bgColor}`}>
                        {item.icon}
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </motion.div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Bottom Explore Causes action button */}
        <div className="mt-16 text-center">
          <button
            onClick={() => window.location.href = "/causes"}
            className="inline-flex items-center px-10 py-4 bg-[#F3A61E] hover:bg-[#e0981b] text-black font-extrabold rounded-full transition-all duration-300 active:scale-98 shadow-xl shadow-yellow-500/10 cursor-pointer"
          >
            Explore Causes &rarr;
          </button>
        </div>

      </section>

      {/* Success story Grid section */}
      <section className="mx-auto max-w-7xl px-4 py-20 border-t border-gray-200 dark:border-zinc-800">
        
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1E4D2B] dark:text-[#52c47c] sm:text-4xl uppercase">
            Success story
          </h2>
        </div>

        {/* Custom rounded corner cards list grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {successStories.map((story) => (
            <motion.div
              key={story.id}
              whileHover={{ y: -6 }}
              className="flex flex-col bg-white dark:bg-[#101412] border border-gray-150 dark:border-zinc-800/80 rounded-t-3xl rounded-bl-[3rem] overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              {/* Card image */}
              <div className="h-56 overflow-hidden bg-black/5 relative">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Card details */}
              <div className="p-6 text-left flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                    {story.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-normal leading-relaxed">
                    {story.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </section>

      {/* Video Lightbox Player Modal */}
      <AnimatePresence>
        {isVideoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div 
              className="fixed inset-0" 
              onClick={() => setIsVideoOpen(false)}
            />
            <div className="relative w-full max-w-3xl rounded-2xl bg-black border border-white/10 overflow-hidden shadow-2xl z-10 aspect-video">
              {/* Close Button */}
              <button
                onClick={() => setIsVideoOpen(false)}
                className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-all border border-white/25 cursor-pointer"
                aria-label="Close video"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Play Video Player */}
              <video
                src={tutorialVideo}
                controls
                autoPlay
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
