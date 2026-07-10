"use client";
import React, { useState, useEffect } from 'react';
import contactInfoFallback from '@/data/contact_info.json';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactCards, setContactCards] = useState<any[]>(contactInfoFallback);

  useEffect(() => {
    fetch('/api/contact-info')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setContactCards(data);
        }
      })
      .catch(err => console.error("Error loading contact info cards:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => {
          setSubmitted(false);
        }, 4500);
      } else {
        setErrorMsg(data.error || "Failed to submit message. Please try again.");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMsg("Failed to connect to the server. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#07100b] font-sans py-16 px-4 md:px-8">
      <div className="mx-auto max-w-6xl">
        
        {/* Header Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#1E4D2B] dark:text-[#52c47c] flex justify-center items-center gap-3">
            <span>Contact</span>
            <span className="bg-[#F3A61E] rounded-3xl px-6 py-1.5 text-black text-3xl sm:text-4xl md:text-5xl font-black shadow-lg">
              Us
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium">
            Have questions, feedback, or want to support? Connect with our dedicated support team.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-12 items-stretch mb-12">
          
          {/* Left Column: Contact details (Col 5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {contactCards.map((card) => {
              const renderCardIcon = (iconName: string) => {
                switch (iconName) {
                  case "map-pin":
                    return (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    );
                  case "mail":
                    return (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    );
                  case "whatsapp":
                    return (
                      <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.208-3.79c1.666.988 3.32 1.48 4.95 1.483 5.405 0 9.802-4.398 9.805-9.805.002-2.618-1.015-5.082-2.87-6.937C16.29 3.097 13.824 2.08 11.205 2.08c-5.412 0-9.803 4.398-9.806 9.806-.001 1.77.478 3.5 1.388 5.008L1.75 22.25l5.515-1.44z"/>
                      </svg>
                    );
                  case "phone":
                  default:
                    return (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    );
                }
              };

              const renderValue = (type: string, value: string) => {
                if (type === "email") {
                  return (
                    <a href={`mailto:${value}`} className="mt-2 text-sm text-[#1E4D2B] dark:text-[#52c47c] font-black hover:underline cursor-pointer block">
                      {value}
                    </a>
                  );
                } else if (type === "whatsapp") {
                  const cleanPhone = value.replace(/[^\d]/g, '');
                  return (
                    <a 
                      href={`https://wa.me/${cleanPhone}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="mt-2 text-sm text-[#1E4D2B] dark:text-[#52c47c] font-black hover:underline cursor-pointer block"
                    >
                      {value}
                    </a>
                  );
                } else if (type === "phone") {
                  return (
                    <a href={`tel:${value}`} className="mt-2 text-sm text-[#1E4D2B] dark:text-[#52c47c] font-black hover:underline cursor-pointer block">
                      {value}
                    </a>
                  );
                }
                return (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-bold whitespace-pre-line">
                    {value}
                  </p>
                );
              };

              return (
                <div key={card.id} className="bg-white dark:bg-[#101412] p-8 rounded-[2rem] border border-gray-150/45 dark:border-zinc-800/80 shadow-sm flex items-start gap-4 text-left">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-[#1E4D2B] dark:text-[#52c47c] shadow-inner flex-shrink-0">
                    {renderCardIcon(card.icon)}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">{card.title}</h3>
                    {renderValue(card.type, card.value)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Contact message form (Col 7) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#101412] p-8 sm:p-10 rounded-[2.5rem] border border-gray-150/45 dark:border-zinc-800/80 shadow-sm text-left">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-50 dark:border-zinc-800/80 pb-3">
              Send Us a Message
            </h2>

            {submitted ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-6 rounded-2xl text-sm font-bold text-[#1E4D2B] dark:text-[#52c47c] text-center my-8">
                Thank you! Your message has been sent successfully. Our team will get back to you shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Vikram Singh"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Message Description</label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message details here..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B] resize-none"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-200 dark:border-red-900/30">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#1E4D2B] hover:bg-[#15381E] text-white font-extrabold text-sm rounded-xl transition-all duration-300 shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Sending Message..." : "Send Message"}
                </button>
              </form>
            )}

          </div>

        </div>

        {/* Map Section */}
        <div className="rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-150/45 dark:border-zinc-800/80 aspect-[21/9] min-h-[300px]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14652.887260533555!2d85.30956209587422!3d23.344099499999997!2m3!1f0!2f0!3f0!4f13.1!3m3!1m2!1s0x39f4e104aa5db7dd%3A0xdc09d43168d6f51!2sRanchi%2C%20Jharkhand!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            className="border-0 w-full h-full"
            loading="lazy"
            allowFullScreen={false}
          />
        </div>

      </div>
    </div>
  );
}
