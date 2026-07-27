"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function DisclaimerPage() {
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
              Section 8 Non-Profit Organization (NPO) • Companies Act, 2013
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#1E4D2B] dark:text-[#52c47c] tracking-tight">
              Legal Disclaimer
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-bold uppercase tracking-wider">
              Last Updated: July 2026 • Kanha Foundation Multi-State Legal Disclosures
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed text-justify">
            <p>
              The information provided on <strong>Kanha Foundation</strong> website (<a href="https://kanhafoundation.org" className="text-[#1E4D2B] dark:text-[#52c47c] font-bold hover:underline">kanhafoundation.org</a>) and associated digital portals is for general informational and charitable contribution purposes only.
            </p>
            <p>
              Kanha Foundation is incorporated as a <strong>Section 8 Non-Profit Company under the Indian Companies Act, 2013</strong>, operating multi-state regional branches and welfare networks across <strong>Bihar, Jharkhand, Delhi NCR, Uttar Pradesh, and Pan-India</strong>. All funds raised through our platform are strictly deployed toward approved public welfare, food relief, educational support, animal care, menstrual hygiene, and environmental conservation projects.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              1. Non-Commercial & No Financial Warranty
            </h2>
            <p>
              All materials, images, impact reports, and story summaries on this platform are provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. Kanha Foundation makes no representations or warranties regarding the absolute error-free nature or uninterrupted availability of server portals.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              2. 80G Tax Exemption & Financial Advice Disclaimer
            </h2>
            <p>
              Donations made to Kanha Foundation may qualify for tax deduction under <strong>Section 80G of the Income Tax Act, 1961</strong> (subject to applicable limits and tax regulations). However, nothing on this website constitutes professional accounting, tax, or legal advice. Donors are encouraged to consult their personal tax advisor or chartered accountant to ascertain individual tax savings applicability under the Income Tax Act.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              3. Multi-State Field Delivery & Operational Flexibility
            </h2>
            <p>
              While Kanha Foundation makes every effort to execute relief distributions (e.g. food packets, study kits, plant saplings) in exact accordance with listed campaign details across Bihar, Jharkhand, Delhi NCR, and Uttar Pradesh, unexpected field conditions—such as severe weather, emergency administrative curfews, or local supply availability—may require minor operational adaptations. In all such cases, resources are redirected to serve beneficiary groups of equivalent need in neighboring regional areas.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              4. Beneficiary Photographs & Privacy Respect
            </h2>
            <p>
              Photographs, videos, and impact stories featuring campaign beneficiaries are published with consent and solely for transparency and reporting purposes. Copying, downloading, or redistributing beneficiary media for commercial, unauthorized, or defamatory purposes is strictly prohibited under Indian copyright and privacy laws.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              5. Third-Party Links & Payment Gateways
            </h2>
            <p>
              Our website integrates certified third-party payment gateways (e.g. Razorpay, Cashfree, UPI provider SDKs) for secure contribution processing. Kanha Foundation does not exercise direct control over third-party external networks and shall not be held liable for external network downtime or bank server delays during transaction processing.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              6. Contact & Regional Legal Enquiries
            </h2>
            <p>
              For legal inquiries, corporate compliance documentation, or verification of Section 8 registration details across any state branch, please reach out to our legal officer at:
            </p>
            <div className="bg-zinc-100 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
              <p className="font-bold text-zinc-900 dark:text-white">Kanha Foundation (Section 8 Company)</p>
              <p className="text-zinc-500 dark:text-zinc-400">Branches & Operations: Bihar • Jharkhand • Delhi NCR • Uttar Pradesh • Pan-India</p>
              <p className="text-zinc-500 dark:text-zinc-400">Email: <span className="font-bold text-emerald-600 dark:text-emerald-400">contact@kanhafoundation.org</span></p>
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
