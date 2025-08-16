"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Lightweight JWT parser to prefill fields
function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function FormClient() {
  const router = useRouter();
  const params = useSearchParams();
  const jobId = params.get("jobId") || "";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [address, setAddress] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  // Debug URLs after upload
  const [debugCvUrl, setDebugCvUrl] = useState(null);
  const [debugCvUrlInline, setDebugCvUrlInline] = useState(null);
  const [debugSignedUrl, setDebugSignedUrl] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }
  const coverLetterCount = useMemo(() => {
    const t = (coverLetter || '').trim();
    if (!t) return 0;
    return t.split(/\s+/).length;
  }, [coverLetter]);

  // Prefill from JWT if available
  useEffect(() => {
    try {
      const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
      if (jwt) {
        const payload = parseJwt(jwt);
        // Auto-fill email from JWT `sub`
        if (payload?.sub) setEmail((prev) => prev || payload.sub);
        // Disallow admin/org roles
        const roles = [];
        if (typeof payload?.role === 'string') roles.push(payload.role);
        if (Array.isArray(payload?.roles)) roles.push(...payload.roles);
        if (typeof payload?.user?.role === 'string') roles.push(payload.user.role);
        const flat = roles.map(r => String(r).toLowerCase());
        const disallowed = flat.some(r => r.includes('admin') || r.includes('org'));
        if (disallowed) {
          const dest = `/job-portal/job-application-form?jobId=${encodeURIComponent(jobId || "")}`;
          router.replace(`/login?redirect=${encodeURIComponent(dest)}`);
          return;
        }
      }
    } catch {}
  }, [router, jobId]);

  const onFileSelect = (file) => {
    if (!file) return;
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const extOk = /\.(pdf|doc|docx)$/i.test(file.name || '');
    const typeOk = allowedMimes.includes(file.type);
    if (!(extOk || typeOk)) {
      setToast({ type: 'error', message: 'Only .pdf, .doc, .docx files are allowed.' });
      setTimeout(() => setToast(null), 4000);
      return;
    }
    setCvFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    onFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Trigger native HTML5 validation for required fields
    if (!e.currentTarget.reportValidity()) {
      return;
    }
    // Ensure a CV has been selected (works for click-upload and drag-drop)
    if (!cvFile) {
      setToast({ type: 'error', message: 'Please attach your CV / Resume before submitting.' });
      setTimeout(() => setToast(null), 4000);
      return;
    }
    if (submitting) return;
    try {
      const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
      const dest = `/job-portal/job-application-form?jobId=${encodeURIComponent(jobId || "")}`;
      if (!jwt) {
        router.replace(`/login?redirect=${encodeURIComponent(dest)}`);
        return;
      }
      // Disallow admin/org roles prior to POST
      try {
        const payload = parseJwt(jwt);
        const roles = [];
        if (typeof payload?.role === 'string') roles.push(payload.role);
        if (Array.isArray(payload?.roles)) roles.push(...payload.roles);
        if (typeof payload?.user?.role === 'string') roles.push(payload.user.role);
        const flat = roles.map(r => String(r).toLowerCase());
        const disallowed = flat.some(r => r.includes('admin') || r.includes('org'));
        if (disallowed) {
          router.replace(`/login?redirect=${encodeURIComponent(dest)}`);
          return;
        }
      } catch {}

      // If a CV is selected, upload it to Cloudinary first (unsigned upload)
      let cvUrl = null;
      let cvUrlInline = null;
      if (cvFile) {
        setSubmitting(true);
        try {
          const urls = await uploadCvToCloudinary(cvFile);
          cvUrl = urls.downloadUrl || urls.secure || null; // prefer download link
          cvUrlInline = urls.inlineUrl || null;
          // Save for debug/testing UI
          setDebugCvUrl(cvUrl || null);
          setDebugCvUrlInline(cvUrlInline || null);
          // Also request a signed download URL via API for maximum compatibility
          if (urls.publicId) {
            try {
              const api = `/api/cv-download?public_id=${encodeURIComponent(urls.publicId)}&resource_type=${encodeURIComponent(urls.resourceType || 'raw')}&type=${encodeURIComponent(urls.type || 'upload')}&filename=${encodeURIComponent(cvFile.name)}&attachment=true`;
              const r = await fetch(api);
              const j = await r.json();
              if (r.ok && j?.url) setDebugSignedUrl(j.url);
            } catch {}
          }
        } catch (uploadErr) {
          console.error("CV upload failed:", uploadErr);
          alert(uploadErr?.message || "CV upload failed");
          return;
        }
      }

      // Log a plain object snapshot of the application data
      const applicationData = {
        fullName,
        email,
        experienceYears,
        coverLetter,
        portfolioLink,
        address,
        jobId: jobId || "",
        status: "applied",
        cvFileName: cvFile?.name || null,
        cvUrl: cvUrl, // download link
        cvUrlInline: cvUrlInline, // optional inline preview
      };
      console.log("Application Data:", applicationData);
      // Send to backend API to persist in MongoDB
      setSubmitting(true);
      const res = await fetch('/api/job-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to save application');
      }
      // Reset form minimal (keep email)
      setFullName("");
      setCoverLetter("");
      setPortfolioLink("");
      setAddress("");
      setExperienceYears("");
      setCvFile(null);
      setToast({ type: 'success', message: 'Application submitted successfully' });
      setTimeout(() => {
        setToast(null);
        try {
          router.push('/job-portal');
        } catch {}
      }, 1000);
    } catch (err) {
      alert(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper: Upload CV to Cloudinary using unsigned upload preset
  async function uploadCvToCloudinary(file) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.");
    }

    // For PDFs and docs, force resource_type 'raw' to ensure correct delivery URL
    const isDoc =
      /pdf|msword|officedocument/i.test(file.type || "") || /\.(pdf|doc|docx)$/i.test(file.name || "");
    const resourceType = isDoc ? "raw" : "auto";
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", uploadPreset); // unsigned preset
    form.append("folder", "job-portal/cv");

    const res = await fetch(endpoint, { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) {
      const msg = data?.error?.message || JSON.stringify(data) || "Cloudinary upload failed";
      throw new Error(msg);
    }
    // Safest: use Cloudinary's own URL and inject transformation segment
    const secure = data.secure_url || data.url;
    if (!secure) {
      throw new Error("Cloudinary response missing URL");
    }
    const publicId = data.public_id || null;
    const deliveryType = data.type || 'upload';
    // Insert transformation after '/upload/'
    const uploadMarker = '/upload/';
    const i = secure.indexOf(uploadMarker);
    if (i === -1) return { inlineUrl: secure, downloadUrl: secure, secure };
    const head = secure.slice(0, i + uploadMarker.length);
    const tail = secure.slice(i + uploadMarker.length);
    const inlineUrl = head + (resourceType === 'raw' ? 'fl_inline/' : '') + tail;
    const downloadUrl = head + 'fl_attachment/' + tail;
    return { inlineUrl, downloadUrl, secure, publicId, resourceType, type: deliveryType };
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="grid gap-2">
            <span className="font-semibold text-gray-900">Full Name</span>
            <input
              name="fullName"
              type="text"
              placeholder="Jane Doe"
              required
              maxLength={30}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-semibold text-gray-900">Email</span>
            <input
              name="email"
              type="email"
              placeholder="jane@example.com"
              value={email}
              disabled
              className="px-3 py-2 border border-gray-200 bg-gray-100 text-gray-700 rounded-lg outline-none hover:cursor-not-allowed disabled:cursor-not-allowed"
            />
          </label>

          

          <label className="grid gap-2">
            <span className="font-semibold text-gray-900">Years of Experience</span>
            <input
              name="experienceYears"
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              step="1"
              placeholder="e.g., 3"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-semibold text-gray-900">Portfolio Link</span>
            <input
              name="portfolioLink"
              type="url"
              placeholder="https://yourportfolio.com"
              value={portfolioLink}
              onChange={(e) => setPortfolioLink(e.target.value)}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="font-semibold text-gray-900">Address</span>
            <input
              name="address"
              type="text"
              placeholder="Street, City, State/Region, Country"
              maxLength={90}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="font-semibold text-gray-900">Cover Letter</span>
            <textarea
              name="coverLetter"
              rows={6}
              placeholder="Tell us about yourself"
              value={coverLetter}
              onChange={(e) => {
                const v = e.target.value;
                const words = v.trim().length ? v.trim().split(/\s+/) : [];
                if (words.length > 250) {
                  const truncated = words.slice(0, 250).join(' ');
                  setCoverLetter(truncated);
                } else {
                  setCoverLetter(v);
                }
              }}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 min-h-[140px] resize-y"
            />
            <div className="text-sm text-gray-500 text-right">{coverLetterCount} / 250 words</div>
          </label>

          <div className="grid gap-2 md:col-span-2">
            <span className="font-semibold text-gray-900">CV / Resume</span>
            <div
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition bg-slate-50 text-slate-900 ${dragActive ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => onFileSelect(e.target.files?.[0])}
              />
              <div className="grid place-items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" x2="12" y1="3" y2="15"/>
                </svg>
                <div className="font-semibold">Drag & drop your CV here</div>
                <div className="text-sm text-slate-600">or click to browse (PDF, DOC, DOCX)</div>
                {cvFile && <div className="text-sm text-emerald-700 mt-1">Selected: {cvFile.name}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Debug download button removed */}

        <div className="mt-2">
          <button
            disabled={submitting}
            type="submit"
            className="px-6 py-3 bg-indigo-700 !text-white rounded-lg font-semibold hover:bg-indigo-800 hover:!text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:!text-white"
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg border text-center ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <div className="font-semibold">{toast.type === 'success' ? 'Success' : 'Notice'}</div>
          <div className="text-sm">{toast.message}</div>
        </div>
      )}
    </>
  );
}

export default function ApplicationFormPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectBack = useMemo(() => {
    const jobId = params.get("jobId");
    const base = "/job-portal/job-application-form";
    return jobId ? `${base}?jobId=${encodeURIComponent(jobId)}` : base;
  }, [params]);

  useEffect(() => {
    try {
      const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
      if (!jwt) {
        router.replace(`/login?redirect=${encodeURIComponent(redirectBack)}`);
      }
    } catch {}
  }, [router, redirectBack]);

  return (
    <main className="bg-gray-50 text-gray-900 min-h-screen py-8 px-4 flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-black px-3 py-2 -ml-2 rounded-lg hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="font-medium">Back</span>
          </button>
        </div>

        <h1 className="mb-2 text-3xl md:text-4xl font-semibold">Application Form</h1>
        <p className="mb-5 text-gray-600 text-base md:text-lg">Please fill out the form below.</p>
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Client-side interactive form with two-column layout and drag & drop CV */}
          <FormClient />
        </div>
      </div>
    </main>
  );
}
