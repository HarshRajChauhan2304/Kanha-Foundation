"use client";
import React, { useState, useEffect } from 'react';
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
  const [proofMedia, setProofMedia] = useState("");
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
    setProofMedia("");
    setVolunteerFeedback("");
    setCompletionError("");
    setIsCompletionModalOpen(true);
  };

  const handleCompletionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompletionError("");

    if (!moneyReceived || !moneySpent || !proofMedia || !volunteerFeedback.trim()) {
      setCompletionError("Please fill in all required fields and upload a media receipt.");
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
          proof_media: proofMedia,
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
          gender: formGender
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
    <div className="bg-zinc-950 text-white min-h-screen py-24 px-4 flex items-center justify-center font-sans relative overflow-hidden">
      
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
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">City / Location</label>
                    <p className="text-sm font-extrabold text-white mt-1">{volunteer?.city}</p>
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

                {/* Proof Media File Upload */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 ml-1">Upload Proof Media (Photo/Receipt/Video)</label>
                  <div className="relative border-2 border-dashed border-zinc-800 rounded-2xl h-36 flex flex-col items-center justify-center bg-zinc-950/50 hover:border-emerald-500 transition-colors cursor-pointer overflow-hidden">
                    {proofMedia ? (
                      proofMedia.endsWith(".mp4") || proofMedia.endsWith(".mov") ? (
                        <video src={proofMedia} className="h-full w-full object-cover" controls />
                      ) : (
                        <img src={proofMedia} alt="Proof Preview" className="h-full w-full object-cover" />
                      )
                    ) : (
                      <div className="text-center p-4 text-zinc-550 hover:text-emerald-550 transition-colors">
                        {isProofUploading ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent border-emerald-500 mx-auto" />
                        ) : (
                          <>
                            <svg className="h-8 w-8 mx-auto mb-2 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[10px] font-black uppercase tracking-wider block">Select File (Image or Video)</span>
                          </>
                        )}
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsProofUploading(true);
                        setCompletionError("");
                        const formData = new FormData();
                        formData.append("file", file);
                        try {
                          const res = await fetch('/api/upload', { method: 'POST', body: formData });
                          const data = await res.json();
                          if (data.success) {
                            setProofMedia(data.url);
                          } else {
                            setCompletionError(data.error || "Failed to upload media.");
                          }
                        } catch (err) {
                          setCompletionError("Error uploading proof file.");
                        } finally {
                          setIsProofUploading(false);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
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
                  <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-black/40 h-44 flex items-center justify-center">
                    {viewingTaskProof.proof_media ? (
                      viewingTaskProof.proof_media.endsWith(".mp4") || viewingTaskProof.proof_media.endsWith(".mov") ? (
                        <video src={viewingTaskProof.proof_media} className="h-full w-full object-cover animate-fade-in" controls />
                      ) : (
                        <img src={viewingTaskProof.proof_media} alt="Proof Media" className="h-full w-full object-cover animate-fade-in" />
                      )
                    ) : (
                      <span className="text-xs text-zinc-550 italic">No media uploaded</span>
                    )}
                  </div>
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

    </div>
  );
}
