"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
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
              Section 8 NPO • Government of India MCA & NITI Aayog Regulated
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#1E4D2B] dark:text-[#52c47c] tracking-tight">
              Privacy Notice & Data Governance Policy
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-bold uppercase tracking-wider">
              Last Updated: July 2026 • Government of India Statutory Compliances
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed text-justify">
            <p>
              At <strong>Kanha Foundation</strong> (<a href="https://kanhafoundation.org" className="text-[#1E4D2B] dark:text-[#52c47c] font-bold hover:underline">kanhafoundation.org</a>), we strictly comply with all statutory regulations prescribed by the <strong>Central Government of India</strong> for Non-Governmental Organizations (NGOs). As a non-profit incorporated under <strong>Section 8 of the Companies Act, 2013 (Ministry of Corporate Affairs, Govt. of India)</strong>, registered on <strong>NITI Aayog (NGO Darpan)</strong>, and operating across Bihar, Jharkhand, Delhi NCR, Uttar Pradesh, and Pan-India, we uphold the highest standards of data safety.
            </p>
            <p>
              Our data processing protocols comply with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> enacted by the Parliament of India, ensuring donor and volunteer data confidentiality across all operational branches.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              1. Information We Collect Under Central Norms
            </h2>
            <p>
              In compliance with Central Board of Direct Taxes (CBDT) and MCA regulations, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Donor Verification Details:</strong> Full name, mobile number, email address, postal address, state, and Permanent Account Number (PAN) mandatory for issuing 80G tax exemption certificates under the Income Tax Act, 1961.</li>
              <li><strong>Sponsorship Customization Data:</strong> Dedication notes, custom photos, or celebration messages provided for field distribution printed tags.</li>
              <li><strong>Volunteer Identity Records:</strong> Skills, educational qualifications, Aadhaar identification numbers, motivation statements, and assigned schedule task logs.</li>
              <li><strong>Technical Session Metadata:</strong> IP address, browser type, device identifiers, and session timestamps collected to ensure secure checkouts and prevent transaction fraud.</li>
            </ul>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              2. Purpose of Processing & Central Statutory Reporting
            </h2>
            <p>
              All personal data processed by Kanha Foundation is utilized strictly for non-commercial, charitable purpose execution:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Generating official 80G Tax Exemption Certificates and Form 10BD filings with the Income Tax Department (Govt. of India).</li>
              <li>Executing ground campaign distributions (food packets, study kits, plant saplings, menstrual packs) across multi-state field locations.</li>
              <li>Communicating campaign delivery proof photos and video updates to donors.</li>
              <li>Coordinating volunteer onboarding, schedule assignments, and issuing verified Internship Completion Certificates.</li>
              <li>Submitting statutory audit filings required by the Ministry of Corporate Affairs (MCA), NITI Aayog Darpan, and Income Tax Department.</li>
            </ul>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              3. Payment Gateway Security & Non-Storage of Card Data
            </h2>
            <p>
              Online contributions are processed through certified PCI-DSS compliant third-party payment gateway aggregators (Razorpay, Cashfree, UPI BHIM/Google Pay/PhonePe). Kanha Foundation <strong>does not store raw credit/debit card numbers or bank passwords</strong> on any server.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              4. Rights Under Indian DPDP Act 2023
            </h2>
            <p>
              In accordance with Central Government data protection regulations, users retain the following statutory rights:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Right to Access & Summary:</strong> Donors can request copies of all past donation transactions and tax receipts.</li>
              <li><strong>Right to Correction & Update:</strong> Users can update inaccurate contact details or profile info anytime via their User Profile dashboard.</li>
              <li><strong>Right to Erasure:</strong> Donors can request account deletion (except records required to be retained under Income Tax Act 80G statutory audit rules).</li>
              <li><strong>Right to Withdraw Marketing Consent:</strong> Users can opt out of promotional update emails or newsletters at any time.</li>
            </ul>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              5. Non-Disclosure & Third-Party Sharing
            </h2>
            <p>
              Kanha Foundation <strong>never sells, rents, or commercializes donor databases</strong> to commercial third parties. Data is shared exclusively with certified payment processors or government regulatory authorities when mandatorily required under Indian law.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              6. Data Grievance Officer & Central Contact Details
            </h2>
            <p>
              For data access requests, privacy concerns, or 80G receipt queries across any of our branches, please contact our Data Protection Officer:
            </p>
            <div className="bg-zinc-100 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
              <p className="font-bold text-zinc-900 dark:text-white">Kanha Foundation (Section 8 NPO • Govt. of India Regulated)</p>
              <p className="text-zinc-500 dark:text-zinc-400">Head Office: G 96, Block G, Gamma 2, Greater Noida, U.P., India</p>
              <p className="text-zinc-500 dark:text-zinc-400">Multi-State Branches: Bihar • Jharkhand • Delhi NCR • Uttar Pradesh • Pan-India</p>
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
