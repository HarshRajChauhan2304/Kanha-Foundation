"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import causesDataFallback from "@/data/causes.json";

interface Donation {
  id: number;
  name: string;
  amount: string;
  donation_for: string;
  time: string;
  transaction_date?: string;
  address?: string;
}

interface CustomisationMeta {
  isAnonymous: boolean;
  printedName?: string;
  deliveryDate?: string;
  photoUrl?: string;
  videoWish?: string;
  instagramId?: string;
  isGift?: boolean;
  giftMessage?: string;
  isOtherRequest?: boolean;
  otherRequestText?: string;
}

interface MarketingMeta {
  receiveMarketing: boolean;
  marketingPhone?: string;
  marketingEmail?: string;
}

interface DonationMeta {
  birthday: number;
  meals: number;
  lives: number;
  studykit: number;
  total: number;
  customisation?: CustomisationMeta | null;
  marketing?: MarketingMeta | null;
}

export default function AdminDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Donation | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCause, setFormCause] = useState("");
  const [formTransactionDate, setFormTransactionDate] = useState("");
  const [causesList, setCausesList] = useState<any[]>(causesDataFallback);
  
  // Customisation form states
  const [formIsAnonymous, setFormIsAnonymous] = useState(false);
  const [formPrintedName, setFormPrintedName] = useState("");
  const [formDeliveryDate, setFormDeliveryDate] = useState("");
  const [formPhotoUrl, setFormPhotoUrl] = useState("");
  const [formVideoWish, setFormVideoWish] = useState("");
  const [formInstagramId, setFormInstagramId] = useState("");
  
  // Special request form states
  const [formIsGift, setFormIsGift] = useState(false);
  const [formGiftMessage, setFormGiftMessage] = useState("");
  const [formIsOtherRequest, setFormIsOtherRequest] = useState(false);
  const [formOtherRequestText, setFormOtherRequestText] = useState("");
  
  // Marketing form states
  const [formReceiveMarketing, setFormReceiveMarketing] = useState(false);
  const [formMarketingPhone, setFormMarketingPhone] = useState("+91");
  const [formMarketingEmail, setFormMarketingEmail] = useState("");

  const fetchDonations = async () => {
    try {
      const res = await fetch("/api/admin/donations", { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setDonations(data);
      }
    } catch (err) {
      console.error("Error fetching donations for admin:", err);
    }
  };

  const fetchCauses = async () => {
    try {
      const res = await fetch("/api/causes");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCausesList(data);
        }
      }
    } catch (err) {
      console.error("Error fetching causes for donation form:", err);
    }
  };

  useEffect(() => {
    fetchDonations();
    fetchCauses();
  }, []);

  // Parse transaction info helper
  const parseTimeField = (timeStr: string) => {
    const defaultMeta: DonationMeta = {
      birthday: 0,
      meals: 0,
      lives: 0,
      studykit: 0,
      total: 0,
      customisation: null,
      marketing: null
    };

    if (!timeStr || !timeStr.includes("|")) {
      return { readableTime: timeStr || "Just now", meta: defaultMeta };
    }

    const parts = timeStr.split("|");
    const readableTime = parts[0];
    try {
      const parsed = JSON.parse(parts[1]);
      return { readableTime, meta: { ...defaultMeta, ...parsed } };
    } catch (e) {
      return { readableTime, meta: defaultMeta };
    }
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStartEdit = (d: Donation) => {
    setEditing(d);
    setFormName(d.name);
    setFormAmount(d.amount.replace(/[^0-9.]/g, ""));
    setFormCause(d.donation_for);
    setFormTransactionDate(d.transaction_date || parseTimeField(d.time).readableTime || getFormattedDate());
    setFormAddress(d.address || "");

    const { meta } = parseTimeField(d.time);
    if (meta.customisation) {
      setFormIsAnonymous(meta.customisation.isAnonymous);
      setFormPrintedName(meta.customisation.printedName || "");
      setFormDeliveryDate(meta.customisation.deliveryDate || "");
      setFormPhotoUrl(meta.customisation.photoUrl || "");
      setFormVideoWish(meta.customisation.videoWish || "");
      setFormInstagramId(meta.customisation.instagramId || "");
      setFormIsGift(meta.customisation.isGift || false);
      setFormGiftMessage(meta.customisation.giftMessage || "");
      setFormIsOtherRequest(meta.customisation.isOtherRequest || false);
      setFormOtherRequestText(meta.customisation.otherRequestText || "");
    } else {
      setFormIsAnonymous(false);
      setFormPrintedName("");
      setFormDeliveryDate("");
      setFormPhotoUrl("");
      setFormVideoWish("");
      setFormInstagramId("");
      setFormIsGift(false);
      setFormGiftMessage("");
      setFormIsOtherRequest(false);
      setFormOtherRequestText("");
    }

    if (meta.marketing) {
      setFormReceiveMarketing(meta.marketing.receiveMarketing);
      setFormMarketingPhone(meta.marketing.marketingPhone || "+91");
      setFormMarketingEmail(meta.marketing.marketingEmail || "");
    } else {
      setFormReceiveMarketing(false);
      setFormMarketingPhone("+91");
      setFormMarketingEmail("");
    }

    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setFormName("");
    setFormAmount("");
    setFormCause("");
    setFormTransactionDate("");
    setFormAddress("");
    setFormIsAnonymous(false);
    setFormPrintedName("");
    setFormDeliveryDate("");
    setFormPhotoUrl("");
    setFormVideoWish("");
    setFormInstagramId("");
    setFormIsGift(false);
    setFormGiftMessage("");
    setFormIsOtherRequest(false);
    setFormOtherRequestText("");
    setFormReceiveMarketing(false);
    setFormMarketingPhone("+91");
    setFormMarketingEmail("");
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";

    const numericAmount = parseFloat(formAmount) || 0;
    const finalAmount = `₹${numericAmount.toLocaleString("en-IN")}`;

    // Package metadata
    const metadata = {
      total: numericAmount,
      customisation: {
        isAnonymous: formIsAnonymous,
        printedName: formIsAnonymous ? "" : formPrintedName,
        deliveryDate: formIsAnonymous ? "" : formDeliveryDate,
        photoUrl: formIsAnonymous ? "" : formPhotoUrl,
        videoWish: formIsAnonymous ? "" : formVideoWish,
        instagramId: formIsAnonymous ? "" : formInstagramId,
        isGift: formIsAnonymous ? false : formIsGift,
        giftMessage: formIsAnonymous ? "" : (formIsGift ? formGiftMessage : ""),
        isOtherRequest: formIsAnonymous ? false : formIsOtherRequest,
        otherRequestText: formIsAnonymous ? "" : (formIsOtherRequest ? formOtherRequestText : "")
      },
      marketing: {
        receiveMarketing: formReceiveMarketing,
        marketingPhone: formReceiveMarketing ? formMarketingPhone : "",
        marketingEmail: formReceiveMarketing ? formMarketingEmail : ""
      }
    };

    const timePayload = `Just now|${JSON.stringify(metadata)}`;

    const response = await fetch("/api/admin/donations", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(editing ? { id: editing.id } : {}),
        name: formName,
        address: formAddress,
        amount: finalAmount,
        donation_for: formCause,
        time: timePayload,
        transaction_date: formTransactionDate || getFormattedDate()
      })
    });

    if (response.ok) {
      await fetchDonations();
      handleCancelEdit();
    } else {
      alert("Error saving transaction record.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this donation transaction?")) return;

    const response = await fetch("/api/admin/donations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    if (response.ok) {
      await fetchDonations();
    } else {
      alert("Error deleting record.");
    }
  };

  // Metrics summary
  const summaryTotalRaised = donations.reduce((sum, d) => {
    const clean = d.amount.replace(/[^0-9.]/g, "");
    return sum + (parseFloat(clean) || 0);
  }, 0);

  const totalPremiumRequests = donations.filter(d => {
    const { meta } = parseTimeField(d.time);
    return meta.customisation && !meta.customisation.isAnonymous && (
      meta.customisation.photoUrl || meta.customisation.videoWish || meta.customisation.isGift || meta.customisation.isOtherRequest
    );
  }).length;

  const totalAnonymousDonations = donations.filter(d => {
    const { meta } = parseTimeField(d.time);
    return meta.customisation && meta.customisation.isAnonymous;
  }).length;

  // Filter query
  const filteredDonations = donations.filter(d => {
    const term = searchQuery.toLowerCase();
    return d.name.toLowerCase().includes(term) || d.donation_for.toLowerCase().includes(term);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070b09] text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-zinc-800/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1E4D2B] dark:text-[#52c47c] tracking-tight">
              Manage Donations Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Overview and configuration of checkout transactions and premium customization fields.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-start">
            <a
              href="/admin"
              className="px-5 py-2.5 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-800 dark:text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer flex items-center gap-1.5"
            >
              ← Back to Admin Panel
            </a>
            <button
              onClick={() => {
                if (showForm) handleCancelEdit();
                else {
                  setFormTransactionDate(getFormattedDate());
                  setShowForm(true);
                }
              }}
              className="px-5 py-2.5 bg-[#1E4D2B] hover:bg-[#15381E] text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              {showForm ? "Close Form" : "Add Transaction"}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#101412] p-5 rounded-2xl border border-gray-150/40 dark:border-zinc-800/80">
            <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">Total Raised</span>
            <span className="text-2xl font-black text-[#1E4D2B] dark:text-[#52c47c] block mt-1">₹{summaryTotalRaised.toLocaleString("en-IN")}</span>
          </div>
          <div className="bg-white dark:bg-[#101412] p-5 rounded-2xl border border-gray-150/40 dark:border-zinc-800/80">
            <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">Transactions</span>
            <span className="text-2xl font-black text-gray-800 dark:text-white block mt-1">{donations.length} records</span>
          </div>
          <div className="bg-white dark:bg-[#101412] p-5 rounded-2xl border border-gray-150/40 dark:border-zinc-800/80">
            <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">Premium Fields</span>
            <span className="text-2xl font-black text-blue-500 block mt-1">{totalPremiumRequests} active</span>
          </div>
          <div className="bg-white dark:bg-[#101412] p-5 rounded-2xl border border-gray-150/40 dark:border-zinc-800/80">
            <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">Anonymous</span>
            <span className="text-2xl font-black text-amber-500 block mt-1">{totalAnonymousDonations} private</span>
          </div>
        </div>

        {/* Collapsible Form Card */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleSubmit}
              className="bg-white dark:bg-[#101412] p-6 sm:p-8 rounded-[2rem] border border-gray-150/40 dark:border-zinc-800/80 shadow-md space-y-6 overflow-hidden"
            >
              <h2 className="text-base font-black text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-3">
                {editing ? `Edit Transaction ID: ${editing.id}` : "Create New Donation Record"}
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-550 dark:text-gray-400 uppercase tracking-wider mb-2">Donor Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Vikram Singh"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-555 dark:text-gray-400 uppercase tracking-wider mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-555 dark:text-gray-400 uppercase tracking-wider mb-2">Donation For / Target Cause</label>
                  <select
                    value={causesList.some(c => c.title === formCause) ? formCause : (formCause ? "Custom" : "")}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Custom") {
                        setFormCause("");
                      } else {
                        setFormCause(val);
                      }
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B] text-gray-900 dark:text-white"
                  >
                    <option value="" disabled>Select a cause...</option>
                    {causesList.map((cause) => (
                      <option key={cause.id} value={cause.title}>
                        {cause.title} ({cause.price})
                      </option>
                    ))}
                    <option value="Custom">Custom / Other...</option>
                  </select>
                  {(!causesList.some(c => c.title === formCause) || formCause === "") && (
                    <input
                      type="text"
                      required
                      value={formCause}
                      onChange={(e) => setFormCause(e.target.value)}
                      placeholder="Enter custom cause name..."
                      className="w-full mt-2 px-4 py-2 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-555 dark:text-gray-400 uppercase tracking-wider mb-2">Transaction Date</label>
                  <input
                    type="text"
                    required
                    value={formTransactionDate}
                    onChange={(e) => setFormTransactionDate(e.target.value)}
                    placeholder="e.g. 11 July 2026 at 05:33 pm"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-550 dark:text-gray-400 uppercase tracking-wider mb-2">Donor Address / Location (Optional)</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="e.g. Ranchi, Jharkhand, India"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B] text-gray-900 dark:text-white"
                />
              </div>

              {/* Customisation inputs inside form */}
              <div className="border-t border-dashed border-gray-150 dark:border-zinc-800 pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="formIsAnonymous"
                    checked={formIsAnonymous}
                    onChange={(e) => setFormIsAnonymous(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="formIsAnonymous" className="text-xs font-black text-gray-800 dark:text-zinc-200 cursor-pointer">
                    Flag this donation as Anonymous (Hides all customisation print lines)
                  </label>
                </div>

                {!formIsAnonymous && (
                  <div className="grid gap-4 sm:grid-cols-2 bg-gray-50/70 dark:bg-zinc-950/20 p-5 rounded-2xl border border-gray-150/40 dark:border-zinc-800/80">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Printed Name</label>
                      <input
                        type="text"
                        value={formPrintedName}
                        onChange={(e) => setFormPrintedName(e.target.value)}
                        placeholder="Name for plate printing"
                        className="w-full px-4 py-2 text-xs bg-white dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-550 uppercase tracking-wider mb-2">Preferred Delivery Date</label>
                      <input
                        type="date"
                        value={formDeliveryDate}
                        onChange={(e) => setFormDeliveryDate(e.target.value)}
                        className="w-full px-4 py-2 text-xs bg-white dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none text-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-550 uppercase tracking-wider mb-2">Photo Attachment URL</label>
                      <input
                        type="text"
                        value={formPhotoUrl}
                        onChange={(e) => setFormPhotoUrl(e.target.value)}
                        placeholder="Image public relative link or URL"
                        className="w-full px-4 py-2 text-xs bg-white dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Video Wish Line (Max 80 chars)</label>
                      <input
                        type="text"
                        maxLength={80}
                        value={formVideoWish}
                        onChange={(e) => setFormVideoWish(e.target.value)}
                        placeholder="e.g. Happy Anniversary!"
                        className="w-full px-4 py-2 text-xs bg-white dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Beneficiary Instagram ID</label>
                      <input
                        type="text"
                        value={formInstagramId}
                        onChange={(e) => setFormInstagramId(e.target.value)}
                        placeholder="e.g. @beneficiary"
                        className="w-full px-4 py-2 text-xs bg-white dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2 pt-2 border-t border-gray-200/50 dark:border-zinc-800/80">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <input type="checkbox" checked={formIsGift} onChange={(e) => setFormIsGift(e.target.checked)} className="rounded" />
                          <span className="font-bold">Gift/On behalf of another</span>
                        </label>
                        {formIsGift && (
                          <input
                            type="text"
                            value={formGiftMessage}
                            onChange={(e) => setFormGiftMessage(e.target.value)}
                            placeholder="Message details"
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none"
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <input type="checkbox" checked={formIsOtherRequest} onChange={(e) => setFormIsOtherRequest(e.target.checked)} className="rounded" />
                          <span className="font-bold">Any other request details</span>
                        </label>
                        {formIsOtherRequest && (
                          <textarea
                            value={formOtherRequestText}
                            onChange={(e) => setFormOtherRequestText(e.target.value)}
                            placeholder="Wishes details..."
                            rows={2}
                            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none resize-none"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Marketing details in form */}
              <div className="border-t border-dashed border-gray-150 dark:border-zinc-800 pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="formReceiveMarketing"
                    checked={formReceiveMarketing}
                    onChange={(e) => setFormReceiveMarketing(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="formReceiveMarketing" className="text-xs font-black text-gray-800 dark:text-zinc-200 cursor-pointer">
                    Enable Marketing Subscriptions (SMS & Email alerts)
                  </label>
                </div>

                {formReceiveMarketing && (
                  <div className="grid gap-4 sm:grid-cols-2 bg-gray-50/70 dark:bg-zinc-950/20 p-5 rounded-2xl border border-gray-150/40 dark:border-zinc-800/80">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Subscribed Mobile Number</label>
                      <input
                        type="tel"
                        value={formMarketingPhone}
                        onChange={(e) => setFormMarketingPhone(e.target.value)}
                        placeholder="+919876543210"
                        className="w-full px-4 py-2 text-xs bg-white dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">Subscribed Email Address</label>
                      <input
                        type="email"
                        value={formMarketingEmail}
                        onChange={(e) => setFormMarketingEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full px-4 py-2 text-xs bg-white dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-5 py-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editing ? "Save Changes" : "Create Record"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="bg-white dark:bg-[#101412] rounded-[2rem] border border-gray-150/40 dark:border-zinc-800/80 shadow-sm overflow-hidden p-6 sm:p-8">
          
          {/* Filters Bar */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="w-full max-w-sm flex items-center border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-[#0c1510] rounded-xl px-3 py-1.5 focus-within:ring-1 focus-within:ring-[#1E4D2B]">
              <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by donor or cause..."
                className="w-full bg-transparent text-xs text-gray-900 dark:text-white focus:outline-none py-1"
              />
            </div>
            <span className="text-xs text-gray-400 font-bold">{filteredDonations.length} matches</span>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="py-4 text-left font-black">Donor Name</th>
                  <th className="py-4 text-left font-black">Address</th>
                  <th className="py-4 text-left font-black">Cause Support</th>
                  <th className="py-4 text-left font-black">Amount</th>
                  <th className="py-4 text-left font-black">Date</th>
                  <th className="py-4 text-left font-black">Details</th>
                  <th className="py-4 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((d) => {
                  const isExpanded = expandedId === d.id;
                  const { readableTime, meta } = parseTimeField(d.time);
                  const isCustomized = meta.customisation && !meta.customisation.isAnonymous;
                  const isAnon = meta.customisation && meta.customisation.isAnonymous;

                  return (
                    <tr key={d.id} className="border-b border-gray-50 dark:border-zinc-800/80 hover:bg-gray-50/50 dark:hover:bg-zinc-950/20 group">
                      <td className="py-4 font-bold text-gray-800 dark:text-zinc-200">
                        <div className="flex items-center gap-2">
                          <span>{d.name}</span>
                          {meta.marketing?.receiveMarketing && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase" title="Subscribed to updates">
                              ✓
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-gray-600 dark:text-zinc-400 font-medium">
                        {d.address || "Ranchi, Jharkhand, India"}
                      </td>
                      <td className="py-4 text-gray-600 dark:text-zinc-400 font-medium max-w-[280px] truncate">
                        {d.donation_for}
                      </td>
                      <td className="py-4 font-black text-[#1E4D2B] dark:text-[#52c47c]">
                        {d.amount}
                      </td>
                      <td className="py-4 text-xs text-gray-600 dark:text-zinc-400 font-medium">
                        {d.transaction_date || readableTime}
                      </td>
                      <td className="py-4 text-xs">
                        {isAnon ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                            Anonymous
                          </span>
                        ) : isCustomized ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
                            Premium Details
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-50 dark:bg-blue-950/30 text-blue-500">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-right space-x-3">
                        <button
                           onClick={() => setExpandedId(isExpanded ? null : d.id)}
                           className="text-xs font-bold text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {isExpanded ? "Hide Details" : "View"}
                        </button>
                        <button
                          onClick={() => handleStartEdit(d)}
                          className="text-xs font-bold text-[#1E4D2B] dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>

                      {/* Detail Expansion Subrow */}
                      {isExpanded && (
                        <td colSpan={7} className="bg-gray-50/50 dark:bg-zinc-950/20 px-6 py-4 rounded-xl border border-gray-150/40 dark:border-zinc-800/80">
                          <div className="grid gap-6 sm:grid-cols-3 text-left">
                            
                            {/* Acknowledgement / Dedicated To */}
                            <div className="space-y-1">
                              <span className="block text-[8px] font-black text-gray-400 dark:text-zinc-550 uppercase tracking-wider">Customisation Details</span>
                              {isAnon ? (
                                <p className="text-xs italic text-gray-500 font-bold">Anonymous Donation - skipped name printing.</p>
                              ) : (
                                <div className="text-xs space-y-1 text-gray-700 dark:text-zinc-300">
                                  <p>Name printed: <span className="font-bold text-gray-900 dark:text-white">{meta.customisation?.printedName || "-"}</span></p>
                                  <p>Delivery date: <span className="font-bold text-gray-900 dark:text-white">{meta.customisation?.deliveryDate || "-"}</span></p>
                                </div>
                              )}
                            </div>

                            {/* Premium content details */}
                            <div className="space-y-1.5">
                              <span className="block text-[8px] font-black text-gray-400 dark:text-zinc-550 uppercase tracking-wider">Premium Attachments</span>
                              {meta.customisation?.photoUrl && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold">Attached photo:</span>
                                  <a href={meta.customisation.photoUrl} target="_blank" rel="noopener noreferrer">
                                    <img src={meta.customisation.photoUrl} className="h-8 w-8 object-cover rounded border border-gray-200" alt="uploaded custom photo" />
                                  </a>
                                </div>
                              )}
                              {meta.customisation?.videoWish && (
                                <p className="text-xs">Video wish: <span className="font-semibold italic">“{meta.customisation.videoWish}”</span></p>
                              )}
                              {meta.customisation?.instagramId && (
                                <p className="text-xs">Instagram: <span className="font-bold text-emerald-500">{meta.customisation.instagramId}</span></p>
                              )}
                            </div>

                            {/* Requests & Marketing alerts */}
                            <div className="space-y-1.5">
                              <span className="block text-[8px] font-black text-gray-400 dark:text-zinc-550 uppercase tracking-wider">Special Requests & Alerts</span>
                              {meta.customisation?.isGift && (
                                <p className="text-xs">🎁 Gift message: <span className="font-semibold text-amber-500">{meta.customisation.giftMessage || "Yes"}</span></p>
                              )}
                              {meta.customisation?.isOtherRequest && (
                                <p className="text-xs">✍️ Special Request: <span className="font-semibold text-gray-800 dark:text-zinc-200">{meta.customisation.otherRequestText}</span></p>
                              )}
                              {meta.marketing?.receiveMarketing ? (
                                <div className="text-xs pt-1 border-t border-gray-200/50 dark:border-zinc-800 text-gray-500 dark:text-zinc-450 font-bold space-y-0.5">
                                  <p>📞 Updates SMS: {meta.marketing.marketingPhone}</p>
                                  {meta.marketing.marketingEmail && <p>📧 Updates Email: {meta.marketing.marketingEmail}</p>}
                                </div>
                              ) : (
                                <p className="text-xs italic text-gray-400 font-bold">No updates subscription selected.</p>
                              )}
                            </div>

                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}
