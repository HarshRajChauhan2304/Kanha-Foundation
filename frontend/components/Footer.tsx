"use client";
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import footerJSON from '@/data/footer.json';

export default function Footer() {
  const [footerData, setFooterData] = useState<any>(footerJSON);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/footer')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error && data.companyOverview && data.quickLinks) {
          setFooterData(data);
        }
      })
      .catch(err => console.error('Footer fetch error', err));
  }, []);

  return (
    <footer className="bg-[#0e2617] text-white pt-10 pb-10 sm:pb-12 px-3 sm:px-12 relative z-10 border-t border-emerald-900/30 overflow-visible">
      <div className="mx-auto max-w-7xl">
        
        {/* Main 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          
          {/* Column 1: Company Overview */}
          <div className="space-y-3 md:pl-8 text-left">
            <h3 className="text-[8px] sm:text-[10px] font-black text-[#52c47c] uppercase tracking-widest">
              Company Overview
            </h3>
            <div className="space-y-1.5 text-[9px] sm:text-xs font-bold text-white">
              {(footerData?.companyOverview || []).map((link: any) => (
                <a key={link.href} href={link.href} className="hover:text-emerald-350 block transition-colors">{link.label}</a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3 flex flex-col items-start md:items-center text-left">
            <div className="w-fit text-left">
              <h3 className="text-[8px] sm:text-[10px] font-black text-[#52c47c] uppercase tracking-widest">
                Quick Links
              </h3>
              <div className="space-y-1.5 text-[9px] sm:text-xs font-bold text-white">
                {(footerData?.quickLinks || []).map((link: any) => (
                  <a key={link.href} href={link.href} className="hover:text-emerald-350 block transition-colors">{link.label}</a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Contact Us */}
          <div className="space-y-3 flex flex-col items-start md:items-end text-left">
            <div className="w-fit text-left">
              <div className="space-y-3 text-[9px] sm:text-xs font-bold text-white">
                <h3 className="text-[8px] sm:text-[10px] font-black text-[#52c47c] uppercase tracking-widest">
                  Contact Us
                </h3>
                
                <div className="leading-relaxed">
                  <p className="text-zinc-150 font-medium text-[8px] sm:text-xs">
                    {footerData?.contact?.ctaText || "Need help fast? Fill out our form or email"}
                  </p>
                  <a 
                    href={`mailto:${footerData?.contact?.email || 'support@kanhafoundation.org'}`} 
                    className="text-white hover:underline block font-black mt-0.5 break-all text-[8px] sm:text-xs"
                  >
                    {footerData?.contact?.email || "support@kanhafoundation.org"}
                  </a>
                </div>
              </div>

              {/* Social Icons horizontal row */}
              <div className="flex items-center gap-2 sm:gap-5 pt-1.5">
                {(footerData?.social || []).map((s: any) => {
                  if (s.platform.toLowerCase() === 'instagram') {
                    return (
                      <a key={s.platform} href={s.href} target="_blank" rel="noopener noreferrer" className="text-white hover:text-emerald-350 transition-colors" aria-label="Instagram">
                        <svg className="h-3.5 w-3.5 sm:h-5 sm:w-5 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>
                      </a>
                    );
                  }
                  if (s.platform.toLowerCase() === 'facebook') {
                    return (
                      <a key={s.platform} href={s.href} target="_blank" rel="noopener noreferrer" className="text-white hover:text-emerald-350 transition-colors" aria-label="Facebook">
                        <svg className="h-3.5 w-3.5 sm:h-5 sm:w-5 fill-current" viewBox="0 0 24 24">
                          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                        </svg>
                      </a>
                    );
                  }
                  if (s.platform.toLowerCase() === 'youtube') {
                    return (
                      <a key={s.platform} href={s.href} target="_blank" rel="noopener noreferrer" className="text-white hover:text-emerald-350 transition-colors" aria-label="YouTube">
                        <svg className="h-3.5 w-3.5 sm:h-5 sm:w-5 fill-current" viewBox="0 0 24 24">
                          <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 00.502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 002.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 002.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </a>
                    );
                  }
                  if (s.platform.toLowerCase() === 'linkedin') {
                    return (
                      <a key={s.platform} href={s.href} target="_blank" rel="noopener noreferrer" className="text-white hover:text-emerald-350 transition-colors" aria-label="LinkedIn">
                        <svg className="h-3.5 w-3.5 sm:h-5 sm:w-5 fill-current" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Divider Line */}
        <div className="border-t border-emerald-900/20 my-6" />

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-[8px] sm:text-[10px] font-black text-white/50 tracking-wider md:pl-8 text-center sm:text-left">
          <p className="uppercase">
            Copyright &copy; {new Date().getFullYear()} Kanha Foundation
          </p>
        </div>

      </div>
    </footer>
  );
}
