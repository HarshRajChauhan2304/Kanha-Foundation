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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/20 text-[#52c47c] border border-emerald-900/40 rounded-full text-[10px] font-black uppercase tracking-wider mb-3">
              Section 8 Non-Profit Corporation • Financial Governance
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#1E4D2B] dark:text-[#52c47c] tracking-tight">
              Return & Refund Policy
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-bold uppercase tracking-wider">
              Last Updated: July 2026 • Kanha Foundation Financial Guidelines
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed text-justify">
            <p>
              At <strong>Kanha Foundation</strong>, operating across <strong>Bihar, Jharkhand, Delhi NCR, Uttar Pradesh, and Pan-India</strong>, we are deeply grateful for your generous contributions supporting our relief campaigns, education kit distributions, menstrual hygiene drives, animal welfare, and tree plantations.
            </p>
            <p>
              Since Kanha Foundation is a Section 8 Non-Profit Organization and contributions are immediately allocated to active field operations and resource procurement, we maintain a transparent and structured Refund & Cancellation Policy.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              1. Voluntary Donations are Non-Refundable
            </h2>
            <p>
              Under Indian non-profit financial governance rules, all online contributions and sponsorships made via <a href="https://kanhafoundation.org" className="text-[#1E4D2B] dark:text-[#52c47c] font-bold hover:underline">kanhafoundation.org</a> are considered final and non-refundable once processed. 
            </p>
            <p>
              Upon successful payment completion, funds are committed directly to ground distribution kits, logistics, and beneficiary outreach programs, making recalled fund processing infeasible.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              2. Exceptional Refund Eligibility (Duplicate or Unauthorized Charges)
            </h2>
            <p>
              We recognize that technical or payment gateway anomalies may occur. Kanha Foundation will evaluate refund claims strictly under the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Duplicate Transaction Glitch:</strong> If a donor is accidentally double-billed due to a network error during checkout processing.</li>
              <li><strong>Unauthorized Payment Activity:</strong> If banking credentials or cards were compromised fraudulently.</li>
            </ul>
            <p>
              To file a claim for a duplicate payment, donors must send an email to <span className="font-bold text-zinc-800 dark:text-white">kanhafoundation223@gmail.com</span> within <span className="font-black text-[#F3A61E]">7 calendar days</span> of the transaction date. The email must include the Payment Reference ID, bank statement snippet proof, and transaction amount details.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              3. Processing Timelines & Original Payment Source Return
            </h2>
            <p>
              All refund requests are reviewed by our finance committee. Once approved:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The refund amount will be credited back exclusively to the original payment source (bank account, credit card, or UPI wallet).</li>
              <li>Processing timelines generally take <span className="font-black text-[#1E4D2B] dark:text-[#52c47c]">5 to 10 working days</span> depending on banking partner clearance cycles.</li>
            </ul>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              4. 80G Tax Receipt Nullification Notice
            </h2>
            <p>
              If a refund is successfully issued for any transaction, the corresponding official tax exemption certificate generated under <strong>Section 80G of the Income Tax Act, 1961</strong> becomes null and void. Donors cannot submit cancelled receipt IDs for income tax exemption claims.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              5. Contact Support
            </h2>
            <p>
              For refund status inquiries or payment assistance across any branch, contact our finance team:
            </p>
            <div className="bg-zinc-100 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
              <p className="font-bold text-zinc-900 dark:text-white">Kanha Foundation (Finance Section)</p>
              <p className="text-zinc-500 dark:text-zinc-400">Multi-State Operations: Bihar • Jharkhand • Delhi NCR • Uttar Pradesh • Pan-India</p>
              <p className="text-zinc-500 dark:text-zinc-400">Email: <span className="font-bold text-emerald-600 dark:text-emerald-400">kanhafoundation223@gmail.com</span></p>
            </div>
          </div>

          {/* Footer Back Link */}
          <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-center">
            <a 
              href="/" 
              className="px-6 py-2.5 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
            >
              Back to Home
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
