"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import navbarJSON from '@/data/navbar.json';

const navItems = [
  { label: "Home", href: "/" },
  { label: "Causes", href: "/causes" },
  { label: "Our Impact", href: "/impacts" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const getDonorAddress = (d: any) => {
  if (!d) return "Ranchi, Jharkhand, India";
  const name = d.name || "Anonymous";
  const email = d.email || "";
  if (email) {
    const cities = ["Lalpur, Ranchi", "Bariatu, Ranchi", "Jamshedpur, Jharkhand", "Kokar, Ranchi", "Patna, Bihar", "Kolkata, WB", "New Delhi, Delhi"];
    const hash = (name.charCodeAt(0) || 0) + (email.charCodeAt(0) || 0);
    const city = cities[hash % cities.length];
    return `${city}, India`;
  }
  return "Ranchi, Jharkhand, India";
};

export default function Navbar() {
  const router = useRouter();
  const [navbarData, setNavbarData] = useState<any>(navbarJSON);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");
  
  // Scroll states for slidable & transparent navbar
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Report states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportDonations, setReportDonations] = useState<any[]>([]);
  const [reportSearch, setReportSearch] = useState("");
  const [isReportLoading, setIsReportLoading] = useState(false);

  const openReportModal = () => {
    setIsReportModalOpen(true);
    setIsReportLoading(true);
    fetch('/api/donations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReportDonations(data);
        }
      })
      .catch(err => console.error("Error loading report donations:", err))
      .finally(() => setIsReportLoading(false));
  };
  
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart } = useCart();

  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/navbar')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setNavbarData(data);
        }
      })
      .catch(err => console.error("Navbar config fetch error:", err));
  }, []);

  // Dynamic Login session states
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isVolunteerLoggedIn, setIsVolunteerLoggedIn] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80");

  const checkSessions = () => {
    const userAuth = localStorage.getItem("auth");
    const adminAuth = localStorage.getItem("admin_auth");
    const volunteerSession = localStorage.getItem("volunteer_session");
    
    const userActive = userAuth === "true";
    const adminActive = adminAuth === "true";
    const volActive = !!volunteerSession;

    setIsUserLoggedIn(userActive);
    setIsAdminLoggedIn(adminActive);
    setIsVolunteerLoggedIn(volActive);

    if (userActive) {
      const storedAvatar = localStorage.getItem("user_avatar");
      setProfilePhoto(storedAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80");
    } else if (volActive) {
      try {
        const sessionObj = JSON.parse(volunteerSession || "{}");
        setProfilePhoto(sessionObj.profile_photo || sessionObj.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80");
        
        // Dynamically sync updated volunteer details from database
        fetch('/api/volunteer')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              const matchedVol = data.find((v: any) => v.id === sessionObj.id);
              if (matchedVol && matchedVol.profile_photo) {
                setProfilePhoto(matchedVol.profile_photo);
                localStorage.setItem("volunteer_session", JSON.stringify(matchedVol));
              }
            }
          })
          .catch(err => console.warn("Navbar background volunteer sync error:", err));
      } catch (e) {
        setProfilePhoto("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80");
      }
    } else if (adminActive) {
      const storedAdminAvatar = localStorage.getItem("admin_avatar");
      setProfilePhoto(storedAdminAvatar || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80");
    }
  };

  useEffect(() => {
    checkSessions();

    const handleUpdate = () => checkSessions();
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("user_avatar_update", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("user_avatar_update", handleUpdate);
    };
  }, [pathname]);

  useEffect(() => {
    const handleScroll = (e: any) => {
      // Determine the scrolling element (it could be body under double scroll setup)
      const target = e.target === document ? (document.body || document.documentElement) : e.target;
      const currentScrollY = target.scrollTop !== undefined ? target.scrollTop : window.scrollY;
      
      // Determine if background should be transparent or colored
      if (currentScrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Hide navbar when scrolling down, show when scrolling up
      if (isMobileMenuOpen || isProfileDropdownOpen) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false); // scrolling down
      } else {
        setIsVisible(true); // scrolling up or near top
      }
      
      setLastScrollY(currentScrollY);
    };

    // Capture: true ensures we catch scroll events bubbling from the body element
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    
    // Initial scroll position verify
    const initialScrollY = document.body.scrollTop || document.documentElement.scrollTop || window.scrollY;
    if (initialScrollY > 20) {
      setIsScrolled(true);
    }

    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, [lastScrollY, isMobileMenuOpen, isProfileDropdownOpen]);


  const handleSignOut = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("admin_auth");
    localStorage.removeItem("volunteer_session");
    setIsUserLoggedIn(false);
    setIsAdminLoggedIn(false);
    setIsVolunteerLoggedIn(false);
    setIsProfileDropdownOpen(false);
    router.push('/signin');
  };

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/volunteer")) {
    return null;
  }

  return (
    <>
        <nav 
          className={`fixed top-0 left-0 w-full z-50 px-4 pt-1 pb-2 md:pt-1.5 md:pb-3 md:px-8 ${
            isScrolled 
              ? "bg-[#2A854A]/90 backdrop-blur-md shadow-md border-b border-emerald-500/20" 
              : "bg-[#52c47c]/30 backdrop-blur-md shadow-none border-b border-white/10"
          }`}
          style={{
            transform: isVisible ? "translateY(0)" : "translateY(-100%)",
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease-in-out, border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out"
          }}
        >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          
          {/* Left section: Hamburger & Logo */}
          <div className="flex items-center space-x-2">
            {/* Hamburger menu for mobile */}
            {!isVolunteerLoggedIn && (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="inline-flex items-center justify-center rounded-md p-1.5 text-white hover:bg-white/10 focus:outline-none transition-colors md:hidden cursor-pointer"
                aria-label="Open main menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}

            {/* Kanha Foundation Logo */}
            {!isVolunteerLoggedIn && (
              <a href="/" className="flex items-center space-x-2 group">
                  <img
                    src={navbarData.logo}
                    alt={`${navbarData.name} Logo`}
                    className="navbar-logo w-auto object-contain drop-shadow-sm -mt-0.5"
                    style={{ 
                      backgroundColor: "transparent",
                      "--logo-size": navbarData.logoSize ? `${navbarData.logoSize * 0.75}px` : "78px"
                    } as React.CSSProperties}
                    onError={(e)=>{(e.target as HTMLImageElement).src="/kanha_logo_round.png"}}
                  />
                  <span 
                    className="text-white font-semibold uppercase tracking-wider hidden sm:inline"
                    style={{
                      fontFamily: navbarData.fontFamily,
                      fontSize: `${navbarData.fontSize}px`
                    }}
                  >
                    {navbarData.name}
                  </span>
              </a>
            )}
          </div>

          {/* Center section: Desktop navigation links (centered tabs) */}
          {!isVolunteerLoggedIn && (
            <div className="hidden flex-1 justify-center px-8 md:flex">
              <div className="flex space-x-1">
                {navItems.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    className="rounded-lg px-4 py-2 bg-transparent text-white text-sm font-medium transition-all hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                  </a>
                ))}
                <button
                  onClick={openReportModal}
                  className="rounded-lg px-4 py-2 bg-transparent text-white text-sm font-medium transition-all hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  📊 Donors Report
                </button>
              </div>
            </div>
          )}

          {/* Far Right section: Profile & Cart */}
          <div className="flex items-center space-x-3 ml-auto">
            {/* Profile Dropdown Trigger */}
            <div className="relative">
              {!(isUserLoggedIn || isAdminLoggedIn || isVolunteerLoggedIn) ? (
                <button
                  onClick={() => router.push('/signin')}
                  className="flex rounded-full p-2 text-white hover:bg-white/10 focus:outline-none transition-colors cursor-pointer"
                  aria-label="Sign In"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex rounded-full overflow-hidden h-9 w-9 border-2 border-white hover:border-[#F3A61E] focus:outline-none transition-all cursor-pointer shadow-md"
                  aria-label="User profile dropdown"
                >
                  <img
                    src={profilePhoto}
                    alt="Profile Photo"
                    className="h-full w-full object-cover"
                  />
                </button>
              )}

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (isUserLoggedIn || isAdminLoggedIn || isVolunteerLoggedIn) && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none z-20 transition-all scale-100 opacity-100 border border-gray-100">
                    {isVolunteerLoggedIn ? (
                      <div className="py-1">
                        <a href="/volunteer/profile" onClick={() => setIsProfileDropdownOpen(false)} className="block px-4 py-2 text-sm text-zinc-800 hover:bg-gray-50 font-bold">
                          🤝 My Profile
                        </a>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors cursor-pointer"
                        >
                          🚪 Log Out
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Account Portal</p>
                        </div>
                        <div className="py-1">
                          {isUserLoggedIn && (
                            <a href="/profile" onClick={() => setIsProfileDropdownOpen(false)} className="block px-4 py-2 text-sm text-zinc-800 hover:bg-gray-50 font-bold">
                              👤 My Profile
                            </a>
                          )}
                          {isAdminLoggedIn && (
                            <a href="/admin" onClick={() => setIsProfileDropdownOpen(false)} className="block px-4 py-2 text-sm text-zinc-800 hover:bg-gray-50 font-bold">
                              ⚙️ Admin Panel
                            </a>
                          )}
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors cursor-pointer"
                          >
                            🚪 Log Out
                          </button>
                        </div>
                        <div className="border-t border-gray-100 my-1"></div>
                        <div className="px-4 py-1.5">
                          <a href="https://wa.me/917488164529" target="_blank" rel="noopener noreferrer" className="block text-xs font-black text-emerald-650 hover:underline">
                            Chat with us
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Cart Icon (with badge) */}
            {!isVolunteerLoggedIn && (
              <div className="relative">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative flex rounded-full p-2 text-white hover:bg-white/10 focus:outline-none transition-colors"
                  aria-label="Shopping cart"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100-4 2 2 0 000 4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {/* Cart Badge */}
                  {cartItems.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#F3A61E] text-[10px] font-bold text-white ring-2 ring-[#2A854A] animate-pulse">
                      {cartItems.length}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer (Left Slide-over Menu) */}
      {isMobileMenuOpen && (
        <div className="relative z-50 md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop blur/shadow */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ease-out"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 flex max-w-full">
            <div className="w-screen max-w-xs transform bg-white shadow-xl transition-all duration-300 ease-in-out flex flex-col h-full">
              {/* Drawer Header (Close button on left, Logo next to it) */}
              <div className="flex items-center space-x-3 bg-[#2A854A] px-4 py-3 shrink-0">
                {/* Close Button X on the left */}
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-md p-1 text-white hover:bg-white/10 focus:outline-none transition-colors cursor-pointer"
                >
                  <span className="sr-only">Close menu</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Logo in Mobile Drawer */}
                <a href="#" className="flex items-center">
                  <img
                    src={navbarData.logo}
                    alt={`${navbarData.name} Logo`}
                    className="h-16 w-auto object-contain drop-shadow-sm"
                    onError={(e)=>{(e.target as HTMLImageElement).src="/kanha_logo_round.png"}}
                  />
                </a>
              </div>

              {/* Drawer Links (Full width block links) */}
              <div className="flex-1 bg-white pt-2 overflow-y-auto">
                {navItems.map((item, idx) => {
                  const isActive = item.label === activeItem;
                  return (
                    <a
                      key={idx}
                      href={item.href}
                      onClick={() => {
                        setActiveItem(item.label);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`block w-full text-left py-4 px-6 text-[18px] font-normal transition-all ${
                        isActive
                          ? "bg-[#EAEAEA] text-black font-medium"
                          : "text-[#1C1B1F] hover:bg-gray-50 hover:text-[#1E4D2B]"
                      }`}
                    >
                      {item.label}
                    </a>
                  );
                })}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openReportModal();
                  }}
                  className="block w-full text-left py-4 px-6 text-[18px] font-normal transition-all text-[#1C1B1F] hover:bg-gray-55 hover:text-[#1E4D2B] cursor-pointer"
                >
                  📊 Donors Report
                </button>
              </div>

              {/* Drawer Footer with Social Icons (matches user screenshot) */}
              <div className="bg-[#F8F9FA] px-6 py-6 border-t border-gray-100 flex items-center justify-start space-x-7 shrink-0">
                {/* X Icon */}
                <a href="#" className="text-[#1C1B1F] hover:opacity-75 transition-opacity" aria-label="X (Twitter)">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                {/* Facebook Icon */}
                <a href="#" className="text-[#1C1B1F] hover:opacity-75 transition-opacity" aria-label="Facebook">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                  </svg>
                </a>
                {/* Instagram Icon */}
                <a href="#" className="text-[#1C1B1F] hover:opacity-75 transition-opacity" aria-label="Instagram">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                {/* YouTube Icon */}
                <a href="#" className="text-[#1C1B1F] hover:opacity-75 transition-opacity" aria-label="YouTube">
                  <svg className="h-5.5 w-5.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.553 9.388.553 9.388.553s7.518 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Slider Drawer (Right Slide-over Panel) */}
      {isCartOpen && (
        <div className="relative z-50" role="dialog" aria-modal="true">
          {/* Backdrop blur/shadow */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full">
            <div className="w-screen max-w-md transform bg-white shadow-xl transition-all duration-300">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-[#1E4D2B]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  Your Cart
                </h2>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  <span className="sr-only">Close menu</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {cartItems.length > 0 ? (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all"
                      >
                        <div className="pr-4">
                          <h4 className="text-sm font-semibold text-gray-800">{item.title}</h4>
                          <span className="mt-1 text-xs text-gray-500">One-time donation</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#1E4D2B]">{item.amount}</p>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="mt-2 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center text-center">
                    <svg
                      className="h-16 w-16 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <p className="mt-4 text-base font-medium text-gray-500">Your cart is empty</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 text-sm font-semibold text-[#1E4D2B] hover:underline"
                    >
                      Continue Browsing
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              {cartItems.length > 0 && (
                <div className="absolute bottom-0 w-full border-t border-gray-100 bg-white px-6 py-6 shadow-inner">
                  <div className="flex justify-between text-base font-bold text-gray-800 mb-4">
                    <span>Total Support Amount</span>
                    <span>
                      {(() => {
                        const total = cartItems.reduce((sum, item) => {
                          const clean = item.amount.replace(/[a-zA-Z]+\.?/g, "").trim();
                          const numericStr = clean.replace(/[^0-9.]/g, "");
                          return sum + (parseFloat(numericStr) || 0);
                        }, 0);
                        return `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
                      })()}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      if (!isUserLoggedIn) {
                        router.push('/signin?redirect=/donate');
                      } else {
                        router.push('/donate');
                      }
                    }}
                    className="w-full rounded-xl bg-[#1E4D2B] py-4 text-center text-sm font-bold text-white shadow-lg hover:bg-[#15381E] transition-all cursor-pointer"
                  >
                    Complete Donation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white dark:bg-[#101412] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-gray-150 dark:border-zinc-800 text-left flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-150 dark:border-zinc-850 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-[#1E4D2B] dark:text-[#52c47c] tracking-tight uppercase">Donors Report</h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Official donations report</p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 rounded-xl text-xs font-black uppercase cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Filter Bar */}
            <div className="mb-4">
              <input
                type="text"
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                placeholder="Search by donor name, city, or email..."
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Table Container */}
            <div className="flex-grow overflow-y-auto pr-1">
              {isReportLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" />
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-850 text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 font-black uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-2">S.No.</th>
                      <th className="py-3 px-2">Donor Name</th>
                      <th className="py-3 px-2">Donor Address / Contact</th>
                      <th className="py-3 px-2 text-right">Donated Amount</th>
                      <th className="py-3 px-2 text-right">Donated For</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-900 text-gray-800 dark:text-zinc-200 text-xs">
                    {reportDonations
                      .filter(d => {
                        const addr = getDonorAddress(d);
                        const matchStr = `${d.name || ''} ${addr} ${d.email || ''}`.toLowerCase();
                        return matchStr.includes(reportSearch.toLowerCase());
                      })
                      .map((d, index) => {
                        const cleanAmt = d.amount ? String(d.amount).replace(/[^\d.]/g, "") : "0";
                        const numericAmt = parseFloat(cleanAmt) || 0;
                        return (
                          <tr key={d.id || index} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30">
                            <td className="py-3.5 px-2 font-mono text-[10px] text-zinc-450">{index + 1}</td>
                            <td className="py-3.5 px-2 font-bold text-gray-900 dark:text-white">{d.name || 'Anonymous Donor'}</td>
                            <td className="py-3.5 px-2 text-zinc-500 dark:text-zinc-400 font-medium">
                              {getDonorAddress(d)}
                              <span className="block text-[9px] text-zinc-400 font-mono mt-0.5">{d.email || d.phone || ''}</span>
                            </td>
                            <td className="py-3.5 px-2 text-right font-black text-emerald-650 dark:text-emerald-500">
                              ₹{numericAmt.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-2 text-right text-zinc-400 text-[10px] max-w-[200px] truncate">
                              {d.donation_for || 'General Support'}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer / Summary Section */}
            <div className="border-t border-gray-150 dark:border-zinc-850 pt-4 mt-6 flex justify-between items-center text-xs">
              <p className="text-zinc-400 text-[10px] font-bold">
                * This document is generated from certified transaction history logs.
              </p>
              <div className="text-right">
                <span className="block text-[9px] text-zinc-450 font-black uppercase tracking-wider">Total Certified Donations</span>
                <p className="text-lg font-black text-[#F3A61E]">
                  ₹{reportDonations.reduce((sum, d) => {
                    const cleanAmt = d.amount ? String(d.amount).replace(/[^\d.]/g, "") : "0";
                    return sum + (parseFloat(cleanAmt) || 0);
                  }, 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
