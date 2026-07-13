"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import causesData from '@/data/causes.json';

const RANDOM_DONORS = [
  { name: "Rahul Singh", amount: "₹35,172", time: "4 minutes ago" },
  { name: "Priya Sharma", amount: "₹5,000", time: "12 minutes ago" },
  { name: "Anish Verma", amount: "₹12,500", time: "28 minutes ago" },
  { name: "Kirti Roy", amount: "₹2,400", time: "1 hour ago" },
  { name: "Aarav Gupta", amount: "₹45,000", time: "2 hours ago" },
  { name: "Siddharth Jain", amount: "₹8,000", time: "45 minutes ago" },
  { name: "Meera Nair", amount: "₹1,500", time: "15 minutes ago" }
];

export default function CauseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;

  const cause = causesData.find(c => c.id.toString() === id);

  // States
  const [quantity, setQuantity] = useState(1);
  const [activeMultiple, setActiveMultiple] = useState(1);
  const [alertMsg, setAlertMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // Recent Donation Popups (Bottom-Left mockup element)
  const [currentDonor, setCurrentDonor] = useState<any>(null);
  const [showDonorToast, setShowDonorToast] = useState(false);
  const realDonorsRef = useRef<any[]>([]);

  useEffect(() => {
    fetch('/api/donations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          realDonorsRef.current = data;
        }
      })
      .catch(err => console.error("Error loading real donors list:", err));

    // Initial delay, then rotate donor popups
    const initialTimeout = setTimeout(() => {
      rotateDonor();
    }, 4000);

    const interval = setInterval(() => {
      rotateDonor();
    }, 16000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const rotateDonor = () => {
    const source = realDonorsRef.current.length > 0 ? realDonorsRef.current : RANDOM_DONORS;
    const randomIdx = Math.floor(Math.random() * source.length);
    setCurrentDonor(source[randomIdx]);
    setShowDonorToast(true);
    // Hide toast after 6 seconds
    setTimeout(() => {
      setShowDonorToast(false);
    }, 6000);
  };

  const getDonationTime = (donor: any) => {
    if (!donor) return "";
    const createdAtStr = donor.created_at;
    const transactionDateStr = donor.transaction_date;
    if (!createdAtStr) return transactionDateStr || "Just now";
    try {
      const date = new Date(createdAtStr);
      if (isNaN(date.getTime())) {
        return transactionDateStr || "Just now";
      }
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      
      const day = date.getDate();
      const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      return `${hours}:${minutesStr} ${ampm}, date ${day} ${month} ${year}`;
    } catch (e) {
      return transactionDateStr || "Just now";
    }
  };

  const getDonationAmount = (donor: any) => {
    if (!donor) return "";
    const cleanAmt = donor.amount ? String(donor.amount).replace(/[^\d.]/g, "") : "0";
    const numericAmt = parseFloat(cleanAmt) || 0;
    return `₹${numericAmt.toLocaleString('en-IN')}`;
  };

  if (!cause) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#07100b] flex flex-col items-center justify-center font-sans text-center px-4">
        <h2 className="text-2xl font-black text-gray-800 dark:text-white">Cause Not Found</h2>
        <p className="text-sm text-zinc-400 mt-2">The request cause ID does not exist or has been deleted.</p>
        <button onClick={() => router.push('/causes')} className="mt-6 px-6 py-2.5 bg-[#1E4D2B] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer">
          Return to Causes
        </button>
      </div>
    );
  }

  // Parse price value
  const basePriceValue = parseFloat(cause.price.replace(/[^0-9.]/g, "")) || 0;
  const totalPrice = basePriceValue * quantity;

  // Multiples fast actions
  const selectMultiple = (multiple: number) => {
    setActiveMultiple(multiple);
    setQuantity(multiple);
  };

  const handleQuantityChange = (val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1) {
      setQuantity(num);
    }
  };

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      const shareUrl = window.location.href;
      const shareText = `Support this noble cause: "${cause.title}" on Kanha Foundation. Every contribution counts! ❤️\n\n`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: cause.title,
            text: shareText,
            url: shareUrl,
          });
          return;
        } catch (err) {
          console.log("Web Share failed, falling back:", err);
        }
      }
      
      // Fallback: Open WhatsApp share window
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + shareUrl)}`;
      window.open(whatsappUrl, '_blank');
      
      // Also copy to clipboard for convenience
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const triggerToast = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(""), 4000);
  };

  const handleAddToCart = () => {
    const auth = localStorage.getItem('auth');
    const adminAuth = localStorage.getItem('admin_auth');
    const volunteerSession = localStorage.getItem('volunteer_session');
    const isLoggedIn = auth === 'true' || adminAuth === 'true' || !!volunteerSession;

    if (!isLoggedIn) {
      router.push(`/signin?redirect=/causes/${cause.id}`);
      return;
    }

    addToCart({
      title: `${cause.title} (Qty: ${quantity})`,
      amount: `₹ ${totalPrice.toFixed(2)}`,
      category: cause.category
    });
    triggerToast("Added to Cart successfully!");
  };

  // Get dynamic category description
  let description = "";
  if (cause.category === "Giving To The Needy") {
    description = "For many underprivileged families, access to basic nourishment is a daily struggle. By sponsoring a food packet or wholesome thali, you ensure that slum kids and labor families receive a hot, nutritious meal. Your contribution supports clean preparation, healthy ingredients, and physical distribution directly to those who need it most.";
  } else if (cause.category === "Women Care") {
    description = "Lack of access to sanitary hygiene items remains one of the largest obstacles to education and dignity for teenage girls in low-income settlements. Sponsoring a hygiene pack provides high-quality sanitary napkins and essential toiletries. This simple support promotes gender parity, reduces school dropout rates, and protects health.";
  } else if (cause.category === "Birthday Giving") {
    description = "Bring joy and celebration to children who have never experienced a birthday party. Sponsoring a birthday celebration provides food packets and a custom cake for kids in the slums. Our volunteers organize fun activities, candle lighting, and sharing, creating happy memories that last a lifetime.";
  } else if (cause.category === "Education") {
    description = "For many children, the biggest barrier to education is not willingness—but access. A simple educational kit can mean the difference between attending school or staying behind. By supporting an educational kit, you help a child receive basic learning essentials that encourage regular school attendance, boost confidence, and nurture dreams.";
  } else {
    description = "Help us drive grassroots community transformation. By sponsoring this cause, you help direct materials, volunteer support, and logistical resources to underserved communities. Your contribution goes entirely towards execution, purchasing raw inventory, and local coordination.";
  }

  // Get other causes (You may also like)
  const otherCauses = causesData.filter(c => c.id !== cause.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#07100b] py-16 px-4 md:px-8 font-sans transition-all relative">
      
      {/* Toast Alert Indicator */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#1E4D2B] border border-emerald-500/30 text-white px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-2"
          >
            <svg className="h-5 w-5 text-emerald-400 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {alertMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-6xl mt-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-550 dark:text-zinc-500 mb-8">
          <span className="hover:underline cursor-pointer" onClick={() => router.push('/causes')}>Causes</span>
          <span>/</span>
          <span className="text-zinc-700 dark:text-zinc-350">{cause.title}</span>
        </div>

        {/* 2-Column Sponsor Template */}
        <div className="grid gap-12 lg:grid-cols-12 items-start bg-white dark:bg-[#101412] p-8 sm:p-12 rounded-[2.5rem] border border-gray-150/45 dark:border-zinc-800/80 shadow-sm relative mb-16">
          
          {/* Left Column: Image & Share Container (Col 6) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative aspect-[4/3] sm:aspect-[4/3] rounded-3xl overflow-hidden shadow-inner border border-zinc-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
              {cause.video ? (
                <video src={cause.video} autoPlay loop muted playsInline className="h-full w-full object-cover" />
              ) : (
                <img src={cause.image} alt={cause.title} className="h-full w-full object-cover" />
              )}
            </div>

            {/* Share Trigger */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-800 dark:hover:text-white cursor-pointer transition-all active:scale-95 group"
            >
              <svg className="h-4.5 w-4.5 text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186l2.913-1.457m0 2.914l2.913 1.456m-2.913-1.456L10.13 12m5.753-3.28a2.25 2.25 0 110 4.5 2.25 2.25 0 010-4.5z" />
              </svg>
              <span>{copied ? "Link Copied! ✓" : "Share"}</span>
            </button>
          </div>

          {/* Right Column: Pricing & Cart Actions (Col 6) */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div>
              <span className="px-3 py-1 bg-emerald-950/20 text-[#52c47c] border border-emerald-900/35 rounded-full text-[10px] font-black uppercase tracking-wider select-none">
                {cause.category}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-snug tracking-tight mt-3">
                {cause.title}
              </h1>
              <p className="text-2xl font-black text-zinc-850 dark:text-zinc-150 mt-3">
                {cause.price}
              </p>
            </div>

            {/* Choose Multiples */}
            <div className="space-y-2.5">
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">Choose In Multiple Of:</label>
              <div className="flex flex-wrap gap-2.5">
                {[1, 20, 50, 100].map((multiple) => {
                  const isActive = activeMultiple === multiple;
                  return (
                    <button
                      key={multiple}
                      onClick={() => selectMultiple(multiple)}
                      className={`h-9 min-w-12 px-4 rounded-full text-xs font-black transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-zinc-950 dark:bg-white text-white dark:text-black border-zinc-950 dark:border-white'
                          : 'bg-transparent text-zinc-650 border-zinc-300 hover:border-zinc-550 dark:text-zinc-400 dark:border-zinc-850 dark:hover:border-zinc-700'
                      }`}
                    >
                      {multiple}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity select inputs */}
            <div className="space-y-2.5">
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">Quantity</label>
              <div className="flex items-center gap-6">
                <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-xl w-32 overflow-hidden bg-gray-50/50 dark:bg-zinc-950/40">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-zinc-550 hover:bg-zinc-150 dark:hover:bg-zinc-800 font-extrabold cursor-pointer transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="flex-1 text-center font-bold text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none w-12"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-zinc-550 hover:bg-zinc-150 dark:hover:bg-zinc-800 font-extrabold cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Cost</span>
                  <span className="text-lg font-black text-[#1E4D2B] dark:text-[#52c47c]">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-4 bg-[#5850ec] hover:bg-[#4b43d3] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all duration-300 active:scale-98 cursor-pointer shadow-lg shadow-indigo-500/10"
            >
              Add to cart
            </button>

            {/* Dynamic details paragraphs */}
            <div className="space-y-4 border-t border-zinc-150 dark:border-zinc-800 pt-6 text-zinc-450 dark:text-zinc-400 text-xs leading-relaxed font-bold">
              <p>{description}</p>
              <p>
                By supporting this kit, you help a child receive basic learning materials that encourage regular school attendance, boost confidence, and nurture dreams.
              </p>
              <p className="italic text-zinc-500 font-medium">
                You will receive pictures of the campaign distribution, with your or your loved one's name & photo (optional), showing the direct impact of your support.
              </p>
            </div>

          </div>
        </div>

        {/* You May Also Like Section */}
        <div className="space-y-6 text-left">
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">You may also like</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {otherCauses.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/causes/${item.id}`)}
                className="bg-white dark:bg-[#101412] border border-gray-150/45 dark:border-zinc-800/85 rounded-3xl p-3.5 shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-98"
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-3.5 bg-gray-50 dark:bg-zinc-950">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                </div>
                <h3 className="text-xs font-black text-gray-800 dark:text-zinc-200 line-clamp-2 min-h-[2rem] leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mt-2">
                  From {item.price}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Floating Recent Donor Toast Notifications (Bottom-Left) */}
      <AnimatePresence>
        {showDonorToast && currentDonor && (
          <motion.div
            initial={{ opacity: 0, x: -100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="fixed bottom-6 left-6 z-40 bg-white/95 dark:bg-[#101412]/95 border border-zinc-150 dark:border-zinc-800/80 p-4 rounded-2xl shadow-2xl flex items-center gap-3.5 max-w-xs md:max-w-sm backdrop-blur-md"
          >
            {/* Heart symbol circle */}
            <div className="h-9 w-9 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center flex-shrink-0 shadow-inner">
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs text-gray-900 dark:text-white font-extrabold truncate">
                {currentDonor.name} donated <span className="text-emerald-500 font-black">{getDonationAmount(currentDonor)}</span>
              </p>
              <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-bold mt-0.5">{getDonationTime(currentDonor)}</p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowDonorToast(false)}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer p-0.5"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Support (Chat with us) */}
      <a
        href="https://wa.me/917488164529"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-[#25d366] hover:bg-[#20ba5a] text-white px-5 py-2.5 rounded-full shadow-2xl font-black text-xs flex items-center gap-2 hover:scale-105 active:scale-98 transition-all"
      >
        {/* WhatsApp Logo */}
        <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.247 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.3 1.592 5.548 0 10.061-4.512 10.064-10.066.002-2.69-1.043-5.22-2.937-7.113-1.894-1.892-4.425-2.935-7.11-2.936-5.549 0-10.06 4.514-10.064 10.066-.002 2.037.547 3.568 1.524 5.21l-.997 3.64 3.734-.979zm12.315-7.126c-.329-.165-1.95-.963-2.253-1.074-.303-.11-.523-.165-.742.165-.22.33-.848 1.074-1.039 1.294-.19.22-.382.247-.711.082-.33-.165-1.391-.512-2.651-1.637-.98-.874-1.642-1.953-1.834-2.282-.19-.33-.02-.508.145-.671.149-.147.33-.384.495-.577.165-.192.22-.33.329-.55.11-.22.055-.412-.028-.577-.082-.165-.742-1.787-1.018-2.447-.269-.646-.543-.559-.742-.569-.193-.01-.413-.012-.633-.012s-.577.082-.88.412c-.303.33-1.155 1.127-1.155 2.748s1.183 3.161 1.348 3.381c.165.22 2.328 3.555 5.64 4.982.788.34 1.403.542 1.884.695.792.251 1.513.216 2.083.13.636-.096 1.95-.798 2.225-1.568.275-.77.275-1.43.193-1.568-.083-.138-.303-.22-.633-.385z"/>
        </svg>
        Chat with us
      </a>

    </div>
  );
}
