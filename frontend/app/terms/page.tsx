"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function TermsOfService() {
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
              Section 8 NPO • Government of India MCA & Statutory Regulated
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#1E4D2B] dark:text-[#52c47c] tracking-tight">
              Terms & Conditions of Service
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-bold uppercase tracking-wider">
              Last Updated: July 2026 • Government of India Legal Framework
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed text-justify">
            <p>
              Welcome to <strong>Kanha Foundation</strong> (<a href="https://kanhafoundation.org" className="text-[#1E4D2B] dark:text-[#52c47c] font-bold hover:underline">kanhafoundation.org</a>). By accessing or using our website, donation portal, volunteer dashboard, or relief contribution services, you agree to be bound by these Terms & Conditions of Service. Please read them carefully.
            </p>
            <p>
              Kanha Foundation is a non-profit company incorporated under <strong>Section 8 of the Companies Act, 2013 enacted by the Parliament of India (Ministry of Corporate Affairs, Govt. of India)</strong>, registered on <strong>NITI Aayog (NGO Darpan)</strong>, and operating multi-state regional branches across <strong>Bihar, Jharkhand, Delhi NCR, Uttar Pradesh, and Pan-India</strong>.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              1. Central Statutory Non-Profit Governance
            </h2>
            <p>
              In accordance with Section 8 of the Companies Act 2013 rules prescribed by the Central Government of India:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>All donations, volunteer initiatives, and relief drives are conducted exclusively for non-profit charitable welfare objects.</li>
              <li>No income, profits, surplus, or assets are paid or transferred as dividends or returns to directors, members, or promoters.</li>
              <li>All statutory filings and annual financial returns are mandatorily submitted to the Registrar of Companies (RoC) and Ministry of Corporate Affairs (MCA).</li>
            </ul>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              2. Voluntary Donations & 80G / 12A Tax Exemptions
            </h2>
            <p>
              By initiating a donation checkout on our portal, donors represent and confirm that:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>All funds contributed are derived from lawful personal or corporate income sources complying with Indian Anti-Money Laundering and Tax laws.</li>
              <li>Contributions are made voluntarily to support selected causes (e.g. food relief, education kits, menstrual hygiene, tree plantation, animal care).</li>
              <li>Official tax exemption receipts generated under <strong>Section 80G of the Income Tax Act, 1961 (Central Board of Direct Taxes, Govt. of India)</strong> are issued in the name provided during checkout.</li>
              <li>Donations once allocated to field relief distribution drives are non-refundable, except under specific transaction duplicate errors outlined in our Refund Policy.</li>
            </ul>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              3. Multi-State Volunteer Program & Internship Certificates
            </h2>
            <p>
              Volunteers registering from Bihar, Jharkhand, Delhi NCR, Uttar Pradesh, or any state in India agree to adhere to the highest standards of integrity:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Onboarding internship start date is recorded as the day of application approval by the admin team.</li>
              <li>Volunteers agree to complete assigned tasks (e.g. field support, media creation, community outreach) diligently.</li>
              <li>Official Internship Completion Certificates are issued automatically upon reaching the scheduled completion end date, provided task compliance is maintained.</li>
              <li>Kanha Foundation reserves the right to terminate volunteer dashboard access in case of code of conduct violations or fraudulent activity.</li>
            </ul>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              4. Intellectual Property & Portal Use
            </h2>
            <p>
              All logo graphics, design layouts, campaign media, and field impact photographs are the exclusive intellectual property of Kanha Foundation. Users may view, share, or download content for personal, non-commercial awareness creation only.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              5. Governing Law & Central Jurisdiction of India
            </h2>
            <p>
              These Terms & Conditions shall be governed by and construed in accordance with the Central Laws of the Republic of India. Any legal dispute or proceeding arising out of or related to Kanha Foundation's portal, branches, or operations shall be subject to the exclusive jurisdiction of the competent <strong>High Courts & Supreme Court of India</strong>.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              6. Contact & Secretarial Office
            </h2>
            <p>
              For legal or statutory inquiries across any of our operating states, contact our central secretarial team:
            </p>
            <div className="bg-zinc-100 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
              <p className="font-bold text-zinc-900 dark:text-white">Kanha Foundation (Section 8 NPO • Govt. of India Regulated)</p>
              <p className="text-zinc-500 dark:text-zinc-400">Head Office: G 96, Block G, Gamma 2, Greater Noida, U.P., India</p>
              <p className="text-zinc-500 dark:text-zinc-400">Branches & Operations: Bihar • Jharkhand • Delhi NCR • Uttar Pradesh • Pan-India</p>
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
