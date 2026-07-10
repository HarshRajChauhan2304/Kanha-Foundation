"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import Counter from "@/components/Counter";
import FeaturesCauses from "@/components/FeaturesCauses";
import CausesThatMatter from "@/components/CausesThatMatter";
import FeaturedCampaign from "@/components/FeaturedCampaign";
import VolunteerSection from "@/components/VolunteerSection";
import TrustSection from "@/components/TrustSection";
import ReviewsSection from "@/components/ReviewsSection";
import BlogSection from "@/components/BlogSection";
import LiveDonationsToast from "@/components/LiveDonationsToast";
import CoreValues from "@/components/CoreValues";
import StoriesOfHope from "@/components/StoriesOfHope";
import BirthdayCampaign from "@/components/BirthdayCampaign";
import FAQSection from "@/components/FAQSection";
import FeaturedIn from "@/components/FeaturedIn";

const renderIcon = (iconName: string) => {
  switch (iconName) {
    case "rupee":
      return (
        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12M6 8h12M6 13h8.5a4.5 4.5 0 0 0 0-9H6M6 13l7.5 8" />
        </svg>
      );
    case "users":
      return (
        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      );
    case "cake":
      return (
        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v4M12 2v5M15 3v4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 11h16v8H4z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 11V8h12v3" />
        </svg>
      );
    case "heart":
      return (
        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      );
    case "meals":
      return (
        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 0a1 1 0 110-2 1 1 0 010 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 15h18v1.5a1 1 0 01-1 1H4a1 1 0 01-1-1V15z" />
        </svg>
      );
    case "child-studykit":
      return (
        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="6" r="3.5" />
          <path d="M5 21v-1.5a3.5 3.5 0 0 1 3.5-3.5h7a3.5 3.5 0 0 1 3.5 3.5V21" />
          <path d="M8 12.5h8v4.5H8z" />
          <path d="M12 12.5v4.5" />
          <path d="M10.5 8c.5.5 1.5.5 2 0" />
        </svg>
      );
    default:
      return (
        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
  }
};

export default function Home() {
  const { addToCart } = useCart();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // States
  const [unmutedIndex, setUnmutedIndex] = useState<number | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [activeDot, setActiveDot] = useState(0);
  const [heroMedia, setHeroMedia] = useState({ url: "", type: "video" });
  const [tutorialVideo, setTutorialVideo] = useState("/DIL%20KAHTA%20HAI.mp4");
  const [educationBanner, setEducationBanner] = useState("https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80");
  const [birthdayBanner, setBirthdayBanner] = useState("https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80");

  // Dynamic metrics stats cards list state
  const [statsCards, setStatsCards] = useState<any[]>([
    { id: 1, title: "Donations Raised", base_value: 100000000, prefix: "₹", suffix: "+", icon: "rupee", category: "raised" },
    { id: 2, title: "Active Donors", base_value: 100000, prefix: "", suffix: "+", icon: "users", category: "donors" },
    { id: 3, title: "Birthday Giving", base_value: 700000, prefix: "", suffix: "+", icon: "cake", category: "birthday" },
    { id: 4, title: "Lives Impacted", base_value: 2000000, prefix: "", suffix: "+", icon: "heart", category: "lives" },
    { id: 5, title: "Meals Served", base_value: 3500000, prefix: "", suffix: "+", icon: "meals", category: "meals" },
    { id: 1783188136129, title: "Providing Education", base_value: 500000, prefix: "", suffix: "+", icon: "child-studykit", category: "studykit" }
  ]);

  const [extraData, setExtraData] = useState({
    extraAmount: 0,
    uniqueDonors: 0,
    extraBirthday: 0,
    extraMeals: 0,
    extraLives: 0,
    extraStudykit: 0
  });

  // 5 videos representing Kanha Foundation's work formatted as reels (utilizing the user's actual uploaded videos)
  const videoPlaylist = [
    {
      id: 1,
      title: "Wholesome Meals Distribution",
      category: "Food Relief",
      desc: "Serving healthy, warm, nutritious thali meals to underprivileged slum children daily.",
      url: "/AAY%20HO%20MERI%20JINDI%20ME.mp4",
      poster: "/shwetha_birthday_thumbnail.png",
    },
    {
      id: 2,
      title: "Educational Study Kits Drive",
      category: "Study Kits",
      desc: "Distributing school bags, notebooks, and essential writing kits to underprivileged children.",
      url: "/DIL%20KAHTA%20HAI.mp4",
    },
    {
      id: 3,
      title: "Menstrual Hygiene Kits Distribution",
      category: "Menstrual Care",
      desc: "Supplying hygienic menstrual kits to underprivileged girls to support health, education, and dignity.",
      url: "/AAY%20HO%20MERI%20JINDI%20ME.mp4",
    },
    {
      id: 4,
      title: "Feeding Hungry Street Cows",
      category: "Cow Welfare",
      desc: "Providing fresh chara fodder and nutrient feed daily to stray cows on the streets.",
      url: "/DIL%20KAHTA%20HAI.mp4",
    },
    {
      id: 5,
      title: "Feeding Stray Street Dogs",
      category: "Dog Welfare",
      desc: "Conducting stray animal feeding drives to provide healthy feeds to street dogs.",
      url: "/AAY%20HO%20MERI%20JINDI%20ME.mp4",
    },
  ];

  const campaigns = [
    {
      id: 1,
      title: "Support Wholesome Thali Feast for 30 Children",
      price: "Rs. 3,000.00",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80",
      video: "/AAY%20HO%20MERI%20JINDI%20ME.mp4",
    },
    {
      id: 2,
      title: "Sponsor Complete Study Kits for 10 Children",
      price: "Rs. 2,000.00",
      image: "https://images.unsplash.com/photo-1464316386224-809b19f6b863?w=600&auto=format&fit=crop&q=80",
      video: "/DIL%20KAHTA%20HAI.mp4",
    },
    {
      id: 3,
      title: "Distribute Menstrual Kits to 15 Slum Girls",
      price: "Rs. 1,450.00",
      image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=600&auto=format&fit=crop&q=80",
      video: "/AAY%20HO%20MERI%20JINDI%20ME.mp4",
    },
    {
      id: 4,
      title: "Feed Fresh Chara Fodder to 20 Street Cows",
      price: "Rs. 700.00",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80",
      video: "/DIL%20KAHTA%20HAI.mp4",
    },
  ];

  // Auto-scrollable ongoing support projects matching user screenshot
  const carouselItems = [
    {
      id: 1,
      title: "Sponsor Fresh Chara Fodder for Street Cows",
      price: "Rs. 100.00",
      image: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      title: "Sponsor a Nutritious Thali for a Hungry Child",
      price: "Rs. 100.00",
      image: "/clean_water.png",
    },
    {
      id: 3,
      title: "Sponsor a Study Notebook & Pen Kit",
      price: "Rs. 200.00",
      image: "/education.png",
    },
    {
      id: 4,
      title: "Provide a Hygienic Menstrual Kit for a Girl",
      price: "Rs. 300.00",
      image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80",
    },
    {
      id: 5,
      title: "Sponsor a Nutritious Feed for Street Dogs",
      price: "Rs. 300.00",
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80",
    },
  ];

  // Scroll function for horizontal navigation buttons (reels section)
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft } = scrollContainerRef.current;
      const offset = direction === "left" ? -320 : 320;
      scrollContainerRef.current.scrollTo({
        left: scrollLeft + offset,
        behavior: "smooth",
      });
    }
  };

  // Scroll function for ongoing support carousel
  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft } = carouselRef.current;
      const offset = direction === "left" ? -360 : 360;
      carouselRef.current.scrollTo({
        left: scrollLeft + offset,
        behavior: "smooth",
      });
    }
  };

  const handleCarouselScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft } = carouselRef.current;
      const index = Math.round(scrollLeft / 360);
      setActiveDot(index % carouselItems.length);
    }
  };

  // Auto-scroll loop for Ongoing Support Carousel (every 4 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        const maxScroll = scrollWidth - clientWidth;
        let nextScroll = scrollLeft + 360;
        
        // Loop back to start if reached end
        if (nextScroll >= maxScroll + 50) {
          nextScroll = 0;
        }
        
        carouselRef.current.scrollTo({
          left: nextScroll,
          behavior: "smooth",
        });
      }
    }, 4000);

    fetch('/api/page-media', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const hero = data.find((m: any) => m.key === 'home_hero' || m.key === 'home_hero_video');
          if (hero) {
            setHeroMedia({ url: hero.url, type: hero.type });
          }
          const tutorial = data.find((m: any) => m.key === 'about_tutorial_video');
          if (tutorial && tutorial.url) {
            setTutorialVideo(tutorial.url);
          }
          const edu = data.find((m: any) => m.key === 'home_education_campaign');
          if (edu && edu.url) {
            setEducationBanner(edu.url);
          }
          const bday = data.find((m: any) => m.key === 'home_birthday_campaign');
          if (bday && bday.url) {
            setBirthdayBanner(bday.url);
          }
        }
      })
      .catch(err => console.error("Error fetching home media settings:", err));

    const fetchStatsAndDonations = () => {
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
    };

    fetchStatsAndDonations();
    const statsInterval = setInterval(fetchStatsAndDonations, 5000); // Poll every 5 seconds for real-time updates

    return () => {
      clearInterval(timer);
      clearInterval(statsInterval);
    };
  }, []);

  const toggleMute = (idx: number) => {
    if (unmutedIndex === idx) {
      setUnmutedIndex(null);
    } else {
      setUnmutedIndex(idx);
    }
  };

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-[#07100b] font-sans pb-0 relative pt-0">
      
      {/* Full-Width Video/Image Hero Section directly below Navbar */}
      <section className="relative w-full overflow-hidden bg-black h-[300px] md:h-[500px] shadow-lg">
        {heroMedia.url ? (
          heroMedia.type === "video" ? (
            <video
              key={heroMedia.url}
              src={heroMedia.url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-fill"
            />
          ) : (
            <img
              key={heroMedia.url}
              src={heroMedia.url}
              alt="Kanha Foundation Hero"
              className="w-full h-full object-fill"
            />
          )
        ) : (
          <div className="w-full h-full bg-black" />
        )}
        {/* Soft dark overlay matching screenshot */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </section>

      {/* Stats Cards Ribbon directly below Video (Matching layout, green theme) */}
      <section className="bg-[#15381E] py-3 md:py-4 px-4 border-b border-zinc-800">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 md:gap-3">
            
            {statsCards.map((card) => {
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
                <div key={card.id} className="bg-white/10 border border-white/5 backdrop-blur-md rounded-2xl p-2.5 md:p-3 text-center shadow-sm flex flex-col justify-between items-center transition-all hover:scale-102">
                  <div className="mb-1">
                    {renderIcon(card.icon)}
                  </div>
                  <div className="space-y-1 flex flex-col items-center">
                    <Counter 
                      target={target} 
                      prefix={card.prefix || ""} 
                      suffix={card.suffix || ""} 
                      decimals={0} 
                    />
                    <p className="text-xs text-white/70 font-semibold tracking-wider text-center">{card.title}</p>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* How to Donate? Watch Now! Info Ribbon (Matching user screenshot: located below stats ribbon) */}
      <div 
        onClick={() => setIsTutorialOpen(true)}
        className="bg-[#F3A61E] py-3 px-4 text-center flex items-center justify-center gap-2.5 font-extrabold text-[#1E4D2B] transition-all hover:bg-[#e0981b] cursor-pointer relative z-30 select-none shadow-inner text-sm tracking-wide"
      >
        {/* Play Icon Badge */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E4D2B] text-[#F3A61E] shadow-sm">
          <svg className="h-3 w-3 fill-current ml-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <span>How to Donate? Watch Now!</span>
      </div>

      
      

      {/* Featured Causes Section */}
        <section id="featured-causes" className="w-full py-16 relative overflow-visible">
        <div className="relative flex justify-center items-center mb-8 w-full">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1E4D2B] sm:text-4xl dark:text-[#52c47c]">
              Featured Causes
            </h2>
            <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
              Support a child and make a difference today
            </p>
          </div>
          <a
            href="/causes"
            className="absolute right-0 text-sm font-bold text-[#1E4D2B] hover:text-[#15381E] dark:text-[#52c47c] dark:hover:text-[#6ae095] hover:underline transition-colors hidden sm:inline-flex items-center gap-1"
          >
            View All Projects &rarr;
          </a>
        </div>
        <FeaturesCauses />
      </section>

      {/* Our Core Values Section (Radical transparency, verified impact, dignity first etc.) */}
      <CoreValues />

      {/* Stories of Hope in Pictures Section (Our Gallery) */}
      <StoriesOfHope />

      {/* Featured Campaign Banner Section */}
      <FeaturedCampaign imageUrl={educationBanner} />

      {/* Volunteer Section Banner (Be Part of Something Meaningful) */}
      <VolunteerSection />

      {/* Birthday Campaign Banner Section (A Birthday They'll Always Remember) */}
      <BirthdayCampaign imageUrl={birthdayBanner} />

      {/* Our Blog Grid Section */}
      <BlogSection />

      {/* Why People Trust Us Section */}
      <TrustSection />

      {/* Reviews Video Reels Section */}
      <ReviewsSection />

      {/* Global Floating Live Donations Toast Notification */}
      <LiveDonationsToast />




      {/* Floating WhatsApp chat widget (Matching screenshot) */}
      <a
        href="https://wa.me/917488164529" 
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all duration-200 font-semibold text-sm cursor-pointer border border-white/10"
      >
        <svg className="h-5.5 w-5.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.018-5.114-2.873-6.971-1.857-1.859-4.331-2.88-6.967-2.881-5.441 0-9.866 4.42-9.87 9.865-.001 1.716.452 3.39 1.309 4.866L1.892 21.8l4.755-1.646zM17.78 14.77c-.3-.15-1.782-.88-2.062-.98-.28-.1-.485-.15-.69.15-.205.3-.79.98-.97 1.18-.18.2-.36.225-.66.075-1.923-.96-3.153-1.748-4.417-3.918-.33-.568.33-.527.944-1.75.102-.203.05-.382-.025-.532-.075-.15-.69-1.66-.945-2.27-.249-.6-.508-.52-.69-.53-.18-.01-.385-.01-.59-.01-.205 0-.538.075-.82.38-.28.305-1.072 1.05-1.072 2.56 0 1.51 1.1 2.97 1.25 3.17.15.2 2.165 3.31 5.245 4.64.733.316 1.307.505 1.753.647.737.234 1.409.201 1.94.12.59-.09 1.782-.73 2.032-1.43.25-.7.25-1.3.175-1.43-.075-.13-.28-.205-.58-.355z"/>
        </svg>
        Chat with us
      </a>

      {/* Tutorial Video Modal popup (Triggers when info ribbon is clicked) */}
      {isTutorialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div 
            className="fixed inset-0" 
            onClick={() => setIsTutorialOpen(false)}
          />
          <div className="relative w-full max-w-3xl rounded-2xl bg-black border border-white/10 overflow-hidden shadow-2xl z-10 aspect-video">
            {/* Close Button */}
            <button
              onClick={() => setIsTutorialOpen(false)}
              className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-all border border-white/25 cursor-pointer"
              aria-label="Close tutorial"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Local Tutorial Video Player */}
            <video
              src={tutorialVideo}
              controls
              autoPlay
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      )}

      {/* FAQ Accordion Section (Frequently asked questions) */}
      <FAQSection />

    </div>
  );
}
