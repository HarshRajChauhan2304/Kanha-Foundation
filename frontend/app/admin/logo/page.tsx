"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogoPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // Verify admin session on mount
  useEffect(() => {
    const adminAuth = localStorage.getItem("admin_auth");
    if (adminAuth === "true") {
      setIsAdmin(true);
    } else {
      router.push("/admin"); // redirect if not admin
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("logo", selectedFile);
    const res = await fetch("/api/admin/logo", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      // Reload to reflect new logo across the site
      window.location.reload();
    } else {
      alert(data.message || "Upload failed");
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#07100b] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#101412] p-8 rounded-2xl shadow-lg border border-gray-150 dark:border-zinc-800">
        <h2 className="text-2xl font-bold text-center mb-6 text-[#1E4D2B] dark:text-[#52c47c]">
          Admin Logo Upload
        </h2>
        <div className="flex flex-col items-center space-y-4">
          <img
            src={previewUrl || "/logo.png"}
            alt="Current Logo"
            className="h-28 w-auto object-contain border border-gray-200 dark:border-zinc-700 p-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1E4D2B] file:text-white hover:file:bg-[#15381E]"
          />
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            className="w-full py-2 bg-[#1E4D2B] hover:bg-[#15381E] text-white font-bold rounded-full transition-colors disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Logo"}
          </button>
        </div>
      </div>
    </div>
  );
}
