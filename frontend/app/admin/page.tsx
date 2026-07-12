"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import causesDataFallback from '@/data/causes.json';

// Models
interface Cause {
  id: number;
  title: string;
  price: string;
  image: string;
  video?: string;
  category: string;
}

interface Review {
  id: number;
  title: string;
  desc: string;
  author: string;
  video: string;
}

interface Blog {
  id: number;
  image: string;
  title: string;
  date: string;
  excerpt: string;
}

interface Story {
  id: number;
  url: string;
  alt: string;
}

interface Donation {
  id: number;
  name: string;
  amount: string;
  time: string;
  created_at?: string;
  donation_for?: string;
  honoree?: string;
  wish?: string;
  transaction_date?: string;
  address?: string;
}

interface HighlightItem {
  id: number;
  name: string;
  role: string;
  image: string;
  quote: string;
}

interface VolunteerApplication {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  motivation: string;
  skills: string[];
  created_at: string;
  status?: string;
  profile_photo?: string;
  gender?: string;
}

interface PageMediaConfig {
  key: string;
  url: string;
  title: string;
  type: string;
}

interface PageTextConfig {
  key: string;
  value: string;
  title: string;
}

interface VolunteerTask {
  id: number;
  volunteer_id: number;
  task_title: string;
  task_description: string;
  task_date: string;
  task_time: string;
  status: string;
  created_at?: string;
  assigned_money?: number;
  money_received?: number;
  money_spent?: number;
  proof_media?: string;
  feedback?: string;
}

type TabType = "Causes" | "Reviews" | "Blogs" | "Stories" | "DetailedStories" | "SuccessStories" | "Donations" | "Highlights" | "Applications" | "Tasks" | "PageMedia" | "PageTexts" | "StatsCards" | "Categories" | "RoleManagement" | "Navbar" | "Footer" | "AdminProfile" | "StarVolunteers" | "ContactInfo" | "ContactSubmissions" | "WhatsAppCommunity";
type AuthMode = "signin" | "signup" | "forgot";

const KEY_MAP: Record<string, { title: string; type: string }> = {
  "home_hero": { title: "Home Page - Main Hero Background (Video/Image)", type: "video" },
  "home_hero_video": { title: "Home Page - Hero Background Video", type: "video" },
  "about_header": { title: "About Page - Top Banner Header Image", type: "image" },
  "about_vision": { title: "About Page - Our Vision Section Image", type: "image" },
  "about_mission": { title: "About Page - Our Mission Section Image", type: "image" },
  "about_team": { title: "About Page - Our Team Section Image", type: "image" },
  "about_tutorial_video": { title: "About Page - How to Donate Tutorial Video", type: "video" },
  "about_footer_banner": { title: "About Page - Footer Banner (Smiling Kids)", type: "image" },
  "home_volunteer_banner": { title: "Home Page - Volunteer Onboarding Banner", type: "image" },
  "home_education_campaign": { title: "Home Page - Education Campaign Banner", type: "image" },
  "home_birthday_campaign": { title: "Home Page - Birthday Campaign Banner", type: "image" },
  "home_trust_top_left": { title: "Home Page - Trust Section (Top-Left Image)", type: "image" },
  "home_trust_bottom_right": { title: "Home Page - Trust Section (Bottom-Right Image)", type: "image" },
  "impacts_header": { title: "Our Impact Page - Top Banner Header Image", type: "image" },
  "causes_header": { title: "Causes Page - Top Banner Header Image", type: "image" }
};

const TEXT_KEY_MAP: Record<string, { title: string }> = {
  "about_banner_title_prefix": { title: "About Page - Top Banner Title Prefix Text" },
  "about_banner_title_highlight": { title: "About Page - Top Banner Title Highlighted Text" },
  "impacts_banner_title_prefix": { title: "Our Impact Page - Top Banner Title Prefix Text" },
  "impacts_banner_title_highlight": { title: "Our Impact Page - Top Banner Title Highlighted Text" },
  "impacts_banner_subtitle": { title: "Our Impact Page - Top Banner Subtitle Text" },
  "causes_banner_title_prefix": { title: "Causes Page - Top Banner Title Prefix Text" },
  "causes_banner_title_highlight": { title: "Causes Page - Top Banner Title Highlighted Text" },
  "about_summary_text": { title: "About Page - Organization Summary Text" },
  "about_vision_title": { title: "About Page - Vision Section Title" },
  "about_vision_desc": { title: "About Page - Vision Section Description" },
  "about_mission_title": { title: "About Page - Mission Section Title" },
  "about_mission_desc": { title: "About Page - Mission Section Description" },
  "about_team_title": { title: "About Page - Team Section Title" },
  "about_team_desc": { title: "About Page - Team Section Description" },
  "about_leadership_title": { title: "About Page - Leadership Section Title" },
  "about_leadership_sub": { title: "About Page - Leadership Section Subtitle" },
  "about_volunteers_title": { title: "About Page - Volunteers Section Title" },
  "about_volunteers_sub": { title: "About Page - Volunteers Section Subtitle" },
  "about_footer_cta_title": { title: "About Page - Footer CTA Section Title" },
  "about_footer_cta_desc": { title: "About Page - Footer CTA Section Description" },
  "impacts_intro_title": { title: "Our Impact Page - Intro Title" },
  "impacts_intro_desc_1": { title: "Our Impact Page - Intro Paragraph 1" },
  "impacts_intro_desc_2": { title: "Our Impact Page - Intro Paragraph 2" },
  "impacts_intro_proof": { title: "Our Impact Page - Proof Guarantee Text" },
  "impacts_timeline_title": { title: "Our Impact Page - Timeline Heading Title" },
  "impacts_timeline_subtitle": { title: "Our Impact Page - Timeline Subtitle Text" },
  "whatsapp_community_link": { title: "Global Settings - WhatsApp Community Invitation Link" }
};

const CATEGORIES = [
  "Birthday Giving",
  "Anniversary Giving",
  "Animal",
  "Giving To The Needy",
  "Nature",
  "Memorial Giving",
  "Women Care",
  "Education"
];

