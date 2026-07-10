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
            <h1 className="text-3xl sm:text-4xl font-black text-[#1E4D2B] dark:text-[#52c47c] tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-2 font-bold uppercase tracking-wider">
              Last Updated: July 3, 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed text-justify">
            <p>
              Welcome to the website of <strong>Kanha Foundation</strong>. By accessing or using our website, services, donation portal, or volunteer portal, you agree to be bound by these Terms of Service. Please read them carefully.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing the website at <a href="https://kanhafoundation.org" className="text-[#1E4D2B] dark:text-[#52c47c] font-bold hover:underline">kanhafoundation.org</a>, you agree to comply with and be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any local laws in Ranchi, Jharkhand, India.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              2. Use License & Scope
            </h2>
            <p>
              Permission is granted to view information on Kanha Foundation's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license, you may not:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Modify or copy the materials, graphics, images, or stories.</li>
              <li>Use the materials for any commercial purpose or public display.</li>
              <li>Attempt to decompile, reverse-engineer, or breach security layers of our dashboard systems.</li>
              <li>Transfer the materials to another person or mirror the materials on any other server.</li>
            </ul>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              3. Donor Responsibilities & UPI Receipts
            </h2>
            <p>
              When checkout transactions are initiated, donors represent that the funds used are their own and obtained through lawful channels. 
            </p>
            <p>
              We reserve the right to audit contributions, check receipts, and reject or refund transactions if they fail to meet our compliance guidelines.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              4. Volunteer Conduct & Assigned Tasks
            </h2>
            <p>
              Volunteers who register and receive dashboard schedules agree to act in good faith and conduct themselves professionally during relief and mentoring campaigns. We reserve the right to terminate volunteer permissions or dashboard access if guidelines are breached.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              5. Limitations & Governing Law
            </h2>
            <p>
              In no event shall Kanha Foundation be liable for any damages arising out of the use or inability to use the materials on our portal. Any claim relating to Kanha Foundation's website shall be governed by the laws of Ranchi Jurisdiction, Jharkhand, India, without regard to conflict of law provisions.
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
