"use client";
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { compressImage } from '@/lib/compress-image';

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
  const [dob, setDob] = useState("");
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
  const [showPassword, setShowPassword] = useState(false);

  // Zoom preview modal state
  const [zoomModal, setZoomModal] = useState<{ isOpen: boolean; type: 'profile' | 'aadhar'; url: string } | null>(null);

  // Hidden input refs
  const profileInputRef = useRef<HTMLInputElement>(null);
  const aadharInputRef = useRef<HTMLInputElement>(null);

  // Upload handlers
  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsPhotoUploading(true);
    setErrorMsg("");
    try {
      const fileToUpload = await compressImage(file);
      const formData = new FormData();
      formData.append("file", fileToUpload);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const text = await res.text();
        let errMsg = "Upload failed";
        try {
          const parsed = JSON.parse(text);
          errMsg = parsed.error || errMsg;
        } catch {
          if (res.status === 413) errMsg = "File is too large (max 10MB).";
        }
        setErrorMsg(errMsg);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setProfilePhoto(data.url);
        setZoomModal(prev => prev && prev.type === 'profile' ? { ...prev, url: data.url, isOpen: true } : prev);
      } else {
        setErrorMsg(data.error || "Failed to upload photo.");
      }
    } catch (err: any) {
      console.error("Photo upload error:", err);
      setErrorMsg(err?.message || "Error uploading photo. Please try again.");
    } finally {
      setIsPhotoUploading(false);
    }
  };

  const handleAadharUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAadharUploading(true);
    setErrorMsg("");
    try {
      if (file.size > 10 * 1024 * 1024 && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
        setErrorMsg("PDF file is too large (max 10MB). Please select a smaller PDF.");
        return;
      }
      const fileToUpload = await compressImage(file);
      const formData = new FormData();
      formData.append("file", fileToUpload);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const text = await res.text();
        let errMsg = "Upload failed";
        try {
          const parsed = JSON.parse(text);
          errMsg = parsed.error || errMsg;
        } catch {
          if (res.status === 413) errMsg = "File is too large (max 10MB).";
        }
        setErrorMsg(errMsg);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setAadharPhoto(data.url);
        setZoomModal(prev => prev && prev.type === 'aadhar' ? { ...prev, url: data.url, isOpen: true } : prev);
      } else {
        setErrorMsg(data.error || "Failed to upload Aadhaar card.");
      }
    } catch (err: any) {
      console.error("Aadhaar upload error:", err);
      setErrorMsg(err?.message || "Error uploading Aadhaar card. Please try again.");
    } finally {
      setIsAadharUploading(false);
    }
  };

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

    if (!dob) {
      setErrorMsg("Please select your Date of Birth.");
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
        dob,
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
              <label className="block text-[10px] font-black text-gray-555 dark:text-gray-400 uppercase tracking-wider mb-3">Profile Photo</label>
              
              <div 
                onClick={() => {
                  if (profilePhoto) {
                    setZoomModal({ isOpen: true, type: 'profile', url: profilePhoto });
                  }
                }}
                className="relative group h-28 w-28 rounded-full overflow-hidden border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0c1510] cursor-pointer hover:border-emerald-500 transition-colors"
              >
                {profilePhoto ? (
                  <>
                    <img src={profilePhoto} alt="Profile Preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity">
                      <svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                      </svg>
                      View / Change
                    </div>
                  </>
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
                
                {!profilePhoto && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                )}
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

            {/* Gender and Date of Birth */}
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
                <label className="block text-[10px] font-black text-gray-550 dark:text-gray-400 uppercase tracking-wider mb-2">Date of Birth (DOB) *</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black text-gray-550 dark:text-gray-400 uppercase tracking-wider mb-2">Choose Password (for profile access)</label>
              <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a strong password"
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                  />
                  {password.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white focus:outline-none p-1 rounded-md cursor-pointer"
                    >
                      {showPassword ? (
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  )}
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
                <div className="relative border border-dashed border-gray-200 dark:border-zinc-700 rounded-xl p-3 bg-gray-55 dark:bg-[#0c1510] flex items-center justify-between hover:border-emerald-500 transition-colors">
                  <div className="text-xs text-gray-550 truncate max-w-[200px]">
                    {isAadharUploading ? "Uploading..." : aadharPhoto ? "✓ Aadhaar ready" : "Choose file..."}
                  </div>
                  
                  {!aadharPhoto && (
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleAadharUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  )}

                  {aadharPhoto && (
                    <div className="flex items-center gap-2 z-10">
                      <span className="text-[10px] text-[#52c47c] font-bold">Uploaded</span>
                      <button
                        type="button"
                        onClick={() => {
                          setZoomModal({ isOpen: true, type: 'aadhar', url: aadharPhoto });
                        }}
                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-extrabold rounded-md shadow-sm transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </div>
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

      {/* Hidden inputs for programmatic upload triggering */}
      <input
        ref={profileInputRef}
        type="file"
        accept="image/*"
        onChange={handleProfilePhotoUpload}
        className="hidden"
      />
      <input
        ref={aadharInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleAadharUpload}
        className="hidden"
      />

      {/* Zoom Preview Modal */}
      <AnimatePresence>
        {zoomModal && zoomModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#101412] p-6 rounded-3xl max-w-md w-full border border-zinc-800/80 shadow-2xl flex flex-col items-center text-center"
            >
              <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest mb-4">
                {zoomModal.type === 'profile' ? "Profile Photo Preview" : "Aadhaar Card Preview"}
              </h3>

              <div className="relative w-full aspect-square max-h-[50vh] rounded-2xl overflow-hidden border border-zinc-800 bg-black/40 flex items-center justify-center mb-6">
                {zoomModal.url.toLowerCase().endsWith('.pdf') ? (
                  <div className="flex flex-col items-center justify-center p-6 text-zinc-400">
                    <svg className="h-16 w-16 text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    <span className="text-xs font-bold mb-4">Aadhaar PDF Document uploaded</span>
                    <a
                      href={zoomModal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl border border-zinc-750 transition-colors"
                    >
                      Open PDF in New Tab
                    </a>
                  </div>
                ) : (
                  <img src={zoomModal.url} alt="Zoom Preview" className="w-full h-full object-contain" />
                )}
              </div>

              {/* Action Buttons below the picture */}
              <div className="flex w-full gap-3">
                <button
                  type="button"
                  onClick={() => setZoomModal(null)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-bold rounded-xl border border-zinc-750 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (zoomModal.type === 'profile') {
                      profileInputRef.current?.click();
                    } else {
                      aadharInputRef.current?.click();
                    }
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Upload Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
