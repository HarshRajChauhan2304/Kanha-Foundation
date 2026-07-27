"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  id: number;
  category: "donations" | "volunteers" | "execution" | "npo";
  question: string;
  answer: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    id: 1,
    category: "donations",
    question: "Is my donation eligible for 80G Tax Exemption?",
    answer: "Yes! Kanha Foundation is a Section 8 Non-Profit Organization registered under Section 80G of the Income Tax Act, 1961. Donors receive an instant official donation receipt containing the 80G reference details, enabling up to 50% tax exemption on eligible contributions."
  },
  {
    id: 2,
    category: "donations",
    question: "How do I receive my official donation receipt?",
    answer: "As soon as your donation checkout is processed successfully via UPI, Net Banking, or Credit/Debit Card, an official 80G tax receipt is instantly generated and displayed on your screen. You can also view or redownload your complete donation history anytime from your User Profile dashboard."
  },
  {
    id: 3,
    category: "donations",
    question: "What payment methods are supported on Kanha Foundation?",
    answer: "We accept all major secure payment methods including UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking, Debit Cards, and Credit Cards via certified payment gateways (Cashfree / Razorpay) with 256-bit SSL encryption."
  },
  {
    id: 4,
    category: "volunteers",
    question: "How does the Volunteer Internship Program work across states?",
    answer: "Any individual passionate about community welfare across Bihar, Jharkhand, Delhi NCR, Uttar Pradesh, or any part of India can submit a volunteer application on our portal. Once reviewed and approved by the admin team, your internship start date is set as your approval date. You receive access to your personalized Volunteer Dashboard where you can view assigned tasks, schedules, and submit completion proofs."
  },
  {
    id: 5,
    category: "volunteers",
    question: "When and how do I get my Internship Completion Certificate?",
    answer: "On your internship completion date (calculated based on your selected duration of 1, 2, 3, or 6 months), your verified Internship Certificate is automatically issued and made available for high-resolution download on your Volunteer Profile dashboard. The admin team can also issue certificates manually when needed."
  },
  {
    id: 6,
    category: "execution",
    question: "How do I know my donation was actually used for the cause?",
    answer: "Transparency is our highest core value. Every campaign distribution (food meals, study kits, plant saplings, menstrual kits) executed across Bihar, Jharkhand, Delhi NCR, Uttar Pradesh, and other states is documented with real-time field photographs and video proofs. Volunteer completion proofs and campaign updates are published on our platform so donors can verify their impact."
  },
  {
    id: 7,
    category: "execution",
    question: "Can I dedicate a donation for a birthday, anniversary, or in memory of a loved one?",
    answer: "Absolutely! During donation checkout (for contributions of ₹700 or more), you can customize your sponsorship by providing the printed name, delivery date, custom photo, or dedication message. We print your dedicated name on the distribution kit and share distribution photos with you!"
  },
  {
    id: 8,
    category: "npo",
    question: "What is a Section 8 Company under the Indian Companies Act?",
    answer: "A Section 8 Company is a company registered under the Companies Act, 2013 for promoting commerce, art, science, sports, education, research, social welfare, religion, charity, protection of environment or any such other object, where profits are applied solely toward promoting its objects. No dividend is paid to its members."
  },
  {
    id: 9,
    category: "npo",
    question: "Where does Kanha Foundation operate its regional branches and campaigns?",
    answer: "Kanha Foundation is a Section 8 Non-Profit Organization operating multi-state regional branches and welfare drives across Bihar, Jharkhand, Delhi NCR, Uttar Pradesh, and Pan-India. Our verified volunteer network and field coordinators execute community welfare drives across underprivileged settlements in all these operating regions."
  }
];

export default function KnowledgeFAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openAccordionId, setOpenAccordionId] = useState<number | null>(1);

  const filteredFAQs = FAQ_LIST.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-zinc-100 font-sans py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Banner Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="px-3.5 py-1 bg-emerald-950/20 text-[#52c47c] border border-emerald-900/40 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-3">
            Knowledge Base & Frequently Asked Questions
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
            How Can We Help You Today?
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto mt-3 font-medium leading-relaxed">
            Find answers regarding 80G tax benefits, donation receipts, volunteer internship certificates, multi-state field execution proofs, and Section 8 NGO governance.
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-md mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any question (e.g. 80G tax, certificate, receipt)..."
              className="w-full px-5 py-3.5 pl-11 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-md"
            />
            <svg className="h-5 w-5 text-zinc-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
        </motion.div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { key: "all", label: "All Questions" },
            { key: "donations", label: "💳 Donations & 80G Tax" },
            { key: "volunteers", label: "🎓 Volunteer Internships" },
            { key: "execution", label: "📦 Field Proofs & Impact" },
            { key: "npo", label: "🏛️ Section 8 NPO Governance" }
          ].map(cat => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#1E4D2B] text-white border-emerald-700 shadow-md'
                    : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-850 hover:border-zinc-400'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-950 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-850">
              <p className="text-sm font-bold text-zinc-500">No matching questions found for "{searchQuery}".</p>
              <p className="text-xs text-zinc-400 mt-1">Try searching another term or contact our support team below.</p>
            </div>
          ) : (
            filteredFAQs.map((faq) => {
              const isOpen = openAccordionId === faq.id;
              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-850 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  <button
                    onClick={() => setOpenAccordionId(isOpen ? null : faq.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white leading-snug">
                      {faq.question}
                    </span>
                    <span className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-300 ${
                      isOpen ? 'bg-[#1E4D2B] text-white border-emerald-700 rotate-180' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'
                    }`}>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-zinc-900/60 pt-4"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Support Card */}
        <div className="mt-12 bg-gradient-to-r from-emerald-950/40 to-zinc-950 p-8 rounded-3xl border border-emerald-900/40 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-base font-black text-white">Still Have Questions?</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md">
              Our team is available to assist you with donation queries, multi-state volunteer applications, or Section 8 compliance documents.
            </p>
          </div>
          <a
            href="/contact"
            className="px-6 py-3 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap border border-emerald-800/40 shadow-lg"
          >
            Contact Support &rarr;
          </a>
        </div>

      </div>
    </div>
  );
}
