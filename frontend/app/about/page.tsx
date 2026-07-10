"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Counter from "@/components/Counter";

const renderIcon = (iconName: string) => {
  switch (iconName) {
    case "rupee":
      return (
        <svg className="h-5.5 w-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12M6 8h12M6 13h8.5a4.5 4.5 0 0 0 0-9H6M6 13l7.5 8" />
        </svg>
      );
    case "users":
      return (
        <svg className="h-5.5 w-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      );
    case "cake":
      return (
        <svg className="h-5.5 w-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v4M12 2v5M15 3v4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 11h16v8H4z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 11V8h12v3" />
        </svg>
      );
    case "heart":
      return (
        <svg className="h-5.5 w-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      );
    case "meals":
      return (
        <svg className="h-5.5 w-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 0a1 1 0 110-2 1 1 0 010 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 15h18v1.5a1 1 0 01-1 1H4a1 1 0 01-1-1V15z" />
        </svg>
      );
    case "child-studykit":
      return (
        <svg className="h-5.5 w-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="6" r="3.5" />
          <path d="M5 21v-1.5a3.5 3.5 0 0 1 3.5-3.5h7a3.5 3.5 0 0 1 3.5 3.5V21" />
          <path d="M8 12.5h8v4.5H8z" />
          <path d="M12 12.5v4.5" />
          <path d="M10.5 8c.5.5 1.5.5 2 0" />
        </svg>
      );
    default:
      return null;
  }
};

const BASE_STATS = [
  { id: 1, title: "Donations Raised", base_value: 100000000, prefix: "₹", suffix: "+", icon: "rupee", category: "raised" },
  { id: 2, title: "Active Donors", base_value: 100000, prefix: "", suffix: "+", icon: "users", category: "donors" },
  { id: 3, title: "Birthday Giving", base_value: 700000, prefix: "", suffix: "+", icon: "cake", category: "birthday" },
  { id: 4, title: "Lives Impacted", base_value: 2000000, prefix: "", suffix: "+", icon: "heart", category: "lives" },
  { id: 5, title: "Meals Served", base_value: 3500000, prefix: "", suffix: "+", icon: "meals", category: "meals" },
];
export default function AboutPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [stats, setStats] = useState<any[]>(BASE_STATS);
  const [directorsList, setDirectorsList] = useState<any[]>([]);
  const [volunteersList, setVolunteersList] = useState<any[]>([]);
const [extraData, setExtraData] = useState({
  extraAmount: 0,
  uniqueDonors: 0,
  extraBirthday: 0,
  extraMeals: 0,
  extraLives: 0,
  extraStudykit: 0,
});
  // Page Media CMS settings
  const [mediaSettings, setMediaSettings] = useState<Record<string, string>>({
    about_header: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&auto=format&fit=crop&q=80",
    about_vision: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80",
    about_mission: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=600&auto=format&fit=crop&q=80",
    about_team: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&auto=format&fit=crop&q=80",
    about_tutorial_video: "/DIL%20KAHTA%20HAI.mp4",
    about_footer_banner: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&auto=format&fit=crop&q=80"
  });

  // Page Texts CMS settings
  const [textSettings, setTextSettings] = useState<Record<string, string>>({
    about_banner_title_prefix: "About",
    about_banner_title_highlight: "Kanha Foundation",
    about_summary_text: "Kanha Foundation is a purpose-driven impact platform built to make giving simple, transparent, and meaningful. Every contribution made through our platform is executed on-ground and documented with real photos and videos, ensuring complete transparency and trust.",
    about_vision_title: "Our Vision",
    about_vision_desc: "We envision a world where giving is not just an act, but an experience—one rooted in empathy, transparency, and human connection.",
    about_mission_title: "Our Mission",
    about_mission_desc: "To empower children and families across India by providing essential resources, education, and opportunities that foster sustainable growth and lasting impact.",
    about_team_title: "Our Team",
    about_team_desc: "Kanha Foundation is powered by a committed team of professionals and verified field partners working together to ensure transparent, on-ground impact.",
    about_leadership_title: "Our Leadership",
    about_leadership_sub: "Meet the guiding minds behind the mission and growth of Kanha Foundation.",
    about_volunteers_title: "Our Team",
    about_volunteers_sub: "Recognizing the passionate volunteers dedicating their time and hearts on the ground.",
    about_footer_cta_title: "Your Kindness Can Change Lives",
    about_footer_cta_desc: "Discover the causes where your support makes a real difference—executed on the ground and shared with you through photos and videos."
  });

  useEffect(() => {
    // 1. Fetch Dynamic Leadership/Volunteers
    fetch('/api/about-highlights')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setDirectorsList(data.directors || []);
          setVolunteersList(data.volunteers || []);
        }
      })
      .catch(err => console.error("Error loading dynamic highlights:", err));

    // 2. Fetch Dynamic Page Media
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
      .catch(err => console.error("Error fetching about media details:", err));

    // 3. Fetch Dynamic Page Texts
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
      .catch(err => console.error("Error loading about text layouts:", err));
    const fetchStatsAndDonations = () => {
      // 4. Fetch stats cards configuration
      fetch('/api/stats-cards')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setStats(data);
          }
        })
        .catch(err => console.error("Error fetching stats cards configuration:", err));

      // 5. Fetch and aggregate dynamic donations statistics
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
            const clean = d.amount ? d.amount.replace(/[^\d.]/g, "") : "0";
            const amt = parseFloat(clean) || 0;
            extraAmount += amt;
            if (d.name) {
              uniqueNames.add(d.name.trim().toLowerCase());
            }
            if (d.time && d.time.includes("|")) {
              try {
                const metaStr = d.time.split("|")[1];
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
            extraStudykit,
          });
        })
        .catch(err => console.error("Error loading dynamic donations metrics:", err));
    };

    fetchStatsAndDonations();
    const statsInterval = setInterval(fetchStatsAndDonations, 5000); // Poll stats every 5 seconds for real-time updates

    return () => {
      clearInterval(statsInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#07100b] font-sans pt-[56px] md:pt-[72px]">
      
      {/* Header Banner Section */}
      <div className="relative h-[280px] sm:h-[310px] md:h-[330px] w-full overflow-hidden flex items-center justify-center">
        <img
          src={mediaSettings.about_header}
          alt="Smiling Children Background"
          className="absolute inset-0 w-full h-full object-fill brightness-[0.3]"
        />
        
        {/* Title Container */}
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight drop-shadow-md flex flex-wrap justify-center items-center gap-3">
            <span>{textSettings.about_banner_title_prefix || "About"}</span>
            <span className="bg-[#F3A61E] rounded-3xl px-6 py-1.5 text-black text-3xl sm:text-4xl md:text-5xl font-black shadow-lg">
              {textSettings.about_banner_title_highlight || "Kanha Foundation"}
            </span>
          </h1>
        </div>
      </div>

      {/* Ribbon stats banner bar */}
      <section className="bg-[#103E1C] text-white py-4 px-4 md:px-8 border-b border-emerald-950/40 relative z-10 shadow-lg mt-0">
        <div className="mx-auto max-w-7xl grid grid-cols-3 md:grid-cols-6 gap-y-3.5 gap-x-2 md:gap-8 text-center">
          {stats.map((card, idx) => {
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
              <div key={idx} className="flex flex-col items-center gap-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white shadow-inner mb-0.5">
                  {renderIcon(card.icon)}
                </div>
                <div className="text-base sm:text-lg font-black text-white leading-tight">
                  <Counter target={target} prefix={card.prefix || ""} suffix={card.suffix || ""} decimals={0} />
                </div>
                <p className="text-[9px] sm:text-[10px] text-gray-300 font-bold tracking-wide uppercase">
                  {card.title}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Gold Video Ribbon Block */}
      <section className="bg-[#F3A61E] py-5 px-4 md:px-8 text-center flex items-center justify-center gap-3 shadow-md">
        <button
          onClick={() => setIsVideoOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#F3A61E] hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
          aria-label="Play video tutorial"
        >
          <svg className="h-5.5 w-5.5 fill-current ml-1" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <span className="font-extrabold text-sm sm:text-base text-[#103E1C] hover:underline cursor-pointer" onClick={() => setIsVideoOpen(true)}>
          How to Donate? Watch Now!
        </span>
      </section>

      {/* About Main content detail block */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
          {textSettings.about_summary_text}
        </p>
      </section>

      {/* Our Vision Block (Image Left, Text Right) */}
      <section className="bg-[#15381E] text-white py-20 px-4 md:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl border border-white/5">
              <img
                src={mediaSettings.about_vision}
                alt="Our Vision Section Banner"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {textSettings.about_vision_title}
            </h2>
            <p className="mt-6 text-sm sm:text-base text-gray-200/90 leading-relaxed font-normal max-w-xl">
              {textSettings.about_vision_desc}
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission Block (Text Left, Image Right) */}
      <section className="bg-white dark:bg-[#07100b] text-gray-900 dark:text-white py-20 px-4 md:px-8 border-t border-gray-150 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/3] rounded-[2rem] overflow-hidden shadow-xl border border-gray-100 dark:border-zinc-800">
              <img
                src={mediaSettings.about_mission}
                alt="Our Mission Section Banner"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1E4D2B] dark:text-[#52c47c] leading-tight">
              {textSettings.about_mission_title}
            </h2>
            <p className="mt-6 text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-normal max-w-xl">
              {textSettings.about_mission_desc}
            </p>
          </div>
        </div>
      </section>

      {/* Our Team Block (Image Left, Text Right for alternating layout) */}
      <section className="bg-[#15381E] text-white py-20 px-4 md:px-8 border-t border-emerald-950/20">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl border border-white/5">
              <img
                src={mediaSettings.about_team}
                alt="Our Team Section Banner"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {textSettings.about_team_title}
            </h2>
            <p className="mt-6 text-sm sm:text-base text-gray-200/90 leading-relaxed font-normal max-w-xl">
              {textSettings.about_team_desc}
            </p>
          </div>
        </div>
      </section>

      {/* Directors Leadership block */}
      {directorsList.length > 0 && (
        <section className="bg-white dark:bg-[#07100b] text-gray-900 dark:text-white py-20 px-4 md:px-8 border-t border-gray-150 dark:border-zinc-800">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight text-[#1E4D2B] dark:text-[#52c47c] sm:text-4xl">
                {textSettings.about_leadership_title}
              </h2>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {textSettings.about_leadership_sub}
              </p>
            </div>
            <div className="grid gap-10 md:grid-cols-2">
              {directorsList.map((dir) => (
                <motion.div
                  key={dir.id}
                  whileHover={{ y: -5 }}
                  className="bg-gray-50/50 dark:bg-[#101412] p-8 sm:p-10 rounded-[2.5rem] border border-gray-150/40 dark:border-zinc-800/80 shadow-sm flex flex-col sm:flex-row items-center gap-8 text-left"
                >
                  <img
                    src={dir.image}
                    alt={dir.name}
                    className="h-32 w-32 object-cover rounded-[2rem] border-2 border-emerald-500/10 shadow-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">{dir.name}</h3>
                    <p className="text-xs font-black text-[#F3A61E] uppercase tracking-wider mt-1">{dir.role}</p>
                    <blockquote className="mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic border-l-2 border-emerald-500 pl-3">
                      "{dir.quote}"
                    </blockquote>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Star Volunteers block */}
      {volunteersList.length > 0 && (
        <section className="bg-gray-50 dark:bg-[#0c120f] text-gray-900 dark:text-white py-20 px-4 md:px-8 border-t border-gray-150 dark:border-zinc-800/85">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight text-[#1E4D2B] dark:text-[#52c47c] sm:text-4xl">
                {textSettings.about_volunteers_title}
              </h2>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {textSettings.about_volunteers_sub}
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {volunteersList.map((vol) => (
                <motion.div
                  key={vol.id}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-[#101412] p-6 rounded-[2rem] border border-gray-150/40 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between text-left"
                >
                  <div className="flex items-center gap-4 border-b border-gray-100 dark:border-zinc-850 pb-4 mb-4">
                    <img
                      src={vol.image}
                      alt={vol.name}
                      className="h-16 w-16 object-cover rounded-full border border-emerald-500/10 shadow-inner flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">{vol.name}</h3>
                      <p className="text-[10px] font-black text-[#1E4D2B] dark:text-[#52c47c] uppercase tracking-wider mt-1">{vol.role}</p>
                    </div>
                  </div>
                  <blockquote className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed pl-3 border-l border-emerald-500">
                    "{vol.quote}"
                  </blockquote>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA Banner block */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1E4D2B] sm:text-4xl dark:text-[#52c47c]">
            {textSettings.about_footer_cta_title}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-normal">
            {textSettings.about_footer_cta_desc}
          </p>
        </div>

        {/* Wide horizontal landscape image */}
        <div className="relative mx-auto max-w-5xl aspect-[21/9] rounded-[2rem] overflow-hidden shadow-xl border border-gray-100 dark:border-zinc-800 mb-10">
          <img
            src={mediaSettings.about_footer_banner}
            alt="Smiling kids landscape footer banner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* View Our Causes button */}
        <button
          onClick={() => window.location.href = "/causes"}
          className="inline-flex px-10 py-4 bg-[#F3A61E] hover:bg-[#e0981b] text-black font-extrabold text-sm sm:text-base rounded-full transition-all duration-300 active:scale-98 shadow-xl shadow-yellow-500/10 cursor-pointer"
        >
          View Our Causes
        </button>
      </section>

      {/* Video Lightbox Modal popup */}
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

              {/* Video Player */}
              <video
                src={mediaSettings.about_tutorial_video}
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
