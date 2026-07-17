"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import fallbackCauses from "@/data/causes.json";

interface Child {
  name: string;
  dob: string;
  aadhar_number: string;
  aadhar_upload_url: string;
  handover_pics?: string[];
}

interface Beneficiary {
  id: number;
  father_name: string;
  mother_name: string;
  address: string;
  father_aadhar_number: string;
  father_aadhar_upload_url: string;
  mother_aadhar_number: string;
  mother_aadhar_upload_url: string;
  children: Child[];
  causes_donated: string[];
  donation_pic_url: string;
  created_at: string;
}

export default function AdminBeneficiariesPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);
  
  // Data lists
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [causes, setCauses] = useState<any[]>(fallbackCauses);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal toggles
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Beneficiary | null>(null);
  const [viewing, setViewing] = useState<Beneficiary | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // File uploading states
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Form states
  const [formFatherName, setFormFatherName] = useState("");
  const [formMotherName, setFormMotherName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formFatherAadharNumber, setFormFatherAadharNumber] = useState("");
  const [formFatherAadharUploadUrl, setFormFatherAadharUploadUrl] = useState("");
  const [formMotherAadharNumber, setFormMotherAadharNumber] = useState("");
  const [formMotherAadharUploadUrl, setFormMotherAadharUploadUrl] = useState("");
  const [formChildren, setFormChildren] = useState<Child[]>([]);
  const [formCausesDonated, setFormCausesDonated] = useState<string[]>([]);
  const [formDonationPicUrl, setFormDonationPicUrl] = useState("");

  // Authenticate session (admin or volunteer)
  useEffect(() => {
    const adminAuth = localStorage.getItem("admin_auth");
    const volunteerSession = localStorage.getItem("volunteer_session");
    
    if (adminAuth === "true") {
      setIsAdmin(true);
      setIsVolunteer(false);
    } else if (volunteerSession) {
      setIsAdmin(true); // Treat as authorized for loading and editing data
      setIsVolunteer(true);
    } else {
      router.push("/admin");
    }
  }, [router]);

  // Fetch beneficiaries and causes
  const fetchData = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const resB = await fetch("/api/beneficiaries", { cache: "no-store" });
      if (resB.ok) {
        const dataB = await resB.json();
        if (Array.isArray(dataB)) {
          setBeneficiaries(dataB);
        }
      }
      
      const resC = await fetch("/api/causes");
      if (resC.ok) {
        const dataC = await resC.json();
        if (Array.isArray(dataC) && dataC.length > 0) {
          setCauses(dataC);
        }
      }
    } catch (err) {
      console.error("Error fetching admin beneficiaries data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  // Handle uploading files using `/api/upload`
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string, childIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldKey);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        if (fieldKey === "father_aadhar") {
          setFormFatherAadharUploadUrl(data.url);
        } else if (fieldKey === "mother_aadhar") {
          setFormMotherAadharUploadUrl(data.url);
        } else if (fieldKey === "donation_pic") {
          setFormDonationPicUrl(data.url);
        } else if (fieldKey === "child_aadhar" && childIndex !== undefined) {
          const updatedChildren = [...formChildren];
          updatedChildren[childIndex].aadhar_upload_url = data.url;
          setFormChildren(updatedChildren);
        }
      } else {
        alert("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Error uploading file. Please try again.");
    } finally {
      setUploadingField(null);
    }
  };

  // Handle uploading multiple handover pictures in parallel for a child
  const handleMultipleUpload = async (e: React.ChangeEvent<HTMLInputElement>, childIndex: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fieldKey = `child_handover_${childIndex}`;
    setUploadingField(fieldKey);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        return data.success ? data.url : null;
      });

      const urls = await Promise.all(uploadPromises);
      const successfulUrls = urls.filter((url): url is string => url !== null);

      if (successfulUrls.length > 0) {
        const updatedChildren = [...formChildren];
        const currentPics = updatedChildren[childIndex].handover_pics || [];
        updatedChildren[childIndex].handover_pics = [...currentPics, ...successfulUrls];
        setFormChildren(updatedChildren);
      }
    } catch (err) {
      console.error("Error uploading multiple files:", err);
      alert("Failed to upload one or more files. Please try again.");
    } finally {
      setUploadingField(null);
    }
  };

  // Dynamic children management
  const addChild = () => {
    setFormChildren([...formChildren, { name: "", dob: "", aadhar_number: "", aadhar_upload_url: "", handover_pics: [] }]);
  };

  const removeChild = (index: number) => {
    setFormChildren(formChildren.filter((_, idx) => idx !== index));
  };

  const updateChildField = (index: number, key: keyof Child, value: string) => {
    const updatedChildren = [...formChildren];
    (updatedChildren[index] as any)[key] = value;
    setFormChildren(updatedChildren);
  };

  // Toggle cause selection
  const handleToggleCause = (causeTitle: string) => {
    if (formCausesDonated.includes(causeTitle)) {
      setFormCausesDonated(formCausesDonated.filter((c) => c !== causeTitle));
    } else {
      setFormCausesDonated([...formCausesDonated, causeTitle]);
    }
  };

  // Add/Edit trigger
  const handleStartEdit = (b: Beneficiary) => {
    setEditing(b);
    setFormFatherName(b.father_name);
    setFormMotherName(b.mother_name);
    setFormAddress(b.address);
    setFormFatherAadharNumber(b.father_aadhar_number);
    setFormFatherAadharUploadUrl(b.father_aadhar_upload_url);
    setFormMotherAadharNumber(b.mother_aadhar_number);
    setFormMotherAadharUploadUrl(b.mother_aadhar_upload_url);
    setFormChildren(b.children || []);
    setFormCausesDonated(b.causes_donated || []);
    setFormDonationPicUrl(b.donation_pic_url || "");
    setShowForm(true);
  };

  const handleStartAdd = () => {
    setEditing(null);
    setFormFatherName("");
    setFormMotherName("");
    setFormAddress("");
    setFormFatherAadharNumber("");
    setFormFatherAadharUploadUrl("");
    setFormMotherAadharNumber("");
    setFormMotherAadharUploadUrl("");
    setFormChildren([]);
    setFormCausesDonated([]);
    setFormDonationPicUrl("");
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      id: editing?.id,
      father_name: formFatherName,
      mother_name: formMotherName,
      address: formAddress,
      father_aadhar_number: formFatherAadharNumber,
      father_aadhar_upload_url: formFatherAadharUploadUrl,
      mother_aadhar_number: formMotherAadharNumber,
      mother_aadhar_upload_url: formMotherAadharUploadUrl,
      children: formChildren,
      causes_donated: formCausesDonated,
      donation_pic_url: formDonationPicUrl
    };

    try {
      const method = editing ? "PUT" : "POST";
      const res = await fetch("/api/beneficiaries", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowForm(false);
        setEditing(null);
        fetchData();
      } else {
        const errData = await res.json();
        alert("Operation failed: " + (errData.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error submitting beneficiary:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this beneficiary record? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/beneficiaries?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchData();
      } else {
        alert("Delete failed.");
      }
    } catch (err) {
      console.error("Error deleting beneficiary:", err);
    }
  };

  // Filtering
  const filteredBeneficiaries = beneficiaries.filter((b) => {
    const query = searchQuery.toLowerCase();
    const matchesFather = b.father_name.toLowerCase().includes(query);
    const matchesMother = b.mother_name.toLowerCase().includes(query);
    const matchesAddress = b.address.toLowerCase().includes(query);
    const matchesChildren = b.children?.some(
      (c) => c.name.toLowerCase().includes(query) || c.aadhar_number.includes(query)
    );
    const matchesAadhar =
      b.father_aadhar_number.includes(query) || b.mother_aadhar_number.includes(query);
    return matchesFather || matchesMother || matchesAddress || matchesChildren || matchesAadhar;
  });

  // Calculate quick stats
  const totalFamilies = beneficiaries.length;
  const totalChildren = beneficiaries.reduce((acc, curr) => acc + (curr.children?.length || 0), 0);
  const totalCauses = Array.from(
    new Set(beneficiaries.reduce<string[]>((acc, curr) => [...acc, ...(curr.causes_donated || [])], []))
  ).length;
  const verifiedAadhars = beneficiaries.reduce((acc, curr) => {
    let count = 0;
    if (curr.father_aadhar_number) count++;
    if (curr.mother_aadhar_number) count++;
    curr.children?.forEach((c) => {
      if (c.aadhar_number) count++;
    });
    return acc + count;
  }, 0);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#070b09] flex items-center justify-center text-white">
        <p className="text-zinc-400">Verifying session credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070b09] text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-zinc-800/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1E4D2B] dark:text-[#52c47c] tracking-tight">
              Beneficiaries Registry Room
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage underprivileged beneficiaries database, children details, Aadhaar credentials, and donation allocations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-start">
            <a
              href={isVolunteer ? "/volunteer/profile" : "/admin"}
              className="px-5 py-2.5 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-800 dark:text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              ← Back to Dashboard
            </a>
            <button
              onClick={handleStartAdd}
              className="px-5 py-2.5 bg-[#1E4D2B] hover:bg-[#15381E] text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1"
            >
              <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Beneficiary</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#101412] p-5 rounded-2xl border border-gray-150/45 dark:border-zinc-850">
            <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">Total Families</span>
            <span className="text-2xl font-black text-[#1E4D2B] dark:text-[#52c47c] block mt-1">{totalFamilies}</span>
          </div>
          <div className="bg-white dark:bg-[#101412] p-5 rounded-2xl border border-gray-150/45 dark:border-zinc-850">
            <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">Children Registered</span>
            <span className="text-2xl font-black text-gray-850 dark:text-white block mt-1">{totalChildren}</span>
          </div>
          <div className="bg-white dark:bg-[#101412] p-5 rounded-2xl border border-gray-150/45 dark:border-zinc-850">
            <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">Causes Supported</span>
            <span className="text-2xl font-black text-blue-500 block mt-1">{totalCauses}</span>
          </div>
          <div className="bg-white dark:bg-[#101412] p-5 rounded-2xl border border-gray-150/45 dark:border-zinc-850">
            <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">Aadhars Logged</span>
            <span className="text-2xl font-black text-amber-500 block mt-1">{verifiedAadhars}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 dark:text-zinc-650" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by father, mother, address, child names, or Aadhaar numbers..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#101412] border border-gray-200 dark:border-zinc-800 text-sm text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#52c47c] dark:focus:ring-[#52c47c]/30"
            />
          </div>
        </div>

        {/* Registry Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 dark:text-zinc-500 flex flex-col items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-[#52c47c] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p>Loading beneficiaries data registry...</p>
          </div>
        ) : filteredBeneficiaries.length === 0 ? (
          <div className="bg-white dark:bg-[#101412] text-center py-16 rounded-2xl border border-gray-150/40 dark:border-zinc-850">
            <svg className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-650 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-sm font-bold text-gray-700 dark:text-zinc-300">No records found</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">Try modifying your keywords or register a new beneficiary family.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#101412] rounded-2xl border border-gray-150/40 dark:border-zinc-850 overflow-hidden shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-150 dark:divide-zinc-800 text-left">
                <thead>
                  <tr className="bg-gray-100 dark:bg-zinc-900/40 text-gray-500 dark:text-zinc-400 text-xs font-black uppercase tracking-wider">
                    <th className="px-6 py-4">Parents Details</th>
                    <th className="px-6 py-4">Address</th>
                    <th className="px-6 py-4">Children Details</th>
                    <th className="px-6 py-4">Causes Supported</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-zinc-800/80 text-sm">
                  {filteredBeneficiaries.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-white flex flex-col">
                          <span>👨‍👦 {b.father_name}</span>
                          <span className="text-zinc-400 dark:text-zinc-500 text-xs font-normal mt-0.5">👩‍👧 {b.mother_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="max-w-[200px] truncate text-gray-600 dark:text-zinc-400 text-xs" title={b.address}>
                          {b.address}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs">
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 rounded font-black">
                            {b.children?.length || 0} Children
                          </span>
                          <div className="mt-1 text-[10px] text-gray-500 dark:text-zinc-500 max-w-[180px] truncate">
                            {b.children?.map((c) => c.name).join(", ")}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {b.causes_donated && b.causes_donated.length > 0 ? (
                            b.causes_donated.map((c, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-[#1E4D2B] dark:text-[#52c47c] border border-emerald-150 dark:border-emerald-900/20 text-[9px] font-bold rounded">
                                {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-zinc-500 text-[10px]">None logged</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewing(b)}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors cursor-pointer"
                            title="View full record"
                          >
                            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleStartEdit(b)}
                            className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg transition-colors cursor-pointer"
                            title="Edit record"
                          >
                            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {!isVolunteer && (
                            <button
                              onClick={() => handleDelete(b.id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                              title="Delete record"
                            >
                              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View Modal Overlay */}
        <AnimatePresence>
          {viewing && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#0c0f0d] text-gray-900 dark:text-gray-100 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-gray-150 dark:border-zinc-800 shadow-2xl relative scrollbar-none max-h-[90vh] overflow-y-auto text-left"
              >
                <button
                  onClick={() => setViewing(null)}
                  className="absolute top-5 right-5 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-white p-1 rounded-full cursor-pointer"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <h2 className="text-2xl font-black text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-850 pb-4 mb-6">
                  Beneficiary Family Card
                </h2>

                <div className="space-y-6">
                  
                  {/* Parents Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-[#101412] rounded-2xl border border-gray-200/50 dark:border-zinc-850">
                      <h4 className="text-[10px] font-black text-[#52c47c] uppercase tracking-wider">Father Details</h4>
                      <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{viewing.father_name}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">Aadhaar: {viewing.father_aadhar_number || "Not provided"}</p>
                      {viewing.father_aadhar_upload_url && (
                        <a
                          href={viewing.father_aadhar_upload_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-450 hover:underline mt-2.5"
                        >
                          View Father's Aadhaar Card ↗
                        </a>
                      )}
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-[#101412] rounded-2xl border border-gray-200/50 dark:border-zinc-850">
                      <h4 className="text-[10px] font-black text-[#52c47c] uppercase tracking-wider">Mother Details</h4>
                      <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{viewing.mother_name}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">Aadhaar: {viewing.mother_aadhar_number || "Not provided"}</p>
                      {viewing.mother_aadhar_upload_url && (
                        <a
                          href={viewing.mother_aadhar_upload_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-450 hover:underline mt-2.5"
                        >
                          View Mother's Aadhaar Card ↗
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Residing Address</h4>
                    <p className="text-sm text-gray-700 dark:text-zinc-300 mt-1 bg-gray-50 dark:bg-[#101412] p-3 rounded-xl border border-gray-200/50 dark:border-zinc-850 whitespace-pre-line">
                      {viewing.address}
                    </p>
                  </div>

                  {/* Children Details */}
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Children ({viewing.children?.length || 0})</h4>
                    {viewing.children && viewing.children.length > 0 ? (
                      <div className="space-y-3">
                        {viewing.children.map((child, idx) => (
                          <div key={idx} className="flex flex-col p-3.5 bg-gray-55/40 dark:bg-[#101412] border border-gray-200/60 dark:border-zinc-850 rounded-xl text-xs gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white text-sm">🧒 {child.name}</p>
                                <p className="text-gray-500 dark:text-zinc-500 mt-0.5">DOB: {child.dob || "N/A"} | Aadhaar: {child.aadhar_number || "N/A"}</p>
                              </div>
                              {child.aadhar_upload_url && (
                                <a
                                  href={child.aadhar_upload_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-850 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-lg text-center font-semibold"
                                >
                                  View Aadhaar ↗
                                </a>
                              )}
                            </div>
                            
                            {/* Donation Handover Pictures for this child */}
                            {child.handover_pics && child.handover_pics.length > 0 && (
                              <div className="mt-2.5 space-y-1.5 border-t border-gray-200/50 dark:border-zinc-800/50 pt-2.5">
                                <span className="block text-[9px] font-bold text-gray-450 dark:text-zinc-500 uppercase tracking-wider">Donation Handover Pics ({child.handover_pics.length})</span>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                  {child.handover_pics.map((picUrl, pIdx) => (
                                    <a
                                      key={pIdx}
                                      href={picUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm hover:scale-[1.02] transition-transform"
                                    >
                                      <img src={picUrl} alt={`handover-${pIdx}`} className="object-cover w-full h-full" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-zinc-500 italic">No child logs saved for this family.</p>
                    )}
                  </div>

                  {/* Causes & Donation Photo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Disbursed Causes</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {viewing.causes_donated && viewing.causes_donated.length > 0 ? (
                          viewing.causes_donated.map((c, i) => (
                            <span key={i} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-[#1E4D2B] dark:text-[#52c47c] border border-emerald-150 dark:border-emerald-900/10 text-xs font-bold rounded-lg">
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-zinc-500 italic">No causes tagged.</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Donation Delivery Pic</h4>
                      {viewing.donation_pic_url ? (
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-850 shadow-md">
                          <img
                            src={viewing.donation_pic_url}
                            alt="Donation disbursement"
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="h-20 bg-gray-50 dark:bg-[#101412] border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl flex items-center justify-center text-xs text-gray-400 dark:text-zinc-600">
                          No donation picture uploaded.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add/Edit Modal Overlay */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#0c0f0d] text-gray-900 dark:text-gray-100 rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-gray-150 dark:border-zinc-800 shadow-2xl relative scrollbar-none max-h-[90vh] overflow-y-auto text-left"
              >
                <button
                  onClick={handleCancelForm}
                  className="absolute top-5 right-5 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-white p-1 rounded-full cursor-pointer"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <h2 className="text-2xl font-black text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-850 pb-4 mb-6">
                  {editing ? "Modify Beneficiary Record" : "Register Underprivileged Beneficiary"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Section 1: Parents Details */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#1E4D2B] dark:text-[#52c47c]">1. Parents Information</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Father field */}
                      <div className="p-4 bg-gray-50/50 dark:bg-[#101412] border border-gray-150 dark:border-zinc-850 rounded-2xl space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Father's Name *</label>
                          <input
                            type="text"
                            required
                            value={formFatherName}
                            onChange={(e) => setFormFatherName(e.target.value)}
                            placeholder="e.g. Ramesh Singh"
                            className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Father's Aadhaar Number</label>
                          <input
                            type="text"
                            value={formFatherAadharNumber}
                            onChange={(e) => setFormFatherAadharNumber(e.target.value)}
                            placeholder="12-digit number"
                            maxLength={12}
                            className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Aadhaar Card File Upload</label>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleUpload(e, "father_aadhar")}
                            className="block w-full text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 dark:file:bg-zinc-900 file:text-gray-700 dark:file:text-zinc-300 hover:file:bg-gray-200 dark:hover:file:bg-zinc-800 cursor-pointer"
                          />
                          {uploadingField === "father_aadhar" && <span className="text-[10px] text-amber-500 mt-1 block">Uploading...</span>}
                          {formFatherAadharUploadUrl && (
                            <span className="text-[10px] text-[#52c47c] mt-1 block font-bold">✓ Aadhaar Card file ready</span>
                          )}
                        </div>
                      </div>

                      {/* Mother field */}
                      <div className="p-4 bg-gray-50/50 dark:bg-[#101412] border border-gray-150 dark:border-zinc-850 rounded-2xl space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Mother's Name *</label>
                          <input
                            type="text"
                            required
                            value={formMotherName}
                            onChange={(e) => setFormMotherName(e.target.value)}
                            placeholder="e.g. Geeta Devi"
                            className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Mother's Aadhaar Number</label>
                          <input
                            type="text"
                            value={formMotherAadharNumber}
                            onChange={(e) => setFormMotherAadharNumber(e.target.value)}
                            placeholder="12-digit number"
                            maxLength={12}
                            className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Aadhaar Card File Upload</label>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleUpload(e, "mother_aadhar")}
                            className="block w-full text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 dark:file:bg-zinc-900 file:text-gray-700 dark:file:text-zinc-300 hover:file:bg-gray-200 dark:hover:file:bg-zinc-800 cursor-pointer"
                          />
                          {uploadingField === "mother_aadhar" && <span className="text-[10px] text-amber-500 mt-1 block">Uploading...</span>}
                          {formMotherAadharUploadUrl && (
                            <span className="text-[10px] text-[#52c47c] mt-1 block font-bold">✓ Aadhaar Card file ready</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Address */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#1E4D2B] dark:text-[#52c47c]">2. Physical Address</h3>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Full Address *</label>
                      <textarea
                        required
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                        placeholder="House no, Area, Village/Town, District, State, Pincode..."
                        className="w-full h-20 px-4 py-2.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Section 3: Children */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#1E4D2B] dark:text-[#52c47c]">3. Children Details</h3>
                      <button
                        type="button"
                        onClick={addChild}
                        className="px-3.5 py-1.5 bg-[#1E4D2B]/10 hover:bg-[#1E4D2B]/20 text-[#1E4D2B] dark:text-[#52c47c] text-xs font-bold rounded-xl border border-[#1E4D2B]/20 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        + Add Child Record
                      </button>
                    </div>

                    {formChildren.length === 0 ? (
                      <p className="text-xs text-gray-500 dark:text-zinc-500 italic bg-gray-50 dark:bg-[#101412] p-4 rounded-2xl border border-dashed border-gray-250 dark:border-zinc-800 text-center">
                        No children logged yet. Click 'Add Child Record' to include children.
                      </p>
                    ) : (
                      <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                        {formChildren.map((child, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 dark:bg-[#101412] border border-gray-200 dark:border-zinc-850 rounded-2xl space-y-3 relative">
                            <button
                              type="button"
                              onClick={() => removeChild(idx)}
                              className="absolute top-3 right-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Child Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={child.name}
                                  onChange={(e) => updateChildField(idx, "name", e.target.value)}
                                  placeholder="e.g. Pappu Kumar"
                                  className="w-full px-3.5 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Child Date of Birth</label>
                                <input
                                  type="date"
                                  value={child.dob}
                                  onChange={(e) => updateChildField(idx, "dob", e.target.value)}
                                  className="w-full px-3.5 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none text-zinc-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                              <div>
                                <label className="block text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Child Aadhaar Number</label>
                                <input
                                  type="text"
                                  value={child.aadhar_number}
                                  onChange={(e) => updateChildField(idx, "aadhar_number", e.target.value)}
                                  placeholder="12-digit number"
                                  maxLength={12}
                                  className="w-full px-3.5 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Child Aadhaar Card</label>
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  onChange={(e) => handleUpload(e, "child_aadhar", idx)}
                                  className="block w-full text-[10px] text-zinc-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-gray-150 dark:file:bg-zinc-900 file:text-gray-700 dark:file:text-zinc-300 hover:file:bg-gray-200 dark:hover:file:bg-zinc-800 cursor-pointer"
                                />
                                {uploadingField === `child_aadhar_${idx}` && <span className="text-[9px] text-amber-500 mt-1 block">Uploading...</span>}
                                {child.aadhar_upload_url && (
                                  <span className="text-[9px] text-[#52c47c] mt-1 block font-bold">✓ Aadhaar file ready</span>
                                )}
                              </div>
                            </div>

                            {/* Donation Handover Multiple Photo Upload */}
                            <div className="border-t border-gray-200/50 dark:border-zinc-800/50 pt-3 mt-1.5 space-y-2">
                              <label className="block text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Donation Handover Pictures (Multiple Upload)</label>
                              <div className="flex flex-col sm:flex-row gap-3 items-start">
                                <div className="relative shrink-0">
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleMultipleUpload(e, idx)}
                                    className="hidden"
                                    id={`child-handover-input-${idx}`}
                                  />
                                  <label
                                    htmlFor={`child-handover-input-${idx}`}
                                    className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/20 text-[#1E4D2B] dark:text-[#52c47c] border border-emerald-150 dark:border-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-[10px] font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                                  >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Upload Pics (Multi)
                                  </label>
                                </div>
                                {uploadingField === `child_handover_${idx}` && (
                                  <span className="text-[10px] text-amber-500 font-bold self-center animate-pulse">Uploading files...</span>
                                )}
                              </div>

                              {/* Thumbnail Previews with Delete option */}
                              {child.handover_pics && child.handover_pics.length > 0 && (
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 bg-white dark:bg-zinc-950 p-2.5 rounded-xl border border-gray-150 dark:border-zinc-850">
                                  {child.handover_pics.map((picUrl, pIdx) => (
                                    <div key={pIdx} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800 group shadow-inner">
                                      <img src={picUrl} alt="handover preview" className="object-cover w-full h-full" />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updatedChildren = [...formChildren];
                                          updatedChildren[idx].handover_pics = updatedChildren[idx].handover_pics?.filter((_, itemIdx) => itemIdx !== pIdx);
                                          setFormChildren(updatedChildren);
                                        }}
                                        className="absolute inset-0 bg-red-650/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-black uppercase cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 4: Donation & Causes */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#1E4D2B] dark:text-[#52c47c]">4. Allocation & Donation Details</h3>
                    
                    <div className="p-4 bg-gray-50/50 dark:bg-[#101412] border border-gray-150 dark:border-zinc-850 rounded-2xl space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Allocate Associated Causes</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                          {causes.map((cause) => {
                            const isChecked = formCausesDonated.includes(cause.title);
                            return (
                              <label key={cause.id} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleCause(cause.title)}
                                  className="h-4 w-4 rounded bg-zinc-900 border-zinc-700 text-[#52c47c] focus:ring-0"
                                />
                                <span className="truncate text-gray-800 dark:text-zinc-300">{cause.title}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Donation Hand-over Picture</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUpload(e, "donation_pic")}
                            className="block w-full text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 dark:file:bg-zinc-900 file:text-gray-700 dark:file:text-zinc-300 hover:file:bg-gray-200 dark:hover:file:bg-zinc-800 cursor-pointer"
                          />
                          {uploadingField === "donation_pic" && <span className="text-[10px] text-amber-500 mt-1 block">Uploading...</span>}
                        </div>
                        {formDonationPicUrl && (
                          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow">
                            <img
                              src={formDonationPicUrl}
                              alt="Donation thumbnail preview"
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-850">
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      disabled={submitting}
                      className="px-5 py-2.5 bg-gray-100 dark:bg-zinc-850 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || uploadingField !== null}
                      className="px-6 py-2.5 bg-[#1E4D2B] hover:bg-[#15381E] disabled:bg-zinc-800 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Record</span>
                      )}
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
