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
            <h1 className="text-3xl sm:text-4xl font-black text-[#1E4D2B] dark:text-[#52c47c] tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-bold uppercase tracking-wider">
              Last Updated: July 3, 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed text-justify">
            <p>
              At <strong>Kanha Foundation</strong>, accessible from <a href="https://kanhafoundation.org" className="text-[#1E4D2B] dark:text-[#52c47c] font-bold hover:underline">kanhafoundation.org</a>, one of our main priorities is the privacy of our visitors and donors. This Privacy Policy document contains types of information that is collected and recorded by Kanha Foundation and how we use it.
            </p>
            <p>
              If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <span className="font-bold text-zinc-800 dark:text-white">contact@kanhafoundation.org</span>.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              1. Information We Collect
            </h2>
            <p>
              The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Contact Information:</strong> Name, email address, phone number, and city provided during donation checkouts, contact forms, or volunteer applications.</li>
              <li><strong>Financial Details:</strong> Payment receipts or verification records. All payments are securely processed by third-party gateways (e.g. Razorpay, Stripe) and we do not store raw card numbers.</li>
              <li><strong>Volunteer Profiles:</strong> Selected skills, motivation statements, and task schedule details.</li>
            </ul>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              2. How We Use Your Information
            </h2>
            <p>
              We use the information we collect in various ways, including to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide, operate, and maintain our charity contribution systems.</li>
              <li>Improve, personalize, and expand our donation causes, outreach programs, and relief works.</li>
              <li>Understand and analyze how you interact with our website to enhance usability.</li>
              <li>Process your donations, generate tax exemption receipts, and compile administrative reports.</li>
              <li>Communicate with you regarding your application status, volunteer duties, and schedule timings.</li>
              <li>Send newsletters or project update emails (subject to your opt-in approval).</li>
            </ul>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              3. Data Protection Rights (GDPR / Indian DPDP Act)
            </h2>
            <p>
              We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>The right to access:</strong> You have the right to request copies of your personal data collected in our database.</li>
              <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
              <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data under certain conditions.</li>
              <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data.</li>
            </ul>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              4. Third-Party Privacy Policies
            </h2>
            <p>
              Kanha Foundation's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party payment gateways or analytics services for more detailed information.
            </p>

            <h2 className="text-lg font-black text-zinc-900 dark:text-white pt-4 uppercase tracking-wider">
              5. Consent
            </h2>
            <p>
              By using our website, you hereby consent to our Privacy Policy and agree to its terms and conditions.
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
