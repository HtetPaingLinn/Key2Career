"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { NavbarLogo, NavbarButton } from "@/components/ui/resizable-navbar";
import { useRouter } from "next/navigation";

export default function JobTrackerPage() {
  const router = useRouter();
  // Navbar state (align with Job Portal)
  const [dropdown, setDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileKey, setProfileKey] = useState(0);
  const dropdownRef = useRef(null);

  function parseJwt(token) {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdown(false);
      }
    }
    if (dropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdown]);

  let jwt = null; let user = null;
  if (typeof window !== 'undefined') {
    jwt = localStorage.getItem('jwt');
    if (jwt) user = parseJwt(jwt);
  }
  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setDropdown(false);
    setProfileKey((k) => k + 1);
    router.replace('/login?redirect=/job-portal/job-tracker');
  };

  // Sample job data with different stages
  const [jobs, setJobs] = useState({
    submitted: [
      { id: 1, company: "TechCorp", position: "Frontend Developer", appliedDate: "2024-01-15", priority: "high" },
      { id: 2, company: "StartupXYZ", position: "Full Stack Engineer", appliedDate: "2024-01-12", priority: "medium" },
      { id: 3, company: "BigTech Inc", position: "React Developer", appliedDate: "2024-01-10", priority: "low" }
    ],
    interview: [
      { id: 4, company: "InnovateLab", position: "Senior Developer", appliedDate: "2024-01-08", priority: "high" },
      { id: 5, company: "DevStudio", position: "UI/UX Developer", appliedDate: "2024-01-05", priority: "medium" }
    ],
    offer: [
      { id: 6, company: "DreamJob Co", position: "Lead Developer", appliedDate: "2024-01-03", priority: "high" }
    ],
    accepted: [
      { id: 7, company: "PerfectFit Ltd", position: "Senior Frontend", appliedDate: "2023-12-28", priority: "high" }
    ],
    rejected: [
      { id: 8, company: "NotRight Inc", position: "Junior Developer", appliedDate: "2023-12-20", priority: "low" }
    ]
  });

  // Modal state for quick add
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ company: "", position: "", priority: "medium", stage: "submitted" });
  const nextIdRef = useRef(1000);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("job-tracker-state");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setJobs(parsed);
          const all = Object.values(parsed).flat();
          const maxId = all.reduce((m, j) => Math.max(m, j.id || 0), 0);
          nextIdRef.current = Math.max(nextIdRef.current, maxId + 1);
        }
      }
    } catch {}
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("job-tracker-state", JSON.stringify(jobs));
    } catch {}
  }, [jobs]);

  const stages = [
    { 
      key: 'submitted', 
      title: 'Form Submitted/Pending', 
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      key: 'interview', 
      title: 'Call for Interview/Screening', 
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    { 
      key: 'offer', 
      title: 'Offer Stage', 
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    { 
      key: 'accepted', 
      title: 'Accept Offer', 
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    { 
      key: 'rejected', 
      title: 'Reject()', 
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ];

  // Drag-and-drop removed per request.

  const handleDelete = (stageKey, jobId) => {
    setJobs(prev => ({
      ...prev,
      [stageKey]: prev[stageKey].filter(j => j.id !== jobId)
    }));
  };

  const openAddModal = () => setShowAdd(true);
  const closeAddModal = () => setShowAdd(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleAdd = (e) => {
    e?.preventDefault?.();
    if (!form.company.trim() || !form.position.trim()) return;
    const newJob = {
      id: nextIdRef.current++,
      company: form.company.trim(),
      position: form.position.trim(),
      appliedDate: new Date().toISOString().slice(0,10),
      priority: form.priority
    };
    setJobs(prev => ({
      ...prev,
      [form.stage]: [...prev[form.stage], newJob]
    }));
    setForm({ company: "", position: "", priority: "medium", stage: "submitted" });
    setShowAdd(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const badgeForPriority = (p) => (
    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${
      p === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
      p === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
      'bg-emerald-50 text-emerald-700 border-emerald-200'
    }`}>
      {p}
    </span>
  );

  const initials = (name = "") => name.split(/\s+/).map(w=>w[0]).filter(Boolean).slice(0,2).join('').toUpperCase();

  const JobCard = ({ job, stage }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -2 }}
      className={`group relative p-3 bg-white rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200/60 transition-all duration-200 ${getPriorityColor(job.priority)}`}
    >
      <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-indigo-500 via-sky-400 to-cyan-400"/>
      <div className="flex items-start gap-3">
        <div className="grid place-items-center shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-sky-500 text-white text-[10px] font-semibold shadow-sm">
          {initials(job.company)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-[13px] text-slate-900 truncate">{job.company}</h4>
            {badgeForPriority(job.priority)}
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5 truncate">{job.position}</p>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
            <span>Applied: {formatDate(job.appliedDate)}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="px-1.5 py-1 rounded-md hover:bg-slate-100" title="Edit">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              </button>
              <button className="px-1.5 py-1 rounded-md hover:bg-red-50 text-red-600" onClick={() => handleDelete(stage, job.id)} title="Delete">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const StageColumn = ({ stage, stageJobs }) => (
    <div 
      className={`flex-1 min-w-[240px] ${stage.bgColor} rounded-2xl p-3 border ${stage.key === 'interview' ? 'border-black' : `${stage.borderColor}/60`} transition-all duration-200`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`}></div>
          <h3 className="font-semibold text-slate-800 text-[15px] md:text-base">{stage.title}</h3>
        </div>
        <span className="bg-white px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-600 border border-slate-200/80 shadow-sm">
          {stageJobs.length}
        </span>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent mb-2.5" />
      
      <div className="space-y-2 min-h-[200px]">
        <AnimatePresence initial={false}>
          {stageJobs.map(job => (
            <JobCard key={job.id} job={job} stage={stage.key} />
          ))}
        </AnimatePresence>
        {stageJobs.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <svg className="w-7 h-7 mx-auto mb-2 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-sm">No applications</p>
          </div>
        )}
      </div>
    </div>
  );

  const totalApplications = Object.values(jobs).flat().length;
  const activeApplications = jobs.submitted.length + jobs.interview.length + jobs.offer.length;

  return (
    <>
      {/* Fixed navbar (consistent with Job Portal, without center search) */}
      <nav className="fixed top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm flex items-center justify-between px-4 md:px-8 py-4">
        <div className="ml-4 md:ml-12">
          <NavbarLogo />
        </div>
        <div className="flex items-center gap-4 mr-4 md:mr-12">
          {mounted && jwt && user ? (
            <div className="relative order-first" ref={dropdownRef} key={profileKey}>
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-200 text-purple-800 font-bold text-lg focus:outline-none"
                onClick={() => setDropdown((d) => !d)}
                aria-label="User menu"
              >
                {user.name ? user.name[0].toUpperCase() : (
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </button>
              {dropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-semibold text-gray-900">{user.name || user.username || user.email}</div>
                  </div>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setDropdown(false); router.push('/settings'); }}>Account Settings</button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <NavbarButton variant="secondary" href="/login">Login</NavbarButton>
              <NavbarButton variant="primary" href="/signup">Sign up for free</NavbarButton>
            </>
          )}
          {/* Job Portal button with animated gradient border (to go back) */}
          <div className="hidden md:block rainbow-wrap">
            <Link
              href="/job-portal"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-zinc-700 text-sm font-medium hover:bg-slate-50 active:bg-slate-100 transition relative z-[1]"
            >
              <span>Job Portal</span>
            </Link>
          </div>
        </div>
      </nav>
      <style jsx global>{`
        .rainbow-wrap {
          position: relative;
          border-radius: 9999px;
          padding: 2px;
          isolation: isolate;
        }
        .rainbow-wrap::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: conic-gradient(from var(--angle),
            #4f46e5, #6366f1, #3b82f6, #22d3ee, #4f46e5
          );
          animation: spin-conic 4s linear infinite;
          z-index: 0;
        }
        .rainbow-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: conic-gradient(from var(--angle),
            #4f46e5cc, #6366f1cc, #3b82f6cc, #22d3eecc, #4f46e5cc
          );
          animation: spin-conic 4s linear infinite;
          filter: blur(8px);
          opacity: .65;
          z-index: -1;
        }
        @keyframes spin-conic {
          from { --angle: 0deg; }
          to { --angle: 360deg; }
        }
      `}</style>

      <main className="bg-white text-black min-h-screen pt-28">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-12">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Application Tracker</h1>
                <p className="text-gray-600">Track your job applications through each stage of the process</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-2xl border border-black/[0.06]">
                <div className="text-2xl font-bold">{totalApplications}</div>
                <div className="text-indigo-100">Total Applications</div>
              </div>
              <div className="bg-gradient-to-r from-indigo-400 to-indigo-500 text-white p-4 rounded-2xl border border-black/[0.06]">
                <div className="text-2xl font-bold">{activeApplications}</div>
                <div className="text-indigo-100">Active Applications</div>
              </div>
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 rounded-2xl border border-black/[0.06]">
                <div className="text-2xl font-bold">{jobs.accepted.length}</div>
                <div className="text-indigo-100">Offers Accepted</div>
              </div>
              <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white p-4 rounded-2xl border border-black/[0.06]">
                <div className="text-2xl font-bold">{jobs.rejected.length}</div>
                <div className="text-indigo-100">Applications Rejected</div>
              </div>
            </div>

          </div>

          {/* Kanban Board */}
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-6">
            {stages.map(stage => (
              <StageColumn 
                key={stage.key} 
                stage={stage} 
                stageJobs={jobs[stage.key]} 
              />
            ))}
          </div>

          {/* Instructions removed as requested */}

          {/* Add Application Modal */}
          {showAdd && (
            <div className="fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/40" onClick={closeAddModal} />
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl border border-black/[0.06] shadow-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Add Application</h3>
                    <button onClick={closeAddModal} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleAdd} className="grid gap-3">
                    <label className="grid gap-1">
                      <span className="text-sm font-medium text-gray-700">Company</span>
                      <input name="company" value={form.company} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900" placeholder="Acme Inc" required />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-sm font-medium text-gray-700">Position</span>
                      <input name="position" value={form.position} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900" placeholder="Frontend Engineer" required />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="grid gap-1">
                        <span className="text-sm font-medium text-gray-700">Priority</span>
                        <select name="priority" value={form.priority} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-900">
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </label>
                      <label className="grid gap-1">
                        <span className="text-sm font-medium text-gray-700">Stage</span>
                        <select name="stage" value={form.stage} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-900">
                          {stages.map(s => (
                            <option key={s.key} value={s.key}>{s.title}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <button type="button" onClick={closeAddModal} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                      <button type="submit" className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-indigo-700 text-white text-sm font-medium shadow-sm hover:bg-indigo-800 active:bg-indigo-900 transition-colors">Add</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}