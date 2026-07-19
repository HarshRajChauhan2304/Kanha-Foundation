"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Volunteer {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  motivation: string;
  skills: string[];
  status: string;
  created_at: string;
  profile_photo?: string;
  gender?: string;
  terms_accepted?: boolean;
  aadhar_number?: string;
  aadhar_upload_url?: string;
  internship_duration?: string;
  certificate_url?: string;
  certificate_issue_date?: string;
  internship_start_date?: string;
  internship_end_date?: string;
  certificate_text?: string;
  certificate_signature_name?: string;
  certificate_signature_title?: string;
  certificate_seal_text?: string;
  certificate_signature_image_url?: string;
  certificate_seal_image_url?: string;
}

const AVAILABLE_SKILLS = [
  "Food Distribution & Relief Work",
  "Children Education & Mentoring",
  "Animal Welfare & Rescue support",
  "Tree Plantation & Nature Drives",
  "Social Media & Graphic Design"
];

export default function VolunteerProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);

  // Login inputs
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formMotivation, setFormMotivation] = useState("");
  const [formSkills, setFormSkills] = useState<string[]>([]);
  const [formGender, setFormGender] = useState("");
  const [formProfilePhoto, setFormProfilePhoto] = useState("");
  const [isFormPhotoUploading, setIsFormPhotoUploading] = useState(false);
  const [formAadharNumber, setFormAadharNumber] = useState("");
  const [formAadharUploadUrl, setFormAadharUploadUrl] = useState("");
  const [isFormAadharUploading, setIsFormAadharUploading] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certScale, setCertScale] = useState(1);
  const certContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCertModalOpen) return;
    const handleResize = () => {
      if (certContainerRef.current) {
        const parentWidth = certContainerRef.current.parentElement?.clientWidth || 360;
        const availableWidth = parentWidth - 32;
        const newScale = Math.min(1, availableWidth / 800);
        setCertScale(newScale);
      }
    };
    const timeoutId = setTimeout(handleResize, 100);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isCertModalOpen, volunteer]);

  const [showCertCelebration, setShowCertCelebration] = useState(false);
  const [starRecord, setStarRecord] = useState<any | null>(null);
  const [isStarCertModalOpen, setIsStarCertModalOpen] = useState(false);
  const [showStarCelebration, setShowStarCelebration] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState("");
  const [editErrorMsg, setEditErrorMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Task schedules state
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Task Completion Modal states
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [completingTask, setCompletingTask] = useState<any | null>(null);
  const [moneyReceived, setMoneyReceived] = useState("");
  const [moneySpent, setMoneySpent] = useState("");
  const [proofMediaList, setProofMediaList] = useState<string[]>([]);
  const [isProofUploading, setIsProofUploading] = useState(false);
  const [volunteerFeedback, setVolunteerFeedback] = useState("");
  const [completionError, setCompletionError] = useState("");
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);

  // View Submission Modal states
  const [isViewProofModalOpen, setIsViewProofModalOpen] = useState(false);
  const [viewingTaskProof, setViewingTaskProof] = useState<any | null>(null);

  const fetchTasks = async (volId: number) => {
    try {
      setTasksLoading(true);
      const res = await fetch(`/api/volunteer/tasks?volunteer_id=${volId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
    } catch (e) {
      console.error("Error loading volunteer tasks:", e);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      const res = await fetch('/api/volunteer/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus })
      });
      const data = await res.json();
      if (data.success && volunteer) {
        fetchTasks(volunteer.id);
      }
    } catch (e) {
      console.error("Error updating task status:", e);
    }
  };

  const openCompletionModal = (task: any) => {
    setCompletingTask(task);
    setMoneyReceived(task.assigned_money?.toString() || "0");
    setMoneySpent("");
    setProofMediaList([]);
    setVolunteerFeedback("");
    setCompletionError("");
    setIsCompletionModalOpen(true);
  };

  const handleCompletionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompletionError("");

    if (!moneyReceived || !moneySpent || proofMediaList.length === 0 || !volunteerFeedback.trim()) {
      setCompletionError("Please fill in all required fields and upload at least one media proof.");
      return;
    }

    setIsSubmittingCompletion(true);
    try {
      const res = await fetch('/api/volunteer/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: completingTask.id,
          status: "Completed",
          money_received: parseFloat(moneyReceived) || 0,
          money_spent: parseFloat(moneySpent) || 0,
          proof_media: proofMediaList.join(","),
          feedback: volunteerFeedback
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsCompletionModalOpen(false);
        if (volunteer) fetchTasks(volunteer.id);
      } else {
        setCompletionError(data.error || "Failed to save completion proof.");
      }
    } catch (err) {
      setCompletionError("Error submitting task completion proof.");
    } finally {
      setIsSubmittingCompletion(false);
    }
  };

  // Check login session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem("volunteer_session");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setVolunteer(parsed);
        setIsLoggedIn(true);
        fetchTasks(parsed.id);

        // Fetch fresh details from server to keep database updates synced
        fetch('/api/volunteer')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              const matchedVol = data.find((v: any) => v.id === parsed.id);
              if (matchedVol) {
                setVolunteer(matchedVol);
                localStorage.setItem("volunteer_session", JSON.stringify(matchedVol));
              }
            }
          })
          .catch(err => console.warn("Failed to fetch fresh volunteer details:", err));
      } catch (e) {
        localStorage.removeItem("volunteer_session");
      }
    }
  }, []);

  // Check if a certificate is available and show the celebration popup
  useEffect(() => {
    if (volunteer && volunteer.certificate_url) {
      const hasDismissed = localStorage.getItem(`dismissed_cert_${volunteer.id}`);
      if (!hasDismissed) {
        setShowCertCelebration(true);
      }
    } else {
      setShowCertCelebration(false);
    }
  }, [volunteer]);

  // Query weekly star API and set star status/records
  useEffect(() => {
    if (volunteer) {
      fetch('/api/volunteer/star')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.stars)) {
            const matchedStar = data.stars.find((s: any) => s && String(s.volunteer_id) === String(volunteer.id));
            if (matchedStar) {
              setStarRecord(matchedStar);
              const weekKey = `dismissed_star_${volunteer.id}_${matchedStar.week_label.replace(/\s+/g, '_')}`;
              const hasDismissed = localStorage.getItem(weekKey);
              if (!hasDismissed) {
                setShowStarCelebration(true);
              }
            }
          }
        })
        .catch(err => console.error("Error checking weekly star volunteer status:", err));
    } else {
      setStarRecord(null);
      setShowStarCelebration(false);
    }
  }, [volunteer]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/volunteer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, phone: phoneInput, password: passwordInput })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("volunteer_session", JSON.stringify(data.volunteer));
        window.dispatchEvent(new Event("user_avatar_update"));
        setVolunteer(data.volunteer);
        setIsLoggedIn(true);
        fetchTasks(data.volunteer.id);
      } else {
        setLoginError(data.error || "Failed to access profile.");
      }
    } catch (err: any) {
      console.error("Login portal error:", err);
      setLoginError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("volunteer_session");
    window.location.href = "/signin";
  };

  const startEditing = () => {
    if (!volunteer) return;
    setFormName(volunteer.name);
    setFormEmail(volunteer.email);
    setFormCity(volunteer.city);
    setFormMotivation(volunteer.motivation || "");
    setFormSkills(volunteer.skills || []);
    setFormGender(volunteer.gender || "");
    setFormProfilePhoto(volunteer.profile_photo || "");
    setFormAadharNumber(volunteer.aadhar_number || "");
    setFormAadharUploadUrl(volunteer.aadhar_upload_url || "");
    setIsEditing(true);
    setEditSuccessMsg("");
    setEditErrorMsg("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditErrorMsg("");
    setEditSuccessMsg("");
    setIsSaving(true);

    if (!volunteer) return;

    try {
      const res = await fetch('/api/volunteer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: volunteer.id,
          name: formName,
          email: formEmail,
          phone: volunteer.phone, // Phone acts as immutable unique key
          city: formCity,
          motivation: formMotivation,
          skills: formSkills,
           status: volunteer.status,
          profile_photo: formProfilePhoto,
          gender: formGender,
          aadhar_number: formAadharNumber,
          aadhar_upload_url: formAadharUploadUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        const updatedVol = data.application;
        localStorage.setItem("volunteer_session", JSON.stringify(updatedVol));
        window.dispatchEvent(new Event("user_avatar_update"));
        setVolunteer(updatedVol);
        setEditSuccessMsg("Profile updated successfully!");
        setTimeout(() => {
          setIsEditing(false);
          setEditSuccessMsg("");
        }, 1500);
      } else {
        setEditErrorMsg(data.error || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Update error:", err);
      setEditErrorMsg("Error updating profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`bg-zinc-950 text-white min-h-screen px-4 flex flex-col items-center justify-center font-sans relative overflow-hidden ${isLoggedIn ? "pt-28 pb-12" : "py-24"}`}>
      
      {/* Decorative Floating Glassmorphic Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[15%] left-[5%] w-[380px] h-[380px] rounded-full bg-[#1E4D2B]/15 blur-[90px] animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-[15%] right-[5%] w-[420px] h-[420px] rounded-full bg-[#F3A61E]/5 blur-[120px] animate-pulse duration-[10000ms]" />
      </div>

      {/* Login Portal Interface */}
      {!isLoggedIn ? (
        <motion.div 
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(30,77,43,0.25)] relative z-10"
        >
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4 px-6 py-2 bg-zinc-950/40 rounded-2xl border border-zinc-800/40">
              <img
                src="/kanha_logo_round.png"
                alt="Kanha Foundation Logo"
                className="h-20 w-auto mx-auto object-contain relative z-10"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Volunteer Login
            </h1>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed max-w-xs mx-auto">
              Welcome back! Provide your registered details to access your verified volunteer profile dashboard.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5 text-left">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Registered Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder-zinc-600 shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Registered Phone</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder-zinc-600 shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder-zinc-600 shadow-inner"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-red-400 font-semibold bg-red-950/20 p-3.5 rounded-2xl border border-red-900/35 leading-relaxed flex items-start gap-2">
                <span className="text-sm mt-0.5">⚠️</span>
                <span>{loginError}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-6 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-950/40 border border-emerald-800/40 hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                  Accessing Dashboard...
                </>
              ) : (
                "Secure Access Portal"
              )}
            </button>
          </form>

        </motion.div>
      ) : (
        
        /* Dashboard Interface */
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-zinc-900/60 backdrop-blur-md border border-zinc-800 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl text-left"
        >
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/80 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <img
                src={volunteer?.profile_photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                alt="Volunteer Profile Photo"
                className="h-16 w-16 rounded-full object-cover border-2 border-zinc-800 shadow-md"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white">Volunteer Dashboard</h1>
                <p className="text-xs text-zinc-400 mt-1">Hello, {volunteer?.name}! Thank you for your support. ❤️</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-black uppercase tracking-wider rounded-full cursor-pointer transition-colors"
            >
              Logout
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!isEditing ? (
              
              /* View Mode card */
              <motion.div
                key="view"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                {/* Status card block */}
                <div className="bg-[#1E4D2B]/10 border border-emerald-900/30 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white">Verification Status</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">Your profile is active and verified by admin.</p>
                  </div>
                  <span className="px-3.5 py-1.5 bg-emerald-950/40 text-emerald-450 border border-emerald-900/40 rounded-xl text-xs font-black uppercase tracking-wide">
                    Approved ✅
                  </span>
                </div>

                {/* Certificate banner card */}
                {volunteer?.certificate_url && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                        🎓 Internship Completion Certificate
                      </h2>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Congratulations! Your certificate has been issued on {volunteer.certificate_issue_date || "N/A"}.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsCertModalOpen(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-wider rounded-xl text-xs cursor-pointer shadow-md text-center transition-all"
                    >
                      View & Download
                    </button>
                  </div>
                )}

                {/* Star Volunteer Certificate banner card */}
                {starRecord && (
                  <div className="bg-amber-550/10 border border-[#F3A61E]/30 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                        🌟 Star Volunteer Certificate
                      </h2>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Congratulations! You have been selected as the Star Volunteer for the {starRecord.week_label}.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsStarCertModalOpen(true)}
                      className="px-4 py-2 bg-[#F3A61E] hover:bg-[#d68f12] text-black font-black uppercase tracking-wider rounded-xl text-xs cursor-pointer shadow-md text-center transition-all"
                    >
                      View & Print Star Cert
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Full Name</label>
                    <p className="text-sm font-extrabold text-white mt-1">{volunteer?.name}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Gender</label>
                    <p className="text-sm font-extrabold text-white mt-1">{volunteer?.gender || "Not Specified"}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Email Address</label>
                    <p className="text-sm font-extrabold text-white mt-1">{volunteer?.email}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Phone (WhatsApp)</label>
                    <p className="text-sm font-extrabold text-white mt-1">{volunteer?.phone}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Aadhaar Card Number</label>
                    <p className="text-sm font-extrabold text-white mt-1">{volunteer?.aadhar_number || "Not Logged"}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Aadhaar Card File</label>
                    {volunteer?.aadhar_upload_url ? (
                      <a
                        href={volunteer.aadhar_upload_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-450 hover:underline font-bold block mt-1"
                      >
                        View Document ↗
                      </a>
                    ) : (
                      <p className="text-sm font-extrabold text-zinc-500 mt-1">No Document</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">City / Location</label>
                    <p className="text-sm font-extrabold text-white mt-1">{volunteer?.city}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Internship Duration</label>
                    <p className="text-sm font-extrabold text-[#F3A61E] mt-1">{volunteer?.internship_duration || "1 Month"}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Internship Start Date</label>
                    <p className="text-sm font-extrabold text-white mt-1">{volunteer?.internship_start_date || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Internship Completion Date</label>
                    <p className="text-sm font-extrabold text-white mt-1">{volunteer?.internship_end_date || "N/A"}</p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Areas of Interest / Skills</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {volunteer?.skills && volunteer.skills.length > 0 ? (
                      volunteer.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-emerald-950/20 text-[#52c47c] border border-emerald-900/35 rounded-lg text-xs font-bold">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500">No skills selected.</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Motivation Statement</label>
                  <p className="text-sm text-zinc-300 mt-2 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 leading-relaxed italic">
                    "{volunteer?.motivation || 'N/A'}"
                  </p>
                </div>

                {/* Tasks List */}
                <div className="border-t border-zinc-800/80 pt-6 space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <svg className="h-4 w-4 text-[#F3A61E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    My Assigned Tasks & Schedules
                  </h3>

                  {tasksLoading ? (
                    <div className="flex items-center gap-2 py-4 text-xs text-zinc-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-emerald-500" />
                      Loading assigned tasks...
                    </div>
                  ) : tasks.length === 0 ? (
                    <p className="text-xs text-zinc-500 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 italic">
                      No tasks assigned yet. You will be notified here once admin delegates an assignment to you!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map(task => (
                        <div key={task.id} className="bg-zinc-950/50 border border-zinc-800/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{task.task_title}</h4>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                                task.status === "Completed" 
                                  ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/35' 
                                  : task.status === "Processing"
                                  ? 'bg-blue-950/30 text-blue-400 border-blue-900/35'
                                  : task.status === "Started"
                                  ? 'bg-indigo-950/30 text-indigo-400 border-indigo-900/35'
                                  : 'bg-amber-950/30 text-amber-400 border-amber-900/35'
                              }`}>
                                {task.status}
                              </span>
                            </div>
                            {task.task_description && (
                              <p className="text-xs text-zinc-400 mt-1.5 max-w-md leading-relaxed">{task.task_description}</p>
                            )}
                            <div className="flex flex-wrap gap-4 mt-2.5 text-[10px] text-zinc-500 font-bold">
                              <span>📅 Date: {task.task_date}</span>
                              <span>⏰ Time: {task.task_time}</span>
                              <span className="text-[#F3A61E]">💰 Budget: ₹{task.assigned_money || 0}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-start sm:self-center">
                            {task.status === "Pending" && (
                              <button
                                onClick={() => handleUpdateTaskStatus(task.id, "Started")}
                                className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-750 text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all border border-indigo-800/40 whitespace-nowrap"
                              >
                                Start Task
                              </button>
                            )}
                            {task.status === "Started" && (
                              <button
                                onClick={() => handleUpdateTaskStatus(task.id, "Processing")}
                                className="px-3.5 py-1.5 bg-blue-650 hover:bg-blue-750 text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all border border-blue-800/40 whitespace-nowrap"
                              >
                                Move to Processing
                              </button>
                            )}
                            {task.status === "Processing" && (
                              <button
                                onClick={() => openCompletionModal(task)}
                                className="px-3.5 py-1.5 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all border border-emerald-800/40 whitespace-nowrap"
                              >
                                Complete Task
                              </button>
                            )}
                            {task.status === "Completed" && (
                              <button
                                onClick={() => {
                                  setViewingTaskProof(task);
                                  setIsViewProofModalOpen(true);
                                }}
                                className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all border border-zinc-700 whitespace-nowrap"
                              >
                                View Submission Proof
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-zinc-800/80 mt-6 flex justify-end">
                  <button
                    onClick={startEditing}
                    className="px-6 py-2.5 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-xs font-black uppercase tracking-wider rounded-full transition-all cursor-pointer shadow-lg border border-emerald-800/40"
                  >
                    Edit Profile Info
                  </button>
                </div>
              </motion.div>
            ) : (
              
              /* Edit Mode form */
              <motion.form
                key="edit"
                onSubmit={handleEditSubmit}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                {/* Profile Photo edit */}
                <div className="flex flex-col items-center justify-center mb-4">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Change Profile Photo</label>
                  <div className="relative group h-24 w-24 rounded-full overflow-hidden border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center cursor-pointer">
                    {formProfilePhoto ? (
                      <img src={formProfilePhoto} alt="Form Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">No Image</span>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] text-white font-black uppercase">
                      {isFormPhotoUploading ? "Uploading..." : "Upload"}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsFormPhotoUploading(true);
                        const formData = new FormData();
                        formData.append("file", file);
                        try {
                          const res = await fetch('/api/upload', { method: 'POST', body: formData });
                          const data = await res.json();
                          if (data.success) setFormProfilePhoto(data.url);
                        } catch (err) {
                          console.error("Form photo upload failed:", err);
                        } finally {
                          setIsFormPhotoUploading(false);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Phone Number (WhatsApp)</label>
                    <input
                      type="text"
                      disabled
                      value={volunteer?.phone}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-550 focus:outline-none disabled:opacity-60 cursor-not-allowed font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">City / Location</label>
                    <input
                      type="text"
                      required
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Gender select */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Gender</label>
                  <select
                    required
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none text-zinc-300"
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Aadhaar Card Number and Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Aadhaar Card Number *</label>
                    <input
                      type="text"
                      required
                      value={formAadharNumber}
                      onChange={(e) => setFormAadharNumber(e.target.value)}
                      placeholder="12-digit number"
                      maxLength={12}
                      className="w-full px-4 py-2.5 bg-zinc-955 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Upload Aadhaar Card *</label>
                    <div className="relative border border-zinc-800 rounded-xl p-2.5 bg-zinc-950 flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-colors">
                      <div className="text-xs text-zinc-500 truncate max-w-[180px]">
                        {isFormAadharUploading ? "Uploading..." : formAadharUploadUrl ? "✓ Aadhaar ready" : "Choose file..."}
                      </div>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsFormAadharUploading(true);
                          const formData = new FormData();
                          formData.append("file", file);
                          try {
                            const res = await fetch('/api/upload', { method: 'POST', body: formData });
                            const data = await res.json();
                            if (data.success) setFormAadharUploadUrl(data.url);
                          } catch (err) {
                            console.error("Aadhaar photo upload failed:", err);
                          } finally {
                            setIsFormAadharUploading(false);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Areas of Interest / Skills</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/80">
                    {AVAILABLE_SKILLS.map((skill) => {
                      const isChecked = formSkills.includes(skill);
                      return (
                        <label key={skill} className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setFormSkills(formSkills.filter(s => s !== skill));
                              } else {
                                setFormSkills([...formSkills, skill]);
                              }
                            }}
                            className="rounded border-zinc-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer h-4 w-4 bg-zinc-900"
                          />
                          {skill}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Motivation Statement</label>
                  <textarea
                    value={formMotivation}
                    onChange={(e) => setFormMotivation(e.target.value)}
                    className="w-full h-24 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                  />
                </div>

                {/* Alerts inside profile form */}
                {editSuccessMsg && (
                  <p className="text-xs text-emerald-450 font-medium bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/35">
                    {editSuccessMsg}
                  </p>
                )}
                {editErrorMsg && (
                  <p className="text-xs text-red-400 font-medium bg-red-950/20 p-2.5 rounded-lg border border-red-900/35">
                    {editErrorMsg}
                  </p>
                )}

                {/* Submit action buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800/80 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2 rounded-full border border-zinc-800 text-xs font-bold text-zinc-450 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-7 py-2 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-xs font-black uppercase tracking-wider rounded-full transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>

              </motion.form>
            )}
          </AnimatePresence>

        </motion.div>
      )}

      {/* Task Completion Form Modal */}
      <AnimatePresence>
        {isCompletionModalOpen && completingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-zinc-900 border border-zinc-850 p-8 rounded-[2.5rem] shadow-2xl relative text-left z-50"
            >
              <h2 className="text-xl font-black text-white mb-2">Complete Task Submission</h2>
              <p className="text-xs text-zinc-400 mb-6 font-medium">Provide the execution financial records, proof media, and your feedback for: <strong className="text-[#F3A61E]">{completingTask.task_title}</strong></p>

              <form onSubmit={handleCompletionSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">Money Received (₹)</label>
                    <input
                      type="number"
                      required
                      value={moneyReceived}
                      onChange={(e) => setMoneyReceived(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">Money Spent (₹)</label>
                    <input
                      type="number"
                      required
                      value={moneySpent}
                      onChange={(e) => setMoneySpent(e.target.value)}
                      placeholder="e.g. 450"
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                    />
                  </div>
                </div>

                {/* Proof Media File Upload (Multiple Support) */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">Upload Proof Media (Photos, Receipts, or Videos)</label>
                  <div className="flex flex-col gap-3">
                    <div className="relative border-2 border-dashed border-zinc-800 rounded-2xl h-24 flex flex-col items-center justify-center bg-zinc-950/50 hover:border-emerald-500 transition-colors cursor-pointer overflow-hidden">
                      <div className="text-center p-3 text-zinc-550">
                        {isProofUploading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-emerald-500 mx-auto" />
                        ) : (
                          <>
                            <svg className="h-6 w-6 mx-auto mb-1 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[10px] font-black uppercase tracking-wider block">Select Media (Multiple Files)</span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        disabled={isProofUploading}
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (!files || files.length === 0) return;
                          setIsProofUploading(true);
                          setCompletionError("");
                          try {
                            const uploadPromises = Array.from(files).map(async (file) => {
                              const formData = new FormData();
                              formData.append("file", file);
                              const res = await fetch('/api/upload', { method: 'POST', body: formData });
                              const data = await res.json();
                              return data.success ? data.url : null;
                            });
                            const urls = await Promise.all(uploadPromises);
                            const successfulUrls = urls.filter((url): url is string => url !== null);
                            if (successfulUrls.length > 0) {
                              setProofMediaList(prev => [...prev, ...successfulUrls]);
                            }
                          } catch (err) {
                            setCompletionError("Error uploading one or more files.");
                          } finally {
                            setIsProofUploading(false);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>

                    {/* Previews with Delete button */}
                    {proofMediaList.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                        {proofMediaList.map((url, pIdx) => {
                          const isVideo = url.endsWith(".mp4") || url.endsWith(".mov") || url.includes("video");
                          return (
                            <div key={pIdx} className="relative aspect-video rounded-lg overflow-hidden border border-zinc-800 group shadow-inner">
                              {isVideo ? (
                                <video src={url} className="object-cover w-full h-full" />
                              ) : (
                                <img src={url} alt="proof thumbnail preview" className="object-cover w-full h-full" />
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setProofMediaList(prev => prev.filter((_, idx) => idx !== pIdx));
                                }}
                                className="absolute inset-0 bg-red-650/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-black uppercase cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">Volunteer Feedback / Comments</label>
                  <textarea
                    required
                    value={volunteerFeedback}
                    onChange={(e) => setVolunteerFeedback(e.target.value)}
                    placeholder="Share how the execution went on the ground..."
                    className="w-full h-24 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {completionError && (
                  <p className="text-xs font-semibold text-red-400 bg-red-950/20 p-3 rounded-xl border border-red-900/35">
                    {completionError}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-850 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCompletionModalOpen(false)}
                    className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-full text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCompletion}
                    className="px-6 py-2.5 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-xs font-black uppercase tracking-wider rounded-full transition-all cursor-pointer border border-emerald-800/40"
                  >
                    {isSubmittingCompletion ? "Submitting..." : "Submit Task Proof"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Submission Proof Modal */}
      <AnimatePresence>
        {isViewProofModalOpen && viewingTaskProof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-zinc-900 border border-zinc-850 p-8 rounded-[2.5rem] shadow-2xl relative text-left z-50"
            >
              <h2 className="text-xl font-black text-white mb-2">Submission Details</h2>
              <p className="text-xs text-zinc-400 mb-6 font-medium">Completed task records and proof details for: <strong className="text-[#F3A61E]">{viewingTaskProof.task_title}</strong></p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 bg-zinc-955/60 p-4 rounded-2xl border border-zinc-800/80">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Money Received</label>
                    <p className="text-base font-extrabold text-[#F3A61E] mt-1">₹{viewingTaskProof.money_received || 0}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Money Spent</label>
                    <p className="text-base font-extrabold text-[#F3A61E] mt-1">₹{viewingTaskProof.money_spent || 0}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Proof Media</label>
                  {viewingTaskProof.proof_media ? (
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {viewingTaskProof.proof_media.split(",").filter(Boolean).map((url: string, idx: number) => {
                        const isVideo = url.endsWith(".mp4") || url.endsWith(".mov") || url.includes("video");
                        return (
                          <div key={idx} className="border border-zinc-800 rounded-xl overflow-hidden bg-black/40 aspect-video flex items-center justify-center">
                            {isVideo ? (
                              <video src={url} className="h-full w-full object-cover" controls />
                            ) : (
                              <a href={url} target="_blank" rel="noreferrer" className="w-full h-full block">
                                <img src={url} alt={`Proof Media ${idx + 1}`} className="h-full w-full object-cover hover:scale-[1.02] transition-transform" />
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-black/40 h-32 flex items-center justify-center">
                      <span className="text-xs text-zinc-550 italic">No media uploaded</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">My Feedback</label>
                  <p className="text-xs text-zinc-300 mt-2 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 leading-relaxed italic">
                    "{viewingTaskProof.feedback || 'No feedback provided'}"
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-zinc-850 mt-6">
                <button
                  onClick={() => setIsViewProofModalOpen(false)}
                  className="px-6 py-2 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-xs font-black uppercase tracking-wider rounded-full transition-all cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic premium certificate print modal */}
      <AnimatePresence>
        {isCertModalOpen && volunteer && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            {volunteer.certificate_url === "auto" ? (
              <>
                <style>{`
                  @media print {
                    body * {
                      visibility: hidden;
                    }
                    #premium-certificate-print-area, #premium-certificate-print-area * {
                      visibility: visible;
                    }
                    #premium-certificate-print-area {
                      position: fixed;
                      left: 0;
                      top: 0;
                      width: 297mm !important;
                      height: 210mm !important;
                      transform: none !important;
                      margin: 0 !important;
                      padding: 2.5rem !important;
                      box-sizing: border-box;
                      background-color: white !important;
                      background-image: none !important;
                      color: #121212 !important;
                      border: 15px double #1E4D2B !important;
                      box-shadow: none !important;
                      z-index: 99999;
                      display: flex !important;
                      flex-direction: column !important;
                      justify-content: space-between !important;
                    }
                    .no-print {
                      display: none !important;
                    }
                  }
                  @page {
                    size: A4 landscape;
                    margin: 0;
                  }
                `}</style>

                <div className="no-print flex justify-end w-full max-w-4xl mb-4 gap-3">
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase tracking-wider rounded-xl text-xs cursor-pointer shadow-lg transition-all"
                  >
                    Print / Save PDF
                  </button>
                  <button
                    onClick={() => setIsCertModalOpen(false)}
                    className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-extrabold uppercase tracking-wider rounded-xl text-xs cursor-pointer transition-all"
                  >
                    Close Certificate
                  </button>
                </div>

                <div 
                  ref={certContainerRef}
                  className="w-full flex items-center justify-center overflow-hidden"
                  style={{ height: `${565 * certScale}px` }}
                >
                  <div
                    id="premium-certificate-print-area"
                    className="relative bg-white border-[16px] border-double border-[#1E4D2B] p-6 sm:p-8 text-center text-[#0e1711] shadow-2xl flex flex-col justify-between rounded-xl select-none"
                    style={{
                      fontFamily: "'Outfit', 'Inter', sans-serif",
                      backgroundImage: "radial-gradient(circle at center, #fcfdfc 0%, #f4faf6 100%)",
                      width: '800px',
                      height: '565px',
                      transform: `scale(${certScale})`,
                      transformOrigin: 'top center',
                      flexShrink: 0
                    }}
                  >
                    {/* Background watermark round logo */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                      <img
                        src="/kanha_logo_round.png"
                        alt="Watermark Logo"
                        className="w-[280px] h-[280px] object-contain opacity-[0.04]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&auto=format&fit=crop&q=80";
                        }}
                      />
                    </div>

                    {/* Top Branding Section */}
                    <div className="relative z-10 flex flex-col items-center">
                      <img
                        src="/kanha_logo_round.png"
                        alt="Kanha Foundation Logo"
                        className="h-16 w-16 object-contain mb-3"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=120&auto=format&fit=crop&q=80";
                        }}
                      />
                      <h4 className="text-sm font-black tracking-[0.25em] text-[#1E4D2B] uppercase mb-1">KANHA FOUNDATION</h4>
                      <p className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold">Registered Charity & Volunteer Network</p>
                      <div className="w-24 h-0.5 bg-[#F3A61E] mt-3 mb-1"></div>
                    </div>

                    {/* Middle Certificate Core */}
                    <div className="relative z-10 my-auto space-y-3">
                      <h2 className="text-3xl font-black tracking-tight text-[#1E4D2B] font-serif uppercase">
                        Certificate of Internship
                      </h2>

                      <div className="space-y-1.5 mt-2">
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">This is proudly presented to</p>
                        <h3 className="text-2xl font-black text-[#1E4D2B] underline decoration-[#F3A61E] decoration-2 underline-offset-8">
                          {volunteer.name.toUpperCase()}
                        </h3>
                      </div>

                      <p className="text-sm text-zinc-650 max-w-2xl mx-auto leading-relaxed mt-4">
                        {volunteer.certificate_text ? (
                          volunteer.certificate_text
                        ) : (
                          <>
                            has successfully completed their volunteering internship under Kanha Foundation from <strong className="text-[#1E4D2B]">{volunteer.internship_start_date || "N/A"}</strong> to <strong className="text-[#1E4D2B]">{volunteer.certificate_issue_date || "N/A"}</strong>. Their contributions have significantly impacted local relief drives and education initiatives.
                          </>
                        )}
                      </p>

                      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-4 text-xs font-bold text-zinc-600">
                        <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-150/40">
                          <span className="block text-[8px] text-zinc-400 uppercase tracking-wider mb-0.5">Start Date</span>
                          <span className="text-xs text-[#1E4D2B] font-black">{volunteer.internship_start_date || "N/A"}</span>
                        </div>
                        <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-150/40">
                          <span className="block text-[8px] text-zinc-400 uppercase tracking-wider mb-0.5">Duration</span>
                          <span className="text-xs text-[#1E4D2B] font-black">{volunteer.internship_duration || "1 Month"}</span>
                        </div>
                        <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-150/40">
                          <span className="block text-[8px] text-zinc-400 uppercase tracking-wider mb-0.5">Completion Date</span>
                          <span className="text-xs text-[#1E4D2B] font-black">{volunteer.certificate_issue_date || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Stamp and Signature block */}
                    <div className="relative z-10 flex justify-between items-end border-t border-zinc-200/60 pt-3 mt-3 text-left">
                      <div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Verification ID</p>
                        <p className="text-xs font-extrabold text-[#F3A61E]">KH-VOL-CERT-{volunteer.id}</p>
                      </div>
                      
                      {/* Stamp Seal */}
                      <div className="h-16 w-16 flex items-center justify-center relative select-none">
                        {volunteer.certificate_seal_image_url ? (
                          <img 
                            src={volunteer.certificate_seal_image_url} 
                            className="h-16 w-16 object-contain" 
                            alt="Seal"
                          />
                        ) : (
                          <div className="h-16 w-16 border-2 border-dashed border-[#1E4D2B]/40 rounded-full flex items-center justify-center text-[#1E4D2B] opacity-60">
                            <div className="text-[8px] font-black uppercase text-center tracking-wider leading-tight">
                              {volunteer.certificate_seal_text ? (
                                volunteer.certificate_seal_text.split(" ").map((w, idx) => (
                                  <span key={idx} className="block">{w}</span>
                                ))
                              ) : (
                                <>KANHA<br />FOUNDATION<br />SEAL</>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-right w-44">
                        {volunteer.certificate_signature_image_url ? (
                          <img 
                            src={volunteer.certificate_signature_image_url} 
                            className="h-10 max-w-full object-contain mx-auto mb-1" 
                            alt="Signature"
                          />
                        ) : volunteer.certificate_signature_name ? (
                          <p className="text-[10px] font-bold text-gray-800 text-center select-none font-serif italic mb-0.5 border-b border-zinc-200/60 pb-1">
                            {volunteer.certificate_signature_name}
                          </p>
                        ) : null}
                        <div className={`${(volunteer.certificate_signature_image_url || volunteer.certificate_signature_name) ? "h-2" : "h-8 border-b border-zinc-300"} w-full mb-1`}></div>
                        <p className="text-[10px] font-black text-[#1E4D2B] uppercase tracking-wider">
                          {volunteer.certificate_signature_title || "Authorized Officer"}
                        </p>
                        <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Kanha Foundation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Custom uploaded certificate file view */
              <div className="w-full max-w-3xl flex flex-col items-center justify-center">
                <div className="flex justify-end w-full mb-4 gap-3 no-print">
                  <a
                    href={volunteer.certificate_url}
                    download={`Certificate_${volunteer.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase tracking-wider rounded-xl text-xs cursor-pointer shadow-lg transition-all text-center"
                  >
                    Download Certificate 📥
                  </a>
                  <button
                    onClick={() => setIsCertModalOpen(false)}
                    className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-extrabold uppercase tracking-wider rounded-xl text-xs cursor-pointer transition-all"
                  >
                    Close Certificate
                  </button>
                </div>

                <div 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center gap-6 shadow-2xl relative"
                  style={{ backgroundColor: "#141916" }}
                >
                  <h3 className="text-lg font-black text-white border-b border-zinc-800 pb-3 w-full text-center">
                    Your Internship Certificate
                  </h3>

                  {volunteer.certificate_url?.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp|svg)/) ? (
                    <div className="w-full flex items-center justify-center bg-zinc-950 p-4 rounded-2xl border border-zinc-850 max-h-[60vh] overflow-auto">
                      <img
                        src={volunteer.certificate_url}
                        alt="Certificate Preview"
                        className="max-h-[50vh] object-contain rounded-lg shadow-md"
                      />
                    </div>
                  ) : volunteer.certificate_url?.toLowerCase().endsWith('.pdf') ? (
                    <div className="w-full h-[50vh] bg-zinc-950 rounded-2xl border border-zinc-850 overflow-hidden">
                      <iframe
                        src={volunteer.certificate_url}
                        className="w-full h-full border-none"
                        title="Certificate PDF Preview"
                      />
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center justify-center bg-zinc-950/50 border border-dashed border-zinc-800 py-12 px-6 rounded-2xl text-center">
                      <div className="text-5xl mb-4">📄</div>
                      <p className="text-sm font-bold text-white mb-2">Certificate Document</p>
                      <p className="text-xs text-zinc-400 max-w-sm mb-6">
                        Your certificate has been issued and is available for viewing/download.
                      </p>
                      <a
                        href={volunteer.certificate_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase tracking-wider rounded-xl text-xs transition-all shadow-md"
                      >
                        Open Document ↗
                      </a>
                    </div>
                  )}

                  <p className="text-xs text-zinc-400 text-center">
                    Issued officially by the Kanha Foundation on {volunteer.certificate_issue_date || "N/A"}.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Celebration Modal for issued certificate */}
      <AnimatePresence>
        {showCertCelebration && volunteer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 text-white w-full max-w-md rounded-3xl p-6 sm:p-8 text-center relative z-50 shadow-2xl"
              style={{ backgroundColor: "#141916" }}
            >
              {/* Confetti decoration */}
              <div className="text-4xl mb-4 animate-bounce">🎉 🥳 🎓</div>
              
              <h2 className="text-xl sm:text-2xl font-black text-white mb-3">
                Congratulations, {volunteer.name}!
              </h2>
              
              <p className="text-sm text-zinc-350 leading-relaxed mb-6">
                Your volunteering internship certificate has been officially issued by the Kanha Foundation! Thank you for your incredible support and dedication.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    localStorage.setItem(`dismissed_cert_${volunteer.id}`, "true");
                    setShowCertCelebration(false);
                    setIsCertModalOpen(true);
                  }}
                  className="w-full py-3 bg-[#1E4D2B] hover:bg-[#15381E] text-white font-extrabold uppercase tracking-wider rounded-xl text-xs cursor-pointer shadow-lg transition-all"
                >
                  View & Download Certificate
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem(`dismissed_cert_${volunteer.id}`, "true");
                    setShowCertCelebration(false);
                  }}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-800 text-zinc-400 hover:text-white font-bold rounded-xl text-xs cursor-pointer transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Star Volunteer Celebration Modal */}
      <AnimatePresence>
        {showStarCelebration && starRecord && volunteer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 text-white w-full max-w-md rounded-3xl p-6 sm:p-8 text-center relative z-50 shadow-2xl"
              style={{ backgroundColor: "#141916" }}
            >
              {/* Confetti decoration */}
              <div className="text-4xl mb-4 animate-bounce">🏆 🌟 🥳</div>
              
              <h2 className="text-xl sm:text-2xl font-black text-amber-400 mb-3">
                Star Volunteer of the Week!
              </h2>
              
              <p className="text-sm text-zinc-350 leading-relaxed mb-6">
                Congratulations, {volunteer.name}! You have been dynamically selected as the **Star Volunteer** for the <strong className="text-white">{starRecord.week_label}</strong> in recognition of your outstanding dedication!
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    const weekKey = `dismissed_star_${volunteer.id}_${starRecord.week_label.replace(/\s+/g, '_')}`;
                    localStorage.setItem(weekKey, "true");
                    setShowStarCelebration(false);
                    setIsStarCertModalOpen(true);
                  }}
                  className="w-full py-3 bg-[#F3A61E] hover:bg-[#d68f12] text-black font-extrabold uppercase tracking-wider rounded-xl text-xs cursor-pointer shadow-lg transition-all"
                >
                  View & Download Star Certificate
                </button>
                <button
                  onClick={() => {
                    const weekKey = `dismissed_star_${volunteer.id}_${starRecord.week_label.replace(/\s+/g, '_')}`;
                    localStorage.setItem(weekKey, "true");
                    setShowStarCelebration(false);
                  }}
                  className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-800 text-zinc-400 hover:text-white font-bold rounded-xl text-xs cursor-pointer transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic premium Star Volunteer Certificate print modal */}
      <AnimatePresence>
        {isStarCertModalOpen && starRecord && volunteer && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <style>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                #star-certificate-print-area, #star-certificate-print-area * {
                  visibility: visible;
                }
                #star-certificate-print-area {
                  position: fixed;
                  left: 0;
                  top: 0;
                  width: 297mm;
                  height: 210mm;
                  margin: 0 !important;
                  padding: 2.5rem !important;
                  box-sizing: border-box;
                  background-color: white !important;
                  background-image: none !important;
                  color: #121212 !important;
                  border: 15px double #F3A61E !important;
                  box-shadow: none !important;
                  z-index: 99999;
                  display: flex !important;
                  flex-direction: column !important;
                  justify-content: space-between !important;
                }
                .no-print {
                  display: none !important;
                }
              }
              @page {
                size: A4 landscape;
                margin: 0;
              }
            `}</style>

            <div className="no-print flex justify-end w-full max-w-4xl mb-4 gap-3">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase tracking-wider rounded-xl text-xs cursor-pointer shadow-lg transition-all"
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => setIsStarCertModalOpen(false)}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-extrabold uppercase tracking-wider rounded-xl text-xs cursor-pointer transition-all"
              >
                Close Certificate
              </button>
            </div>

            <div
              id="star-certificate-print-area"
              className="relative w-full max-w-4xl aspect-[1.414/1] bg-white border-[16px] border-double border-[#F3A61E] p-8 sm:p-12 text-center text-[#0e1711] shadow-2xl flex flex-col justify-between rounded-xl select-none"
              style={{
                fontFamily: "'Outfit', 'Inter', sans-serif",
                backgroundImage: "radial-gradient(circle at center, #fdfdfd 0%, #fefcf7 100%)"
              }}
            >
              {/* Background watermark gold star */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <svg className="w-[300px] h-[300px] text-[#F3A61E]/5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.858 1.4-8.168L.132 9.21l8.2-1.192z" />
                </svg>
              </div>

              {/* Top Branding Section */}
              <div className="relative z-10 flex flex-col items-center">
                <img
                  src="/kanha_logo_round.png"
                  alt="Kanha Foundation Logo"
                  className="h-16 w-16 object-contain mb-3"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=120&auto=format&fit=crop&q=80";
                  }}
                />
                <h4 className="text-sm font-black tracking-[0.25em] text-[#1E4D2B] uppercase mb-1">KANHA FOUNDATION</h4>
                <p className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold">Registered Charity & Volunteer Network</p>
                <div className="w-24 h-0.5 bg-[#F3A61E] mt-3 mb-1"></div>
              </div>

              {/* Middle Certificate Core */}
              <div className="relative z-10 my-auto space-y-4">
                <h2 className="text-3xl font-black tracking-tight text-[#F3A61E] font-serif uppercase">
                  Star Volunteer Certificate
                </h2>
                
                <div className="space-y-1.5 mt-2">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">This Weekly Award is proudly presented to</p>
                  <h3 className="text-2xl font-black text-[#1E4D2B] underline decoration-[#F3A61E] decoration-2 underline-offset-8">
                    {volunteer.name.toUpperCase()}
                  </h3>
                </div>

                <p className="text-sm text-zinc-655 max-w-2xl mx-auto leading-relaxed mt-4">
                  in recognition of their outstanding performance and dedication as the <strong className="text-[#F3A61E]">Star Volunteer of the Week ({starRecord.week_label})</strong> at Kanha Foundation. They achieved <strong className="text-[#1E4D2B]">Grade {starRecord.grade}</strong> by successfully completing volunteer tasks.
                </p>

                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-4 text-xs font-bold text-zinc-600">
                  <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-150/40">
                    <span className="block text-[8px] text-zinc-400 uppercase tracking-wider mb-0.5">Award Category</span>
                    <span className="text-xs text-[#1E4D2B] font-black">Star Volunteer</span>
                  </div>
                  <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-150/40">
                    <span className="block text-[8px] text-zinc-400 uppercase tracking-wider mb-0.5">Tasks Completed</span>
                    <span className="text-xs text-[#1E4D2B] font-black">{starRecord.tasks_completed || 0} Drives</span>
                  </div>
                  <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-150/40">
                    <span className="block text-[8px] text-zinc-400 uppercase tracking-wider mb-0.5">Weekly Grade</span>
                    <span className="text-xs text-[#1E4D2B] font-black">Grade {starRecord.grade}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Stamp and Signature block */}
              <div className="relative z-10 flex justify-between items-end border-t border-zinc-200/60 pt-6 mt-6 text-left">
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Verification ID</p>
                  <p className="text-xs font-extrabold text-[#F3A61E]">{starRecord.id}</p>
                </div>
                
                {/* Stamp Seal */}
                <div className="h-16 w-16 border-2 border-dashed border-[#F3A61E]/40 rounded-full flex items-center justify-center text-[#F3A61E] opacity-60 relative select-none">
                  <div className="text-[8px] font-black uppercase text-center tracking-wider">
                    STAR<br />VOLUNTEER<br />SEAL
                  </div>
                </div>

                <div className="text-right w-44">
                  <div className="h-8 border-b border-zinc-300 w-full mb-1"></div>
                  <p className="text-[10px] font-black text-[#1E4D2B] uppercase tracking-wider">Authorized Officer</p>
                  <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Kanha Foundation</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
