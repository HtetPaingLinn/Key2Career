"use client";

import { useState, useRef } from "react";

function FormClient() {
  const [cvFile, setCvFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const onFileSelect = (file) => {
    if (!file) return;
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

  return (
    <>
      <form action="#" method="post" className="grid gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="grid gap-2">
            <span className="font-semibold text-gray-900">Full Name</span>
            <input name="fullName" type="text" placeholder="Jane Doe" required className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900" />
          </label>

          <label className="grid gap-2">
            <span className="font-semibold text-gray-900">Email</span>
            <input name="email" type="email" placeholder="jane@example.com" required className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900" />
          </label>

          <label className="grid gap-2">
            <span className="font-semibold text-gray-900">Position</span>
            <input name="position" type="text" placeholder="Role you're applying for" className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900" />
          </label>

          <label className="grid gap-2">
            <span className="font-semibold text-gray-900">Phone</span>
            <input name="phone" type="tel" placeholder="(+1) 555-123-4567" className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900" />
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="font-semibold text-gray-900">Cover Letter</span>
            <textarea name="coverLetter" rows={6} placeholder="Tell us about yourself" className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 min-h-[140px] resize-y" />
          </label>

          <div className="grid gap-2 md:col-span-2">
            <span className="font-semibold text-gray-900">CV / Resume</span>
            <div
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition bg-slate-50 text-slate-900 ${dragActive ? "border-gray-900 bg-indigo-50" : "border-slate-300"}`}
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

        <div className="mt-2">
          <button type="submit" className="px-4 py-3 border border-gray-900 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black">Submit Application</button>
        </div>
      </form>
    </>
  );
}

export default function ApplicationFormPage() {
  return (
    <main className="bg-white text-black min-h-screen p-8 flex justify-center">
      <div className="w-full max-w-[960px]">
        <h1 className="mb-2 text-2xl font-semibold">Application Form</h1>
        <p className="mb-5 text-gray-600">Please fill out the form below.</p>
        {/* Client-side interactive form with two-column layout and drag & drop CV */}
        <FormClient />
      </div>
    </main>
  );
}
