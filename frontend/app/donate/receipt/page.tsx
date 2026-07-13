"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';

function ReceiptPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams ? searchParams.get('order_id') : null;
  const { clearCart } = useCart();

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [donation, setDonation] = useState<any>(null);

  useEffect(() => {
    if (!orderId) {
      setErrorMsg("Order ID is missing in query parameters. If you just placed a donation, please check your email/SMS confirmation.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    fetch(`/api/payment/verify-order?order_id=${orderId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.donation) {
          setDonation(data.donation);
          clearCart(); // clear global cart items on success
        } else {
          setErrorMsg(data.error || "Payment verification failed. Please check your bank statement or contact support.");
        }
      })
      .catch(err => {
        console.error("Error verifying payment receipt:", err);
        setErrorMsg("Failed to reach payment validation servers. Please check your connection and retry.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-550/5 dark:bg-[#07100b] flex flex-col items-center justify-center font-sans py-12 px-4">
        <div className="relative flex flex-col items-center p-8 bg-white dark:bg-[#101412] border border-gray-150 dark:border-zinc-800 rounded-[2rem] shadow-xl max-w-sm w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4" />
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">Verifying Transaction</h2>
          <p className="mt-2 text-xs text-zinc-400">Consulting payment gateways and securing your 80G tax document. Do not reload.</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !donation) {
    return (
      <div className="min-h-screen bg-zinc-550/5 dark:bg-[#07100b] flex flex-col items-center justify-center font-sans py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white dark:bg-[#101412] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-red-500/10 dark:border-red-950/20 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 shadow-inner mb-6">
            <svg className="h-8 w-8 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="text-2xl font-black text-rose-600 dark:text-rose-500 tracking-tight">
            Payment Verification Failed
          </h1>
          
          <p className="mt-4 text-xs text-gray-550 dark:text-gray-400 leading-relaxed text-left bg-gray-50 dark:bg-zinc-950/40 p-4 rounded-xl border border-gray-100 dark:border-zinc-900">
            <span className="block font-black text-gray-800 dark:text-gray-200 mb-1">Details:</span>
            {errorMsg}
          </p>

          <p className="mt-4 text-[10px] text-gray-450 leading-relaxed">
            If money was deducted from your account, please wait. Banks sometimes delay settlement confirmations. We will process your tax receipt immediately upon receiving settlement details.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/donate')}
              className="flex-1 py-3 bg-[#1E4D2B] hover:bg-[#15381E] text-white font-extrabold text-xs rounded-full transition-colors cursor-pointer"
            >
              Back to Checkout
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-extrabold text-xs rounded-full border border-gray-200 dark:border-zinc-800 cursor-pointer"
            >
              Retry Check
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Parse total amount
  const cleanAmt = donation.amount ? donation.amount.replace(/[^\d.]/g, '') : '0';
  const numericAmt = parseFloat(cleanAmt) || 0;

  // Split donation_for causes
  const causes = donation.donation_for ? donation.donation_for.split(',').map((c: string) => c.trim()) : ['General Support'];

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
        {/* Success Tick */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 shadow-inner mb-6">
          <svg className="h-10 w-10 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-black text-[#1E4D2B] dark:text-[#52c47c] tracking-tight">
          Thank you, {donation.name}!
        </h1>
        <p className="mt-2 text-sm text-[#F3A61E] font-black uppercase tracking-wider">
          Donation Successful
        </p>

        <p className="mt-4 text-xs text-gray-550 dark:text-gray-450 leading-relaxed max-w-md mx-auto">
          Your generous contribution has been securely processed. A tax donation receipt (80G) and a WhatsApp proof of execution will be sent shortly.
        </p>

        {/* Print Area */}
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
                  <p className="text-[9px] text-gray-500 font-mono mt-1.5">{donation.receipt_id}</p>
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
              <p className="font-bold text-gray-800 dark:text-zinc-200 mt-0.5">{donation.name}</p>
              <p className="text-[9px] text-gray-500">{donation.email}</p>
              <p className="text-[9px] text-gray-500">{donation.phone}</p>
            </div>
            <div className="text-right">
              <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wider">Transaction Details</span>
              <p className="font-semibold text-gray-850 dark:text-zinc-250 mt-0.5">Date: {donation.transaction_date}</p>
              <p className="text-[9px] text-gray-500">Mode: {donation.payment_method || 'Online'}</p>
              <p className="text-[9px] text-emerald-500 font-black">Status: SUCCESS ✅</p>
            </div>
          </div>

          {/* Honoree / Dedication */}
          {donation.is_dedicated && donation.dedicated_to && (
            <div className="mt-4 text-[9px] text-gray-800 dark:text-gray-200 border-b pb-3.5 mb-4 space-y-0.5">
              <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wider">Honoree / Dedication</span>
              <p className="font-bold text-gray-800 dark:text-zinc-200 mt-0.5">{donation.dedicated_to}</p>
              {donation.dedication_msg && <p className="italic text-gray-500">“{donation.dedication_msg}”</p>}
            </div>
          )}

          {/* Customisation Block */}
          {!donation.is_anonymous && (donation.printed_name || donation.delivery_date || donation.photo_url || donation.video_wish || donation.instagram_id || donation.is_gift || donation.is_other_request) && (
            <div className="mb-4 pb-3.5 border-b border-gray-200 dark:border-zinc-800/80 text-[9px] text-gray-855 dark:text-gray-200 space-y-1.5">
              <p className="font-black uppercase text-[8px] tracking-wider text-gray-400">Acknowledgement & Customisation</p>
              {donation.printed_name && <p>Name to be printed: <span className="font-bold text-gray-850 dark:text-zinc-150">{donation.printed_name}</span></p>}
              {donation.delivery_date && <p>Preferred date: <span className="font-bold text-gray-855 dark:text-zinc-150">{donation.delivery_date}</span></p>}
              {donation.photo_url && (
                <div className="flex items-center gap-2 mt-1">
                  <span>Uploaded Photo:</span>
                  <img src={donation.photo_url} alt="Receipt Preview" className="h-10 w-10 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800" />
                </div>
              )}
              {donation.video_wish && <p>Video wish line: <span className="italic font-medium text-gray-700 dark:text-gray-300">“{donation.video_wish}”</span></p>}
              {donation.instagram_id && <p>Beneficiary Instagram: <span className="font-bold text-gray-800 dark:text-gray-200">{donation.instagram_id}</span></p>}
              {donation.is_gift && donation.gift_message && <p>Gift Details: <span className="font-bold text-gray-850 dark:text-zinc-150">{donation.gift_message}</span></p>}
              {donation.is_other_request && donation.other_request_text && <p>Special Request: <span className="font-bold text-gray-850 dark:text-zinc-150">{donation.other_request_text}</span></p>}
            </div>
          )}

          {donation.is_anonymous && (
            <div className="mb-4 pb-3.5 border-b border-gray-200 dark:border-zinc-800/80 text-[9px] text-gray-550 dark:text-zinc-555">
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
              {causes.map((item: string, idx: number) => (
                <tr key={idx}>
                  <td className="py-2 font-bold text-gray-800 dark:text-zinc-300">{item}</td>
                  <td className="py-2 text-right font-black text-gray-900 dark:text-white">
                    {idx === 0 ? donation.amount : ""}
                  </td>
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
              <p className="text-sm font-black text-[#F3A61E]">{donation.amount}</p>
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
              onClick={() => router.push('/')}
              className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-extrabold text-xs rounded-full border border-gray-200 dark:border-zinc-800 cursor-pointer"
            >
              Back to Home
            </button>
            <button
              onClick={() => router.push('/causes')}
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

export default function ReceiptPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-[#07100b] flex items-center justify-center font-sans">
        <p className="text-emerald-500 font-bold uppercase tracking-wider text-xs">Loading receipt...</p>
      </div>
    }>
      <ReceiptPageContent />
    </Suspense>
  );
}