export default function AdminPanelPage() {
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  
  // Auth Form Inputs
  const [authUsername, setAuthUsername] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>("Causes");

  // Highlights sub-tab state
  const [highlightSubTab, setHighlightSubTab] = useState<"directors" | "volunteers">("directors");

  // Database lists
  const [causes, setCauses] = useState<Cause[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [detailedStories, setDetailedStories] = useState<any[]>([]);
  const [successStories, setSuccessStories] = useState<any[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [contactInfoList, setContactInfoList] = useState<any[]>([]);
  const [contactSubmissionsList, setContactSubmissionsList] = useState<any[]>([]);
  const [volApps, setVolApps] = useState<VolunteerApplication[]>([]);
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [pageMedia, setPageMedia] = useState<PageMediaConfig[]>([]);
  const [pageTexts, setPageTexts] = useState<PageTextConfig[]>([]);
  const [statsCards, setStatsCards] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [navbarConfig, setNavbarConfig] = useState<any>({
    logo: "",
    name: "",
    fontFamily: "Inter",
    fontSize: 20,
    logoSize: 104
  });
  const [footerConfig, setFooterConfig] = useState<any>({
    logo: "",
    companyOverview: [],
    quickLinks: [],
    contact: { email: "", ctaText: "" },
    social: []
  });

  // Task form fields states
  const [taskFormVolunteerId, setTaskFormVolunteerId] = useState<string>("");
  const [taskFormTitle, setTaskFormTitle] = useState("");
  const [taskFormDesc, setTaskFormDesc] = useState("");
  const [taskFormDate, setTaskFormDate] = useState("");
  const [taskFormTime, setTaskFormTime] = useState("");
  const [taskFormStatus, setTaskFormStatus] = useState("Pending");
  const [taskFormAssignedMoney, setTaskFormAssignedMoney] = useState("");
  const [whatsappCommunityLinkInput, setWhatsappCommunityLinkInput] = useState("");
  const [isSavingWhatsappLink, setIsSavingWhatsappLink] = useState(false);

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Task Completion Proof View States for Admin
  const [isViewProofModalOpen, setIsViewProofModalOpen] = useState(false);
  const [viewingTaskProof, setViewingTaskProof] = useState<any | null>(null);

  const openViewProofModal = (task: any) => {
    setViewingTaskProof(task);
    setIsViewProofModalOpen(true);
  };

  // Report generation states
  const [reportFilterType, setReportFilterType] = useState<"date" | "month">("date");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportMonth, setReportMonth] = useState((new Date().getMonth() + 1).toString());
  const [reportYear, setReportYear] = useState(new Date().getFullYear().toString());
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Highlights database lists
  const [directors, setDirectors] = useState<HighlightItem[]>([]);
  const [volunteers, setVolunteers] = useState<HighlightItem[]>([]);
  const [extraData, setExtraData] = useState({
    extraAmount: 0,
    uniqueDonors: 0,
    extraBirthday: 0,
    extraMeals: 0,
    extraLives: 0,
    extraStudykit: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Form states (unified fields)
  const [formTitle, setFormTitle] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState("Birthday Giving");
  const [formImage, setFormImage] = useState("");
  const [formVideo, setFormVideo] = useState("");
  
  // Reviews/Donations/Highlights/Applications/Texts fields
  const [formDesc, setFormDesc] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formAddress, setFormAddress] = useState("");

  // Star Volunteers fields
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formGrade, setFormGrade] = useState("A+");
  const [formWeekLabel, setFormWeekLabel] = useState("");
  const [formTasksCompleted, setFormTasksCompleted] = useState("0");
  const [formVolunteerId, setFormVolunteerId] = useState("");
  const [starVolunteers, setStarVolunteers] = useState<any[]>([]);
  
  // Blog fields
  const [formDate, setFormDate] = useState("");
  const [formExcerpt, setFormExcerpt] = useState("");
  
  // Stories fields
  const [formAlt, setFormAlt] = useState("");
  const [formHonoree, setFormHonoree] = useState("");
  const [formWish, setFormWish] = useState("");

  // Applications Skills & Status
  const [formSkills, setFormSkills] = useState<string[]>([]);
  const [formStatus, setFormStatus] = useState("Pending");
  const [formGender, setFormGender] = useState("");
  const [formProfilePhoto, setFormProfilePhoto] = useState("");
  const [formTransactionDate, setFormTransactionDate] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("user");
  const [causesList, setCausesList] = useState<any[]>(causesDataFallback);

  const [alertMsg, setAlertMsg] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedDB = async () => {
    if (!window.confirm("WARNING: This will clear existing Supabase tables and sync them fresh with your local JSON data files. Continue?")) return;

    setIsSeeding(true);
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        triggerAlert("Database synced successfully with local JSON files!");
        fetchData();
      } else {
        triggerAlert(data.error || "Failed to sync database.");
      }
    } catch (error) {
      console.error("Seeding error:", error);
      triggerAlert("Error syncing database.");
    } finally {
      setIsSeeding(false);
    }
  };

  // Refs for file inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Media Settings Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMediaKey, setSelectedMediaKey] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<string>("image");

  const triggerMediaUpload = (key: string, type: string) => {
    setSelectedMediaKey(key);
    setSelectedMediaType(type);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleMediaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedMediaKey) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Upload file
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        triggerAlert(uploadData.error || "Upload failed.");
        return;
      }

      // 2. Save configuration in database
      const updateRes = await fetch('/api/page-media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: selectedMediaKey, url: uploadData.url, title: pageMedia.find(m => m.key === selectedMediaKey)?.title || selectedMediaKey, type: selectedMediaType })
      });
      const updateData = await updateRes.json();
      if (updateData.success) {
        triggerAlert("Media asset updated successfully!");
        fetchData();
      } else {
        triggerAlert(updateData.error || "Failed to update asset.");
      }
    } catch (error) {
      console.error("Media upload error:", error);
      triggerAlert("Error updating media asset.");
    } finally {
      setIsUploading(false);
      setSelectedMediaKey(null);
    }
  };

  // Admin Profile states
  const [adminUsername, setAdminUsername] = useState("Admin");
  const [adminEmail, setAdminEmail] = useState("admin@kanhafoundation.org");
  const [adminAvatar, setAdminAvatar] = useState("https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80");
  const [adminPhone, setAdminPhone] = useState("");
  const [isAdminPhotoUploading, setIsAdminPhotoUploading] = useState(false);

  // Check login state on mount
  useEffect(() => {
    const authState = localStorage.getItem("admin_auth");
    if (authState === "true") {
      setIsLoggedIn(true);
    }
    const storedUsername = localStorage.getItem("admin_username") || "Admin";
    const storedEmail = localStorage.getItem("admin_email") || "admin@kanhafoundation.org";
    const storedAvatar = localStorage.getItem("admin_avatar") || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80";
    const storedPhone = localStorage.getItem("admin_phone") || "";
    setAdminUsername(storedUsername);
    setAdminEmail(storedEmail);
    setAdminAvatar(storedAvatar);
    setAdminPhone(storedPhone);
    setIsMounted(true);
  }, []);

  // Fetch Helper
  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch dynamic categories
      try {
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        if (Array.isArray(catData) && catData.length > 0) {
          setCategoriesList(catData);
        }
      } catch (catErr) {
        console.error("Error loading categories:", catErr);
      }

      // Fetch volunteer applications always for notifications!
      try {
        const volRes = await fetch('/api/volunteer');
        const volData = await volRes.json();
        setVolApps(Array.isArray(volData) ? volData : []);
      } catch (volErr) {
        console.error("Error loading volunteer applications for notification check:", volErr);
      }

      if (activeTab === "Causes") {
        const res = await fetch('/api/causes');
        const data = await res.json();
        setCauses(Array.isArray(data) ? data : []);
      } else if (activeTab === "Categories") {
        // categoriesList already loaded
      } else if (activeTab === "Reviews") {
        const res = await fetch('/api/reviews');
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } else if (activeTab === "Blogs") {
        const res = await fetch('/api/blogs');
        const data = await res.json();
        setBlogs(Array.isArray(data) ? data : []);
      } else if (activeTab === "Stories") {
        const res = await fetch('/api/stories');
        const data = await res.json();
        setStories(Array.isArray(data) ? data : []);
      } else if (activeTab === "DetailedStories") {
        const res = await fetch('/api/stories/detailed');
        const data = await res.json();
        setDetailedStories(Array.isArray(data) ? data : []);
      } else if (activeTab === "SuccessStories") {
        const res = await fetch('/api/success-stories');
        const data = await res.json();
        setSuccessStories(Array.isArray(data) ? data : []);
      } else if (activeTab === "Donations") {
        const res = await fetch('/api/donations', { cache: 'no-store' });
        const data = await res.json();
        setDonations(Array.isArray(data) ? data : []);
        try {
          const causesRes = await fetch('/api/causes');
          const causesData = await causesRes.json();
          if (Array.isArray(causesData) && causesData.length > 0) {
            setCausesList(causesData);
          }
        } catch (e) {
          console.error("Failed to load causes for donations:", e);
        }
      } else if (activeTab === "Highlights") {
        const res = await fetch('/api/about-highlights');
        const data = await res.json();
        if (data && !data.error) {
          setDirectors(Array.isArray(data.directors) ? data.directors : []);
          setVolunteers(Array.isArray(data.volunteers) ? data.volunteers : []);
        } else {
          setDirectors([]);
          setVolunteers([]);
        }
      } else if (activeTab === "Applications") {
        const res = await fetch('/api/volunteer');
        const data = await res.json();
        setVolApps(Array.isArray(data) ? data : []);
      } else if (activeTab === "Tasks") {
        const res = await fetch('/api/volunteer/tasks');
        const data = await res.json();
        setTasks(data.success && Array.isArray(data.tasks) ? data.tasks : []);
        
        // Populate volApps list for selection dropdown
        const volRes = await fetch('/api/volunteer');
        const volData = await volRes.json();
        setVolApps(Array.isArray(volData) ? volData.filter((a: any) => a.status === "Approved") : []);
      } else if (activeTab === "StarVolunteers") {
        const res = await fetch('/api/volunteer/star');
        const data = await res.json();
        setStarVolunteers(data.success && Array.isArray(data.stars) ? data.stars : []);
        
        const volRes = await fetch('/api/volunteer');
        const volData = await volRes.json();
        setVolApps(Array.isArray(volData) ? volData.filter((a: any) => a.status === "Approved") : []);
      } else if (activeTab === "ContactInfo") {
        const res = await fetch('/api/contact-info');
        const data = await res.json();
        setContactInfoList(Array.isArray(data) ? data : []);
      } else if (activeTab === "ContactSubmissions") {
        const res = await fetch('/api/contact');
        const data = await res.json();
        setContactSubmissionsList(Array.isArray(data) ? data : []);
      } else if (activeTab === "PageMedia") {
        const res = await fetch('/api/page-media', { cache: 'no-store' });
        const data = await res.json();
        setPageMedia(Array.isArray(data) ? data : []);
      } else if (activeTab === "PageTexts") {
        const res = await fetch('/api/page-texts');
        const data = await res.json();
        setPageTexts(Array.isArray(data) ? data : []);
      } else if (activeTab === "WhatsAppCommunity") {
        const res = await fetch('/api/page-texts');
        const data = await res.json();
        setPageTexts(Array.isArray(data) ? data : []);
        if (Array.isArray(data)) {
          const matched = data.find((t: any) => t.key === "whatsapp_community_link");
          setWhatsappCommunityLinkInput(matched ? matched.value : "");
        } else {
          setWhatsappCommunityLinkInput("");
        }
      } else if (activeTab === "StatsCards") {
        const res = await fetch('/api/stats-cards');
        const data = await res.json();
        setStatsCards(Array.isArray(data) ? data : []);

        // Also fetch donations to calculate live stats
        try {
          const donRes = await fetch('/api/donations', { cache: 'no-store' });
          const donData = await donRes.json();
          if (Array.isArray(donData)) {
            let extraAmount = 0;
            let extraBirthday = 0;
            let extraMeals = 0;
            let extraLives = 0;
            let extraStudykit = 0;
            const uniqueNames = new Set<string>();

            donData.forEach(d => {
              const clean = d.amount ? d.amount.replace(/[^\d.]/g, "") : "0";
              const amt = parseFloat(clean) || 0;
              extraAmount += amt;

              if (d.name) {
                uniqueNames.add(d.name.trim().toLowerCase());
              }

              if (d.time && d.time.includes('|')) {
                try {
                  const metaStr = d.time.split('|')[1];
                  const meta = JSON.parse(metaStr);
                  if (meta) {
                    if (meta.birthday) extraBirthday += meta.birthday;
                    if (meta.meals) extraMeals += meta.meals;
                    if (meta.lives) extraLives += meta.lives;
                    if (meta.studykit) extraStudykit += meta.studykit;
                  }
                } catch (e) {
                  console.error("Failed to parse donation metadata:", e);
                }
              }
            });

            setExtraData({
              extraAmount,
              uniqueDonors: uniqueNames.size,
              extraBirthday,
              extraMeals,
              extraLives,
              extraStudykit
            });
          }
        } catch (donErr) {
          console.error("Error loading donations for stats calculation:", donErr);
        }
      } else if (activeTab === "RoleManagement") {
        try {
          const userRes = await fetch('/api/admin/users');
          const userData = await userRes.json();
          setUsersList(userData.success && Array.isArray(userData.users) ? userData.users : []);

          const volRes = await fetch('/api/volunteer');
          const volData = await volRes.json();
          setVolApps(Array.isArray(volData) ? volData.filter((a: any) => a.status === "Approved") : []);
        } catch (roleErr) {
          console.error("Error loading role data:", roleErr);
        }
      } else if (activeTab === "Navbar") {
        try {
          const res = await fetch('/api/navbar');
          const data = await res.json();
          if (data && !data.error) {
            setNavbarConfig(data);
          }
        } catch (err) {
          console.error("Error loading navbar config:", err);
        }
      } else if (activeTab === "Footer") {
        try {
          const res = await fetch('/api/footer');
          const data = await res.json();
          if (data && !data.error) {
            setFooterConfig(data);
          }
        } catch (err) {
          console.error("Error loading footer config:", err);
        }
      }
    } catch (error) {
      console.error(`Error loading ${activeTab}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn, activeTab]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    try {
      if (authMode === "signin") {
        const res = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: "signin", username: authUsername, password: authPassword })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("admin_auth", "true");
          const finalUsername = data.username || authUsername;
          const finalEmail = data.email || "";
          const finalAvatar = data.avatar || "";

          localStorage.setItem("admin_username", finalUsername);
          localStorage.setItem("admin_email", finalEmail);
          localStorage.setItem("admin_avatar", finalAvatar);

          setAdminUsername(finalUsername);
          setAdminEmail(finalEmail);
          setAdminAvatar(finalAvatar || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80");

          window.dispatchEvent(new Event("user_avatar_update"));
          setIsLoggedIn(true);
        } else {
          setAuthError(data.error || "Authentication failed.");
        }
      } 
      
      else if (authMode === "signup") {
        if (authPassword !== authConfirmPassword) {
          setAuthError("Passwords do not match.");
          return;
        }
        const res = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: "signup", username: authUsername, email: authEmail, password: authPassword })
        });
        const data = await res.json();
        if (data.success) {
          setAuthSuccess("Registration successful! Toggling to Sign In...");
          setTimeout(() => {
            setAuthMode("signin");
            setAuthSuccess("");
            setAuthPassword("");
            setAuthConfirmPassword("");
          }, 2000);
        } else {
          setAuthError(data.error || "Signup failed.");
        }
      } 
      
      else if (authMode === "forgot") {
        const res = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: "reset", email: authEmail })
        });
        const data = await res.json();
        if (data.success) {
          setAuthSuccess("Admin password reset link sent to your email!");
          setTimeout(() => {
            setAuthMode("signin");
            setAuthSuccess("");
            setAuthEmail("");
          }, 3000);
        } else {
          setAuthError(data.error || "Forgot Password reset failed.");
        }
      }
    } catch (error) {
      console.error("Auth action error:", error);
      setAuthError("An error occurred during authentication.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    window.location.href = "/signin";
  };

  const handleSaveNavbar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/navbar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(navbarConfig)
      });
      const data = await res.json();
      if (data && !data.error) {
        triggerAlert("Navbar configuration updated successfully!");
        fetchData();
      } else {
        triggerAlert(data.error || "Failed to update Navbar.");
      }
    } catch (err) {
      console.error(err);
      triggerAlert("Error saving Navbar configuration.");
    }
  };

  const handleSaveFooter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/footer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footerConfig)
      });
      const data = await res.json();
      if (data && !data.error) {
        triggerAlert("Footer configuration updated successfully!");
        fetchData();
      } else {
        triggerAlert(data.error || "Failed to update Footer.");
      }
    } catch (err) {
      console.error(err);
      triggerAlert("Error saving Footer configuration.");
    }
  };

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(""), 4000);
  };

  // File Upload Processor
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldSetter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        fieldSetter(data.url);
        triggerAlert("File uploaded successfully!");
      } else {
        triggerAlert(data.error || "Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      triggerAlert("Error uploading file.");
    } finally {
      setIsUploading(false);
    }
  };

  // Modals Actions
  const openAddModal = () => {
    setEditingItem(null);
    setFormTitle(
      activeTab === "PageMedia" 
        ? "Home Page - Main Hero Background (Video/Image)" 
        : activeTab === "PageTexts" 
        ? "About Page - Top Banner Title Prefix Text" 
        : ""
    );
    setFormPrice("");
    setFormCategory(categoriesList[0]?.name || "Birthday Giving");
    setFormImage("");
    setFormVideo("");
    setFormDesc("");
    setFormAuthor(
      activeTab === "PageMedia" 
        ? "home_hero" 
        : activeTab === "PageTexts" 
        ? "about_banner_title_prefix" 
        : ""
    );
    setFormDate("");
    setFormExcerpt("");
    setFormAlt("");
    setFormHonoree("");
    setFormWish("");
    setFormSkills([]);
    setFormStatus("Pending");
    setFormGender("");
    setFormProfilePhoto("");
    setSelectedMediaType("image");
    setFormEmail("");
    setFormPhone("");
    setFormGrade("A+");
    setFormWeekLabel("");
    setFormTasksCompleted("0");
    setFormVolunteerId("");
    setFormPassword("");
    setFormRole("user");
    
    if (activeTab === "StatsCards") {
      setFormImage("rupee");
      setFormStatus("none");
    }
    
    if (activeTab === "Donations") {
      setFormExcerpt("General Support");
      setFormTransactionDate(getFormattedDate());
      setFormAddress("");
    }
    
    if (activeTab === "DetailedStories") {
      setFormCategory("Food Relief");
    }
    
    // Clear Tasks states
    setTaskFormVolunteerId("");
    setTaskFormTitle("");
    setTaskFormDesc("");
    setTaskFormDate("");
    setTaskFormTime("");
    setTaskFormStatus("Pending");
    setTaskFormAssignedMoney("");
    
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    
    // Fill states based on active tab
    if (activeTab === "Categories") {
      setFormTitle(item.name);
    } else if (activeTab === "Causes") {
      setFormTitle(item.title);
      setFormPrice(item.price);
      setFormCategory(item.category);
      setFormImage(item.image);
      setFormVideo(item.video || "");
    } else if (activeTab === "Reviews") {
      setFormTitle(item.title);
      setFormDesc(item.desc);
      setFormAuthor(item.author);
      setFormVideo(item.video);
    } else if (activeTab === "Blogs") {
      setFormTitle(item.title);
      setFormImage(item.image);
      setFormDate(item.date);
      setFormExcerpt(item.excerpt);
    } else if (activeTab === "Stories") {
      setFormImage(item.url);
      setFormAlt(item.alt);
    } else if (activeTab === "DetailedStories") {
      setFormTitle(item.title);
      setFormCategory(item.category);
      setFormDesc(item.desc);
      setFormImage(item.image);
      setFormExcerpt(item.stats);
      setFormDate(item.date);
    } else if (activeTab === "SuccessStories") {
      setFormTitle(item.title);
      setFormDesc(item.desc);
      setFormImage(item.image);
    } else if (activeTab === "Donations") {
      setFormTitle(item.name);
      setFormPrice(item.amount);
      setFormDesc(item.time || "");
      setFormExcerpt(item.donation_for || "General Support");
      setFormHonoree(item.honoree || "");
      setFormWish(item.wish || "");
      setFormTransactionDate(item.transaction_date || (item.time ? item.time.split('|')[0] : "") || getFormattedDate());
      setFormAddress(item.address || "");
    } else if (activeTab === "StatsCards") {
      setFormTitle(item.title);
      setFormPrice(item.base_value?.toString() || "0");
      setFormAuthor(item.prefix || "");
      setFormCategory(item.suffix || "");
      setFormImage(item.icon || "rupee");
      setFormStatus(item.category || "none");
    } else if (activeTab === "Highlights") {
      setFormTitle(item.name);
      setFormPrice(item.role);
      setFormImage(item.image);
      setFormDesc(item.quote);
    } else if (activeTab === "Applications") {
      setFormTitle(item.name);
      setFormAuthor(item.email);
      setFormPrice(item.phone);
      setFormCategory(item.city);
      setFormDesc(item.motivation || "");
      setFormSkills(item.skills || []);
      setFormStatus(item.status || "Pending");
      setFormGender(item.gender || "");
      setFormProfilePhoto(item.profile_photo || "");
    } else if (activeTab === "RoleManagement") {
      setFormTitle(item.name || "");
      setFormEmail(item.email || "");
      setFormPhone(item.phone || "");
      setFormPassword(item.password || "");
      setFormRole(item.role || "user");
    } else if (activeTab === "Tasks") {
      setTaskFormVolunteerId(item.volunteer_id?.toString() || "");
      setTaskFormTitle(item.task_title);
      setTaskFormDesc(item.task_description || "");
      setTaskFormDate(item.task_date);
      setTaskFormTime(item.task_time);
      setTaskFormStatus(item.status || "Pending");
      setTaskFormAssignedMoney(item.assigned_money?.toString() || "0");
    } else if (activeTab === "PageMedia") {
      setFormTitle(item.title);
      setFormAuthor(item.key); 
      setFormImage(item.url);
      setSelectedMediaType(item.type);
    } else if (activeTab === "PageTexts") {
      setFormTitle(item.title);
      setFormAuthor(item.key); 
      setFormDesc(item.value);
    } else if (activeTab === "StarVolunteers") {
      setFormTitle(item.name);
      setFormEmail(item.email || "");
      setFormPhone(item.phone || "");
      setFormGender(item.gender || "Male");
      setFormProfilePhoto(item.profile_photo || "");
      setFormGrade(item.grade || "A+");
      setFormDesc(item.reason || "");
      setFormWeekLabel(item.week_label || "");
      setFormTasksCompleted(item.tasks_completed?.toString() || "0");
      setFormVolunteerId(item.volunteer_id?.toString() || "");
    } else if (activeTab === "ContactInfo") {
      setFormTitle(item.title);
      setFormDesc(item.value);
      setFormStatus(item.type);
      setFormImage(item.icon);
    }
    setIsModalOpen(true);
  };

  const openOverrideModal = (item: any) => {
    setEditingItem(null); // Save as new manual configuration
    setFormTitle(item.name);
    setFormEmail(item.email || "");
    setFormPhone(item.phone || "");
    setFormGender(item.gender || "Male");
    setFormProfilePhoto(item.profile_photo || "");
    setFormGrade(item.grade || "A+");
    setFormDesc(item.reason || "");
    setFormWeekLabel(item.week_label || "");
    setFormTasksCompleted(item.tasks_completed?.toString() || "0");
    setFormVolunteerId(item.volunteer_id?.toString() || "");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = activeTab === "Highlights" 
      ? "/api/about-highlights" 
      : activeTab === "Applications"
      ? "/api/volunteer"
      : activeTab === "Tasks"
      ? "/api/volunteer/tasks"
      : activeTab === "PageMedia"
      ? "/api/page-media"
      : activeTab === "PageTexts"
      ? "/api/page-texts"
      : activeTab === "StatsCards"
      ? "/api/stats-cards"
      : activeTab === "StarVolunteers"
      ? "/api/volunteer/star"
      : activeTab === "DetailedStories"
      ? "/api/stories/detailed"
      : activeTab === "SuccessStories"
      ? "/api/success-stories"
      : activeTab === "RoleManagement"
      ? "/api/admin/users"
      : `/api/${activeTab.toLowerCase()}`;
    
    // Build payload based on Tab
    let bodyPayload: any = {};
    if (editingItem) {
      bodyPayload.id = editingItem.id;
    }

    if (activeTab === "Categories") {
      if (!formTitle.trim()) {
        triggerAlert("Please fill all required fields.");
        return;
      }
      bodyPayload = { ...bodyPayload, name: formTitle };
    } else if (activeTab === "Causes") {
      if (!formTitle.trim() || !formPrice.trim()) {
        triggerAlert("Please fill all required fields.");
        return;
      }
      bodyPayload = { ...bodyPayload, title: formTitle, price: formPrice, category: formCategory, image: formImage, video: formVideo };
    } else if (activeTab === "Reviews") {
      if (!formTitle.trim() || !formDesc.trim() || !formAuthor.trim()) {
        triggerAlert("Please fill all required fields.");
        return;
      }
      bodyPayload = { ...bodyPayload, title: formTitle, desc: formDesc, author: formAuthor, video: formVideo };
    } else if (activeTab === "Blogs") {
      if (!formTitle.trim() || !formExcerpt.trim()) {
        triggerAlert("Please fill all required fields.");
        return;
      }
      bodyPayload = { ...bodyPayload, title: formTitle, image: formImage, date: formDate, excerpt: formExcerpt };
    } else if (activeTab === "Stories") {
      if (!formImage.trim() || !formAlt.trim()) {
        triggerAlert("Please fill all required fields.");
        return;
      }
      bodyPayload = { ...bodyPayload, url: formImage, alt: formAlt };
    } else if (activeTab === "DetailedStories") {
      if (!formTitle.trim() || !formCategory.trim() || !formDesc.trim()) {
        triggerAlert("Please fill all required fields (Title, Category, and Description).");
        return;
      }
      bodyPayload = { 
        ...bodyPayload, 
        title: formTitle, 
        category: formCategory, 
        desc: formDesc, 
        image: formImage || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80", 
        stats: formExcerpt, 
        date: formDate || "July 2026"
      };
    } else if (activeTab === "SuccessStories") {
      if (!formTitle.trim() || !formDesc.trim() || !formImage.trim()) {
        triggerAlert("Please fill all required fields (Title, Description, and Image).");
        return;
      }
      bodyPayload = { 
        ...bodyPayload, 
        title: formTitle, 
        desc: formDesc, 
        image: formImage 
      };
    } else if (activeTab === "Donations") {
      if (!formTitle.trim() || !formPrice.trim()) {
        triggerAlert("Please fill all required fields.");
        return;
      }
      bodyPayload = { 
        ...bodyPayload, 
        name: formTitle, 
        amount: formPrice, 
        time: formDesc || "Just now",
        donation_for: formExcerpt || "General Support",
        honoree: formHonoree,
        wish: formWish,
        transaction_date: formTransactionDate || getFormattedDate(),
        address: formAddress || ""
      };
    } else if (activeTab === "StatsCards") {
      if (!formTitle.trim() || !formPrice.trim()) {
        triggerAlert("Please fill all required fields.");
        return;
      }
      bodyPayload = { 
        ...bodyPayload, 
        title: formTitle, 
        base_value: parseFloat(formPrice) || 0, 
        prefix: formAuthor, 
        suffix: formCategory, 
        icon: formImage || "rupee", 
        category: formStatus || "none" 
      };
    } else if (activeTab === "Highlights") {
      if (!formTitle.trim() || !formPrice.trim() || !formDesc.trim()) {
        triggerAlert("Please fill all required fields.");
        return;
      }
      bodyPayload = { ...bodyPayload, type: highlightSubTab, name: formTitle, role: formPrice, quote: formDesc, image: formImage };
    } else if (activeTab === "Applications") {
      if (!formTitle.trim() || !formAuthor.trim() || !formPrice.trim() || !formCategory.trim() || formSkills.length === 0) {
        triggerAlert("Please fill all required fields & select at least one skill.");
        return;
      }
      bodyPayload = { 
        ...bodyPayload, 
        name: formTitle, 
        email: formAuthor, 
        phone: formPrice, 
        city: formCategory, 
        motivation: formDesc, 
        skills: formSkills, 
        status: formStatus,
        gender: formGender,
        profile_photo: formProfilePhoto
      };
    } else if (activeTab === "Tasks") {
      if (!taskFormVolunteerId || !taskFormTitle.trim() || !taskFormDate.trim() || !taskFormTime.trim()) {
        triggerAlert("Please fill all required fields.");
        return;
      }
      bodyPayload = {
        ...bodyPayload,
        volunteer_id: parseInt(taskFormVolunteerId, 10),
        task_title: taskFormTitle,
        task_description: taskFormDesc,
        task_date: taskFormDate,
        task_time: taskFormTime,
        status: taskFormStatus,
        assigned_money: parseFloat(taskFormAssignedMoney) || 0
      };
    } else if (activeTab === "PageMedia") {
      if (!formTitle.trim() || !formAuthor.trim() || !formImage.trim()) {
        triggerAlert("Please fill all required fields.");
        return;
      }
      bodyPayload = {
        key: formAuthor,
        title: formTitle,
        url: formImage,
        type: selectedMediaType
      };
    } else if (activeTab === "PageTexts") {
      if (!formTitle.trim() || !formAuthor.trim() || !formDesc.trim()) {
        triggerAlert("Please fill all required fields.");
        return;
      }
      bodyPayload = {
        key: formAuthor,
        title: formTitle,
        value: formDesc,
      };
    } else if (activeTab === "ContactInfo") {
      if (!formTitle.trim() || !formDesc.trim() || !formStatus.trim() || !formImage.trim()) {
        triggerAlert("Please fill all required fields.");
        return;
      }
      bodyPayload = {
        ...bodyPayload,
        title: formTitle,
        value: formDesc,
        type: formStatus,
        icon: formImage
      };
    } else if (activeTab === "StarVolunteers") {
      if (!formTitle.trim() || !formGender || !formGrade || !formDesc.trim()) {
        triggerAlert("Please fill all required fields (Name, Gender, Grade, and Reason).");
        return;
      }
      bodyPayload = {
        ...bodyPayload,
        name: formTitle,
        email: formEmail,
        phone: formPhone,
        gender: formGender,
        profile_photo: formProfilePhoto || formImage,
        grade: formGrade,
        reason: formDesc,
        week_label: formWeekLabel,
        tasks_completed: parseInt(formTasksCompleted, 10) || 0,
        volunteer_id: formVolunteerId ? parseInt(formVolunteerId, 10) : null
      };
    } else if (activeTab === "RoleManagement") {
      if (!formTitle.trim() || !formEmail.trim() || !formPassword.trim()) {
        triggerAlert("Username, email, and password are required.");
        return;
      }
      bodyPayload = {
        ...bodyPayload,
        username: formTitle,
        email: formEmail,
        phone: formPhone,
        password: formPassword,
        role: formRole
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const result = await res.json();
      if (result.success) {
        triggerAlert(`${activeTab} record saved successfully!`);
        fetchData();
        setIsModalOpen(false);
      } else {
        triggerAlert(result.error || "Failed to save record.");
      }
    } catch (error) {
      console.error("Save error:", error);
      triggerAlert("Failed to save changes.");
    }
  };

  const handleApproveApp = async (app: VolunteerApplication) => {
    try {
      const res = await fetch('/api/volunteer/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: app.id })
      });
      const data = await res.json();
      if (data.success) {
        triggerAlert(`Application for ${app.name} approved!`);
        fetchData();

        // Launch simulated WhatsApp text window
        const cleanPhone = app.phone.replace(/[^0-9]/g, "");
        const msg = encodeURIComponent(`Hello ${app.name},\n\nThank you for joining as a volunteer with Kanha Foundation! Your application has been approved. Welcome to the team! ❤️`);
        window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
      } else {
        triggerAlert(data.error || "Approval failed.");
      }
    } catch (error) {
      console.error("Approve error:", error);
      triggerAlert("Error approving application.");
    }
  };

  const handlePromote = async (newRole: "user" | "volunteer" | "admin", email: string) => {
    if (!window.confirm(`Are you sure you want to change the role of ${email} to ${newRole}?`)) return;

    try {
      const res = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newRole, email })
      });
      const data = await res.json();
      if (data.success) {
        triggerAlert(data.message || "Role updated successfully!");
        fetchData();
      } else {
        triggerAlert(data.error || "Failed to update role.");
      }
    } catch (e) {
      console.error("Role update error:", e);
      triggerAlert("Error performing role update.");
    }
  };

  const handleOpenAssignTaskModal = (app: VolunteerApplication) => {
    setEditingItem(null);
    setTaskFormVolunteerId(app.id.toString());
    setTaskFormTitle("");
    setTaskFormDesc("");
    setTaskFormDate("");
    setTaskFormTime("");
    setTaskFormStatus("Pending");
    setActiveTab("Tasks");
    setIsModalOpen(true);
  };

  const handleDelete = async (idOrKey: any) => {
    const isApp = activeTab === "Applications";
    const isMedia = activeTab === "PageMedia";
    const isTexts = activeTab === "PageTexts";
    const isTasks = activeTab === "Tasks";
    const isStar = activeTab === "StarVolunteers";
    const isDetStories = activeTab === "DetailedStories";
    const isSuccessStories = activeTab === "SuccessStories";
    const isContactInfo = activeTab === "ContactInfo";
    const isContactSub = activeTab === "ContactSubmissions";
    const confirmName = activeTab === "Highlights" 
      ? highlightSubTab.substring(0, highlightSubTab.length - 1) 
      : activeTab === "Categories"
      ? "Category"
      : activeTab === "RoleManagement"
      ? "User Account"
      : isApp ? "Volunteer Application" : isMedia ? "Media Section Banner" : isTexts ? "Text Setting" : isTasks ? "Volunteer Task" : isStar ? "Star Volunteer" : isDetStories ? "Detailed Story" : isSuccessStories ? "Success Story" : isContactInfo ? "Contact Info Card" : isContactSub ? "Contact Message" : activeTab.substring(0, activeTab.length - 1);
      
    if (!window.confirm(`Are you sure you want to delete this ${confirmName}?`)) return;

    const endpoint = activeTab === "Highlights"
      ? `/api/about-highlights?type=${highlightSubTab}&id=${idOrKey}`
      : activeTab === "Applications"
      ? `/api/volunteer?id=${idOrKey}`
      : activeTab === "StarVolunteers"
      ? `/api/volunteer/star?id=${idOrKey}`
      : activeTab === "ContactInfo"
      ? `/api/contact-info?id=${idOrKey}`
      : activeTab === "ContactSubmissions"
      ? `/api/contact?id=${idOrKey}`
      : isMedia
      ? `/api/page-media?key=${idOrKey}`
      : isTexts
      ? `/api/page-texts?key=${idOrKey}`
      : isTasks
      ? `/api/volunteer/tasks?id=${idOrKey}`
      : activeTab === "StatsCards"
      ? `/api/stats-cards?id=${idOrKey}`
      : activeTab === "DetailedStories"
      ? `/api/stories/detailed?id=${idOrKey}`
      : activeTab === "SuccessStories"
      ? `/api/success-stories?id=${idOrKey}`
      : activeTab === "RoleManagement"
      ? `/api/admin/users?id=${idOrKey}`
      : `/api/${activeTab.toLowerCase()}?id=${idOrKey}`;

    try {
      const res = await fetch(endpoint, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (result.success) {
        triggerAlert("Record deleted successfully!");
        fetchData();
      } else {
        triggerAlert(result.error || "Failed to delete record.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      triggerAlert("Failed to delete record.");
    }
  };

  // Pre-hydration loading state to prevent flash of login page or hydration mismatches
  if (!isMounted) {
    return (
      <div className="bg-zinc-950 text-white min-h-screen flex items-center justify-center font-sans px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#F3A61E] mx-auto mb-4"></div>
          <p className="text-xs text-zinc-400">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  // Auth Portal Render Flow
  if (!isLoggedIn) {
    return (
      <div className="bg-zinc-950 text-white min-h-screen flex items-center justify-center font-sans px-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800/80 p-8 rounded-3xl shadow-2xl">
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4 px-6 py-2 bg-zinc-950/40 rounded-2xl border border-zinc-800/40">
              <img
                src="/kanha_logo_round.png"
                alt="Kanha Foundation Logo"
                className="h-12 w-auto mx-auto object-contain relative z-10"
              />
            </div>
            <h1 className="text-2xl font-black">
              {authMode === "signin" && "Admin Sign In"}
              {authMode === "signup" && "Admin Registration"}
              {authMode === "forgot" && "Admin Recovery"}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {authMode === "signin" && "Sign in to access custom site settings & records."}
              {authMode === "signup" && "Create a new admin portal profile credential."}
              {authMode === "forgot" && "Reset your portal access password."}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
            {/* Username for signin & signup */}
            {authMode !== "forgot" && (
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Username / Login ID</label>
                <input
                  type="text"
                  required
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            )}

            {/* Email for signup & forgot */}
            {authMode !== "signin" && (
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@kanha.org"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            )}

            {/* Password for signin & signup */}
            {authMode !== "forgot" && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Password</label>
                  {authMode === "signin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("forgot");
                        setAuthError("");
                      }}
                      className="text-xs font-bold text-emerald-450 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            )}

            {/* Confirm Password for signup only */}
            {authMode === "signup" && (
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={authConfirmPassword}
                  onChange={(e) => setAuthConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            )}

            {/* Alerts state */}
            {authError && <p className="text-xs text-red-400 font-medium bg-red-950/20 p-2.5 rounded-lg border border-red-900/35">{authError}</p>}
            {authSuccess && <p className="text-xs text-emerald-450 font-medium bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/35">{authSuccess}</p>}

            <button
              type="submit"
              className="w-full py-3 mt-4 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-sm font-black uppercase tracking-wider rounded-xl transition-all duration-300 active:scale-98 shadow-lg cursor-pointer"
            >
              {authMode === "signin" && "Sign In"}
              {authMode === "signup" && "Sign Up Admin"}
              {authMode === "forgot" && "Send Recovery Link"}
            </button>
          </form>

          {/* Form Actions Footer */}
          <div className="mt-8 text-center text-xs font-medium text-zinc-400 border-t border-zinc-800/80 pt-6">
            {authMode === "signin" && (
              <p>
                Need access?{" "}
                <button onClick={() => { setAuthMode("signup"); setAuthError(""); }} className="font-extrabold text-emerald-450 hover:underline cursor-pointer">
                  Register Admin Profile
                </button>
              </p>
            )}
            {authMode !== "signin" && (
              <p>
                Already have credentials?{" "}
                <button onClick={() => { setAuthMode("signin"); setAuthError(""); }} className="font-extrabold text-emerald-450 hover:underline cursor-pointer">
                  Back to Sign In
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 text-white min-h-screen py-16 px-4 md:px-8 font-sans">
      
      {/* Hidden File Input for PageMedia manager */}
      <input
        type="file"
        ref={fileInputRef}
        accept={selectedMediaType === "video" ? "video/*" : "image/*"}
        onChange={handleMediaFileChange}
        className="hidden"
      />

      {/* Toast Alert Indicator */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#1E4D2B] border border-emerald-500/30 text-white px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-2"
          >
            <svg className="h-5 w-5 text-emerald-400 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {alertMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl">
        
        {/* Header Dashboard section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-zinc-800 pb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-400">Manage campaign causes, reviews, blog posts, photo gallery, live donations, and team highlights dynamically.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Admin Avatar Circle Header Info */}
            <div 
              onClick={() => setActiveTab("AdminProfile")}
              className="flex items-center gap-2.5 cursor-pointer group bg-zinc-900 border border-zinc-800 rounded-full px-3.5 py-1.5 hover:border-[#F3A61E] transition-all"
              title="Edit Profile"
            >
              <img
                src={adminAvatar}
                alt="Admin Profile"
                className="h-7 w-7 rounded-full object-cover border border-zinc-800 shadow-inner group-hover:scale-105 transition-transform"
              />
              <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                {adminUsername}
              </span>
            </div>
            {activeTab !== "Applications" && activeTab !== "ContactSubmissions" && activeTab !== "Navbar" && activeTab !== "Footer" && activeTab !== "AdminProfile" && (
              <button
                onClick={openAddModal}
                className="px-5 py-2.5 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-xs font-black uppercase tracking-wider rounded-full transition-all cursor-pointer flex items-center gap-2 border border-emerald-800/40"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add {activeTab === "Blogs" ? "Blog" : activeTab === "Highlights" ? (highlightSubTab === "directors" ? "Director" : "Volunteer") : activeTab === "Tasks" ? "Volunteer Task" : activeTab === "StarVolunteers" ? "Star Volunteer" : activeTab === "PageMedia" ? "Banner/Media Setting" : activeTab === "PageTexts" ? "Text Setting" : activeTab === "Categories" ? "Category" : activeTab === "ContactInfo" ? "Contact Card" : activeTab === "RoleManagement" ? "User Account" : activeTab.substring(0, activeTab.length - 1)}
              </button>
            )}
            <button
              onClick={handleSeedDB}
              disabled={isSeeding}
              className="px-5 py-2.5 bg-amber-650 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider rounded-full transition-all cursor-pointer disabled:opacity-50 border border-amber-600/30"
            >
              {isSeeding ? "Syncing..." : "Sync JSON to DB"}
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-black uppercase tracking-wider rounded-full transition-all cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Pending Volunteer Applications Notification Banner */}
        {volApps.filter(app => app.status === "Pending" || !app.status).length > 0 && (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between text-amber-200 text-xs font-bold shadow-md animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-sm">🔔</span>
              <span>You have {volApps.filter(app => app.status === "Pending" || !app.status).length} pending volunteer applications awaiting review and approval.</span>
            </div>
            <button 
              onClick={() => setActiveTab("Applications")} 
              className="px-4 py-1.5 bg-[#F3A61E] hover:bg-[#d68f12] text-black rounded-lg transition-colors cursor-pointer text-[10px] font-black uppercase tracking-wider shadow-sm"
            >
              Review Apps
            </button>
          </div>
        )}

        {/* Tab Selection Row */}
        <div className="flex border-b border-zinc-900 gap-1.5 mb-10 overflow-x-auto pb-2 scrollbar-none">
          {(["Causes", "Reviews", "Blogs", "Stories", "DetailedStories", "SuccessStories", "Donations", "Highlights", "Applications", "Tasks", "StarVolunteers", "ContactInfo", "ContactSubmissions", "PageMedia", "PageTexts", "StatsCards", "Categories", "RoleManagement", "Navbar", "Footer", "WhatsAppCommunity", "AdminProfile"] as TabType[]).map((tab) => {
            const isTabActive = activeTab === tab;
            const pendingCount = tab === "Applications" ? volApps.filter(a => a.status === "Pending" || !a.status).length : 0;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isTabActive
                    ? "bg-[#F3A61E] text-black shadow-lg"
                    : "bg-zinc-900/50 text-zinc-400 hover:text-white border border-zinc-800/20"
                }`}
              >
                <span>
                  {tab === "StarVolunteers" ? "Star Volunteers" : tab === "Applications" ? "Volunteer Apps" : tab === "PageMedia" ? "Page Banners & Media" : tab === "PageTexts" ? "Page Layout Texts" : tab === "StatsCards" ? "Stats Ribbon" : tab === "RoleManagement" ? "Role Manager" : tab === "Navbar" ? "Navbar Config" : tab === "Footer" ? "Footer Config" : tab === "AdminProfile" ? "My Profile" : tab === "DetailedStories" ? "Detailed Stories" : tab === "SuccessStories" ? "Success Stories" : tab === "ContactInfo" ? "Contact Info Cards" : tab === "ContactSubmissions" ? "Contact Messages" : tab === "WhatsAppCommunity" ? "WhatsApp Community" : tab}
                </span>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-650 text-white text-[9px] font-black rounded-full shadow-sm animate-bounce">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Highlights Inner Sub-Tabs */}
        {activeTab === "Highlights" && (
          <div className="flex gap-2 mb-8 text-left">
            <button
              onClick={() => setHighlightSubTab("directors")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                highlightSubTab === "directors" ? 'bg-zinc-800 text-[#F3A61E] border border-[#F3A61E]/30' : 'bg-zinc-900/40 text-zinc-450 hover:text-white'
              }`}
            >
              Directors List
            </button>
            <button
              onClick={() => setHighlightSubTab("volunteers")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                highlightSubTab === "volunteers" ? 'bg-zinc-800 text-[#F3A61E] border border-[#F3A61E]/30' : 'bg-zinc-900/40 text-zinc-450 hover:text-white'
              }`}
            >
              Volunteers List
            </button>
          </div>
        )}

        {/* Records Listing table grids */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mx-auto" />
            <p className="mt-4 text-sm text-zinc-400">Loading {activeTab === "Applications" ? "Volunteer Apps" : activeTab === "PageMedia" ? "Page Banners" : activeTab === "PageTexts" ? "Page Texts" : activeTab}...</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-zinc-900/30 border border-zinc-800/50 rounded-2xl">
            {activeTab === "Causes" && (
              <table className="min-w-full divide-y divide-zinc-800 text-left">
                <thead>
                  <tr className="bg-zinc-900/60 text-zinc-400 text-xs font-black uppercase tracking-wider"><th className="px-6 py-4">Preview</th><th className="px-6 py-4">Title</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Price</th><th className="px-6 py-4 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {causes.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {c.video ? (
                          <div className="relative h-10 w-14 rounded-lg overflow-hidden border border-zinc-800"><video src={c.video} className="h-full w-full object-cover" muted /></div>
                        ) : (
                          <img src={c.image} alt={c.title} className="h-10 w-14 object-cover rounded-lg border border-zinc-800" />
                        )}
                      </td>
                      <td className="px-6 py-4"><p className="text-sm font-bold text-white line-clamp-1 max-w-xs">{c.title}</p></td>
                      <td className="px-6 py-4"><span className="px-2.5 py-0.5 rounded bg-zinc-800 text-[#F3A61E] text-[10px] font-black">{c.category}</span></td>
                      <td className="px-6 py-4"><p className="text-sm font-extrabold text-[#F3A61E]">{c.price}</p></td>
                      <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => openEditModal(c)} className="px-3 py-1 border border-zinc-700 rounded text-xs text-zinc-300 cursor-pointer">Edit</button><button onClick={() => handleDelete(c.id)} className="px-3 py-1 bg-red-650/15 border border-red-900/40 rounded text-xs text-red-400 cursor-pointer">Delete</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "Reviews" && (
              <table className="min-w-full divide-y divide-zinc-800 text-left">
                <thead>
                  <tr className="bg-zinc-900/60 text-zinc-400 text-xs font-black uppercase tracking-wider"><th className="px-6 py-4">Video Preview</th><th className="px-6 py-4">Title</th><th className="px-6 py-4">Author</th><th className="px-6 py-4">Description snippet</th><th className="px-6 py-4 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {reviews.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap"><div className="relative h-10 w-14 rounded-lg overflow-hidden border border-zinc-800"><video src={r.video} className="h-full w-full object-cover" muted /></div></td>
                      <td className="px-6 py-4"><p className="text-sm font-bold text-white line-clamp-1 max-w-xs">{r.title}</p></td>
                      <td className="px-6 py-4"><p className="text-xs text-gray-300 font-bold">{r.author}</p></td>
                      <td className="px-6 py-4"><p className="text-xs text-zinc-400 line-clamp-1 max-w-xs">{r.desc}</p></td>
                      <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => openEditModal(r)} className="px-3 py-1 border border-zinc-700 rounded text-xs text-zinc-300 cursor-pointer">Edit</button><button onClick={() => handleDelete(r.id)} className="px-3 py-1 bg-red-650/15 border border-red-900/40 rounded text-xs text-red-400 cursor-pointer">Delete</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "Blogs" && (
              <table className="min-w-full divide-y divide-zinc-800 text-left">
                <thead>
                  <tr className="bg-zinc-900/60 text-zinc-400 text-xs font-black uppercase tracking-wider"><th className="px-6 py-4">Thumbnail</th><th className="px-6 py-4">Title</th><th className="px-6 py-4">Publish Date</th><th className="px-6 py-4">Excerpt</th><th className="px-6 py-4 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {blogs.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap"><img src={b.image} alt={b.title} className="h-10 w-14 object-cover rounded-lg border border-zinc-800" /></td>
                      <td className="px-6 py-4"><p className="text-sm font-bold text-white line-clamp-1 max-w-xs">{b.title}</p></td>
                      <td className="px-6 py-4"><p className="text-xs text-zinc-300 font-bold">{b.date}</p></td>
                      <td className="px-6 py-4"><p className="text-xs text-zinc-400 line-clamp-1 max-w-xs">{b.excerpt}</p></td>
                      <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => openEditModal(b)} className="px-3 py-1 border border-zinc-700 rounded text-xs text-zinc-300 cursor-pointer">Edit</button><button onClick={() => handleDelete(b.id)} className="px-3 py-1 bg-red-650/15 border border-red-900/40 rounded text-xs text-red-400 cursor-pointer">Delete</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "Stories" && (
              <table className="min-w-full divide-y divide-zinc-800 text-left">
                <thead>
                  <tr className="bg-zinc-900/60 text-zinc-400 text-xs font-black uppercase tracking-wider"><th className="px-6 py-4">Image preview</th><th className="px-6 py-4">Alternative Alt Text</th><th className="px-6 py-4 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {stories.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap"><img src={s.url} alt={s.alt} className="h-10 w-14 object-cover rounded-lg border border-zinc-800" /></td>
                      <td className="px-6 py-4"><p className="text-sm font-bold text-white">{s.alt}</p></td>
                      <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => openEditModal(s)} className="px-3 py-1 border border-zinc-700 rounded text-xs text-zinc-300 cursor-pointer">Edit</button><button onClick={() => handleDelete(s.id)} className="px-3 py-1 bg-red-650/15 border border-red-900/40 rounded text-xs text-red-400 cursor-pointer">Delete</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "ContactInfo" && (
              <table className="min-w-full divide-y divide-zinc-800 text-left">
                <thead>
                  <tr className="bg-zinc-900/60 text-zinc-400 text-xs font-black uppercase tracking-wider">
                    <th className="px-6 py-4">Icon</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Value</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {contactInfoList.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-zinc-800 rounded font-mono text-xs text-white">{c.icon}</span></td>
                      <td className="px-6 py-4"><p className="text-sm font-bold text-white">{c.title}</p></td>
                      <td className="px-6 py-4"><span className="px-2.5 py-0.5 rounded bg-zinc-800 text-[#52c47c] text-[10px] font-black">{c.type}</span></td>
                      <td className="px-6 py-4"><p className="text-xs text-zinc-400 whitespace-pre-line max-w-xs">{c.value}</p></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(c)} className="px-3 py-1 border border-zinc-700 rounded text-xs text-zinc-300 cursor-pointer">Edit</button>
                          <button onClick={() => handleDelete(c.id)} className="px-3 py-1 bg-red-650/15 border border-red-900/40 rounded text-xs text-red-400 cursor-pointer">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "ContactSubmissions" && (
              <table className="min-w-full divide-y divide-zinc-800 text-left">
                <thead>
                  <tr className="bg-zinc-900/60 text-zinc-400 text-xs font-black uppercase tracking-wider">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Message</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {contactSubmissionsList.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4"><p className="text-xs text-zinc-400">{new Date(s.created_at || s.id).toLocaleString()}</p></td>
                      <td className="px-6 py-4"><p className="text-sm font-bold text-white">{s.name}</p></td>
                      <td className="px-6 py-4"><a href={`mailto:${s.email}`} className="text-xs text-[#F3A61E] hover:underline">{s.email}</a></td>
                      <td className="px-6 py-4"><p className="text-xs text-zinc-300">{s.phone || "-"}</p></td>
                      <td className="px-6 py-4"><p className="text-xs text-zinc-400 max-w-sm whitespace-pre-line">{s.message}</p></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleDelete(s.id)} className="px-3 py-1 bg-red-650/15 border border-red-900/40 rounded text-xs text-red-400 cursor-pointer">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "DetailedStories" && (
              <table className="min-w-full divide-y divide-zinc-800 text-left">
                <thead>
                  <tr className="bg-zinc-900/60 text-zinc-400 text-xs font-black uppercase tracking-wider">
                    <th className="px-6 py-4">Image preview</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Stats Highlight</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {detailedStories.map((ds) => (
                    <tr key={ds.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img src={ds.image} alt={ds.title} className="h-10 w-14 object-cover rounded-lg border border-zinc-800" />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-white">{ds.title}</p>
                        <p className="text-xs text-zinc-500 line-clamp-1 max-w-xs">{ds.desc}</p>
                      </td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 bg-zinc-800 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">{ds.category}</span></td>
                      <td className="px-6 py-4"><p className="text-sm text-amber-500 font-bold">{ds.stats}</p></td>
                      <td className="px-6 py-4"><p className="text-xs text-zinc-400">{ds.date}</p></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(ds)} className="px-3 py-1 border border-zinc-700 rounded text-xs text-zinc-300 cursor-pointer">Edit</button>
                          <button onClick={() => handleDelete(ds.id)} className="px-3 py-1 bg-red-650/15 border border-red-900/40 rounded text-xs text-red-400 cursor-pointer">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "SuccessStories" && (
              <table className="min-w-full divide-y divide-zinc-800 text-left">
                <thead>
                  <tr className="bg-zinc-900/60 text-zinc-400 text-xs font-black uppercase tracking-wider">
                    <th className="px-6 py-4">Image preview</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {successStories.map((ss) => (
                    <tr key={ss.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img src={ss.image} alt={ss.title} className="h-10 w-14 object-cover rounded-lg border border-zinc-800" />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-white">{ss.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-zinc-400 line-clamp-2 max-w-lg">{ss.desc}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(ss)} className="px-3 py-1 border border-zinc-700 rounded text-xs text-zinc-300 cursor-pointer">Edit</button>
                          <button onClick={() => handleDelete(ss.id)} className="px-3 py-1 bg-red-650/15 border border-red-900/40 rounded text-xs text-red-400 cursor-pointer">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "Donations" && (() => {
              const filteredReportDonations = donations.filter(d => {
                const dDate = d.created_at ? new Date(d.created_at) : new Date();
                
                if (reportFilterType === "date") {
                  if (reportStartDate) {
                    const start = new Date(reportStartDate);
                    start.setHours(0, 0, 0, 0);
                    if (dDate < start) return false;
                  }
                  if (reportEndDate) {
                    const end = new Date(reportEndDate);
                    end.setHours(23, 59, 59, 999);
                    if (dDate > end) return false;
                  }
                  return true;
                } else {
                  const dMonth = dDate.getMonth() + 1;
                  const dYear = dDate.getFullYear();
                  if (reportMonth && dMonth !== parseInt(reportMonth, 10)) return false;
                  if (reportYear && dYear !== parseInt(reportYear, 10)) return false;
                  return true;
                }
              });

              return (
                <div className="space-y-6">
                  {/* Premium Callout to full Dashboard */}
                  <div className="bg-gradient-to-r from-emerald-950/30 to-zinc-900/50 border border-emerald-500/20 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <h4 className="text-sm font-black uppercase tracking-wider text-emerald-400">Live Donations Control Room</h4>
                      </div>
                      <h3 className="text-xl font-bold text-white">Looking for the detailed Donations Dashboard?</h3>
                      <p className="text-xs text-zinc-400 max-w-2xl">
                        Open the full dashboard to view premium checkout metadata (anonymous donor names, birthday/meal/studykit quantities, dedication messages, photo wishes, video wishes, and transaction history) and manage records.
                      </p>
                    </div>
                    <a
                      href="/admin/donations"
                      className="px-6 py-3.5 bg-[#F3A61E] hover:bg-[#d68f12] text-black text-xs font-black uppercase tracking-widest rounded-2xl transition-all cursor-pointer text-center flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/10 hover:scale-[1.02]"
                    >
                      <svg className="h-4 w-4 shrink-0 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span>Open Donations Dashboard</span>
                    </a>
                  </div>

                  {/* PDF/Print Report Control Panel */}
                    <div className="bg-zinc-900/50 border border-zinc-800/60 p-6 rounded-2xl space-y-5">
                      <h3 className="text-sm font-black uppercase tracking-wider text-[#F3A61E] mb-2 flex items-center gap-2">
                        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 00-4-4H5m14 0h-3a4 4 0 00-4 4v2m21 2h-1a2 2 0 01-2-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v12a2 2 0 01-2 2H3" />
                        </svg>
                        Donation Report Generator (Print / PDF)
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Filter Type</label>
                          <select 
                            value={reportFilterType} 
                            onChange={(e) => setReportFilterType(e.target.value as "date" | "month")}
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                          >
                            <option value="date">Date Range</option>
                            <option value="month">Month-wise</option>
                          </select>
                        </div>

                        {reportFilterType === "date" ? (
                          <>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">From Date</label>
                              <input 
                                type="date" 
                                value={reportStartDate} 
                                onChange={(e) => setReportStartDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none text-zinc-300"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">To Date</label>
                              <input 
                                type="date" 
                                value={reportEndDate} 
                                onChange={(e) => setReportEndDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none text-zinc-300"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Select Month</label>
                              <select 
                                value={reportMonth} 
                                onChange={(e) => setReportMonth(e.target.value)}
                                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                              >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                  <option key={m} value={m}>
                                    {new Date(2020, m - 1).toLocaleString('default', { month: 'long' })}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Select Year</label>
                              <select 
                                value={reportYear} 
                                onChange={(e) => setReportYear(e.target.value)}
                                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                              >
                                {["2025", "2026", "2027"].map(y => (
                                  <option key={y} value={y}>{y}</option>
                                ))}
                              </select>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button 
                          onClick={() => setIsReportOpen(true)}
                          className="flex-1 py-3 px-4 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-emerald-800/40 text-center flex justify-center items-center gap-2 shadow-sm"
                        >
                          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          <span>Print PDF / Report</span>
                        </button>
                        <a 
                          href="/admin/donations"
                          className="flex-1 py-3 px-4 bg-[#F3A61E] hover:bg-[#d68f12] text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center flex justify-center items-center gap-2 shadow-sm"
                        >
                          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Manage Donations Dashboard ↗</span>
                        </a>
                      </div>
                    </div>

                  <table className="min-w-full divide-y divide-zinc-800 text-left">
                    <thead>
                      <tr className="bg-zinc-900/60 text-zinc-400 text-xs font-black uppercase tracking-wider">
                        <th className="px-6 py-4">Donor Name</th>
                        <th className="px-6 py-4">Address</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Time Label</th>
                        <th className="px-6 py-4">Donated For</th>
                        <th className="px-6 py-4">Date Recieved</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {filteredReportDonations.map((d) => (
                        <tr key={d.id} className="hover:bg-zinc-900/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm font-bold text-white">{d.name}</p></td>
                          <td className="px-6 py-4 whitespace-nowrap"><p className="text-xs text-zinc-400">{d.address || "Ranchi, Jharkhand, India"}</p></td>
                          <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm font-extrabold text-[#F3A61E]">{d.amount}</p></td>
                          <td className="px-6 py-4 whitespace-nowrap"><p className="text-xs text-zinc-400">{d.time ? d.time.split('|')[0] : ""}</p></td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-zinc-300 max-w-xs font-semibold truncate" title={d.donation_for || "General Support"}>
                              {d.donation_for || "General Support"}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-xs text-zinc-400">
                              {d.created_at 
                                ? new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) 
                                : 'Prior Record'}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => openEditModal(d)} className="px-3 py-1 border border-zinc-700 rounded text-xs text-zinc-300 cursor-pointer">Edit</button>
                              <button onClick={() => handleDelete(d.id)} className="px-3 py-1 bg-red-650/15 border border-red-900/40 rounded text-xs text-red-400 cursor-pointer">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredReportDonations.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-xs text-zinc-500 italic">No donations match selected criteria.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {activeTab === "Highlights" && (
              <table className="min-w-full divide-y divide-zinc-800 text-left">
                <thead>
                  <tr className="bg-zinc-900/60 text-zinc-400 text-xs font-black uppercase tracking-wider">
                    <th className="px-6 py-4">Photo</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Role/Designation</th>
                    <th className="px-6 py-4">Quote Statement</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {(highlightSubTab === "directors" ? directors : volunteers).map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img src={item.image} alt={item.name} className="h-10 w-10 object-cover rounded-full border border-zinc-800" />
                      </td>
                      <td className="px-6 py-4"><p className="text-sm font-bold text-white">{item.name}</p></td>
                      <td className="px-6 py-4"><p className="text-xs text-zinc-300 font-bold">{item.role}</p></td>
                      <td className="px-6 py-4"><p className="text-xs text-zinc-400 line-clamp-1 max-w-xs">{item.quote}</p></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(item)} className="px-3 py-1 border border-zinc-700 rounded text-xs text-zinc-300 cursor-pointer">Edit</button>
                          <button onClick={() => handleDelete(item.id)} className="px-3 py-1 bg-red-650/15 border border-red-900/40 rounded text-xs text-red-400 cursor-pointer">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "Applications" && (
              <table className="min-w-full divide-y divide-zinc-800 text-left">
                <thead>
                  <tr className="bg-zinc-900/60 text-zinc-400 text-xs font-black uppercase tracking-wider">
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Gender</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Areas of Interest</th>
                    <th className="px-6 py-4">Motivation statement</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-left">
                  {volApps.map((app) => (
                    <tr key={app.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img 
                          src={app.profile_photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"} 
                          alt={app.name} 
                          className="h-9 w-9 object-cover rounded-full border border-zinc-850 shadow-sm" 
                        />
                        <div>
                          <p className="text-sm font-bold text-white">{app.name}</p>
                          <p className="text-[10px] text-zinc-400 font-bold mt-0.5">{app.email}</p>
                          <p className="text-[10px] text-emerald-450 font-black mt-0.5 cursor-pointer" onClick={() => window.open(`https://wa.me/${app.phone.replace(/[^0-9]/g, "")}`, "_blank")}>
                            📞 {app.phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded bg-zinc-800 text-gray-300 text-[10px] font-bold">
                          {app.gender || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded bg-zinc-800 text-gray-300 text-[10px] font-bold">{app.city}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(app.skills || []).map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-emerald-950/20 text-[#52c47c] border border-emerald-900/30 rounded text-[9px] font-black">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-zinc-400 line-clamp-2 max-w-xs italic font-normal">
                          "{app.motivation || 'N/A'}"
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center gap-2">
                          {app.status === "Approved" ? (
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-emerald-950/30 text-emerald-450 border border-emerald-900/40 rounded-lg text-xs font-bold">
                                Approved ✅
                              </span>
                              <button 
                                onClick={() => handleOpenAssignTaskModal(app)} 
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase rounded text-[10px] cursor-pointer shadow-md"
                              >
                                Assign Task
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleApproveApp(app)} 
                              className="px-3 py-1 bg-emerald-650 hover:bg-emerald-700 text-white font-bold rounded text-xs cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          <button onClick={() => openEditModal(app)} className="px-3 py-1 border border-zinc-700 rounded text-xs text-zinc-300 cursor-pointer">Edit</button>
                          <button onClick={() => handleDelete(app.id)} className="px-3 py-1 bg-red-650/15 border border-red-900/40 rounded text-xs text-red-400 cursor-pointer">Archive</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "Tasks" && (
              <table className="min-w-full divide-y divide-zinc-800 text-left">
                <thead>
                  <tr className="bg-zinc-900/60 text-zinc-400 text-xs font-black uppercase tracking-wider">
                    <th className="px-6 py-4">Assigned Volunteer</th>
                    <th className="px-6 py-4">Task Details</th>
                    <th className="px-6 py-4">Budget / Assigned</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-left">
                  {Array.isArray(tasks) && tasks.map((task) => {
                    const volunteer = volApps.find(a => a.id === task.volunteer_id);
                    return (
                      <tr key={task.id} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-white">{volunteer ? volunteer.name : `ID: ${task.volunteer_id}`}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{volunteer ? volunteer.email : ""}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-white">{task.task_title}</p>
                          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1 max-w-xs">{task.task_description}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-extrabold text-[#F3A61E]">₹{task.assigned_money || 0}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-zinc-850 rounded text-xs text-zinc-300 font-bold">{task.task_date}</span>
                          <span className="ml-1.5 px-2 py-0.5 bg-zinc-850 rounded text-xs text-zinc-400">{task.task_time}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                            task.status === "Completed" 
                              ? 'bg-emerald-950/30 text-emerald-450 border-emerald-900/40' 
                              : task.status === "Processing"
                              ? 'bg-blue-950/30 text-blue-450 border-blue-900/40'
                              : task.status === "Started"
                              ? 'bg-indigo-950/30 text-indigo-400 border-indigo-900/40'
                              : 'bg-amber-950/30 text-amber-450 border-amber-900/40'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end items-center gap-2">
                            {task.status === "Completed" && (
                              <button 
                                onClick={() => openViewProofModal(task)} 
                                className="px-2.5 py-1 bg-emerald-950/20 text-emerald-450 hover:bg-emerald-950/40 border border-emerald-900/40 rounded text-xs font-bold cursor-pointer whitespace-nowrap"
                              >
                                View Proof
                              </button>
                            )}
                            <button onClick={() => openEditModal(task)} className="px-3 py-1 border border-zinc-700 rounded text-xs text-zinc-300 cursor-pointer whitespace-nowrap">Edit</button>
                            <button onClick={() => handleDelete(task.id)} className="px-3 py-1 bg-red-650/15 border border-red-900/40 rounded text-xs text-red-400 cursor-pointer whitespace-nowrap">Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {activeTab === "PageMedia" && (
              <table className="min-w-full divide-y divide-zinc-800 text-left">
                <thead>
                  <tr className="bg-zinc-900/60 text-zinc-400 text-xs font-black uppercase tracking-wider">
                    <th className="px-6 py-4">Setting Section Banner</th>
                    <th className="px-6 py-4">Identifier Key</th>
                    <th className="px-6 py-4">Format</th>
                    <th className="px-6 py-4">Active Live Media Preview</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-left">
                  {Array.isArray(pageMedia) && pageMedia.map((m) => (
                    <tr key={m.key} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4"><p className="text-sm font-bold text-white">{m.title}</p></td>
                      <td className="px-6 py-4"><p className="text-xs text-zinc-400 font-mono">{m.key}</p></td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded bg-zinc-800 text-gray-300 text-[10px] font-black uppercase">{m.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {m.type === "video" ? (
                          <div className="relative h-10 w-16 bg-black rounded-lg overflow-hidden border border-zinc-800">
                            <video src={m.url} className="h-full w-full object-cover" muted />
                          </div>
                        ) : (
                          <img src={m.url} alt={m.title} className="h-10 w-16 object-cover rounded-lg border border-zinc-800" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => triggerMediaUpload(m.key, m.type)}
                            disabled={isUploading}
                            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-bold border border-zinc-700 cursor-pointer whitespace-nowrap transition-all disabled:opacity-50"
                          >
                            Change File
                          </button>
                          <button onClick={() => openEditModal(m)} className="px-3 py-1 border border-zinc-700 rounded text-xs text-zinc-300 cursor-pointer whitespace-nowrap">Edit</button>
                          <button onClick={() => handleDelete(m.key)} className="px-3 py-1 bg-red-650/15 border border-red-900/40 rounded text-xs text-red-400 cursor-pointer whitespace-nowrap">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "PageTexts" && (
              <table className="min-w-full divide-y divide-zinc-800 text-left">
                <thead>
                  <tr className="bg-zinc-900/60 text-zinc-400 text-xs font-black uppercase tracking-wider">
                    <th className="px-6 py-4">Section Text Location</th>
                    <th className="px-6 py-4">Identifier Key</th>
                    <th className="px-6 py-4">Active Live Text Value</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-left">
                  {Array.isArray(pageTexts) && pageTexts.map((txt) => (
                    <tr key={txt.key} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4"><p className="text-sm font-bold text-white">{txt.title}</p></td>
                      <td className="px-6 py-4"><p className="text-xs text-zinc-400 font-mono">{txt.key}</p></td>
                      <td className="px-6 py-4"><p className="text-xs text-zinc-300 line-clamp-2 max-w-md">{txt.value}</p></td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center gap-2">
                          <button onClick={() => openEditModal(txt)} className="px-3 py-1 border border-zinc-700 rounded text-xs text-zinc-300 cursor-pointer whitespace-nowrap">Edit</button>
                          <button onClick={() => handleDelete(txt.key)} className="px-3 py-1 bg-red-650/15 border border-red-900/40 rounded text-xs text-red-400 cursor-pointer whitespace-nowrap">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "StatsCards" && (
              <table className="min-w-full divide-y divide-zinc-800 text-left">
                <thead>
                  <tr className="bg-zinc-900/60 text-zinc-400 text-xs font-black uppercase tracking-wider">
                    <th className="px-6 py-4">Title / Label</th>
                    <th className="px-6 py-4">Icon</th>
                    <th className="px-6 py-4">Format (Prefix + Base + Suffix)</th>
                    <th className="px-6 py-4">Automatic Tracker Category</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-left">
                  {Array.isArray(statsCards) && statsCards.map((card) => (
                    <tr key={card.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-white">{card.title}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-zinc-850 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 uppercase">
                          {card.icon}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-extrabold text-[#F3A61E]">
                          {(() => {
                            const base = parseFloat(card.base_value) || 0;
                            const cat = card.category;
                            let target = base;
                            if (cat === "raised") {
                              target = base + extraData.extraAmount;
                            } else if (cat === "donors") {
                              target = base + extraData.uniqueDonors;
                            } else if (cat === "birthday") {
                              target = base + extraData.extraBirthday;
                            } else if (cat === "lives") {
                              target = base + extraData.extraLives;
                            } else if (cat === "meals") {
                              target = base + extraData.extraMeals;
                            } else if (cat === "studykit") {
                              target = base + extraData.extraStudykit;
                            }
                            return `${card.prefix || ""}${target.toLocaleString('en-IN')}${card.suffix || ""}`;
                          })()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-emerald-950/30 border border-emerald-900/40 text-[#52c47c] rounded text-[10px] font-black uppercase">
                          {card.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center gap-2">
                          <button onClick={() => openEditModal(card)} className="px-3 py-1 border border-zinc-700 rounded text-xs text-zinc-300 cursor-pointer whitespace-nowrap">Edit</button>
                          <button onClick={() => handleDelete(card.id)} className="px-3 py-1 bg-red-650/15 border border-red-900/40 rounded text-xs text-red-400 cursor-pointer whitespace-nowrap">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "Categories" && (
              <table className="min-w-full divide-y divide-zinc-800 text-left">
                <thead>
                  <tr className="bg-zinc-900/60 text-zinc-400 text-xs font-black uppercase tracking-wider">
                    <th className="px-6 py-4">Category Name</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {categoriesList.map((c) => (
                    <tr key={c.id || c.name} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded bg-zinc-850 border border-zinc-800 text-sm font-bold text-[#F3A61E]">
                          {c.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center gap-2">
                          <button onClick={() => openEditModal(c)} className="px-3 py-1 border border-zinc-700 rounded text-xs text-zinc-300 cursor-pointer whitespace-nowrap">Edit</button>
                          <button onClick={() => handleDelete(c.id)} className="px-3 py-1 bg-red-650/15 border border-red-900/40 rounded text-xs text-red-400 cursor-pointer whitespace-nowrap">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "RoleManagement" && (
              <div className="space-y-6 p-6 text-left">
                <div className="bg-zinc-900/40 border border-zinc-800/85 rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white">Registered Users & Role Manager</h3>
                      <p className="text-xs text-zinc-400 mt-1">Change any user's role to automatically migrate them to User, Volunteer, or Admin lists.</p>
                    </div>
                    <span className="px-3 py-1 bg-zinc-800 rounded-full text-xs font-black text-[#F3A61E] self-start sm:self-center">
                      {usersList.length} Total Accounts
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-800 text-left">
                      <thead>
                        <tr className="bg-zinc-950/40 text-zinc-400 text-xs font-black uppercase tracking-wider">
                          <th className="px-6 py-4">Name / Username</th>
                          <th className="px-6 py-4">Email Address</th>
                          <th className="px-6 py-4">Phone</th>
                          <th className="px-6 py-4">Password</th>
                          <th className="px-6 py-4">Role Designation</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {usersList.map((user) => (
                          <tr key={user.id} className="hover:bg-zinc-900/20 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm font-bold text-white">{user.name}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-xs text-zinc-300">{user.email}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-xs text-zinc-400">{user.phone || "N/A"}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-xs text-zinc-400">{user.password || "••••••••"}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={user.role}
                                onChange={(e) => handlePromote(e.target.value as any, user.email)}
                                className="px-3.5 py-1.5 bg-zinc-950 border border-zinc-850 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#F3A61E] cursor-pointer"
                              >
                                <option value="user">User</option>
                                <option value="volunteer">Volunteer</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openEditModal(user)}
                                  className="p-2 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-all cursor-pointer"
                                  title="Edit User Info"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(user.id)}
                                  className="p-2 hover:bg-red-950/30 text-red-400 hover:text-red-500 rounded-xl transition-all cursor-pointer"
                                  title="Delete User"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {usersList.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-xs text-zinc-500 italic">No user accounts found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Navbar" && (
              <div className="space-y-6 p-6 text-left">
                <form onSubmit={handleSaveNavbar} className="bg-zinc-900/40 border border-zinc-800/85 rounded-2xl p-6 space-y-6 max-w-xl">
                  <div>
                    <h3 className="text-lg font-bold text-white">Navbar Settings</h3>
                    <p className="text-xs text-zinc-400 mt-1">Configure layout, typography, and logo assets for the navigation bar.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 font-black">Navbar Logo Image</label>
                      <div className="flex items-center gap-4 bg-zinc-950/40 border border-zinc-800/80 p-3 rounded-xl">
                        {navbarConfig.logo && (
                          <div className="h-12 w-12 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center p-1 overflow-hidden shrink-0">
                            <img
                              src={navbarConfig.logo}
                              alt="Navbar Logo Preview"
                              className="h-full w-full object-contain"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, (url) => setNavbarConfig({ ...navbarConfig, logo: url }))}
                            className="block w-full text-xs text-zinc-400
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-xs file:font-black file:uppercase file:tracking-wider
                              file:bg-emerald-950 file:text-emerald-300
                              hover:file:bg-emerald-900 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Foundation Name</label>
                      <input
                        type="text"
                        required
                        value={navbarConfig.name || ""}
                        onChange={(e) => setNavbarConfig({ ...navbarConfig, name: e.target.value })}
                        placeholder="Kanha Foundation"
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#F3A61E]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Font Family</label>
                        <select
                          value={navbarConfig.fontFamily || "Inter"}
                          onChange={(e) => setNavbarConfig({ ...navbarConfig, fontFamily: e.target.value })}
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                        >
                          <option value="Inter">Inter (Sans-serif)</option>
                          <option value="Outfit">Outfit (Modern)</option>
                          <option value="Playfair Display">Playfair Display (Serif)</option>
                          <option value="Montserrat">Montserrat (Geometric)</option>
                          <option value="Roboto">Roboto (Clean)</option>
                          <option value="Poppins">Poppins (Friendly)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Font Size (px)</label>
                        <input
                          type="number"
                          required
                          value={navbarConfig.fontSize || 20}
                          onChange={(e) => setNavbarConfig({ ...navbarConfig, fontSize: parseInt(e.target.value) || 20 })}
                          placeholder="20"
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#F3A61E]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Logo Height (px)</label>
                      <input
                        type="number"
                        required
                        min={40}
                        max={200}
                        value={navbarConfig.logoSize || 104}
                        onChange={(e) => setNavbarConfig({ ...navbarConfig, logoSize: parseInt(e.target.value) || 104 })}
                        placeholder="104"
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#F3A61E]"
                      />
                      <p className="text-[10px] text-zinc-500 mt-1">Configure height of the logo on desktop (in pixels). Mobile scales automatically. Default is 104.</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-emerald-800/40"
                  >
                    Save Navbar Settings
                  </button>
                </form>
              </div>
            )}

            {activeTab === "Footer" && (
              <div className="space-y-6 p-6 text-left">
                <form onSubmit={handleSaveFooter} className="bg-zinc-900/40 border border-zinc-800/85 rounded-2xl p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Footer Settings</h3>
                    <p className="text-xs text-zinc-400 mt-1">Configure footer content overview links, quick links, contact info, and social integration.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: General info, email, social */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 font-black">Footer Logo Image</label>
                        <div className="flex items-center gap-4 bg-zinc-950/40 border border-zinc-800/80 p-3 rounded-xl">
                          {footerConfig.logo && (
                            <div className="h-12 w-12 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center p-1 overflow-hidden shrink-0">
                              <img
                                src={footerConfig.logo}
                                alt="Footer Logo Preview"
                                className="h-full w-full object-contain"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, (url) => setFooterConfig({ ...footerConfig, logo: url }))}
                              className="block w-full text-xs text-zinc-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-xs file:font-black file:uppercase file:tracking-wider
                                file:bg-emerald-950 file:text-emerald-300
                                hover:file:bg-emerald-900 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border border-zinc-800/50 p-4 rounded-xl space-y-4 bg-zinc-950/20">
                        <h4 className="text-xs font-black text-[#F3A61E] uppercase tracking-wider">Contact Details</h4>
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Email</label>
                          <input
                            type="email"
                            required
                            value={footerConfig.contact?.email || ""}
                            onChange={(e) => setFooterConfig({
                              ...footerConfig,
                              contact: { ...footerConfig.contact, email: e.target.value }
                            })}
                            className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Call to Action (CTA) Text</label>
                          <input
                            type="text"
                            required
                            value={footerConfig.contact?.ctaText || ""}
                            onChange={(e) => setFooterConfig({
                              ...footerConfig,
                              contact: { ...footerConfig.contact, ctaText: e.target.value }
                            })}
                            className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="border border-zinc-800/50 p-4 rounded-xl space-y-4 bg-zinc-950/20">
                        <h4 className="text-xs font-black text-[#F3A61E] uppercase tracking-wider">Social Integrations</h4>
                        {(footerConfig.social || []).map((s: any, idx: number) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <span className="w-20 text-xs font-bold text-zinc-400">{s.platform}:</span>
                            <input
                              type="text"
                              value={s.href}
                              onChange={(e) => {
                                const newSocial = [...footerConfig.social];
                                newSocial[idx] = { ...s, href: e.target.value };
                                setFooterConfig({ ...footerConfig, social: newSocial });
                              }}
                              className="flex-1 px-4 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Column: Company Overview and Quick Links lists */}
                    <div className="space-y-6">
                      <div className="border border-zinc-800/50 p-4 rounded-xl bg-zinc-950/20">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-xs font-black text-[#F3A61E] uppercase tracking-wider">Company Overview Links</h4>
                          <button
                            type="button"
                            onClick={() => {
                              const newLinks = [...(footerConfig.companyOverview || []), { label: "New Link", href: "/" }];
                              setFooterConfig({ ...footerConfig, companyOverview: newLinks });
                            }}
                            className="px-2.5 py-1 bg-emerald-950/30 text-[#52c47c] border border-emerald-900/30 rounded text-[10px] font-black uppercase cursor-pointer"
                          >
                            + Add Link
                          </button>
                        </div>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {(footerConfig.companyOverview || []).map((link: any, idx: number) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={link.label}
                                onChange={(e) => {
                                  const newLinks = [...footerConfig.companyOverview];
                                  newLinks[idx] = { ...link, label: e.target.value };
                                  setFooterConfig({ ...footerConfig, companyOverview: newLinks });
                                }}
                                placeholder="Label"
                                className="w-1/3 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
                              />
                              <input
                                type="text"
                                value={link.href}
                                onChange={(e) => {
                                  const newLinks = [...footerConfig.companyOverview];
                                  newLinks[idx] = { ...link, href: e.target.value };
                                  setFooterConfig({ ...footerConfig, companyOverview: newLinks });
                                }}
                                placeholder="Href"
                                className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newLinks = footerConfig.companyOverview.filter((_: any, i: number) => i !== idx);
                                  setFooterConfig({ ...footerConfig, companyOverview: newLinks });
                                }}
                                className="px-2 py-1 bg-red-950/30 text-red-400 border border-red-900/35 rounded text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border border-zinc-800/50 p-4 rounded-xl bg-zinc-950/20">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-xs font-black text-[#F3A61E] uppercase tracking-wider">Quick Links</h4>
                          <button
                            type="button"
                            onClick={() => {
                              const newLinks = [...(footerConfig.quickLinks || []), { label: "New Link", href: "/" }];
                              setFooterConfig({ ...footerConfig, quickLinks: newLinks });
                            }}
                            className="px-2.5 py-1 bg-emerald-950/30 text-[#52c47c] border border-emerald-900/30 rounded text-[10px] font-black uppercase cursor-pointer"
                          >
                            + Add Link
                          </button>
                        </div>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {(footerConfig.quickLinks || []).map((link: any, idx: number) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={link.label}
                                onChange={(e) => {
                                  const newLinks = [...footerConfig.quickLinks];
                                  newLinks[idx] = { ...link, label: e.target.value };
                                  setFooterConfig({ ...footerConfig, quickLinks: newLinks });
                                }}
                                placeholder="Label"
                                className="w-1/3 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
                              />
                              <input
                                type="text"
                                value={link.href}
                                onChange={(e) => {
                                  const newLinks = [...footerConfig.quickLinks];
                                  newLinks[idx] = { ...link, href: e.target.value };
                                  setFooterConfig({ ...footerConfig, quickLinks: newLinks });
                                }}
                                placeholder="Href"
                                className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newLinks = footerConfig.quickLinks.filter((_: any, i: number) => i !== idx);
                                  setFooterConfig({ ...footerConfig, quickLinks: newLinks });
                                }}
                                className="px-2 py-1 bg-red-950/30 text-red-400 border border-red-900/35 rounded text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-emerald-800/40"
                    >
                      Save Footer Settings
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "AdminProfile" && (
              <div className="space-y-6 p-6 text-left">
                <div className="bg-zinc-900/40 border border-zinc-800/85 rounded-2xl p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Admin Profile Settings</h3>
                    <p className="text-xs text-zinc-400 mt-1">Manage your administrative credentials, email, and display avatar.</p>
                  </div>

                  {/* Profile Photo Uploader */}
                  <div className="flex flex-col items-center justify-center p-4 border border-zinc-800 bg-zinc-950/20 rounded-2xl">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Profile Picture</label>
                    <div className="relative group h-28 w-28 rounded-full overflow-hidden border-2 border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center cursor-pointer">
                      <img src={adminAvatar} alt="Admin Avatar" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs text-white font-black uppercase text-center font-bold">
                        {isAdminPhotoUploading ? "Uploading..." : "Upload"}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsAdminPhotoUploading(true);
                          const formData = new FormData();
                          formData.append("file", file);
                          try {
                            const res = await fetch('/api/upload', { method: 'POST', body: formData });
                            const data = await res.json();
                            if (data.success) {
                              setAdminAvatar(data.url);
                              localStorage.setItem("admin_avatar", data.url);

                              // Save immediately to DB
                              const currentEmail = localStorage.getItem("admin_email") || "admin@kanha.org";
                              const storedUsername = localStorage.getItem("admin_username") || "Admin";
                              const storedPhone = localStorage.getItem("admin_phone") || "";

                              await fetch('/api/admin/auth', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  action: "update",
                                  currentEmail,
                                  username: storedUsername,
                                  email: currentEmail,
                                  phone: storedPhone,
                                  avatar: data.url
                                })
                              });

                              window.dispatchEvent(new Event("user_avatar_update"));
                              triggerAlert("Profile picture updated and saved!");
                            } else {
                              triggerAlert(data.error || "Upload failed.");
                            }
                          } catch (err) {
                            console.error("Admin avatar upload error:", err);
                            triggerAlert("Error uploading image.");
                          } finally {
                            setIsAdminPhotoUploading(false);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const currentEmail = localStorage.getItem("admin_email") || "admin@kanha.org";
                      try {
                        const res = await fetch('/api/admin/auth', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            action: "update",
                            currentEmail,
                            username: adminUsername,
                            email: adminEmail,
                            phone: adminPhone,
                            avatar: adminAvatar
                          })
                        });
                        const data = await res.json();
                        if (data.success) {
                          localStorage.setItem("admin_username", adminUsername);
                          localStorage.setItem("admin_email", adminEmail);
                          localStorage.setItem("admin_phone", adminPhone);
                          localStorage.setItem("admin_avatar", adminAvatar);
                          triggerAlert("Admin profile details saved successfully!");
                          window.dispatchEvent(new Event("user_avatar_update"));
                        } else {
                          triggerAlert(data.error || "Failed to save profile details.");
                        }
                      } catch (err) {
                        console.error("Save profile error:", err);
                        triggerAlert("Error saving profile details.");
                      }
                    }} 
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Admin Name / Username</label>
                        <input
                          type="text"
                          required
                          value={adminUsername}
                          onChange={(e) => setAdminUsername(e.target.value)}
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Admin Email Address</label>
                        <input
                          type="email"
                          required
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Admin Phone Number</label>
                        <input
                          type="text"
                          required
                          value={adminPhone}
                          onChange={(e) => setAdminPhone(e.target.value)}
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-emerald-800/40"
                      >
                        Save Profile Details
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "StarVolunteers" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">Weekly Star Volunteers</h3>
                  <span className="text-xs text-zinc-400">Manage manually configured star volunteers or override automatic weekly calculation stars.</span>
                </div>
                <table className="min-w-full divide-y divide-zinc-800 text-left">
                  <thead>
                    <tr className="bg-zinc-900/60 text-zinc-400 text-xs font-black uppercase tracking-wider">
                      <th className="px-6 py-4">Photo</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Gender</th>
                      <th className="px-6 py-4">Grade</th>
                      <th className="px-6 py-4">Week Label</th>
                      <th className="px-6 py-4">Completions</th>
                      <th className="px-6 py-4">Reason / Highlight Details</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {starVolunteers.map((star, idx) => (
                      <tr key={star.id || idx} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img 
                            src={star.profile_photo || (star.gender === "Female" 
                              ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
                              : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                            )} 
                            alt={star.name} 
                            className="h-10 w-10 object-cover rounded-full border border-zinc-850" 
                          />
                        </td>
                        <td className="px-6 py-4"><span className="text-sm font-bold text-white">{star.name}</span></td>
                        <td className="px-6 py-4"><span className="text-xs text-zinc-350">{star.gender || "Male"}</span></td>
                        <td className="px-6 py-4"><span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-black rounded-lg">{star.grade}</span></td>
                        <td className="px-6 py-4"><span className="text-xs text-zinc-400 font-medium">{star.week_label}</span></td>
                        <td className="px-6 py-4"><span className="text-xs text-zinc-400 font-medium">{star.tasks_completed} drives</span></td>
                        <td className="px-6 py-4"><p className="text-xs text-zinc-400 line-clamp-2 max-w-xs">{star.reason}</p></td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {star.id && !star.id.toString().startsWith("auto") && !star.id.toString().startsWith("fallback") ? (
                              <>
                                <button onClick={() => openEditModal(star)} className="px-3 py-1.5 border border-zinc-700 hover:border-zinc-500 rounded-lg text-xs text-zinc-300 transition-colors cursor-pointer">Edit</button>
                                <button onClick={() => handleDelete(star.id)} className="px-3 py-1.5 bg-red-650/15 border border-red-900/40 rounded-lg text-xs text-red-400 hover:bg-red-650/25 transition-all cursor-pointer">Delete</button>
                              </>
                            ) : (
                              <button onClick={() => openOverrideModal(star)} className="px-3 py-1.5 bg-[#1E4D2B]/20 border border-emerald-900/40 rounded-lg text-xs text-[#52c47c] hover:bg-[#1E4D2B]/30 transition-all cursor-pointer">Override / Save</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "WhatsAppCommunity" && (
              <div className="bg-[#101412] p-8 sm:p-10 rounded-[2.5rem] border border-zinc-800/80 shadow-lg text-left max-w-2xl mx-auto space-y-6">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <span>💬</span> WhatsApp Community Settings
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Manage the global invitation link for the WhatsApp Community. Setting this link displays the "Join Community" button in the website footer and homepage. Deleting or clearing it will hide the buttons.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      WhatsApp Community Invitation Link
                    </label>
                    <input
                      type="url"
                      value={whatsappCommunityLinkInput}
                      onChange={(e) => setWhatsappCommunityLinkInput(e.target.value)}
                      placeholder="e.g., https://chat.whatsapp.com/L1234567890abcdef"
                      className="w-full px-4 py-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isSavingWhatsappLink}
                      onClick={async () => {
                        setIsSavingWhatsappLink(true);
                        try {
                          const existingItem = pageTexts.find((t: any) => t.key === "whatsapp_community_link");
                          const method = existingItem ? "PUT" : "POST";
                          const res = await fetch("/api/page-texts", {
                            method,
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              key: "whatsapp_community_link",
                              title: "Global Settings - WhatsApp Community Invitation Link",
                              value: whatsappCommunityLinkInput
                            })
                          });
                          const result = await res.json();
                          if (result.success) {
                            triggerAlert("WhatsApp Community Link saved successfully!");
                            // Refresh page texts
                            const refRes = await fetch('/api/page-texts');
                            const refData = await refRes.json();
                            setPageTexts(Array.isArray(refData) ? refData : []);
                          } else {
                            triggerAlert("Failed to save link: " + (result.error || "Unknown error"));
                          }
                        } catch (err: any) {
                          triggerAlert("Error: " + err.message);
                        } finally {
                          setIsSavingWhatsappLink(false);
                        }
                      }}
                      className="px-6 py-3 bg-[#1E4D2B] hover:bg-[#15381E] text-white font-extrabold text-xs rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-50 border border-emerald-800/40"
                    >
                      {isSavingWhatsappLink ? "Saving..." : "Save Link"}
                    </button>

                    <button
                      type="button"
                      disabled={isSavingWhatsappLink}
                      onClick={async () => {
                        if (!window.confirm("Are you sure you want to delete the WhatsApp Community Link? This will hide the Join Community buttons from the live website.")) return;
                        setIsSavingWhatsappLink(true);
                        try {
                          const res = await fetch("/api/page-texts?key=whatsapp_community_link", {
                            method: "DELETE"
                          });
                          const result = await res.json();
                          if (result.success) {
                            setWhatsappCommunityLinkInput("");
                            triggerAlert("WhatsApp Community Link deleted successfully!");
                            // Refresh page texts
                            const refRes = await fetch('/api/page-texts');
                            const refData = await refRes.json();
                            setPageTexts(Array.isArray(refData) ? refData : []);
                          } else {
                            triggerAlert("Failed to delete link: " + (result.error || "Unknown error"));
                          }
                        } catch (err: any) {
                          triggerAlert("Error: " + err.message);
                        } finally {
                          setIsSavingWhatsappLink(false);
                        }
                      }}
                      className="px-6 py-3 bg-red-650/10 hover:bg-red-650/20 border border-red-900/40 text-red-400 font-extrabold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Delete / Clear Link
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Edit / Add Modal Overlays popup */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
            <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800/80 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative z-10 p-8 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl sm:text-2xl font-black text-white mb-6">
                {editingItem 
                  ? `Edit ${activeTab === "Blogs" ? "Blog" : activeTab === "Highlights" ? (highlightSubTab === "directors" ? "Director" : "Volunteer") : activeTab === "Applications" ? "Volunteer App" : activeTab === "PageMedia" ? "Banner/Media Setting" : activeTab === "PageTexts" ? "Text Setting" : activeTab.substring(0, activeTab.length - 1)}` 
                  : `Add ${activeTab === "Blogs" ? "Blog" : activeTab === "Highlights" ? (highlightSubTab === "directors" ? "Director" : "Volunteer") : activeTab === "Applications" ? "Volunteer App" : activeTab === "PageMedia" ? "Banner/Media Setting" : activeTab === "PageTexts" ? "Text Setting" : activeTab.substring(0, activeTab.length - 1)}`}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                
                {activeTab === "Causes" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Campaign Title</label>
                      <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Daily Meals for Kids" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Category</label>
                        <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white">
                          {categoriesList.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Price Label</label>
                        <input type="text" required value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="e.g. Rs. 2,000.00" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Image Upload</label>
                        <input type="file" ref={imageInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, setFormImage)} className="hidden" />
                        <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold rounded-xl text-zinc-350 transition-all cursor-pointer flex justify-center items-center gap-1.5">
                          <svg className="h-4 w-4 text-emerald-450" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          Choose Image
                        </button>
                        {formImage && <p className="text-[10px] text-zinc-400 mt-1 truncate">{formImage}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Video Upload (Optional)</label>
                        <input type="file" ref={videoInputRef} accept="video/*" onChange={(e) => handleFileUpload(e, setFormVideo)} className="hidden" />
                        <button type="button" onClick={() => videoInputRef.current?.click()} className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold rounded-xl text-zinc-300 transition-all cursor-pointer flex justify-center items-center gap-1.5">
                          <svg className="h-4 w-4 text-emerald-450" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          Choose Video
                        </button>
                        {formVideo && <p className="text-[10px] text-zinc-400 mt-1 truncate">{formVideo}</p>}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "Reviews" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Review Title</label>
                      <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. One small act. One real change." className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Reviewer Author</label>
                      <input type="text" required value={formAuthor} onChange={(e) => setFormAuthor(e.target.value)} placeholder="e.g. Amit Patel, Gujarat" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Description (Snippet)</label>
                      <textarea required value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="e.g. I got proof straight on WhatsApp..." className="w-full h-24 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Video Upload</label>
                      <input type="file" ref={videoInputRef} accept="video/*" onChange={(e) => handleFileUpload(e, setFormVideo)} className="hidden" />
                      <button type="button" onClick={() => videoInputRef.current?.click()} className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold rounded-xl text-zinc-300 transition-all cursor-pointer flex justify-center items-center gap-1.5">
                        <svg className="h-4 w-4 text-emerald-450" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Upload Video File
                      </button>
                      {formVideo && <p className="text-[10px] text-zinc-400 mt-1 truncate">{formVideo}</p>}
                    </div>
                  </>
                )}

                {activeTab === "Blogs" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Blog Post Title</label>
                      <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Why Feeding Strays Is Responsibility" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Thumbnail Upload</label>
                        <input type="file" ref={imageInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, setFormImage)} className="hidden" />
                        <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold rounded-xl text-zinc-300 transition-all cursor-pointer flex justify-center items-center gap-1.5">
                          <svg className="h-4 w-4 text-emerald-450" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          Upload Image
                        </button>
                        {formImage && <p className="text-[10px] text-zinc-400 mt-1 truncate">{formImage}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Publish Date Label</label>
                        <input type="text" value={formDate} onChange={(e) => setFormDate(e.target.value)} placeholder="e.g. JANUARY 3, 2026" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Excerpt Description</label>
                      <textarea required value={formExcerpt} onChange={(e) => setFormExcerpt(e.target.value)} placeholder="A short description summarizing the blog article..." className="w-full h-24 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white" />
                    </div>
                  </>
                )}

                {activeTab === "Stories" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Story Image Upload</label>
                      <input type="file" ref={imageInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, setFormImage)} className="hidden" />
                      <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold rounded-xl text-zinc-300 transition-all cursor-pointer flex justify-center items-center gap-1.5">
                        <svg className="h-4 w-4 text-emerald-450" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Choose Image File
                      </button>
                      {formImage && <p className="text-[10px] text-zinc-400 mt-1 truncate">{formImage}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Alternative Alt text</label>
                      <input type="text" required value={formAlt} onChange={(e) => setFormAlt(e.target.value)} placeholder="e.g. Education kit delivery smile" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white" />
                    </div>
                  </>
                )}

                {activeTab === "DetailedStories" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Story Title</label>
                      <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Empowering Schoolkids with Kits" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Category</label>
                        <select 
                          value={formCategory} 
                          onChange={(e) => setFormCategory(e.target.value)} 
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                        >
                          <option value="Food Relief">Food Relief</option>
                          <option value="Education">Education</option>
                          <option value="Women Care">Women Care</option>
                          <option value="Stray Care">Stray Care</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Date Label</label>
                        <input type="text" value={formDate} onChange={(e) => setFormDate(e.target.value)} placeholder="e.g. July 2026" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Image Upload</label>
                        <input type="file" ref={imageInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, setFormImage)} className="hidden" />
                        <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold rounded-xl text-zinc-350 transition-all cursor-pointer flex justify-center items-center gap-1.5">
                          <svg className="h-4 w-4 text-emerald-450" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          Choose Image
                        </button>
                        {formImage && <p className="text-[10px] text-zinc-400 mt-1 truncate">{formImage}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Stats Highlight Label</label>
                        <input type="text" value={formExcerpt} onChange={(e) => setFormExcerpt(e.target.value)} placeholder="e.g. 150+ Kits Distributed" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Description</label>
                      <textarea required value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Enter details of the relief work campaign story..." className="w-full h-24 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" />
                    </div>
                  </>
                )}

                {activeTab === "SuccessStories" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Success Story Title</label>
                      <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. 7 Lakh+ Birthday Giving" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Success Story Image Upload / URL</label>
                      <div className="space-y-2">
                        <input type="file" ref={imageInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, setFormImage)} className="hidden" />
                        <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold rounded-xl text-zinc-300 transition-all cursor-pointer flex justify-center items-center gap-1.5">
                          <svg className="h-4 w-4 text-emerald-450" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          Choose Image File
                        </button>
                        <input type="text" required value={formImage} onChange={(e) => setFormImage(e.target.value)} placeholder="Or paste custom image URL here" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Short Description</label>
                      <textarea required value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Enter a brief description summarizing this success metric/story..." className="w-full h-24 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" />
                    </div>
                  </>
                )}

                {activeTab === "ContactInfo" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Card Title</label>
                      <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Registered Address" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Type</label>
                        <select 
                          value={formStatus} 
                          onChange={(e) => setFormStatus(e.target.value)} 
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                        >
                          <option value="address">Address</option>
                          <option value="email">Email</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="phone">Phone</option>
                          <option value="text">General Text</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Icon Style</label>
                        <select 
                          value={formImage} 
                          onChange={(e) => setFormImage(e.target.value)} 
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                        >
                          <option value="map-pin">Map Pin</option>
                          <option value="mail">Mail Envelope</option>
                          <option value="whatsapp">WhatsApp logo</option>
                          <option value="phone">Phone handset</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Contact Detail Value</label>
                      <textarea required value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="e.g. support@kanhafoundation.org or Office Address..." className="w-full h-24 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" />
                    </div>
                  </>
                )}

                {activeTab === "Donations" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-[#F3A61E] uppercase tracking-wider mb-1.5">Donor Name</label>
                      <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Vikram Singh" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Donor Address / Location (Optional)</label>
                      <input type="text" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder="e.g. Ranchi, Jharkhand, India" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Amount Label</label>
                        <input type="text" required value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="e.g. ₹10,000" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Transaction Date</label>
                        <input type="text" required value={formTransactionDate} onChange={(e) => setFormTransactionDate(e.target.value)} placeholder="e.g. 11 July 2026 at 05:33 pm" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Donated For (Product / Cause)</label>
                      <select
                        value={(causesList.some(c => c.title === formExcerpt) || formExcerpt === "General Support") ? formExcerpt : (formExcerpt ? "Custom" : "")}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "Custom") {
                            setFormExcerpt("");
                          } else {
                            setFormExcerpt(val);
                          }
                        }}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                      >
                        <option value="" disabled>Select a cause...</option>
                        {causesList.map((cause) => (
                          <option key={cause.id} value={cause.title}>
                            {cause.title} ({cause.price})
                          </option>
                        ))}
                        <option value="General Support">General Support</option>
                        <option value="Custom">Custom / Other...</option>
                      </select>
                      {(!(causesList.some(c => c.title === formExcerpt) || formExcerpt === "General Support") || formExcerpt === "") && (
                        <input
                          type="text"
                          required
                          value={formExcerpt}
                          onChange={(e) => setFormExcerpt(e.target.value)}
                          placeholder="Enter custom cause name..."
                          className="w-full mt-2 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none"
                        />
                      )}
                    </div>
                    <input type="hidden" value={formDesc} />
                  </>
                )}

                {activeTab === "Highlights" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-[#F3A61E] uppercase tracking-wider mb-1.5">Name</label>
                      <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Dr. Kiran Kumar" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Role Designation</label>
                      <input type="text" required value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="e.g. Co-Founder & Director" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Quote / Statement</label>
                      <textarea required value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="e.g. Kindness is a chain reaction..." className="w-full h-24 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Photo File Upload</label>
                      <input type="file" ref={imageInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, setFormImage)} className="hidden" />
                      <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold rounded-xl text-zinc-300 transition-all cursor-pointer flex justify-center items-center gap-1.5">
                        <svg className="h-4 w-4 text-emerald-450" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Upload Photo File
                      </button>
                      {formImage && <p className="text-[10px] text-zinc-400 mt-1 truncate">{formImage}</p>}
                    </div>
                  </>
                )}

                {activeTab === "Applications" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Applicant Name</label>
                        <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Rahul Sharma" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Email Address</label>
                        <input type="email" required value={formAuthor} onChange={(e) => setFormAuthor(e.target.value)} placeholder="name@domain.com" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Phone (Mobile/WhatsApp)</label>
                        <input type="text" required value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="e.g. +91 9876543210" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">City/Location</label>
                        <input type="text" required value={formCategory} onChange={(e) => setFormCategory(e.target.value)} placeholder="e.g. Ranchi" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Gender</label>
                        <select value={formGender} onChange={(e) => setFormGender(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white text-zinc-300">
                          <option value="" disabled>Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Status</label>
                        <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white">
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                        </select>
                      </div>
                    </div>

                    {/* Profile Photo Edit Section inside Applications */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Profile Photo Link/Upload</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={formProfilePhoto} 
                          onChange={(e) => setFormProfilePhoto(e.target.value)} 
                          placeholder="Image URL or upload" 
                          className="flex-1 px-4 py-2 bg-zinc-955 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none" 
                        />
                        <input type="file" ref={imageInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, setFormProfilePhoto)} className="hidden" />
                        <button type="button" onClick={() => imageInputRef.current?.click()} className="px-4 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold rounded-xl text-zinc-300 transition-all cursor-pointer">
                          Upload
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Areas of Interest / Skills (Select options)</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/65">
                        {[
                          "Food Distribution & Relief Work",
                          "Children Education & Mentoring",
                          "Animal Welfare & Rescue support",
                          "Tree Plantation & Nature Drives",
                          "Social Media & Graphic Design"
                        ].map((skill) => {
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
                      <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Why do you want to join our organization?" className="w-full h-20 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" />
                    </div>
                  </>
                )}

                {activeTab === "Tasks" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Select Approved Volunteer</label>
                      <select 
                        required
                        value={taskFormVolunteerId}
                        onChange={(e) => setTaskFormVolunteerId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                      >
                        <option value="">-- Choose a Volunteer --</option>
                        {volApps.map(a => (
                          <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Task Title</label>
                      <input 
                        type="text" 
                        required 
                        value={taskFormTitle} 
                        onChange={(e) => setTaskFormTitle(e.target.value)} 
                        placeholder="e.g. Ranchi Food Distribution Drive" 
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Task Description / Instructions</label>
                      <textarea 
                        value={taskFormDesc} 
                        onChange={(e) => setTaskFormDesc(e.target.value)} 
                        placeholder="Details/Instructions for the volunteer task..." 
                        className="w-full h-24 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Target Date</label>
                        <input 
                          type="date" 
                          required 
                          value={taskFormDate} 
                          onChange={(e) => setTaskFormDate(e.target.value)} 
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none text-zinc-350" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Target Time</label>
                        <input 
                          type="time" 
                          required 
                          value={taskFormTime} 
                          onChange={(e) => setTaskFormTime(e.target.value)} 
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none text-zinc-350" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Assigned Money / Budget (₹)</label>
                        <input 
                          type="number" 
                          required 
                          value={taskFormAssignedMoney} 
                          onChange={(e) => setTaskFormAssignedMoney(e.target.value)} 
                          placeholder="e.g. 500" 
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Task Status</label>
                        <select 
                          value={taskFormStatus} 
                          onChange={(e) => setTaskFormStatus(e.target.value)} 
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Started">Started</option>
                          <option value="Processing">Processing</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "PageMedia" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Setting Section Banner Title</label>
                      {editingItem ? (
                        <input
                          type="text"
                          required
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="e.g. Home Page - Hero Background"
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      ) : (
                        <div className="space-y-2">
                          <select
                            value={
                              Object.values(KEY_MAP).map(v => v.title).includes(formTitle)
                                ? formTitle
                                : formTitle === ""
                                ? "Home Page - Main Hero Background (Video/Image)"
                                : "custom"
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "custom") {
                                setFormTitle("");
                              } else {
                                setFormTitle(val);
                                // Auto-fill corresponding key and format type
                                const matchingKey = Object.keys(KEY_MAP).find(k => KEY_MAP[k].title === val);
                                if (matchingKey) {
                                  setFormAuthor(matchingKey);
                                  setSelectedMediaType(KEY_MAP[matchingKey].type);
                                }
                              }
                            }}
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                          >
                            <option value="Home Page - Main Hero Background (Video/Image)">Home Page - Main Hero Background (Video/Image)</option>
                            <option value="Home Page - Hero Background Video">Home Page - Hero Background Video</option>
                            <option value="About Page - Top Banner Header Image">About Page - Top Banner Header Image</option>
                            <option value="Our Impact Page - Top Banner Header Image">Our Impact Page - Top Banner Header Image</option>
                            <option value="Causes Page - Top Banner Header Image">Causes Page - Top Banner Header Image</option>
                            <option value="About Page - Our Vision Section Image">About Page - Our Vision Section Image</option>
                            <option value="About Page - Our Mission Section Image">About Page - Our Mission Section Image</option>
                            <option value="About Page - Our Team Section Image">About Page - Our Team Section Image</option>
                            <option value="About Page - How to Donate Tutorial Video">About Page - How to Donate Tutorial Video</option>
                            <option value="About Page - Footer Banner (Smiling Kids)">About Page - Footer Banner (Smiling Kids)</option>
                            <option value="Home Page - Volunteer Onboarding Banner">Home Page - Volunteer Onboarding Banner</option>
                            <option value="Home Page - Education Campaign Banner">Home Page - Education Campaign Banner</option>
                            <option value="Home Page - Birthday Campaign Banner">Home Page - Birthday Campaign Banner</option>
                            <option value="Home Page - Trust Section (Top-Left Image)">Home Page - Trust Section (Top-Left Image)</option>
                            <option value="Home Page - Trust Section (Bottom-Right Image)">Home Page - Trust Section (Bottom-Right Image)</option>
                            <option value="custom">Other / Custom Title...</option>
                          </select>

                          {!Object.values(KEY_MAP).map(v => v.title).includes(formTitle) && (
                            <input
                              type="text"
                              required
                              value={formTitle}
                              onChange={(e) => setFormTitle(e.target.value)}
                              placeholder="Type custom banner title here"
                              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Identifier Key</label>
                      {editingItem ? (
                        <input
                          type="text"
                          required
                          disabled
                          value={formAuthor}
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none disabled:opacity-50 font-mono"
                        />
                      ) : (
                        <div className="space-y-2">
                          <select
                            value={
                              Object.keys(KEY_MAP).includes(formAuthor)
                                ? formAuthor
                                : formAuthor === ""
                                ? "home_hero"
                                : "custom"
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "custom") {
                                setFormAuthor("");
                              } else {
                                setFormAuthor(val);
                                // Auto-fill corresponding title and format type
                                if (KEY_MAP[val]) {
                                  setFormTitle(KEY_MAP[val].title);
                                  setSelectedMediaType(KEY_MAP[val].type);
                                }
                              }
                            }}
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none font-mono"
                          >
                            <option value="home_hero">home_hero - Home page main banner</option>
                            <option value="home_hero_video">home_hero_video - Home page background video</option>
                            <option value="about_header">about_header - About page top banner</option>
                            <option value="impacts_header">impacts_header - Our Impact page top banner</option>
                            <option value="causes_header">causes_header - Causes page top banner</option>
                            <option value="about_vision">about_vision - About page Vision image</option>
                            <option value="about_mission">about_mission - About page Mission image</option>
                            <option value="about_team">about_team - About page Team image</option>
                            <option value="about_tutorial_video">about_tutorial_video - Donate Tutorial video</option>
                            <option value="about_footer_banner">about_footer_banner - About page bottom banner</option>
                            <option value="home_volunteer_banner">home_volunteer_banner - Home page volunteer onboarding</option>
                            <option value="home_education_campaign">home_education_campaign - Education Campaign Banner</option>
                            <option value="home_birthday_campaign">home_birthday_campaign - Birthday Campaign Banner</option>
                            <option value="home_trust_top_left">home_trust_top_left - Trust Section Top-Left Image</option>
                            <option value="home_trust_bottom_right">home_trust_bottom_right - Trust Section Bottom-Right Image</option>
                            <option value="custom">Other / Custom Key...</option>
                          </select>

                          {!Object.keys(KEY_MAP).includes(formAuthor) && (
                            <input
                              type="text"
                              required
                              value={formAuthor}
                              onChange={(e) => setFormAuthor(e.target.value)}
                              placeholder="Type custom identifier key here (e.g. custom_banner)"
                              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Format Type</label>
                      <select value={selectedMediaType} onChange={(e) => setSelectedMediaType(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white">
                        <option value="image">Image File</option>
                        <option value="video">Video File</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Media File Upload</label>
                      <input type="file" ref={imageInputRef} accept={selectedMediaType === "video" ? "video/*" : "image/*"} onChange={(e) => handleFileUpload(e, setFormImage)} className="hidden" />
                      <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold rounded-xl text-zinc-300 transition-all cursor-pointer flex justify-center items-center gap-1.5">
                        <svg className="h-4 w-4 text-emerald-450" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Upload {selectedMediaType === "video" ? "Video" : "Image"} file
                      </button>
                      {formImage && <p className="text-[10px] text-zinc-400 mt-1 truncate">{formImage}</p>}
                    </div>
                  </>
                )}

                {activeTab === "PageTexts" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Section Text Location Title</label>
                      {editingItem ? (
                        <input
                          type="text"
                          required
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="e.g. About Page - Vision Section Description"
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      ) : (
                        <div className="space-y-2">
                          <select
                            value={
                              Object.values(TEXT_KEY_MAP).map(v => v.title).includes(formTitle)
                                ? formTitle
                                : formTitle === ""
                                ? "About Page - Top Banner Title Prefix Text"
                                : "custom"
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "custom") {
                                setFormTitle("");
                              } else {
                                setFormTitle(val);
                                // Auto-fill corresponding key
                                const matchingKey = Object.keys(TEXT_KEY_MAP).find(k => TEXT_KEY_MAP[k].title === val);
                                if (matchingKey) {
                                  setFormAuthor(matchingKey);
                                }
                              }
                            }}
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                          >
                            {Object.keys(TEXT_KEY_MAP).map(k => (
                              <option key={k} value={TEXT_KEY_MAP[k].title}>{TEXT_KEY_MAP[k].title}</option>
                            ))}
                            <option value="custom">Other / Custom Title...</option>
                          </select>

                          {(!Object.values(TEXT_KEY_MAP).map(v => v.title).includes(formTitle) || formTitle === "") && (
                            <input
                              type="text"
                              required
                              value={formTitle}
                              onChange={(e) => setFormTitle(e.target.value)}
                              placeholder="Type custom text title here"
                              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Identifier Key</label>
                      {editingItem ? (
                        <input
                          type="text"
                          required
                          disabled
                          value={formAuthor}
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none disabled:opacity-50 font-mono"
                        />
                      ) : (
                        <div className="space-y-2">
                          <select
                            value={
                              Object.keys(TEXT_KEY_MAP).includes(formAuthor)
                                ? formAuthor
                                : formAuthor === ""
                                ? "about_banner_title_prefix"
                                : "custom"
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "custom") {
                                setFormAuthor("");
                              } else {
                                setFormAuthor(val);
                                // Auto-fill corresponding title
                                if (TEXT_KEY_MAP[val]) {
                                  setFormTitle(TEXT_KEY_MAP[val].title);
                                }
                              }
                            }}
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none font-mono"
                          >
                            {Object.keys(TEXT_KEY_MAP).map(k => (
                              <option key={k} value={k}>{k} - {TEXT_KEY_MAP[k].title.replace("About Page - ", "").replace("Our Impact Page - ", "")}</option>
                            ))}
                            <option value="custom">Other / Custom Key...</option>
                          </select>

                          {(!Object.keys(TEXT_KEY_MAP).includes(formAuthor) || formAuthor === "") && (
                            <input
                              type="text"
                              required
                              value={formAuthor}
                              onChange={(e) => setFormAuthor(e.target.value)}
                              placeholder="Type custom identifier key here (e.g. about_custom_text)"
                              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Text Value Content</label>
                      <textarea required value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Enter details text content block..." className="w-full h-32 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                    </div>
                  </>
                )}

                {activeTab === "StarVolunteers" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#F3A61E] uppercase tracking-wider mb-1.5">Volunteer Name</label>
                        <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Rajesh Kumar" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Select Approved Volunteer Profile (Optional)</label>
                        <select 
                          value={formVolunteerId}
                          onChange={(e) => {
                            setFormVolunteerId(e.target.value);
                            const found = volApps.find(a => a.id.toString() === e.target.value);
                            if (found) {
                              setFormTitle(found.name);
                              setFormEmail(found.email || "");
                              setFormPhone(found.phone || "");
                              setFormGender(found.gender || "Male");
                              setFormProfilePhoto(found.profile_photo || "");
                            }
                          }}
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none"
                        >
                          <option value="">-- Manual Override Entry --</option>
                          {volApps.map(a => (
                            <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Gender</label>
                        <select value={formGender} onChange={(e) => setFormGender(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white text-zinc-300">
                          <option value="Male">Male (Boy)</option>
                          <option value="Female">Female (Girl)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Grade Rating</label>
                        <select value={formGrade} onChange={(e) => setFormGrade(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white">
                          <option value="A+">A+</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="Gold">Gold</option>
                          <option value="Silver">Silver</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Drives Completed</label>
                        <input type="number" required value={formTasksCompleted} onChange={(e) => setFormTasksCompleted(e.target.value)} placeholder="e.g. 5" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Email Address</label>
                        <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="volunteer@example.com" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                        <input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+91 9876543210" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Week Label</label>
                        <input type="text" value={formWeekLabel} onChange={(e) => setFormWeekLabel(e.target.value)} placeholder="e.g. Week of July 7, 2026" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Profile Photo Link/Upload</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={formProfilePhoto || formImage} 
                            onChange={(e) => {
                              setFormProfilePhoto(e.target.value);
                              setFormImage(e.target.value);
                            }} 
                            placeholder="Image URL or upload" 
                            className="flex-1 px-4 py-2 bg-zinc-955 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none" 
                          />
                          <input type="file" ref={imageInputRef} accept="image/*" onChange={(e) => {
                            handleFileUpload(e, (url) => {
                              setFormProfilePhoto(url);
                              setFormImage(url);
                            });
                          }} className="hidden" />
                          <button type="button" onClick={() => imageInputRef.current?.click()} className="px-4 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold rounded-xl text-zinc-355 transition-all cursor-pointer">
                            Upload
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Reason / Highlights Quote</label>
                      <textarea required value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="e.g. Managed food drives and water campaigns with outstanding results..." className="w-full h-24 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" />
                    </div>
                  </>
                )}

                {activeTab === "StatsCards" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-[#F3A61E] uppercase tracking-wider mb-1.5">Card Title / Label</label>
                      <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Donations Raised" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Base Value</label>
                        <input type="number" required value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="e.g. 100000" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Prefix</label>
                        <input type="text" value={formAuthor} onChange={(e) => setFormAuthor(e.target.value)} placeholder="e.g. ₹" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Suffix</label>
                        <input type="text" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} placeholder="e.g. +" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Icon Selection</label>
                        <select value={formImage} onChange={(e) => setFormImage(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none">
                          <option value="rupee">Indian Rupee (₹)</option>
                          <option value="users">Group of People (Donors)</option>
                          <option value="cake">Cake (Birthdays)</option>
                          <option value="heart">Heart (Lives Impacted)</option>
                          <option value="meals">Serving Tray (Meals)</option>
                          <option value="child-studykit">Child with Study Kit</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Category Tracker</label>
                        <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none">
                          <option value="raised">Donations Raised Tracker</option>
                          <option value="donors">Active Donors Tracker</option>
                          <option value="birthday">Birthday Giving Tracker</option>
                          <option value="lives">Lives Impacted Tracker</option>
                          <option value="meals">Meals Served Tracker</option>
                          <option value="studykit">Study Kits Tracker</option>
                          <option value="none">None (Static value)</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "Categories" && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Category Name</label>
                    <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Health Care" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                  </div>
                )}

                {activeTab === "RoleManagement" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Username / Name</label>
                        <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Aman Kumar" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Email Address</label>
                        <input type="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="user@gmail.com" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Phone (WhatsApp)</label>
                        <input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="e.g. +917488164529" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Account Role</label>
                        <select value={formRole} onChange={(e) => setFormRole(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none">
                          <option value="user">User</option>
                          <option value="volunteer">Volunteer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Account Password</label>
                      <input type="text" required value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="Enter password (plain text)" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none" />
                    </div>
                  </>
                )}

                {/* Unified Save / Cancel button */}
                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800/80 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-full border border-[#1A1A1A] text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" disabled={isUploading} className={`px-7 py-2 rounded-full text-white text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer ${isUploading ? 'bg-zinc-700 cursor-not-allowed' : 'bg-[#1E4D2B] hover:bg-[#15381E]'}`}>
                    {isUploading ? "Uploading..." : "Save changes"}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF Report Print Dialog overlay */}
      <AnimatePresence>
        {isReportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm no-print">
            <div className="fixed inset-0" onClick={() => setIsReportOpen(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header controls inside report viewer */}
              <div className="flex justify-between items-center bg-zinc-950 px-8 py-4 border-b border-zinc-800">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-300">Donation Report Document Preview</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="px-5 py-2 bg-emerald-650 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Print / Save PDF
                  </button>
                  <button 
                    onClick={() => setIsReportOpen(false)}
                    className="px-4 py-2 border border-zinc-850 text-zinc-400 hover:text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>

              {/* Actual Report Document Container (printed) */}
              <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-white text-black" id="print-report-container">
                <style dangerouslySetInnerHTML={{__html: `
                  @media print {
                    body {
                      background: white !important;
                      color: black !important;
                    }
                    body * {
                      visibility: hidden;
                    }
                    #print-report-container, #print-report-container * {
                      visibility: visible;
                    }
                    #print-report-container {
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 100%;
                      background: white !important;
                      color: black !important;
                      padding: 20px !important;
                    }
                    .no-print {
                      display: none !important;
                    }
                  }
                `}} />

                {/* Document Header */}
                <div className="border-b-2 border-zinc-900 pb-6 mb-8 flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">KANHA FOUNDATION</h1>
                    <p className="text-xs text-zinc-550 mt-1 font-bold">Ranchi, Jharkhand, India</p>
                    <p className="text-[10px] text-zinc-500 font-medium">Email: contact@kanhafoundation.org | Web: kanhafoundation.org</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-base font-black uppercase tracking-wider text-zinc-800">Donation Statement</h2>
                    <p className="text-xs text-zinc-550 font-bold mt-1">
                      Report Scope: {reportFilterType === "date" 
                        ? `Period: ${reportStartDate || 'All'} to ${reportEndDate || 'Today'}` 
                        : `Month: ${new Date(2020, parseInt(reportMonth, 10) - 1).toLocaleString('default', { month: 'long' })} ${reportYear}`}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Generated: {new Date().toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Report Table summary list */}
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-400 text-zinc-700 font-bold text-xs uppercase">
                      <th className="py-2.5">S.No.</th>
                      <th className="py-2.5">Donation Date</th>
                      <th className="py-2.5">Donor Name</th>
                      <th className="py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {donations.filter(d => {
                      const dDate = d.created_at ? new Date(d.created_at) : new Date();
                      if (reportFilterType === "date") {
                        if (reportStartDate) {
                          const start = new Date(reportStartDate);
                          start.setHours(0, 0, 0, 0);
                          if (dDate < start) return false;
                        }
                        if (reportEndDate) {
                          const end = new Date(reportEndDate);
                          end.setHours(23, 59, 59, 999);
                          if (dDate > end) return false;
                        }
                        return true;
                      } else {
                        const dMonth = dDate.getMonth() + 1;
                        const dYear = dDate.getFullYear();
                        if (reportMonth && dMonth !== parseInt(reportMonth, 10)) return false;
                        if (reportYear && dYear !== parseInt(reportYear, 10)) return false;
                        return true;
                      }
                    }).map((d, index) => {
                      const amtStr = d.amount.replace(/[^0-9.]/g, "");
                      const parsedAmt = parseFloat(amtStr) || 0;
                      return (
                        <tr key={d.id} className="text-zinc-800 text-xs">
                          <td className="py-3 font-medium">{index + 1}</td>
                          <td className="py-3 font-mono">
                            {d.created_at 
                              ? new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) 
                              : 'Prior Record'}
                          </td>
                          <td className="py-3 font-bold">{d.name}</td>
                          <td className="py-3 text-right font-black">₹{parsedAmt.toLocaleString('en-IN')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Financial summaries */}
                <div className="mt-8 border-t border-zinc-900 pt-6 flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed max-w-sm">
                      * Note: Kanha Foundation is registered under Section 80G of the Income Tax Act. All donations compiled here are fully eligible for tax exemption computations.
                    </p>
                  </div>
                  <div className="w-64 text-right space-y-2">
                    <div className="flex justify-between text-xs text-zinc-600 font-bold">
                      <span>Total Contributions:</span>
                      <span>{donations.filter(d => {
                        const dDate = d.created_at ? new Date(d.created_at) : new Date();
                        if (reportFilterType === "date") {
                          if (reportStartDate) {
                            const start = new Date(reportStartDate);
                            start.setHours(0, 0, 0, 0);
                            if (dDate < start) return false;
                          }
                          if (reportEndDate) {
                            const end = new Date(reportEndDate);
                            end.setHours(23, 59, 59, 999);
                            if (dDate > end) return false;
                          }
                          return true;
                        } else {
                          const dMonth = dDate.getMonth() + 1;
                          const dYear = dDate.getFullYear();
                          if (reportMonth && dMonth !== parseInt(reportMonth, 10)) return false;
                          if (reportYear && dYear !== parseInt(reportYear, 10)) return false;
                          return true;
                        }
                      }).length} records</span>
                    </div>
                    <div className="flex justify-between text-sm font-black border-t border-dashed border-zinc-400 pt-2 text-zinc-900">
                      <span>Total Collections:</span>
                      <span>₹{donations.filter(d => {
                        const dDate = d.created_at ? new Date(d.created_at) : new Date();
                        if (reportFilterType === "date") {
                          if (reportStartDate) {
                            const start = new Date(reportStartDate);
                            start.setHours(0, 0, 0, 0);
                            if (dDate < start) return false;
                          }
                          if (reportEndDate) {
                            const end = new Date(reportEndDate);
                            end.setHours(23, 59, 59, 999);
                            if (dDate > end) return false;
                          }
                          return true;
                        } else {
                          const dMonth = dDate.getMonth() + 1;
                          const dYear = dDate.getFullYear();
                          if (reportMonth && dMonth !== parseInt(reportMonth, 10)) return false;
                          if (reportYear && dYear !== parseInt(reportYear, 10)) return false;
                          return true;
                        }
                      }).reduce((sum, d) => {
                        const amtStr = d.amount.replace(/[^0-9.]/g, "");
                        return sum + (parseFloat(amtStr) || 0);
                      }, 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Signature Area */}
                <div className="mt-16 pt-8 border-t border-zinc-150 flex justify-between items-center text-xs">
                  <p className="text-zinc-450">System Verified Document • No signature required</p>
                  <div className="text-right w-48">
                    <div className="border-b border-zinc-800 h-10 w-full mb-2"></div>
                    <p className="font-bold text-zinc-800 uppercase text-[10px] tracking-wider">Authorized Officer</p>
                    <p className="text-[9px] text-zinc-500">Kanha Foundation</p>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Task Submission Proof Modal for Admin */}
      <AnimatePresence>
        {isViewProofModalOpen && viewingTaskProof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
            <div className="fixed inset-0" onClick={() => setIsViewProofModalOpen(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800/80 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative z-10 p-8 max-h-[90vh] overflow-y-auto text-left"
            >
              <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Volunteer Submission Proof</h2>
              <p className="text-xs text-zinc-400 mb-6 font-medium">Completed task details & records for: <strong className="text-[#F3A61E]">{viewingTaskProof.task_title}</strong></p>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 bg-zinc-955/60 p-4 rounded-2xl border border-zinc-800/80">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Budget Assigned</label>
                    <p className="text-sm font-extrabold text-white mt-1">₹{viewingTaskProof.assigned_money || 0}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Money Received</label>
                    <p className="text-sm font-extrabold text-[#F3A61E] mt-1">₹{viewingTaskProof.money_received || 0}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Money Spent</label>
                    <p className="text-sm font-extrabold text-[#F3A61E] mt-1">₹{viewingTaskProof.money_spent || 0}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Uploaded Proof Media</label>
                  <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-black/40 h-56 flex items-center justify-center">
                    {viewingTaskProof.proof_media ? (
                      viewingTaskProof.proof_media.endsWith(".mp4") || viewingTaskProof.proof_media.endsWith(".mov") ? (
                        <video src={viewingTaskProof.proof_media} className="h-full w-full object-cover animate-fade-in" controls />
                      ) : (
                        <img src={viewingTaskProof.proof_media} alt="Proof Submission" className="h-full w-full object-cover animate-fade-in" />
                      )
                    ) : (
                      <span className="text-xs text-zinc-550 italic">No media uploaded by volunteer</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-extrabold">Volunteer Feedback & Comments</label>
                  <p className="text-xs text-zinc-300 mt-2 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 leading-relaxed italic">
                    "{viewingTaskProof.feedback || 'No comments provided'}"
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-zinc-850 mt-6">
                <button
                  onClick={() => setIsViewProofModalOpen(false)}
                  className="px-6 py-2.5 bg-[#1E4D2B] hover:bg-[#15381E] text-white text-xs font-black uppercase tracking-wider rounded-full transition-all cursor-pointer font-bold"
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
