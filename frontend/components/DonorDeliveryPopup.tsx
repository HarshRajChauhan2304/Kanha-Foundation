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
}

export default function DonorDeliveryPopup() {
  const [completedProofs, setCompletedProofs] = useState<CompletedTaskProof[]>([]);
  const [currentProof, setCurrentProof] = useState<CompletedTaskProof | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check for completed volunteer tasks with proof media
    const fetchProofs = async () => {
      try {
        const res = await fetch('/api/volunteer/tasks');
        const data = await res.json();
        if (data.success && Array.isArray(data.tasks)) {
          const proofs = data.tasks.filter((t: any) => t.status === 'Completed' && t.proof_media);
          if (proofs.length > 0) {
            setCompletedProofs(proofs);
            
            // Check if donor hasn't seen this proof popup yet
            const seenIds = JSON.parse(localStorage.getItem('seen_donor_proof_ids') || '[]');
            const unseen = proofs.find((p: any) => !seenIds.includes(p.id));
            if (unseen) {
              setCurrentProof(unseen);
              setIsOpen(true);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching completed donor proofs:", err);
      }
    };

    fetchProofs();
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-zinc-900 border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative overflow-hidden"
        >
          {/* Top banner styling */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 p-2 rounded-full transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Popup Content Header */}
          <div className="text-center space-y-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-950 border border-emerald-700/50 text-emerald-400">
              🎉 Donation Successfully Delivered!
            </span>
            <h3 className="text-xl font-black text-white">
              {currentProof.donor_name ? `Thank You, ${currentProof.donor_name}!` : 'Donation Impact Proof'}
            </h3>
            <p className="text-xs text-zinc-300">
              Aapka donation successfully is beneficiary ke naam aur photo ke saath provide kar diya gaya hai.
            </p>
          </div>

          {/* Beneficiary Photo */}
          {currentProof.proof_media && (
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 mb-4 group max-h-64 flex justify-center items-center">
              <img 
                src={currentProof.proof_media} 
                alt="Beneficiary Delivery Proof" 
                className="w-full h-full object-cover max-h-64 rounded-2xl"
              />
              {currentProof.beneficiary_name && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 text-left">
                  <p className="text-xs text-emerald-400 font-bold">Beneficiary:</p>
                  <p className="text-sm font-extrabold text-white">{currentProof.beneficiary_name}</p>
                </div>
              )}
            </div>
          )}

          {/* Details list */}
          <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80 text-xs space-y-1.5 mb-6">
            {currentProof.cause && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Cause / Item:</span>
                <span className="font-semibold text-zinc-200">{currentProof.cause}</span>
              </div>
            )}
            {currentProof.quantity && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Quantity Provided:</span>
                <span className="font-semibold text-emerald-400">{currentProof.quantity}</span>
              </div>
            )}
            {currentProof.donation_amount && (
              <div className="flex justify-between">
                <span className="text-zinc-400">Donation Amount:</span>
                <span className="font-bold text-emerald-300">{currentProof.donation_amount}</span>
              </div>
            )}
            {currentProof.feedback && (
              <div className="pt-2 border-t border-zinc-800/80">
                <span className="text-zinc-400 block mb-0.5">Volunteer Note:</span>
                <p className="text-zinc-300 italic">"{currentProof.feedback}"</p>
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            onClick={handleClose}
            className="w-full py-3 bg-[#1E4D2B] hover:bg-[#15381E] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer border border-emerald-700/40 active:scale-98"
          >
            Acknowledge & Close
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
