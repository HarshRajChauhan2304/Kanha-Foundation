'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompletedTaskProof {
  id: number;
  task_title: string;
  task_description?: string;
  proof_media?: string;
  beneficiary_name?: string;
  feedback?: string;
  donor_name?: string;
  donor_email?: string;
  cause?: string;
  quantity?: string;
  donation_amount?: string;
  assigned_money?: number;
  admin_verified?: boolean;
}

const isVideo = (url: string) => {
  if (!url) return false;
  const clean = url.toLowerCase();
  return clean.includes('.mp4') || clean.includes('.mov') || clean.includes('.webm') || clean.includes('.m4v') || clean.includes('video/') || clean.startsWith('data:video');
};

export default function DonorDeliveryPopup() {
  const [currentProof, setCurrentProof] = useState<CompletedTaskProof | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  useEffect(() => {
    // Check for verified completed volunteer tasks with proof media
    const fetchProofs = async () => {
      try {
        const res = await fetch('/api/volunteer/tasks');
        const data = await res.json();
        if (data.success && Array.isArray(data.tasks)) {
          const proofs = data.tasks.filter((t: any) => t.status === 'Completed' && t.proof_media && t.admin_verified);
          if (proofs.length > 0) {
            const seenIds = JSON.parse(localStorage.getItem('seen_donor_proof_ids') || '[]');
            const unseen = proofs.find((p: any) => !seenIds.includes(p.id));
            if (unseen) {
              setCurrentProof(unseen);
              setActiveMediaIndex(0);
              setIsOpen(true);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching completed donor proofs:", err);
      }
    };

    fetchProofs();

    const handleCustomOpen = (e: CustomEvent) => {
      if (e.detail) {
        setCurrentProof(e.detail);
        setActiveMediaIndex(0);
        setIsOpen(true);
      }
    };
    window.addEventListener("open_donor_proof" as any, handleCustomOpen as any);
    return () => {
      window.removeEventListener("open_donor_proof" as any, handleCustomOpen as any);
    };
  }, []);

  const handleClose = () => {
    if (currentProof) {
      const seenIds = JSON.parse(localStorage.getItem('seen_donor_proof_ids') || '[]');
      if (!seenIds.includes(currentProof.id)) {
        seenIds.push(currentProof.id);
        localStorage.setItem('seen_donor_proof_ids', JSON.stringify(seenIds));
      }
    }
    setIsOpen(false);
  };

  if (!isOpen || !currentProof) return null;

  const causeName = currentProof.cause || currentProof.task_title || "Relief Drive";
  const donorDisplayName = currentProof.donor_name || "Valued Supporter";
  const beneficiaryDisplayName = currentProof.beneficiary_name || "Underprivileged Beneficiary";

  const rawMedia = currentProof.proof_media ? currentProof.proof_media.split(',').map(s => s.trim()).filter(Boolean) : [];
  const mediaUrls = rawMedia.length > 0 ? rawMedia : ["https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80"];

  const currentMediaUrl = mediaUrls[activeMediaIndex] || mediaUrls[0];
  const isCurrentVideo = isVideo(currentMediaUrl);

  const videoCount = mediaUrls.filter(u => isVideo(u)).length;
  const photoCount = mediaUrls.length - videoCount;

  const shareText = `❤️ I sponsored a life with Kanha Foundation!\n\n` +
    `✨ Beneficiary: ${beneficiaryDisplayName}\n` +
    `🙏 Cause: ${causeName}\n` +
    `📍 Real-time transparent distribution completed.\n\n` +
    `Join the movement: https://kanhafoundation.org\n#KanhaFoundation #TransparentGiving #Section8NGO`;

  const handleCopyShareText = () => {
    navigator.clipboard.writeText(shareText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://kanhafoundation.org')}&quote=${encodeURIComponent(shareText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-zinc-950 border border-emerald-500/50 rounded-[2.5rem] max-w-lg w-full p-6 sm:p-8 text-white shadow-2xl relative my-8"
        >
          {/* Top glowing radial */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button 
            onClick={handleClose}
            className="absolute top-5 right-5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 p-2 rounded-full transition-all cursor-pointer border border-zinc-800 z-20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header Badge */}
          <div className="text-center space-y-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-950 border border-emerald-500/40 text-emerald-400 shadow-sm">
              🎉 Donation Successfully Distributed!
            </span>
            <h3 className="text-2xl font-black text-white tracking-tight">
              Thank You, {donorDisplayName}!
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Your contribution was distributed to the beneficiary on ground with full proof.
            </p>
          </div>

          {/* Beneficiary Social Media Frame Card */}
          <div className="bg-gradient-to-b from-zinc-900 to-black border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl relative mb-6">
            
            {/* Card Watermark Header */}
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800/80 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center font-black text-[10px] text-emerald-400">
                  KH
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  Kanha Foundation • On-Ground Proof
                </span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 text-[9px] font-bold rounded-full">
                {mediaUrls.length > 1 ? `${mediaUrls.length} Proof Files` : "Verified On-Ground"}
              </span>
            </div>

            {/* Beneficiary Media Box (Main Viewer) */}
            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-zinc-950 mb-3 h-64 flex justify-center items-center shadow-lg group">
              {isCurrentVideo ? (
                <video 
                  key={currentMediaUrl}
                  src={currentMediaUrl} 
                  controls 
                  autoPlay 
                  loop
                  className="w-full h-full object-contain bg-black rounded-2xl" 
                />
              ) : (
                <img 
                  key={currentMediaUrl}
                  src={currentMediaUrl} 
                  alt="Beneficiary Delivery Proof" 
                  className="w-full h-full object-cover max-h-64 rounded-2xl"
                />
              )}

              {/* Prev / Next Arrows if multiple media */}
              {mediaUrls.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveMediaIndex(prev => (prev === 0 ? mediaUrls.length - 1 : prev - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white p-2 rounded-full border border-white/20 transition-all cursor-pointer z-10 text-sm font-bold"
                    aria-label="Previous Media"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setActiveMediaIndex(prev => (prev === mediaUrls.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white p-2 rounded-full border border-white/20 transition-all cursor-pointer z-10 text-sm font-bold"
                    aria-label="Next Media"
                  >
                    ›
                  </button>
                </>
              )}

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/60 to-transparent p-3.5 text-left pointer-events-none">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 inline-block mb-1">
                  Beneficiary
                </span>
                <p className="text-base font-black text-white tracking-wide">{beneficiaryDisplayName}</p>
              </div>
            </div>

            {/* Thumbnail Carousel Bar for Multiple Photos/Videos */}
            {mediaUrls.length > 1 && (
              <div className="mb-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold px-1">
                  <span>📸 {photoCount} Photos {videoCount > 0 ? `• 🎬 ${videoCount} Videos` : ''}</span>
                  <span className="text-emerald-400 font-black">{activeMediaIndex + 1} / {mediaUrls.length}</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                  {mediaUrls.map((url, idx) => {
                    const isVid = isVideo(url);
                    const isActive = idx === activeMediaIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveMediaIndex(idx)}
                        className={`relative h-14 w-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${isActive ? 'border-emerald-400 ring-2 ring-emerald-500/40 scale-105' : 'border-zinc-800 opacity-60 hover:opacity-100'}`}
                      >
                        {isVid ? (
                          <div className="w-full h-full bg-zinc-900 flex items-center justify-center relative">
                            <video src={url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">▶</span>
                            </div>
                          </div>
                        ) : (
                          <img src={url} alt={`Proof thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                        )}
                        <span className="absolute bottom-0.5 right-0.5 bg-black/80 px-1 py-0.2 text-[8px] text-white font-bold rounded">
                          {isVid ? 'VIDEO' : 'PIC'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Impact Details inside frame */}
            <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800/80 text-xs space-y-1.5 text-left">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-semibold">Cause:</span>
                <span className="font-extrabold text-emerald-300">{causeName}</span>
              </div>
              {currentProof.quantity && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-semibold">Items Distributed:</span>
                  <span className="font-extrabold text-amber-400">{currentProof.quantity}</span>
                </div>
              )}
              {currentProof.donation_amount && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-semibold">Donation Value:</span>
                  <span className="font-black text-white">{currentProof.donation_amount}</span>
                </div>
              )}
              {currentProof.feedback && (
                <div className="pt-2 border-t border-zinc-800/80 mt-1">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">Volunteer Field Report:</span>
                  <p className="text-zinc-300 italic text-[11px]">"{currentProof.feedback}"</p>
                </div>
              )}
            </div>

          </div>

          {/* Social Media Share Actions */}
          <div className="space-y-3 mb-6">
            <p className="text-[11px] font-black uppercase tracking-wider text-emerald-400 text-center">
              📲 Share Donation Successfully Proof on Social Media
            </p>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <span>WhatsApp</span>
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <span>Facebook</span>
              </a>
              <a
                href={twitterUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <span>Twitter / X</span>
              </a>
            </div>

            <button
              onClick={handleCopyShareText}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{copySuccess ? "✓ Impact Frame Text Copied!" : "📋 Copy Impact Message for Instagram Story"}</span>
            </button>
          </div>

          {/* Close Action button */}
          <button
            onClick={handleClose}
            className="w-full py-3 bg-[#1E4D2B] hover:bg-[#15381E] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg cursor-pointer border border-emerald-700/40 active:scale-98"
          >
            Close & Back to Site
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
