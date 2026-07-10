"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  {
    id: 1,
    question: "When will I receive updates on my donation?",
    answer: "You will receive real-time updates within 3-5 days after your donation is executed. This includes verified photo and video proofs directly sent to your registered WhatsApp number."
  },
  {
    id: 2,
    question: "How will I receive the pictures and videos?",
    answer: "All pictures and video proofs of the execution will be sent directly to your registered WhatsApp number and email address, ensuring zero delay and absolute transparency."
  },
  {
    id: 3,
    question: "What if I don't receive my pictures or videos on time?",
    answer: "While we make every effort to send proofs within the estimated timeframe, minor delays can occur due to weather or logistics. You can reach out to us on WhatsApp anytime at +91 74881 64529 for an instant status check."
  },
  {
    id: 4,
    question: "Are the pictures and videos personalized?",
    answer: "Yes! For major donations like Birthday or Anniversary celebrations, the banners will feature your name, and children/volunteers will carry customized cards with your wishes."
  },
  {
    id: 5,
    question: "Where will my donation be executed?",
    answer: "Most of our drives are executed in underprivileged local communities, slum schools, and stray animal shelter hubs where help is needed immediately."
  }
];

export default function FAQSection() {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="mx-auto max-w-4xl px-4 pt-20 pb-6 bg-transparent">
      {/* Centered Heading and Subheading matching screenshot */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1E4D2B] dark:text-[#52c47c] sm:text-4xl">
          Frequently asked questions
        </h2>
        <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
          Find answers to common questions about our products and services.
        </p>
      </div>

      {/* Accordion List */}
      <div className="border-t border-gray-200 dark:border-zinc-800 divide-y divide-gray-200 dark:divide-zinc-800">
        {FAQS.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id} className="py-4">
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full flex justify-between items-center text-left py-2 font-bold text-gray-900 dark:text-white hover:text-[#1E4D2B] dark:hover:text-[#52c47c] transition-all cursor-pointer group"
              >
                <span className="text-base sm:text-lg pr-4">{faq.question}</span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#1E4D2B] dark:text-[#52c47c]' : 'text-gray-400'}`}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="py-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
