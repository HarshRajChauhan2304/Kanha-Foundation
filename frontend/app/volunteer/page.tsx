"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VolunteerRegistrationPage() {
  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [motivation, setMotivation] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [gender, setGender] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [aadharNumber, setAadharNumber] = useState("");
  const [aadharPhoto, setAadharPhoto] = useState("");
  const [isAadharUploading, setIsAadharUploading] = useState(false);
  const [internshipDuration, setInternshipDuration] = useState("1 Month");

  // Flow states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const SKILLS_OPTIONS = [
    "Food Distribution & Relief Work",
    "Children Education & Mentoring",
    "Animal Welfare & Rescue support",
    "Tree Plantation & Nature Drives",
    "Social Media & Graphic Design"
  ];

  const handleCheckboxChange = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim() || !email.trim() || !phone.trim() || !city.trim() || !password.trim()) {
      setErrorMsg("Please fill in all required profile information fields including password.");
      return;
    }

    if (!profilePhoto) {
      setErrorMsg("Please upload your profile photo.");
      return;
    }

    if (!gender) {
      setErrorMsg("Please select your gender.");
      return;
    }

    if (!aadharNumber.trim() || aadharNumber.length !== 12) {
      setErrorMsg("Please enter a valid 12-digit Aadhaar Card number.");
      return;
    }

    if (!aadharPhoto) {
      setErrorMsg("Please upload your Aadhaar Card document.");
      return;
    }

    if (!termsAccepted) {
      setErrorMsg("You must read and agree to the Terms and Conditions to submit.");
      return;
    }

    if (selectedSkills.length === 0) {
      setErrorMsg("Please select at least one area of interest or skill.");
      return;
    }

    setIsSubmitting(true);

    fetch('/api/volunteer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fullName,
        email,
        phone,
        city,
        motivation,
        skills: selectedSkills,
        password,
        profile_photo: profilePhoto,
        gender,
        terms_accepted: termsAccepted,
        aadhar_number: aadharNumber,
        aadhar_upload_url: aadharPhoto,
        internship_duration: internshipDuration
      })
    })
      .then(res => res.json())
      .then(data => {
        setIsSubmitting(false);
        if (data.success) {
          setIsSuccess(true);
        } else {
          setErrorMsg(data.error || "Failed to submit application.");
        }
      })
      .catch(err => {
        setIsSubmitting(false);
        setErrorMsg("Network error. Please try again later.");
      });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#07100b] flex items-center justify-center font-sans px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#101412] p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-zinc-800 text-center"
        >
          {/* Close/Cross Button */}
          <button 
            onClick={() => window.location.href = "/"}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer p-1.5 rounded-full hover:bg-gray-105 dark:hover:bg-zinc-800/80"
            aria-label="Close success screen"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Animated success green circle tick */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 shadow-inner mb-6">
            <svg className="h-10 w-10 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-black text-[#1E4D2B] dark:text-[#52c47c] tracking-tight">
            Application Received!
          </h1>
          <p className="mt-2 text-sm text-[#F3A61E] font-black uppercase tracking-wider">
            Thank you, {fullName}
          </p>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
            Your interest in volunteering with us is highly appreciated. Our onboarding coordinator will get in touch with you at <span className="font-extrabold text-gray-900 dark:text-white">{phone}</span> on WhatsApp within the next 48 hours to share the schedule.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#07100b] font-sans py-12 flex items-center justify-center">
      
      {/* Main Registration Form Block */}
      <section className="mx-auto max-w-3xl w-full px-4">
        
        {/* Form Container */}
        <div className="bg-white dark:bg-[#101412] p-8 sm:p-12 rounded-[2.5rem] border border-gray-150/45 dark:border-zinc-800/80 shadow-sm relative">
          
          {/* Close/Cross Button to Home */}
          <button 
            onClick={() => window.location.href = "/"}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800/80 z-10"
            aria-label="Cancel and return to home"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {isSubmitting && (
            <div className="absolute inset-0 bg-black/45 rounded-[2.5rem] z-20 flex flex-col items-center justify-center text-white backdrop-blur-sm">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500" />
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-emerald-450">Registering Volunteer Profile...</p>
            </div>
          )}

          <h2 className="text-2xl font-black text-[#1E4D2B] dark:text-[#52c47c] mb-8 text-left border-b border-gray-50 dark:border-zinc-800/80 pb-4">
            Volunteer Onboarding Application
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center justify-center mb-6">
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Profile Photo</label>
              <div className="relative group h-28 w-28 rounded-full overflow-hidden border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0c1510] cursor-pointer hover:border-emerald-500 transition-colors">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile Preview" className="h-full w-full object-cover animate-fade-in" />
                ) : (
                  <div className="text-center p-3 text-zinc-500 group-hover:text-emerald-500 transition-colors">
                    {isPhotoUploading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent border-emerald-500 mx-auto" />
                    ) : (
                      <>
                        <svg className="h-7 w-7 mx-auto mb-1 text-gray-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-[9px] font-black uppercase tracking-wider block">Upload Photo</span>
                      </>
                    )}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsPhotoUploading(true);
                    setErrorMsg("");
                    const formData = new FormData();
                    formData.append("file", file);
                    try {
                      const res = await fetch('/api/upload', { method: 'POST', body: formData });
                      const data = await res.json();
                      if (data.success) {
                        setProfilePhoto(data.url);
                      } else {
                        setErrorMsg(data.error || "Failed to upload photo.");
                      }
                    } catch (err) {
                      setErrorMsg("Error uploading photo.");
                    } finally {
                      setIsPhotoUploading(false);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
              </div>
            </div>

            {/* Name and email */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Vikram Singh"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                />
              </div>
            </div>

            {/* Phone and City */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">WhatsApp Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Current Location / City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Hyderabad"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                />
              </div>
            </div>

            {/* Gender and Password */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-black text-gray-550 dark:text-gray-400 uppercase tracking-wider mb-2">Gender</label>
                <select
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B] text-gray-700 dark:text-gray-300"
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-550 dark:text-gray-400 uppercase tracking-wider mb-2">Choose Password (for profile access)</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                />
              </div>
            </div>

            {/* Aadhaar Card Number and Upload */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-black text-gray-555 dark:text-gray-400 uppercase tracking-wider mb-2">Aadhaar Card Number *</label>
                <input
                  type="text"
                  required
                  value={aadharNumber}
                  onChange={(e) => setAadharNumber(e.target.value)}
                  placeholder="12-digit Aadhaar number"
                  maxLength={12}
                  className="w-full px-4 py-3 bg-gray-55 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-555 dark:text-gray-400 uppercase tracking-wider mb-2">Upload Aadhaar Card (Image/PDF) *</label>
                <div className="relative border border-dashed border-gray-200 dark:border-zinc-700 rounded-xl p-3 bg-gray-55 dark:bg-[#0c1510] flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-colors">
                  <div className="text-xs text-gray-550 truncate max-w-[200px]">
                    {isAadharUploading ? "Uploading..." : aadharPhoto ? "✓ Aadhaar ready" : "Choose file..."}
                  </div>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsAadharUploading(true);
                      setErrorMsg("");
                      const formData = new FormData();
                      formData.append("file", file);
                      try {
                        const res = await fetch('/api/upload', { method: 'POST', body: formData });
                        const data = await res.json();
                        if (data.success) {
                          setAadharPhoto(data.url);
                        } else {
                          setErrorMsg(data.error || "Failed to upload Aadhaar card.");
                        }
                      } catch (err) {
                        setErrorMsg("Error uploading Aadhaar card.");
                      } finally {
                        setIsAadharUploading(false);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {aadharPhoto && (
                    <span className="text-[10px] text-[#52c47c] font-bold">Uploaded</span>
                  )}
                </div>
              </div>
            </div>

            {/* Internship Duration selection */}
            <div>
              <label className="block text-[10px] font-black text-gray-550 dark:text-gray-400 uppercase tracking-wider mb-2">Internship Duration *</label>
              <select
                required
                value={internshipDuration}
                onChange={(e) => setInternshipDuration(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B] text-gray-700 dark:text-gray-300"
              >
                <option value="1 Month">1 Month</option>
                <option value="2 Months">2 Months</option>
                <option value="3 Months">3 Months</option>
                <option value="4 Months">4 Months</option>
                <option value="5 Months">5 Months</option>
                <option value="6 Months">6 Months</option>
                <option value="12 Months">12 Months</option>
              </select>
            </div>

            {/* Checkboxes skills */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Area of Interest / Skills (Select all that apply)</label>
              <div className="space-y-2.5">
                {SKILLS_OPTIONS.map((skill) => (
                  <label key={skill} className="flex items-center gap-3 cursor-pointer select-none text-xs text-gray-700 dark:text-gray-300 font-medium">
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={() => handleCheckboxChange(skill)}
                      className="h-4.5 w-4.5 rounded border-gray-300 dark:border-gray-700 text-[#1E4D2B] focus:ring-[#1E4D2B]"
                    />
                    {skill}
                  </label>
                ))}
              </div>
            </div>

            {/* Motivation statement */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Why do you want to volunteer? (Optional)</label>
              <textarea
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="Share a short note about why you'd like to join us..."
                className="w-full h-24 px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
              />
            </div>

            {/* Terms and Conditions Scroll Box */}
            <div className="text-left">
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Terms & Conditions (Scroll to read entirely to enable check)</label>
              <div 
                onScroll={(e) => {
                  const target = e.currentTarget;
                  // Check if scrolled to bottom with a small buffer
                  if (target.scrollHeight - target.scrollTop <= target.clientHeight + 4) {
                    setHasScrolledToBottom(true);
                  }
                }}
                className="w-full h-24 overflow-y-auto px-4 py-3 bg-gray-50 dark:bg-[#0c1510]/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-500 dark:text-gray-400 leading-relaxed scrollbar-thin select-none"
              >
                <p className="font-bold mb-1 text-zinc-800 dark:text-zinc-200">Kanha Foundation Volunteer Code of Conduct</p>
                <p className="mb-2">1. Respect: All volunteers must treat community members, fellow volunteers, and staff with absolute dignity and respect.</p>
                <p className="mb-2">2. Confidentiality: Volunteers must protect the privacy of any sensitive information or beneficiaries they work with.</p>
                <p className="mb-2">3. Integrity: Volunteers must report true financial and project details on-ground and respect resources allotted to campaigns.</p>
                <p className="mb-2">4. Safety: Adhere strictly to dynamic instructions and safety protocols established by campaign coordinates.</p>
                <p className="mb-2">By checking the box below, you confirm that you have read, understood, and agreed to be bound by the volunteer guidelines and terms of Kanha Foundation.</p>
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-3 mt-4 select-none">
              <input
                type="checkbox"
                id="terms"
                disabled={!hasScrolledToBottom}
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className={`h-4.5 w-4.5 rounded border-gray-300 dark:border-gray-700 text-[#1E4D2B] focus:ring-[#1E4D2B] mt-0.5 ${
                  hasScrolledToBottom ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                }`}
              />
              <label 
                htmlFor="terms" 
                className={`text-xs leading-normal ${
                  hasScrolledToBottom ? "text-gray-600 dark:text-gray-400 cursor-pointer" : "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                }`}
              >
                I agree to the Terms & Conditions and Privacy Policy of Kanha Foundation. {!hasScrolledToBottom && <span className="text-[10px] text-[#F3A61E] font-bold block mt-1">(Please scroll the terms text box above to enable checking this box)</span>}
              </label>
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-200 dark:border-red-900/30">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#1E4D2B] hover:bg-[#15381E] text-white font-extrabold text-sm rounded-xl transition-all duration-300 active:scale-98 shadow-xl shadow-emerald-900/10 cursor-pointer"
            >
              Submit Application
            </button>

          </form>

        </div>

      </section>

    </div>
  );
}
