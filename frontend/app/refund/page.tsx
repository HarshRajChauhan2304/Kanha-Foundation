"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-zinc-100 font-sans py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 p-8 sm:p-12 rounded-[2.5rem] shadow-xl"
        >
          {/* Header */}
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-8 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-black text-[#1E4D2B] dark:text-[#52c47c] tracking-tight">
              Refund & Cancellation Policy
            </h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-2 font-bold uppercase tracking-wider">
              Last Updated: July 3, 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed text-justify">
            <p>
              At <strong>Kanha Foundation</strong>, Ranchi, Jharkhand, we are incredibly grateful for your generous contributions and support toward our relief works, education campaign drives, animal welfare, and eco-initiatives.
            </p>
            <p>
              Since Kanha Foundation is a non-profit charity organization and funds are immediately allocated to public service operations and relief resource distribution, we have instituted a transparent and fair Refund Policy as detailed below.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              1. Donations are Voluntary and Non-Refundable
            </h2>
            <p>
              Generally, all online contributions and sponsorships made via <a href="https://kanhafoundation.org" className="text-[#1E4D2B] dark:text-[#52c47c] font-bold hover:underline">kanhafoundation.org</a> are considered final and non-refundable. 
            </p>
            <p>
              Once a payment has been processed and a confirmation receipt has been sent, those funds are earmarked directly for active field projects (e.g. food distribution drives or tree plantations) and cannot be recalled.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              2. Exceptional Circumstances for Refund Requests
            </h2>
            <p>
              We understand that administrative errors can occur during payment transfers. We will review refund requests under the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Technical / Transaction Failures:</strong> If a donor experiences a network glitch and their credit card / UPI account is charged multiple times in error for a single contribution checkout.</li>
              <li><strong>Unauthorized Activity:</strong> If card details or accounts were used fraudulently without the owner's authorization.</li>
            </ul>
            <p>
              Refund requests for double-charging or transaction duplicates must be submitted via email to <span className="font-bold text-zinc-800 dark:text-white">contact@kanhafoundation.org</span> within <span className="font-black text-[#F3A61E]">7 calendar days</span> of the payment date, containing the Transaction ID, payment reference receipt, and banking statement proof.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              3. Processing of Refund Requests
            </h2>
            <p>
              All validated refund requests are evaluated by our administrative board. If approved, the refund will be credited back via the original payment source channel (bank card, net banking, or UPI wallet).
            </p>
            <p>
              Please note that transaction processing times are subject to standard payment gateway clearance timelines and may take <span className="font-black text-[#1E4D2B] dark:text-[#52c47c]">5 to 10 working days</span> to reflect in your account.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              4. Tax Exemption Receipts
            </h2>
            <p>
              If a refund request is successfully processed, any tax exemption receipt (Section 80G certificate) generated for the original transaction stands nullified and cancelled. Donors are advised not to submit cancelled contribution receipts for tax deduction benefits.
            </p>
          </div>

          {/* Footer Back Link */}
          <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-center">
            <a 
              href="/" 
              className="px-6 py-2.5 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Back to Home
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
