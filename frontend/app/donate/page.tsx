"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

type PaymentMethod = "UPI" | "Card" | "NetBanking" | "Wallet" | "Razorpay";

export default function DonateCheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");

  // Purchased items info for invoice PDF
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
  const [receiptId, setReceiptId] = useState("");
  const [transactionDate, setTransactionDate] = useState("");

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem('auth');
    const adminAuth = localStorage.getItem('admin_auth');
    const volunteerSession = localStorage.getItem('volunteer_session');
    const isLoggedIn = auth === 'true' || adminAuth === 'true' || !!volunteerSession;

    if (!isLoggedIn) {
      router.push('/signin?redirect=/donate');
      return;
    }

    // Pre-fill profile fields based on active session type
    if (auth === 'true') {
      setFullName(localStorage.getItem("user_name") || "");
      const storedEmail = localStorage.getItem("user_email") || "";
      setEmail(storedEmail);
      setMarketingEmail(storedEmail);
      const storedPhone = localStorage.getItem("user_phone") || "";
      setPhone(storedPhone);
      setMarketingPhone(storedPhone ? (storedPhone.startsWith("+91") ? storedPhone : "+91" + storedPhone) : "+91");
    } else if (volunteerSession) {
      try {
        const vol = JSON.parse(volunteerSession);
        setFullName(vol.name || "");
        setEmail(vol.email || "");
        setMarketingEmail(vol.email || "");
        setPhone(vol.phone || "");
        setMarketingPhone(vol.phone ? (vol.phone.startsWith("+91") ? vol.phone : "+91" + vol.phone) : "+91");
      } catch (e) {
        console.error("Error parsing volunteer session on donate page:", e);
      }
    } else if (adminAuth === 'true') {
      setFullName("Administrator");
      setEmail("admin@kanhafoundation.org");
      setMarketingEmail("admin@kanhafoundation.org");
      setPhone("");
      setMarketingPhone("+91");
    }
  }, [router]);

  const [causesList, setCausesList] = useState<any[]>([]);
  const [selectedCauseId, setSelectedCauseId] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("1000");
  const [localCart, setLocalCart] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/causes')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCausesList(data);
          // If global cart is empty, keep cart empty
          if (cartItems.length === 0) {
            setSelectedCauseId("");
            setLocalCart([]);
          }
        }
      })
      .catch(err => console.error("Error loading causes on checkout:", err));
  }, []);

  // Sync with global cartItems if user came from causes grid click
  useEffect(() => {
    if (cartItems.length > 0) {
      setSelectedCauseId("cart");
      setLocalCart(cartItems);
    }
  }, [cartItems]);

  // Pre-fill tomorrow's date by default
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setDeliveryDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const handleCauseChange = (id: string) => {
    setSelectedCauseId(id);
    if (id === "") {
      setLocalCart([]);
    } else if (id === "cart") {
      setLocalCart(cartItems);
    } else if (id === "custom") {
      setLocalCart([{
        id: "custom",
        title: "General Support",
        amount: `₹${customAmount}`,
        category: "Giving To The Needy"
      }]);
    } else {
      const found = causesList.find(c => c.id.toString() === id);
      if (found) {
        setLocalCart([{
          id: found.id,
          title: found.title,
          amount: found.price,
          category: found.category
        }]);
      }
    }
  };

  const handleCustomAmountChange = (val: string) => {
    setCustomAmount(val);
    if (selectedCauseId === "custom") {
      setLocalCart([{
        id: "custom",
        title: "General Support",
        amount: `₹${val}`
      }]);
    }
  };
  const [receiveMarketing, setReceiveMarketing] = useState(true);
  const [marketingPhone, setMarketingPhone] = useState("+91");
  const [marketingEmail, setMarketingEmail] = useState("");

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [printedName, setPrintedName] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  const [customPhotoFile, setCustomPhotoFile] = useState<File | null>(null);
  const [customPhotoUrl, setCustomPhotoUrl] = useState("");
  const [videoWish, setVideoWish] = useState("");
  const [instagramId, setInstagramId] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [isOtherRequest, setIsOtherRequest] = useState(false);
  const [otherRequestText, setOtherRequestText] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [isDedicated, setIsDedicated] = useState(false);
  const [dedicatedTo, setDedicatedTo] = useState("");
  const [dedicationMsg, setDedicationMsg] = useState("");

  const handleAnonymousChange = (checked: boolean) => {
    setIsAnonymous(checked);
    if (checked) {
      setPrintedName("");
    } else if (isDedicated && dedicatedTo) {
      setPrintedName(dedicatedTo);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5 MB limits.");
      return;
    }

    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        setCustomPhotoUrl(data.url);
      } else {
        alert(data.error || "Upload failed.");
      }
    } catch (err) {
      console.error("Photo upload error:", err);
      alert("Error uploading file.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // UPI fields
  const [upiId, setUpiId] = useState("");

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // Net banking fields
  const [selectedBank, setSelectedBank] = useState("SBI");

  // Flow states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sum calculations based on chosen local selection
  const totalAmount = localCart.reduce((sum, item) => {
    const clean = item.amount ? item.amount.replace(/[a-zA-Z]+\.?/g, "").trim() : "0";
    const numericStr = clean.replace(/[^0-9.]/g, "");
    return sum + (parseFloat(numericStr) || 0);
  }, 0);

  const processSuccessfulDonation = (methodUsed: string, transactionId?: string) => {
    // Save transaction to user donations history in localStorage
    try {
      const historyKey = `user_donations_${email.trim().toLowerCase()}`;
      const existing = localStorage.getItem(historyKey);
      const history = existing ? JSON.parse(existing) : [];
      const newDonations = localCart.map(item => ({
        title: item.title,
        amount: item.amount,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        status: "Completed"
      }));
      localStorage.setItem(historyKey, JSON.stringify([...newDonations, ...history]));
    } catch (err) {
      console.error("Error saving user donation transaction history:", err);
    }

    // Calculate category-specific metrics for metadata
    let birthdayTotal = 0;
    let foodTotal = 0;
    let welfareTotal = 0;
    let studyKitTotal = 0;

    localCart.forEach(item => {
      const clean = item.amount ? item.amount.replace(/[a-zA-Z]+\.?/g, "").trim() : "0";
      const numericStr = clean.replace(/[^0-9.]/g, "");
      const amt = parseFloat(numericStr) || 0;
      const title = item.title.toLowerCase();
      const category = (item.category || "").toLowerCase();

      // Match based on category property OR string search on title (fallback)
      const isBirthday = category.includes("birthday") || category.includes("anniversary") || category.includes("memorial") ||
                         title.includes("birthday") || title.includes("anniversary") || title.includes("celebration");
                         
      const isFood = category.includes("needy") || category.includes("animal") || category.includes("nature") || category.includes("food") ||
                     title.includes("thali") || title.includes("meals") || title.includes("feed") || title.includes("cows") || title.includes("dogs") || title.includes("chara") || title.includes("fodder");
                     
      const isWelfare = category.includes("women") || category.includes("education") || category.includes("care") ||
                        title.includes("study") || title.includes("kit") || title.includes("notebook") || title.includes("education") || title.includes("menstrual") || title.includes("water") || title.includes("girl") || title.includes("child");
                        
      const isStudyKit = category.includes("education") || (title.includes("study") && title.includes("kit"));

      if (isBirthday) {
        birthdayTotal += amt;
      }
      if (isFood) {
        foodTotal += amt;
      }
      if (isWelfare) {
        welfareTotal += amt;
      }
      if (isStudyKit) {
        studyKitTotal += amt;
      }
    });

    const mealsCount = Math.round(foodTotal / 30);
    const livesCount = Math.round(welfareTotal / 50);
    const studyKitsCount = Math.round(studyKitTotal / 1200);
    const metadata = {
      birthday: birthdayTotal,
      meals: mealsCount,
      lives: livesCount,
      studykit: studyKitsCount,
      total: totalAmount,
      marketing: {
        receiveMarketing,
        marketingPhone: receiveMarketing ? marketingPhone : "",
        marketingEmail: receiveMarketing ? (marketingEmail || email) : ""
      },
      customisation: totalAmount >= 700 ? {
        isAnonymous,
        printedName: isAnonymous ? "" : printedName,
        deliveryDate: isAnonymous ? "" : deliveryDate,
        photoUrl: isAnonymous ? "" : customPhotoUrl,
        videoWish: isAnonymous ? "" : videoWish,
        instagramId: isAnonymous ? "" : instagramId,
        isGift: isAnonymous ? false : isGift,
        giftMessage: isAnonymous ? "" : (isGift ? giftMessage : ""),
        isOtherRequest: isAnonymous ? false : isOtherRequest,
        otherRequestText: isAnonymous ? "" : (isOtherRequest ? otherRequestText : "")
      } : null
    };

    const timePayload = `Just now|${JSON.stringify(metadata)}`;

    const productTitles = localCart.map(item => item.title).join(", ");

    const randId = Math.floor(100000 + Math.random() * 900000);
    const generatedReceiptId = transactionId || `KF-2026-${randId}`;
    const generatedDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Sync donation to Supabase database for live feed
    fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fullName,
        email: email,
        phone: phone,
        amount: `₹${totalAmount.toLocaleString('en-IN')}`,
        time: timePayload,
        donation_for: productTitles,
        is_anonymous: isAnonymous,
        printed_name: isAnonymous ? "" : printedName,
        delivery_date: isAnonymous ? "" : deliveryDate,
        photo_url: isAnonymous ? "" : customPhotoUrl,
        video_wish: isAnonymous ? "" : videoWish,
        instagram_id: isAnonymous ? "" : instagramId,
        is_gift: isAnonymous ? false : isGift,
        gift_message: isAnonymous ? "" : (isGift ? giftMessage : ""),
        is_other_request: isAnonymous ? false : isOtherRequest,
        other_request_text: isAnonymous ? "" : (isOtherRequest ? otherRequestText : ""),
        receive_marketing: receiveMarketing,
        marketing_phone: receiveMarketing ? marketingPhone : "",
        marketing_email: receiveMarketing ? (marketingEmail || email) : "",
        is_dedicated: isDedicated,
        dedicated_to: isDedicated ? dedicatedTo : "",
        dedication_msg: isDedicated ? dedicationMsg : "",
        receipt_id: generatedReceiptId,
        transaction_date: generatedDate,
        payment_method: methodUsed,
        payment_status: "SUCCESS"
      })
    })
      .then(res => res.json())
      .then(data => {
        setReceiptId(generatedReceiptId);
        setTransactionDate(generatedDate);
        setPurchasedItems([...localCart]);
        setIsProcessing(false);
        setIsSuccess(true);
        clearCart();
      })
      .catch(err => {
        console.error("Error saving donation to database:", err);
        setReceiptId(generatedReceiptId);
        setTransactionDate(generatedDate);
        setPurchasedItems([...localCart]);
        setIsProcessing(false);
        setIsSuccess(true);
        clearCart();
      });
  };

  const handleRazorpayPayment = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_Tz0WJ5M6nO6uVb", // Public test key fallback
        amount: totalAmount * 100, // in paise
        currency: "INR",
        name: "Kanha Foundation",
        description: "Donation for " + localCart.map(item => item.title).join(", "),
        image: "/kanha_logo_round.png",
        prefill: {
          name: fullName,
          email: email,
          contact: phone
        },
        theme: {
          color: "#1E4D2B"
        },
        handler: function (response: any) {
          processSuccessfulDonation("Razorpay", response.razorpay_payment_id);
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    };
    script.onerror = () => {
      setIsProcessing(false);
      setErrorMsg("Failed to load Razorpay SDK. Please check your internet connection.");
    };
    document.body.appendChild(script);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg("Please fill in your name, email, and mobile number.");
      return;
    }

    if (totalAmount <= 0) {
      setErrorMsg("Your donation cart is empty. Please add causes to support.");
      return;
    }

    if (paymentMethod === "UPI" && !upiId.trim()) {
      setErrorMsg("Please enter a valid UPI ID.");
      return;
    }

    if (!isAnonymous && totalAmount >= 700 && (!printedName.trim() || !deliveryDate.trim())) {
      setErrorMsg("Please fill in the printed name and preferred delivery date for customization, or choose anonymous donation.");
      return;
    }

    if (videoWish.length > 80) {
      setErrorMsg("Video wish line cannot exceed 80 characters.");
      return;
    }

    if (paymentMethod === "Card" && (!cardNumber || !cardExpiry || !cardCvv || !cardName)) {
      setErrorMsg("Please enter complete card payment details.");
      return;
    }

    // Trigger loader
    setIsProcessing(true);

    if (paymentMethod === "Razorpay") {
      handleRazorpayPayment();
      return;
    }

    setTimeout(() => {
      processSuccessfulDonation(paymentMethod);
    }, 2500); // 2.5s secure transaction mock loading
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#07100b] flex items-center justify-center font-sans py-12 px-4 print:bg-white print:py-0">
        <style dangerouslySetInnerHTML={{ __html: `
  @media print {
    @page {
      size: A4;
      margin: 20mm;
    }
    body {
      background: white !important;
      color: black !important;
    }
    body * {
      visibility: hidden;
    }
    #print-area, #print-area * {
      visibility: visible;
    }
    #print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      border: none !important;
      box-shadow: none !important;
      padding: 10mm;
      background: white !important;
      color: black !important;
      page-break-inside: avoid;
    }
    #print-area p, #print-area h2, #print-area span, #print-area td, #print-area th {
      color: black !important;
      font-size: 9pt;
    }
    .no-print {
      display: none !important;
    }
  }
`}} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl bg-white dark:bg-[#101412] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-gray-150 dark:border-zinc-800 text-center"
        >
          {/* Animated success green circle tick */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 shadow-inner mb-6">
            <svg className="h-10 w-10 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-black text-[#1E4D2B] dark:text-[#52c47c] tracking-tight">
            Thank you, {fullName}!
          </h1>
          <p className="mt-2 text-sm text-[#F3A61E] font-black uppercase tracking-wider">
            Donation Successful
          </p>

          <p className="mt-4 text-xs text-gray-550 dark:text-gray-450 leading-relaxed max-w-md mx-auto">
            Your generous contribution has been securely processed. A tax donation receipt (80G) and a WhatsApp proof of execution will be sent shortly.
          </p>

          {/* Invoice Receipt Preview (Shown on screen, and isolates on print) */}
          <div id="print-area" className="mt-6 text-left bg-gray-50/50 dark:bg-zinc-950/30 p-6 rounded-2xl border border-gray-100 dark:border-zinc-900 shadow-inner">
            {/* Invoice Header */}
            <div className="border-b border-gray-200 dark:border-zinc-800/80 pb-3.5 mb-3.5">
              <div className="text-center">
                <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-tight uppercase">Kanha Foundation</h2>
                <p className="text-[9px] text-gray-500 font-bold mt-0.5">Ranchi, Jharkhand, India</p>

                <div className="flex justify-between mt-2">
                  <div className="text-left">
                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-[#1E4D2B] dark:text-[#52c47c] border border-emerald-900/10 rounded text-[9px] font-black uppercase tracking-wider">
                      80G Receipt
                    </span>
                    <p className="text-[9px] text-gray-500 font-mono mt-1.5">{receiptId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-500 font-mono">+91 7488164529</p>
                    <p className="text-[9px] text-gray-500 font-mono">contact@kanhafoundation.org</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Donor & Transaction Info */}
            <div className="grid grid-cols-2 gap-3 text-[10px] mb-4 pb-3.5 border-b border-gray-200 dark:border-zinc-800/80">
              <div>
                <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wider">Donor Details</span>
                <p className="font-bold text-gray-800 dark:text-zinc-200 mt-0.5">{fullName}</p>
                <p className="text-[9px] text-gray-500">{email}</p>
                <p className="text-[9px] text-gray-500">{phone}</p>
              </div>
              <div className="text-right">
                <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wider">Transaction Details</span>
                <p className="font-semibold text-gray-850 dark:text-zinc-250 mt-0.5">Date: {transactionDate}</p>
                <p className="text-[9px] text-gray-500">Mode: {paymentMethod}</p>
                <p className="text-[9px] text-emerald-500 font-black">Status: SUCCESS ✅</p>
              </div>
            </div>

            {/* Honoree / Dedication */}
            {dedicatedTo && (
              <div className="mt-4 text-[9px] text-gray-800 dark:text-gray-200 border-t pt-2">
                <p className="font-black uppercase">Honoree: {dedicatedTo}</p>
                {dedicationMsg && <p className="italic">“{dedicationMsg}”</p>}
              </div>
            )}

            {!isAnonymous && (printedName || deliveryDate || customPhotoUrl || videoWish || instagramId || isGift || isOtherRequest) && (
              <div className="mt-4 text-[9px] text-gray-850 dark:text-gray-200 border-t pt-2 space-y-1.5 text-left col-span-2">
                <p className="font-black uppercase text-[8px] tracking-wider text-gray-400">Acknowledgement & Customisation</p>
                {printedName && <p>Name to be printed: <span className="font-bold text-gray-800 dark:text-gray-200">{printedName}</span></p>}
                {deliveryDate && <p>Preferred date: <span className="font-bold text-gray-800 dark:text-gray-200">{deliveryDate}</span></p>}
                {customPhotoUrl && (
                  <div className="flex items-center gap-2 mt-1">
                    <span>Uploaded Photo:</span>
                    <img src={customPhotoUrl} alt="Receipt Preview" className="h-10 w-10 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800" />
                  </div>
                )}
                {videoWish && <p>Video wish line: <span className="italic font-medium text-gray-700 dark:text-gray-300">“{videoWish}”</span></p>}
                {instagramId && <p>Beneficiary Instagram: <span className="font-bold text-gray-800 dark:text-gray-200">{instagramId}</span></p>}
                {isGift && giftMessage && <p>Gift Details: <span className="font-bold text-gray-800 dark:text-gray-200">{giftMessage}</span></p>}
                {isOtherRequest && otherRequestText && <p>Special Request: <span className="font-bold text-gray-800 dark:text-gray-200">{otherRequestText}</span></p>}
              </div>
            )}

            {isAnonymous && (
              <div className="mt-4 text-[9px] text-gray-550 dark:text-zinc-555 border-t pt-2 text-left col-span-2">
                <p className="italic font-bold text-amber-500">Anonymous Donation (acknowledged privately)</p>
              </div>
            )}

            {/* Contributions List */}
            <table className="w-full text-left text-[10px] mb-4">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-850 text-gray-400 font-black uppercase tracking-wider text-[8px]">
                  <th className="pb-1.5">Sponsored Cause</th>
                  <th className="pb-1.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-900">
                {purchasedItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 font-bold text-gray-800 dark:text-zinc-300">{item.title}</td>
                    <td className="py-2 text-right font-black text-gray-900 dark:text-white">{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Receipt Summary */}
            <div className="border-t border-gray-250 dark:border-zinc-800/80 pt-3 flex justify-between items-center text-[10px]">
              <div>
                <p className="text-[8px] text-gray-400 leading-relaxed max-w-[200px]">
                  * This is a computer generated tax receipt eligible for tax exemption computations.
                </p>
              </div>
              <div className="text-right">
                <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wider">Total Contribution</span>
                <p className="text-sm font-black text-[#F3A61E]">₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Signature Area (Only for print) */}
            <div className="hidden print:flex justify-between items-center mt-10 pt-6 border-t border-dashed border-gray-300 text-[9px] text-gray-500">
              <p>Verified Online Document • No signature required</p>
              <div className="text-right">
                <div className="border-b border-gray-400 h-6 w-24 mb-1"></div>
                <p className="font-bold text-gray-800 uppercase tracking-wider text-[7px]">Authorized Signatory</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 justify-center">
            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-[#1E4D2B] hover:bg-[#15381E] text-white font-extrabold text-xs rounded-full transition-all duration-300 shadow-md cursor-pointer flex justify-center items-center gap-1.5 border border-emerald-800/40"
            >
              <svg className="h-4 w-4 text-emerald-450" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Invoice / Receipt (PDF)
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.href = "/"}
                className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-extrabold text-xs rounded-full border border-gray-200 dark:border-zinc-800 cursor-pointer"
              >
                Back to Home
              </button>
              <button
                onClick={() => window.location.href = "/causes"}
                className="flex-1 py-3 bg-[#F3A61E] hover:bg-[#e0981b] text-black font-extrabold text-xs rounded-full transition-all duration-300 shadow-md cursor-pointer"
              >
                Support More
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#07100b] font-sans py-16 px-4 md:px-8">
      
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/75 z-50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
          <p className="mt-4 text-sm font-extrabold tracking-wider uppercase text-emerald-450">Securing Payment Connection...</p>
          <p className="mt-1 text-xs text-zinc-400">Do not refresh or close this tab</p>
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        
        {/* Header Title */}
        <div className="mb-12 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E4D2B] dark:text-[#52c47c] tracking-tight">
            Complete Your Donation
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Secure checkout powered by 256-bit encryption. Fill details below to complete.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* Left Form: Col 7 */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white dark:bg-[#101412] p-6 sm:p-10 rounded-[2rem] border border-gray-150/40 dark:border-zinc-800/80 shadow-sm space-y-8">
            
            {/* Logged in User Profile Info Banner */}
            <div className="bg-emerald-950/20 border border-emerald-900/35 p-5 rounded-2xl flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-left">
                <div className="h-10 w-10 bg-[#1E4D2B] rounded-full flex items-center justify-center font-bold text-white uppercase text-sm border border-emerald-500/20">
                  {fullName.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Logged in as {fullName}</h3>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{email} • {phone}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("auth");
                  localStorage.removeItem("user_name");
                  localStorage.removeItem("user_email");
                  localStorage.removeItem("user_phone");
                  router.push("/signin?redirect=/donate");
                }}
                className="px-4 py-1.5 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 text-xs font-bold rounded-full transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>

            {/* Step 1: Donor Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E4D2B] text-white text-xs font-black">1</span>
                Donor Contact Information
              </h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Vikram Singh"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">WhatsApp Number (For Proofs)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email Address (For Tax Receipt)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                />
              </div>
            </div>
              {/* Dedication Checkbox */}
            <div className="border-t border-gray-100 dark:border-zinc-800/80 pt-6">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isDedicated}
                  onChange={(e) => setIsDedicated(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-gray-300 dark:border-gray-700 text-[#5850ec] focus:ring-[#5850ec]"
                />
                <span className="text-xs font-black text-gray-900 dark:text-white">
                  Dedicate this donation in honor of someone's birthday or memory
                </span>
              </label>

              <AnimatePresence>
                {isDedicated && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4 grid gap-4 sm:grid-cols-2 pt-2"
                  >
                    {/* Dedication Inputs */}
                    <div>
                      <label className="block text-[10px] font-black text-gray-555 dark:text-gray-400 uppercase tracking-wider mb-2">Honoree Name</label>
                      <input
                        type="text"
                        value={dedicatedTo}
                        onChange={(e) => {
                          setDedicatedTo(e.target.value);
                          if (!isAnonymous) {
                            setPrintedName(e.target.value);
                          }
                        }}
                        placeholder="e.g. Shwetha's Birthday"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-550 dark:text-gray-400 uppercase tracking-wider mb-2">Dedication Note (Wishes)</label>
                      <input
                        type="text"
                        value={dedicationMsg}
                        onChange={(e) => setDedicationMsg(e.target.value)}
                        placeholder="e.g. Wish you a very happy birthday!"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step 2: Choose Cause / Product to Support */}
            <div className="space-y-4 border-t border-gray-100 dark:border-zinc-800/80 pt-6">
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E4D2B] text-white text-xs font-black">2</span>
                Choose Cause to Support
              </h2>

              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Select Donation Target</label>
                <select
                  value={selectedCauseId}
                  onChange={(e) => handleCauseChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-800 dark:text-white font-semibold focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                >
                  <option value="">-- Choose a cause to support --</option>
                  {cartItems.length > 0 && (
                    <option value="cart">Items in your cart ({cartItems.length} items)</option>
                  )}
                  {causesList.map((c) => (
                    <option key={c.id} value={c.id.toString()}>
                      {c.title} ({c.price})
                    </option>
                  ))}
                  <option value="custom">General Support / Custom Amount</option>
                </select>
              </div>

              {selectedCauseId === "custom" && (
                <div className="mt-3">
                  <label className="block text-[10px] font-black text-gray-555 dark:text-gray-400 uppercase tracking-wider mb-2">Enter Custom Amount (₹)</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    placeholder="e.g. 1000"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                  />
                </div>
              )}
            </div>

            {/* Review & Customise Block */}
            <div className="border-t border-gray-150/40 dark:border-zinc-800/80 pt-6 space-y-3 text-left">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Review & Customise</h2>
              <p className="text-xs text-gray-400 font-bold -mt-1 block">
                Add the details (optional premium field unlock at ₹700+).
              </p>

              <div className="grid gap-6 md:grid-cols-12 items-start mt-4">
                {/* Anonymous Box - Col 5 */}
                <div className="md:col-span-5 bg-gray-50/75 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl flex flex-col justify-start text-left min-h-[160px]">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => handleAnonymousChange(e.target.checked)}
                      className="h-4.5 w-4.5 mt-0.5 rounded border-gray-300 dark:border-gray-700 text-[#5850ec] focus:ring-[#5850ec]"
                    />
                    <div className="space-y-1">
                      <span className="text-xs font-black text-gray-900 dark:text-white">
                        Make my donation anonymous <span className="text-[10px] text-zinc-555 dark:text-zinc-500 font-medium">(skip all customisation)</span>
                      </span>
                      <p className="text-[10px] text-gray-500 dark:text-zinc-500 leading-normal font-bold">
                        If selected, we will process your donation without printed name, wishes, or special requests.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Customisation inputs - Col 7 */}
                <div className="md:col-span-7 space-y-4 text-left">
                  {!isAnonymous ? (
                    <>
                      {totalAmount >= 700 ? (
                        <>
                          <div>
                            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Name to be printed *</label>
                            <input
                              type="text"
                              value={printedName}
                              onChange={(e) => setPrintedName(e.target.value)}
                              placeholder="Example: Prathamesh"
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-250 dark:border-gray-750 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                              required={!isAnonymous}
                            />
                            <span className="block text-[10px] text-gray-450 dark:text-zinc-555 mt-1.5 font-bold">
                              This will be used for name plate / acknowledgement.
                            </span>
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Preferred delivery date *</label>
                            <input
                              type="date"
                              value={deliveryDate}
                              onChange={(e) => setDeliveryDate(e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-250 dark:border-gray-750 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B] text-gray-800 dark:text-white"
                              required={!isAnonymous}
                            />
                            <span className="block text-[10px] text-gray-450 dark:text-zinc-555 mt-1.5 font-bold">
                              Earliest available date is tomorrow.
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex flex-col items-center justify-center text-center min-h-[160px]">
                          <p className="text-xs font-black text-amber-600 dark:text-amber-400 leading-normal">
                            🔒 Donate ₹{(700 - totalAmount).toFixed(0)} more to unlock customization details & premium fields (printed name, preferred date, wishes).
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-6 bg-zinc-500/5 border border-zinc-500/10 rounded-2xl flex items-center justify-center text-center min-h-[160px]">
                      <p className="text-xs font-bold text-zinc-500 italic">
                        Anonymous donation selected. Customisation skipped.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Premium Fields Subsection */}
              {!isAnonymous && totalAmount >= 700 && (
                <div className="mt-6 border-t border-dashed border-gray-150/80 dark:border-zinc-800/80 pt-6 space-y-5">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Premium fields:</h3>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-550 dark:text-gray-400 uppercase tracking-wider mb-2">Upload a photo (max 5 MB)</label>
                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#0c1510] p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={isUploadingPhoto}
                        className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-[#1E4D2B] file:text-white hover:file:bg-[#15381E] file:cursor-pointer"
                      />
                      {isUploadingPhoto && <span className="text-xs text-gray-400 animate-pulse font-bold">Uploading...</span>}
                      {customPhotoUrl && (
                        <div className="flex items-center gap-2">
                          <img src={customPhotoUrl} alt="Uploaded preview" className="h-10 w-10 object-cover rounded-lg border border-gray-200" />
                          <span className="text-[10px] text-emerald-500 font-bold">✓ Uploaded</span>
                        </div>
                      )}
                    </div>
                    <span className="block text-[10px] text-gray-450 dark:text-zinc-555 mt-1.5 font-bold">Any photo format. Max 5 MB.</span>
                  </div>

                  {/* Video wish line */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[10px] font-black text-gray-555 dark:text-gray-400 uppercase tracking-wider">Video wish line (max 80 characters)</label>
                      <span className="text-[10px] font-bold text-gray-400">{videoWish.length}/80</span>
                    </div>
                    <input
                      type="text"
                      maxLength={80}
                      value={videoWish}
                      onChange={(e) => setVideoWish(e.target.value)}
                      placeholder="Example: Happy Birthday / Anniversary Prathamesh"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                    />
                  </div>

                  {/* Beneficiary Instagram ID */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-555 dark:text-gray-400 uppercase tracking-wider mb-2">Beneficiary Instagram ID (optional)</label>
                    <input
                      type="text"
                      value={instagramId}
                      onChange={(e) => setInstagramId(e.target.value)}
                      placeholder="Example: @prathamesh"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                    />
                    <span className="block text-[10px] text-gray-450 dark:text-zinc-555 mt-1.5 font-bold">If you want us to tag them (where possible).</span>
                  </div>

                  {/* Any Special Request */}
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-gray-550 dark:text-gray-400 uppercase tracking-wider">Any Special Request?</label>
                    <p className="text-[10px] text-gray-450 dark:text-zinc-555 font-bold -mt-3">We'll try our best to consider them.</p>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 p-4 rounded-2xl text-left space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isGift}
                            onChange={(e) => setIsGift(e.target.checked)}
                            className="h-4.5 w-4.5 rounded border-gray-300 dark:border-gray-700 text-[#5850ec] focus:ring-[#5850ec]"
                          />
                          <span className="text-xs font-black text-gray-850 dark:text-zinc-200">
                            🎁 Is this a gift or on behalf of someone else?
                          </span>
                        </label>
                        <AnimatePresence>
                          {isGift && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden pt-1"
                            >
                              <input
                                type="text"
                                value={giftMessage}
                                onChange={(e) => setGiftMessage(e.target.value)}
                                placeholder="Enter name or gift message..."
                                className="w-full px-3 py-2 bg-white dark:bg-[#101412] border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:outline-none"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="bg-gray-50 dark:bg-[#0c1510] border border-gray-200 dark:border-gray-700 p-4 rounded-2xl text-left space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isOtherRequest}
                            onChange={(e) => setIsOtherRequest(e.target.checked)}
                            className="h-4.5 w-4.5 rounded border-gray-300 dark:border-gray-700 text-[#5850ec] focus:ring-[#5850ec]"
                          />
                          <span className="text-xs font-black text-gray-850 dark:text-zinc-200">
                            ✍️ Any other request?
                          </span>
                        </label>
                        <AnimatePresence>
                          {isOtherRequest && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden pt-1"
                            >
                              <textarea
                                value={otherRequestText}
                                onChange={(e) => setOtherRequestText(e.target.value)}
                                placeholder="Describe your request..."
                                rows={2}
                                className="w-full px-3 py-2 bg-white dark:bg-[#101412] border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:outline-none resize-none"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Step 3: Choose Payment Method */}
            <div className="border-t border-gray-100 dark:border-zinc-800/80 pt-6 space-y-4">
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E4D2B] text-white text-xs font-black">3</span>
                Select Payment Method
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {(["UPI", "Card", "NetBanking", "Wallet", "Razorpay"] as PaymentMethod[]).map((method) => {
                  const isSelected = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-3 px-4 rounded-xl border text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-[#F3A61E]/10 border-[#F3A61E] text-black dark:text-white'
                          : 'bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {method}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Inputs per Method */}
              <div className="bg-gray-50 dark:bg-[#0c1510] p-6 rounded-2xl border border-gray-100 dark:border-zinc-900 mt-4">
                
                {paymentMethod === "Razorpay" && (
                  <div className="space-y-4 text-left">
                    <p className="text-xs text-gray-700 dark:text-gray-250 font-bold">
                      Pay securely with Razorpay checkout popup.
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold">
                      Once you click "Proceed to Secure Pay" below, the Razorpay payment window will open. You can pay using UPI, Cards, Net Banking, or Wallets inside Razorpay.
                    </p>
                  </div>
                )}

                {paymentMethod === "UPI" && (
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enter UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. vikram@okhdfcbank"
                      className="w-full px-4 py-3 bg-white dark:bg-[#101412] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B]"
                    />
                    <p className="text-[10px] text-gray-400 font-bold">Pay securely using Google Pay, PhonePe, Paytm, or BHIM.</p>
                  </div>
                )}

                {paymentMethod === "Card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="e.g. Vikram Singh"
                        className="w-full px-4 py-3 bg-white dark:bg-[#101412] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 •••• •••• ••••"
                        className="w-full px-4 py-3 bg-white dark:bg-[#101412] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 bg-white dark:bg-[#101412] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">CVV</label>
                        <input
                          type="password"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full px-4 py-3 bg-white dark:bg-[#101412] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "NetBanking" && (
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Select Your Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-[#101412] border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-700 dark:text-white"
                    >
                      <option value="SBI">State Bank of India (SBI)</option>
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="AXIS">Axis Bank</option>
                      <option value="KOTAK">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {paymentMethod === "Wallet" && (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Choose Wallet Provider</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" className="py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold text-center bg-white dark:bg-[#101412]">Paytm Wallet</button>
                      <button type="button" className="py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold text-center bg-white dark:bg-[#101412]">Amazon Pay</button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Step 4: Text and email me with news and offers section */}
            <div className="border-t border-gray-150/40 dark:border-zinc-800/80 pt-6 space-y-4 text-left">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={receiveMarketing}
                  onChange={(e) => setReceiveMarketing(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-gray-300 dark:border-gray-700 text-[#5850ec] focus:ring-[#5850ec]"
                />
                <span className="text-xs font-black text-gray-900 dark:text-white">
                  Text and email me with news and offers
                </span>
              </label>

              <AnimatePresence>
                {receiveMarketing && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-3"
                  >
                    <div className="bg-gray-50/70 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-550 dark:text-gray-400 uppercase tracking-widest mb-2">Mobile phone number</label>
                        <div className="flex items-center border border-zinc-250 dark:border-zinc-750 bg-white dark:bg-[#0c1510] rounded-xl overflow-hidden px-3 py-1.5 focus-within:ring-1 focus-within:ring-[#1E4D2B]">
                          <span className="text-sm font-bold text-zinc-550 select-none mr-1.5">+91</span>
                          <input
                            type="tel"
                            value={marketingPhone.replace(/^\+91/, "")}
                            onChange={(e) => setMarketingPhone("+91" + e.target.value.replace(/[^0-9]/g, ""))}
                            placeholder="9876543210"
                            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none py-1.5"
                            required={receiveMarketing}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                        <input
                          type="email"
                          value={marketingEmail || email}
                          onChange={(e) => setMarketingEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full px-4 py-3 bg-white dark:bg-[#0c1510] border border-zinc-250 dark:border-zinc-750 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#1E4D2B] text-gray-900 dark:text-white"
                          required={receiveMarketing}
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-zinc-450 dark:text-zinc-550 leading-normal font-bold">
                      By signing up via text or email, you agree to receive recurring automated marketing messages, including cart reminders, at the contact information provided. Consent is not a condition of purchase. Reply STOP to unsubscribe. Reply HELP for help. Message frequency varies. Msg & data rates may apply. View our <a href="#" className="underline">Privacy policy</a> and <a href="#" className="underline">Terms of service</a>.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error Indicators */}
            {errorMsg && (
              <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-200 dark:border-red-900/30">
                {errorMsg}
              </p>
            )}

            {/* Pay Button */}
            <button
              type="submit"
              className="w-full py-4 bg-[#1E4D2B] hover:bg-[#15381E] text-white font-extrabold text-sm rounded-xl transition-all duration-300 active:scale-98 shadow-xl shadow-emerald-900/10 cursor-pointer flex justify-center items-center gap-2"
            >
              <svg className="h-4.5 w-4.5 text-emerald-450 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Proceed to Secure Pay
            </button>

          </form>

          {/* Right Summary: Col 5 */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Cart Items Box */}
            <div className="bg-white dark:bg-[#101412] p-6 rounded-[2rem] border border-gray-150/40 dark:border-zinc-800/80 shadow-sm">
              <h2 className="text-base font-black text-gray-900 dark:text-white mb-6 border-b border-gray-50 dark:border-zinc-800/80 pb-3 flex items-center gap-2">
                Donation Summary
              </h2>

              {localCart.length > 0 ? (
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                  {localCart.map((item) => (
                    <div key={item.id} className="flex justify-between items-start gap-4">
                      <div className="text-left">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{item.title}</p>
                        <span className="text-[10px] text-gray-400 font-bold">One-time Donation</span>
                      </div>
                      <span className="text-xs font-black text-[#1E4D2B] dark:text-[#52c47c] flex-shrink-0">{item.amount}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 font-medium py-4 text-center">Your donation cart is empty.</p>
              )}

              {/* Pricing breakdown */}
              <div className="border-t border-gray-100 dark:border-zinc-800/80 pt-6 mt-6 space-y-3">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-bold">
                  <span>Donation Contribution</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-bold">
                  <span>Platform Fee</span>
                  <span className="text-[#52c47c]">Free</span>
                </div>
                <div className="flex justify-between text-base font-black text-gray-900 dark:text-white pt-3 border-t border-dashed border-gray-100 dark:border-zinc-800">
                  <span>Total Amount</span>
                  <span className="text-[#F3A61E]">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Secures & Badges card */}
            <div className="bg-[#103E1C]/5 border border-[#103E1C]/25 dark:border-emerald-950 p-6 rounded-[2rem] space-y-4">
              <div className="flex gap-3">
                <svg className="h-5 w-5 text-[#103E1C] dark:text-[#52c47c] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div className="text-left">
                  <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Tax Benefit Available</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">Donations are 50% tax exempt under Section 80G of the Income Tax Act.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <svg className="h-5 w-5 text-[#103E1C] dark:text-[#52c47c] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="text-left">
                  <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Secure Payment Gateway</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">Your connection is encrypted using standard 256-bit SSL protocols.</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
