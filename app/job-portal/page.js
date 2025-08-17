"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavbarLogo, NavbarButton } from "@/components/ui/resizable-navbar";
import { useRouter } from "next/navigation";
 
// Navigation items copied from resume-builder navbar
const navItems = [
  // { name: "Home", link: "/" },
  // { name: "Job Tracker", link: "/job-portal/job-tracker" }, // moved to right side of navbar
  // { name: "Resume Builder", link: "/resume-builder" },
  // { name: "CV Verification", link: "#" },
  // { name: "Interview Q&A", link: "/interview-prep" },
  // { name: "Career Roadmap", link: "#" },
];

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
export default function JobBoard() {
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Navbar state (copied/adapted from resume-builder)
  const [dropdown, setDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileKey, setProfileKey] = useState(0);
  const dropdownRef = useRef(null);
  // Saved dropdown state
  const [savedOpen, setSavedOpen] = useState(false);
  const savedDropdownRef = useRef(null);
  // Server-backed saved jobs
  const [savedJobs, setSavedJobs] = useState([]);
  const [savedJobsLoading, setSavedJobsLoading] = useState(false);
  // Unique saved job IDs (dedup by id) - independent of `jobs` to avoid order/init issues
  const uniqueSavedJobIds = useMemo(() => {
    const seen = new Set();
    const ids = [];
    for (const sj of savedJobs || []) {
      const savedIdRaw = sj?.id ?? sj?.jobPost_obj_id ?? sj?._id;
      if (!savedIdRaw) continue;
      const savedId = String(savedIdRaw);
      if (seen.has(savedId)) continue;
      seen.add(savedId);
      ids.push(savedId);
    }
    return ids;
  }, [savedJobs]);
  // Capsule row drag scroll state
  const capsulesRef = useRef(null);
  const [isCapsDragging, setIsCapsDragging] = useState(false);
  const capsDrag = useRef({ startX: 0, scrollLeft: 0 });
  // Track logo load failures to show placeholder icon
  const [badLogoIds, setBadLogoIds] = useState(new Set());
  const ORG_PLACEHOLDER_SVG = "data:image/svg+xml;utf8,\
<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'>\
  <rect fill='%23111827' rx='16' width='80' height='80'/>\
  <g fill='%23ffffff'>\
    <rect x='24' y='26' width='32' height='28' rx='2'/>\
    <rect x='30' y='32' width='6' height='16' rx='1'/>\
    <rect x='44' y='32' width='6' height='16' rx='1'/>\
    <rect x='26' y='56' width='28' height='4' rx='2'/>\
  </g>\
</svg>";
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdown]);
  // Close saved dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (savedDropdownRef.current && !savedDropdownRef.current.contains(event.target)) {
        setSavedOpen(false);
      }
    }
    if (savedOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [savedOpen]);
  // Search and saved jobs state
  const [searchQuery, setSearchQuery] = useState(""); // debounced/effective query
  const [searchQueryInput, setSearchQueryInput] = useState(""); // raw input
  // Use server, not localStorage, for saved jobs

  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Helper to fetch saved jobs from API
  const fetchSavedJobs = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
      if (!token) return;
      const payload = parseJwt(token);
      const email = payload?.sub;
      if (!email) return;
      setSavedJobsLoading(true);
      const url = `http://localhost:8080/api/user/savedJobs?email=${encodeURIComponent(email)}`;
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch saved jobs');
      const data = await res.json();
      // Expecting an array of saved job posts; normalize minimal fields
      const arr = Array.isArray(data) ? data : (Array.isArray(data?.jobs) ? data.jobs : []);
      setSavedJobs(arr);
    } catch (e) {
      console.warn('savedJobs fetch error:', e);
    } finally {
      setSavedJobsLoading(false);
    }
  };

  // Fetch saved jobs on mount (if logged in)
  useEffect(() => { fetchSavedJobs(); }, []);
  // Refresh when opening dropdown
  useEffect(() => { if (savedOpen) fetchSavedJobs(); }, [savedOpen]);

  // Capsule handlers
  const handleCapsMouseDown = (e) => {
    const el = capsulesRef.current;
    if (!el) return;
    setIsCapsDragging(true);
    capsDrag.current.startX = e.pageX - el.offsetLeft;
    capsDrag.current.scrollLeft = el.scrollLeft;
  };
  const handleCapsMouseMove = (e) => {
    const el = capsulesRef.current;
    if (!el || !isCapsDragging) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - capsDrag.current.startX;
    el.scrollLeft = capsDrag.current.scrollLeft - walk;
  };
  const handleCapsMouseUp = () => setIsCapsDragging(false);
  const handleCapsMouseLeave = () => setIsCapsDragging(false);
  const handleCapsWheel = (e) => {
    const el = capsulesRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  };
  // Debounce search input -> effective query
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchQueryInput), 250);
    return () => clearTimeout(t);
  }, [searchQueryInput]);
  // Always get JWT and user info on every render (same approach as resume-builder)
  let jwt = null;
  let user = null;
  if (typeof window !== 'undefined') {
    jwt = localStorage.getItem('jwt');
    if (jwt) user = parseJwt(jwt);
  }
  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setDropdown(false);
    setProfileKey((k) => k + 1);
    router.replace('/login?redirect=/job-portal');
  };

  const openJobModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeJobModal = () => {
    setIsModalOpen(false);
    // Delay clearing selectedJob until after animation (200ms)
    setTimeout(() => setSelectedJob(null), 220);
  };
  
  // Jobs from API and facets
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Job categories mapped to API endpoints
  const JOB_CATEGORIES = [
    { key: 'BackendDev', label: 'Backend Developer', path: 'http://localhost:8080/api/jobs/BackendDev' },
    { key: 'SE', label: 'Software Engineer', path: 'http://localhost:8080/api/jobs/SE' },
    { key: 'AiMlDs', label: 'AI/ML/Data Science', path: 'http://localhost:8080/api/jobs/AiMlDs' },
    { key: 'WebDev', label: 'Web Developer', path: 'http://localhost:8080/api/jobs/WebDev' },
    { key: 'MobiDev', label: 'Mobile Developer', path: 'http://localhost:8080/api/jobs/MobiDev' },
    { key: 'DevOpsCloud', label: 'DevOps & Cloud', path: 'http://localhost:8080/api/jobs/DevOpsCloud' },
    { key: 'Cybersecurity', label: 'Cybersecurity', path: 'http://localhost:8080/api/jobs/Cybersecurity' },
    { key: 'GameDev', label: 'Game Developer', path: 'http://localhost:8080/api/jobs/GameDev' },
    { key: 'UiUx', label: 'UI/UX', path: 'http://localhost:8080/api/jobs/UiUx' },
    { key: 'EmbeddedIO', label: 'Embedded/IoT', path: 'http://localhost:8080/api/jobs/EmbeddedIO' },
    { key: 'ItSupport', label: 'IT Support', path: 'http://localhost:8080/api/jobs/ItSupport' },
    { key: 'QATesting', label: 'QA & Testing', path: 'http://localhost:8080/api/jobs/QATesting' },
    { key: 'CSTeacher', label: 'CS Teacher', path: 'http://localhost:8080/api/jobs/CSTeacher' },
    { key: 'DBWarehouse', label: 'DB/Warehouse', path: 'http://localhost:8080/api/jobs/DBWarehouse' },
    { key: 'FrontendDev', label: 'Frontend Developer', path: 'http://localhost:8080/api/jobs/FrontendDev' },
    { key: 'Networking', label: 'Networking', path: 'http://localhost:8080/api/jobs/Networking' },
    { key: 'SystemEng', label: 'System Engineer', path: 'http://localhost:8080/api/jobs/SystemEng' },
    { key: 'Data.Analytics', label: 'Data Analytics', path: 'http://localhost:8080/api/jobs/Data.Analytics' },
    { key: 'Blockchain', label: 'Blockchain', path: 'http://localhost:8080/api/jobs/Blockchain' },
    { key: 'TechnicalWriter', label: 'Technical Writer', path: 'http://localhost:8080/api/jobs/TechnicalWriter' },
    { key: 'FullStackDev', label: 'Full Stack Developer', path: 'http://localhost:8080/api/jobs/FullStackDev' },
    { key: 'ERP', label: 'ERP', path: 'http://localhost:8080/api/jobs/ERP' },
    { key: 'ITPjManager', label: 'IT Project Manager', path: 'http://localhost:8080/api/jobs/ITPjManager' },
    { key: 'OtherSpecialized', label: 'Other Specialized', path: 'http://localhost:8080/api/jobs/OtherSpecialized' },
    // Newly added special categories
    { key: 'WorkFromHome', label: 'Work From Home', path: 'http://localhost:8080/api/jobs/WorkFromHome' },
    { key: 'Intern', label: 'Intern', path: 'http://localhost:8080/api/jobs/Intern' },
    { key: 'Freelance', label: 'Freelance', path: 'http://localhost:8080/api/jobs/Freelance' },
  ];
  const [selectedCategories, setSelectedCategories] = useState(() => JOB_CATEGORIES.map(c => c.key));

  useEffect(() => {
    let cancelled = false;
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        // fetch all categories in parallel (counts need full dataset)
        const responses = await Promise.all(JOB_CATEGORIES.map(async (c) => {
          const r = await fetch(c.path);
          if (!r.ok) throw new Error(`Failed to fetch ${c.key} (${r.status})`);
          const json = await r.json();
          const arr = Array.isArray(json) ? json : [];
          // Attach source category for later counts and filtering UI
          return arr.map(item => ({ ...item, __cat: c.key }));
        }));
        const merged = ([]).concat(...responses);
        const normalized = merged.map((d, idx) => {
          const parseSalary = (v) => {
            if (v == null) return 0;
            if (typeof v === 'number') return v;
            const n = parseInt(String(v).replace(/[^0-9]/g, ''), 10);
            return isNaN(n) ? 0 : n;
          };
          const safeArray = (v) => Array.isArray(v) ? v : (v ? [v] : []);
          const company = d.org_name || d.orgEmail || "";
          const rawSalaryStr = typeof d.salary_mmk === 'string' ? d.salary_mmk : '';
          const isNegotiable = (typeof d.salary_mmk === 'string' && /nego/i.test(d.salary_mmk)) || (rawSalaryStr.trim().length > 0 && !/\d/.test(rawSalaryStr));
          // Normalize working type from multiple possible source keys or tags
          const tagsArr = safeArray(d.tag);
          const jobFieldArr = safeArray(d.job_field);
          const guessFromTags = () => {
            const blob = [
              ...tagsArr,
              ...jobFieldArr,
              typeof d.work_time === 'string' ? d.work_time : '',
              typeof d.address === 'string' ? d.address : ''
            ].join(' ').toLowerCase();
            if (/remote/.test(blob) || /wfh/.test(blob)) return 'Remote';
            if (/hybrid/.test(blob)) return 'Hybrid';
            if (/on[- ]?site/.test(blob) || /onsite/.test(blob)) return 'Onsite';
            return '';
          };
          const wt = (typeof d.workingType === 'string' && d.workingType.trim().length > 0)
            ? d.workingType.trim()
            : (typeof d.working_type === 'string' && d.working_type.trim().length > 0)
              ? d.working_type.trim()
              : guessFromTags();
          return {
            // Preserve old fields for UI while also keeping original API fields
            // company,
            // title: d.job_title || "",
            // logoUrl: d.logoUrl || "https://via.placeholder.com/48?text=JB",
            // salary_raw: d.salary_mmk,
            // location: d.address || "",
            // applicants: d.applicants ?? 0,
            // required_skills: safeArray(d.tech_skill),
            // Qualifications: d.qualification ? [{ education: safeArray(d.qualification) }] : [],
            // created_at: d.posted_date || new Date().toISOString(),
            // Original API fields (pass-through)
            id: d.id ?? `${company}-${d.job_title || 'job'}-${idx}`,
            orgEmail: (typeof d.orgEmail === 'string' && d.orgEmail.trim().length > 0) ? d.orgEmail.trim() : "[OrgEmail]",
            org_name: (typeof d.org_name === 'string' && d.org_name.trim().length > 0) ? d.org_name.trim() : "[OrgName]",
            org_img: (typeof d.org_img === 'string' && d.org_img.trim().length > 0) ? d.org_img.trim() : "https://via.placeholder.com/48?text=JB",
            job_title: (typeof d.job_title === 'string' && d.job_title.trim().length > 0) ? d.job_title.trim() : "[JobTitle]",
            job_field: safeArray(d.job_field),
            jobLevel: (typeof d.jobLevel === 'string' && d.jobLevel.trim().length > 0) ? d.jobLevel.trim() : "[JobLevel]",
            workingType: wt,
            tags: safeArray(d.tag).length ? safeArray(d.tag) : safeArray(d.job_field),
            work_time: d.work_time,
            address: (typeof d.address === 'string' && d.address.trim().length > 0) ? d.address.trim() : "[Address]",
            cv_email: (typeof d.cv_email === 'string' && d.cv_email.trim().length > 0) ? d.cv_email.trim() : "[CVEmail]",
            contact_ph_number: (typeof d.contact_ph_number === 'string' && d.contact_ph_number.trim().length > 0) ? d.contact_ph_number.trim() : "[ContactPhNumber]",
            responsibilities: safeArray(d.responsibility),
            qualification: safeArray(d.qualification),
            // Keep numeric salary for filtering; preserve raw and negotiable flag for display/filtering
            salary_mmk: parseSalary(d.salary_mmk),
            salary_raw: d.salary_mmk,
            negotiable: isNegotiable,
            // Required positions: ensure numeric (support alternative API keys and string forms like "3 positions")
            // required_number: (() => {
            //   const altKeys = [
            //     'required_number', 'required', 'requiredCount', 'requiredPersons',
            //     'required_persons', 'required_people', 'required_number_of_positions',
            //     'no_of_positions', 'positions_required'
            //   ];
            //   let raw;
            //   for (const k of altKeys) {
            //     if (Object.prototype.hasOwnProperty.call(d, k) && d[k] != null && d[k] !== '') { raw = d[k]; break; }
            //   }
            //   if (raw == null) return 0;
            //   const n = typeof raw === 'number' ? raw : parseInt(String(raw).replace(/[^0-9]/g, ''), 10);
            //   return Number.isFinite(n) ? n : 0;
            // })(),
            required_number: d.required_number,
            tech_skill: safeArray(d.tech_skill),
            due_date: (typeof d.due_date === 'string' && d.due_date.trim().length > 0) ? d.due_date.trim() : "[DueDate]",
            posted_date: (typeof d.posted_date === 'string' && d.posted_date.trim().length > 0) ? d.posted_date.trim() : "[PostedDate]",
            // track source category for counts
            categoryKey: d.__cat,
          };
        });

  // de-duplicate by id to avoid duplicates across categories
  const seen = new Set();
  const dedup = [];
  for (const j of normalized) {
    if (seen.has(j.id)) continue;
          seen.add(j.id);
          dedup.push(j);
        }
        if (!cancelled) setJobs(dedup);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load jobs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchJobs();
    return () => { cancelled = true; };
  }, []);

  // Derived facets from jobs
  const allCompanies = Array.from(new Set(jobs.map(j => j.org_name).filter(Boolean)));

  // Helpers for search and save (must be before preSalaryFilteredJobs)
  const normalizeText = (s) => (s || "").toString().toLowerCase();
  const tokenize = (q) => normalizeText(q).split(/[^a-z0-9+#.]+/i).filter(Boolean);
  // Highlighting helpers (use across card and modal)
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const queryTokens = useMemo(() => tokenize(searchQuery), [searchQuery]);
  const highlightText = (text, tokens) => {
    if (!text || !tokens || tokens.length === 0) return text;
    const uniq = Array.from(new Set(tokens.filter(Boolean)));
    if (uniq.length === 0) return text;
    const pattern = new RegExp('(' + uniq.map(escapeRegExp).join('|') + ')', 'gi');
    const parts = String(text).split(pattern);
    return parts.map((part, idx) => (
      pattern.test(part)
        ? <span key={idx} className="bg-yellow-200 rounded-sm px-0.5">{part}</span>
        : <span key={idx}>{part}</span>
    ));
  };
  const jobSearchBlob = (job) => {
    // Combine key searchable fields into one normalized blob
    const parts = [
      job.job_title,
      job.org_name,
      ...(job.tags || []),
      ...(job.tech_skill || []),
      ...(job.responsibilities || []),
      job.job_level,
      (job.workingType || job.working_type),
      job.address,
    ];
    return normalizeText(parts.filter(Boolean).join(" \n "));
  };
  const titleTokens = (title) => normalizeText(title).split(/[^a-z0-9+#.]+/i).filter(Boolean);
  const orderedProximityBoost = (title, tokens) => {
    // Boost when tokens appear in order and close in the title
    const tt = titleTokens(title);
    if (!tt.length || tokens.length < 2) return 0;
    // map token -> all positions in title
    const pos = tokens.map(tk => tt.map((w,i)=> w.includes(tk) ? i : -1).filter(i=>i>=0));
    if (pos.some(arr => arr.length === 0)) return 0;
    // greedy small-window heuristic
    let bestSpan = Infinity;
    for (const i0 of pos[0]) {
      let prev = i0; let ok = true;
      for (let k=1;k<pos.length;k++) {
        const nextPos = pos[k].find(i => i >= prev); // maintain order
        if (nextPos == null) { ok = false; break; }
        prev = nextPos;
      }
      if (ok) bestSpan = Math.min(bestSpan, prev - i0);
    }
    if (!isFinite(bestSpan)) return 0;
    // smaller span -> larger boost (cap at 80)
    return Math.max(0, 80 - bestSpan * 10);
  };
  const daysSince = (iso) => {
    try {
      const d = new Date(iso);
      return Math.max(0, (Date.now() - d.getTime()) / (1000*60*60*24));
    } catch {
      return 9999;
    }
  };
  const scoreJob = (job, q) => {
    const s = (q || "").trim();
    if (!s) return 0;
    const phrase = normalizeText(s);
    const tokens = tokenize(s);
    if (!tokens.length) return 0;
    // Field weights
    const title = normalizeText(job.job_title);
    const company = normalizeText(job.org_name);
    const tags = (job.tags || []).map(normalizeText);
    const skills = (job.tech_skill || []).map(normalizeText);
    const resp = (job.responsibilities || []).map(normalizeText);
    const level = normalizeText(job.job_level);
    const work = normalizeText(job.workingType || job.working_type);
    const address = normalizeText(job.address);

    let score = 0;
    // Phrase match boosts
    if (title.includes(phrase)) score += 50;
    if (company.includes(phrase)) score += 25;
    if (tags.some(t=>t.includes(phrase))) score += 20;
    if (skills.some(t=>t.includes(phrase))) score += 18;
    if (resp.some(t=>t.includes(phrase))) score += 10;

    // All-token presence quick boosts
    const blob = jobSearchBlob(job);
    const allInTitle = tokens.every(tk => title.includes(tk));
    const allInBlob = tokens.every(tk => blob.includes(tk));
    if (allInTitle) score += 60; else if (allInBlob) score += 20;

    // Ordered proximity in title
    score += orderedProximityBoost(job.job_title || "", tokens);

    // Token matches
    const countMatches = (hay, w) => {
      for (const tk of tokens) {
        if (!tk) continue;
        if (hay.includes(tk)) score += w;
        // prefix boost
        else if (hay.startsWith(tk)) score += Math.floor(w/2);
      }
    };
    tokens.forEach(tk => {
      if (title.startsWith(tk)) score += 12;
      if (company.startsWith(tk)) score += 8;
    });
    countMatches(title, 10);
    countMatches(company, 6);
    tags.forEach(t => countMatches(t, 5));
    skills.forEach(t => countMatches(t, 5));
    resp.forEach(t => countMatches(t, 2));
    countMatches(level, 3);
    countMatches(work, 3);
    countMatches(address, 2);

    // Recency boost (max ~30)
    const days = daysSince(job.posted_date);
    score += Math.max(0, 30 - Math.min(60, days));

    // Saved jobs slight boost
    if (isSaved(job.id)) score += 10;

    return score;
  };
  const isSaved = (id) => uniqueSavedJobIds.some((key) => String(key) === String(id));
  const toggleSave = async (id) => {
    const dest = '/job-portal';
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent(dest)}`);
      return;
    }
    const payload = parseJwt(token);
    const roles = [];
    if (typeof payload?.role === 'string') roles.push(payload.role);
    if (Array.isArray(payload?.roles)) roles.push(...payload.roles);
    if (typeof payload?.user?.role === 'string') roles.push(payload.user.role);
    const hasUser = roles.map(r => String(r).toLowerCase()).some(r => r.includes('user'));
    if (!hasUser) {
      router.replace(`/login?redirect=${encodeURIComponent(dest)}`);
      return;
    }
    const email = payload?.sub;
    if (!email) {
      router.replace(`/login?redirect=${encodeURIComponent(dest)}`);
      return;
    }
    try {
      if (isSaved(id)) {
        // UNSAVE via DELETE
        const res = await fetch('http://localhost:8080/api/user/unsaveJob', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ email, jobPost_obj_id: id }),
        });
        if (!res.ok) throw new Error('Failed to unsave job');
        // Optimistically remove from savedJobs
        setSavedJobs(prev => prev.filter((sj) => {
          const savedId = sj?.id ?? sj?.jobPost_obj_id ?? sj?._id;
          return savedId !== id;
        }));
      } else {
        // SAVE via POST
        const res = await fetch('http://localhost:8080/api/user/saveJob', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ email, jobPost_obj_id: id }),
        });
        if (!res.ok) throw new Error('Failed to save job');
        // Optimistically add to savedJobs if not already there
        if (!isSaved(id)) {
          const job = (typeof jobs !== 'undefined' && Array.isArray(jobs)) ? jobs.find(j => String(j.id) === String(id)) : null;
          if (job) setSavedJobs(prev => [job, ...prev]);
          else fetchSavedJobs();
        }
      }
    } catch (e) {
      console.error('saveJob error:', e);
      alert(e.message || 'Save/Unsave failed');
    }
  };
  const matchesQuery = (job, q) => {
    const s = (q || "").trim();
    if (!s) return true;
    const tokens = tokenize(s);
    if (!tokens.length) return true;
    // Require ALL tokens to appear somewhere across searchable fields
    const blob = jobSearchBlob(job);
    return tokens.every(tk => blob.includes(tk));
  };

  // Filter states used to compute pre-salary set
  const [filterLevels, setFilterLevels] = useState([]); // values from allLevels
  const [filterCompanies, setFilterCompanies] = useState([]); // values from allCompanies
  const [remoteOnly, setRemoteOnly] = useState(false); // true -> tag must include "Remote Ops"
  const [includeNegotiable, setIncludeNegotiable] = useState(true);
  const [filterWorkingTypes, setFilterWorkingTypes] = useState([]); // values from allWorkingTypes

  // For the Seniority facet: compute available levels from jobs ignoring the current level filter
  const preLevelFacetJobs = useMemo(() => {
    return jobs.filter(j => {
      // category selection: if not all selected, restrict by selectedCategories
      if (selectedCategories.length && selectedCategories.length !== JOB_CATEGORIES.length) {
        if (!selectedCategories.includes(j.categoryKey)) return false;
      }
      // remote
      if (remoteOnly && !(/remote/i.test((j.working_type || j.workingType || "")))) return false;
      // NOTE: do NOT filter by filterLevels here, so options don't disappear when checked
      // companies
      if (filterCompanies.length > 0 && !filterCompanies.includes(j.org_name)) return false;
      // saved only
      if (showSavedOnly && !isSaved(j.id)) return false;
      // keyword match
      if (!matchesQuery(j, searchQuery)) return false;
      return true;
    });
  }, [jobs, selectedCategories, remoteOnly, filterCompanies, showSavedOnly, searchQuery]);

  // For the Working Type facet: compute options ignoring the current working type filter
  const preWorkingFacetJobs = useMemo(() => {
    return jobs.filter(j => {
      // category selection
      if (selectedCategories.length && selectedCategories.length !== JOB_CATEGORIES.length) {
        if (!selectedCategories.includes(j.categoryKey)) return false;
      }
      // remote filter still applies
      if (remoteOnly && !(/remote/i.test((j.working_type || j.workingType || "")))) return false;
      // DO NOT filter by working type here; we want options to remain visible
      // levels still apply
      if (filterLevels.length > 0 && !filterLevels.includes(j.jobLevel || "")) return false;
      // companies
      if (filterCompanies.length > 0 && !filterCompanies.includes(j.org_name)) return false;
      // saved only
      if (showSavedOnly && !isSaved(j.id)) return false;
      // keyword match
      if (!matchesQuery(j, searchQuery)) return false;
      return true;
    });
  }, [jobs, selectedCategories, remoteOnly, filterLevels, filterCompanies, showSavedOnly, searchQuery]);

  // Compute the set of jobs shown BEFORE applying salary filter
  const preSalaryFilteredJobs = jobs.filter(j => {
    // category selection: if not all selected, restrict by selectedCategories
    if (selectedCategories.length && selectedCategories.length !== JOB_CATEGORIES.length) {
      if (!selectedCategories.includes(j.categoryKey)) return false;
    }
    // remote
    if (remoteOnly && !(/remote/i.test((j.working_type || j.workingType || "")))) return false;
    // levels (use normalized jobLevel)
    if (filterLevels.length > 0 && !filterLevels.includes(j.jobLevel || "")) return false;
    // working type (use normalized workingType)
    if (filterWorkingTypes.length > 0 && !filterWorkingTypes.includes(j.workingType || "")) return false;
    // companies
    if (filterCompanies.length > 0 && !filterCompanies.includes(j.org_name)) return false;
    // saved only
    if (showSavedOnly && !isSaved(j.id)) return false;
    // keyword match
    if (!matchesQuery(j, searchQuery)) return false;
    return true;
  });

  // For category capsules: compute counts while IGNORING the current category selection
  // so that other categories remain clickable and show their true counts under other filters
  const preCategoryFacetJobs = useMemo(() => {
    return jobs.filter(j => {
      // DO NOT filter by selectedCategories here
      // remote
      if (remoteOnly && !(/remote/i.test((j.working_type || j.workingType || "")))) return false;
      // levels
      if (filterLevels.length > 0 && !filterLevels.includes(j.jobLevel || "")) return false;
      // working type
      if (filterWorkingTypes.length > 0 && !filterWorkingTypes.includes(j.workingType || "")) return false;
      // companies
      if (filterCompanies.length > 0 && !filterCompanies.includes(j.org_name)) return false;
      // saved only
      if (showSavedOnly && !isSaved(j.id)) return false;
      // keyword match
      if (!matchesQuery(j, searchQuery)) return false;
      return true;
    });
  }, [jobs, remoteOnly, filterLevels, filterWorkingTypes, filterCompanies, showSavedOnly, searchQuery]);

  const categoryCounts = useMemo(() => {
    const init = Object.fromEntries(JOB_CATEGORIES.map(c => [c.key, 0]));
    for (const j of preCategoryFacetJobs) {
      if (j.categoryKey && Object.prototype.hasOwnProperty.call(init, j.categoryKey)) {
        init[j.categoryKey] += 1;
      }
    }
    return init;
  }, [preCategoryFacetJobs]);
  // Seniority facet based on jobs ignoring the level filter (keeps options visible for multi-select)
  const allLevels = useMemo(
    () => Array.from(new Set(preLevelFacetJobs.map(j => j.jobLevel).filter(Boolean))),
    [preLevelFacetJobs]
  );
  // Working type facet based on jobs ignoring the working type filter
  const allWorkingTypes = useMemo(
    () => Array.from(new Set(preWorkingFacetJobs.map(j => j.workingType).filter(Boolean))),
    [preWorkingFacetJobs]
  );

  // Category helpers for capsules
  const allCategoryKeys = useMemo(() => JOB_CATEGORIES.map(c => c.key), []);
  const allSelected = selectedCategories.length === allCategoryKeys.length;

  // Slider bounds based on shown jobs (excluding salary filter)
  const salaryPool = preSalaryFilteredJobs
    .filter(j => !j.negotiable && (j.salary_mmk || 0) > 0)
    .map(j => j.salary_mmk || 0);
  const minSalary = salaryPool.length ? Math.min(...salaryPool) : 0;
  const maxSalary = salaryPool.length ? Math.max(...salaryPool) : 0;

  // Salary range state depends on computed bounds
  const [salaryRange, setSalaryRange] = useState([minSalary, maxSalary]);
  const [userAdjustedSalary, setUserAdjustedSalary] = useState(false);

  // Sync slider to new bounds unless user has adjusted it; otherwise clamp within bounds
  useEffect(() => {
    if (!userAdjustedSalary) {
      setSalaryRange([minSalary, maxSalary]);
      return;
    }
    setSalaryRange(([lo, hi]) => {
      const clampedLo = Math.max(minSalary, Math.min(lo, maxSalary));
      const clampedHi = Math.max(minSalary, Math.min(hi, maxSalary));
      return clampedLo <= clampedHi ? [clampedLo, clampedHi] : [minSalary, maxSalary];
    });
  }, [minSalary, maxSalary, userAdjustedSalary]);

  const toggleInArray = (arr, value, setter) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const clampSalary = (minV, maxV) => {
    const lo = Math.max(minSalary, Math.min(minV, maxV));
    const hi = Math.min(maxSalary, Math.max(minV, maxV));
    return [lo, hi];
  };

  const handleMinSalaryChange = (v) => {
    const val = Number(v);
    setUserAdjustedSalary(true);
    setSalaryRange(([_, hi]) => clampSalary(val, hi));
  };
  const handleMaxSalaryChange = (v) => {
    const val = Number(v);
    setUserAdjustedSalary(true);
    setSalaryRange(([lo, _]) => clampSalary(lo, val));
  };

  // Collapsible filter sections state
  const [openFilters, setOpenFilters] = useState({
    salary: true,
    category: false,
    level: false,
    work: false,
    companies: false,
  });
  const toggleFilterOpen = (key) => {
    setOpenFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setFilterLevels([]);
    setFilterCompanies([]);
    setRemoteOnly(false);
    setIncludeNegotiable(true);
    setSalaryRange([minSalary, maxSalary]);
    setUserAdjustedSalary(false);
  };
  // Helpers for search and save (moved above)

  let filteredJobs = jobs.filter(j => {
    // category selection: if not all selected, restrict by selectedCategories
    if (selectedCategories.length && selectedCategories.length !== JOB_CATEGORIES.length) {
      if (!selectedCategories.includes(j.categoryKey)) return false;
    }
    // salary: negotiable passes when included; otherwise enforce numeric range
    if (!(includeNegotiable && j.negotiable)) {
      if ((j.salary_mmk || 0) < salaryRange[0] || (j.salary_mmk || 0) > salaryRange[1]) return false;
    }
    // remote
    if (remoteOnly && !(/remote/i.test((j.working_type || j.workingType || "")))) return false;
    // levels
    if (filterLevels.length > 0 && !filterLevels.includes(j.jobLevel || "")) return false;
    // working type
    if (filterWorkingTypes.length > 0 && !filterWorkingTypes.includes(j.workingType || "")) return false;
    // companies
    if (filterCompanies.length > 0 && !filterCompanies.includes(j.org_name)) return false;
    // saved only toggle
    if (showSavedOnly && !isSaved(j.id)) return false;
    // keyword match
    if (!matchesQuery(j, searchQuery)) return false;
    return true;
  });

  // Rank results for best relevance
  if ((searchQuery || "").trim()) {
    filteredJobs = filteredJobs
      .map(j => ({ j, s: scoreJob(j, searchQuery) }))
      .sort((a,b) => b.s - a.s)
      .map(x => x.j);
  } else {
    // default sort by recency desc if available
    filteredJobs = filteredJobs.sort((a,b) => new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime());
  }

  // Cyclic background colors for job cards
  const cardBgColors = ['#FFE1CB', '#D5F6ED', '#E2DBF9', '#E0F3FF', '#FBE2F3', '#ECEFF5'];

  // Utility: format ISO date string into a friendly short date
  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "";
    }
  };

  // Utility: format a number like 3500000 to 3,500,000 and append MMK.
  const formatMMKNumber = (value) => {
    if (value == null) return '0MMK';
    const num = typeof value === 'number' ? value : parseInt(String(value).replace(/[^0-9]/g, ''), 10);
    if (isNaN(num)) return typeof value === 'string' ? value : '0MMK';
    const withCommas = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${withCommas}MMK`;
  };

  // Component to render individual job card using the new design
  const JobCard = ({ job, bgColor, onDetails }) => {
    console.log('JobCard job:', job);
    return (
    <div className="flex-[1_1_320px] min-w-[280px] bg-white rounded-[26px] border-[3px] border-gray-200 p-1.5 flex flex-col">
      {/* Map-like region wrapper */}
      <div className="rounded-[20px] p-4" style={{ backgroundColor: bgColor }}>
        {/* Header with date and bookmark */}
        <div className="flex justify-between items-center mb-4">
          <div className="bg-white rounded-full px-3 py-1">
            <span className="text-gray-800 text-sm font-medium">{formatDate(job.posted_date)}</span>
          </div>
          <button
            type="button"
            onClick={() => toggleSave(job.id)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer"
            aria-label={isSaved(job.id) ? 'Unsave job' : 'Save job'}
            title={isSaved(job.id) ? 'Unsave job' : 'Save job'}
          >
            {isSaved(job.id) ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-black">
                <path d="M5 3h14a2 2 0 0 1 2 2v16l-9-6-9 6V5a2 2 0 0 1 2-2z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>

        {/* Company name */}
        <div className="text-gray-900 text-sm font-semibold mb-2">{highlightText(job.org_name, queryTokens)}</div>

        {/* Job title and logo row */}
        <div className="flex items-center justify-between mb-6">
          {/* Job title - 75% width */}
          <div className="flex-1 pr-4" style={{flexBasis: '80%'}}>
            <h3
              className="text-gray-900 text-2xl font-semibold leading-tight break-words"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {highlightText(job.job_title, queryTokens)}
            </h3>
          </div>
          
          {/* Company logo - 25% width */}
          <div className="flex-shrink-0 flex justify-end" style={{flexBasis: '25%'}}>
            <div className="w-12 h-12 rounded-lg overflow-hidden">
              <img
                src={(job.org_img && !badLogoIds.has(job.id)) ? job.org_img : ORG_PLACEHOLDER_SVG}
                alt={job.org_name || 'Organization'}
                className="w-full h-full object-cover"
                onError={() => setBadLogoIds(prev => {
                  const next = new Set(prev);
                  next.add(job.id);
                  return next;
                })}
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-1 min-h-[106px] content-end">
          {(job.tags || []).map((tag, index) => (
            <span key={index} className="text-gray-800 px-3 py-1 border-1 border-gray-500 rounded-full text-sm">
              {highlightText(tag, queryTokens)}
            </span>
          ))}
        </div>
      </div>

      {/* Footer with salary and location */}
      <div className="mt-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-900 text-md font-semibold">
              {(() => {
                const raw = job.salary_raw ?? job.salary_mmk;
                if (typeof raw === 'string') {
                  const digits = raw.replace(/[^0-9]/g, '');
                  return digits.length ? formatMMKNumber(parseInt(digits, 10)) : raw;
                }
                if (typeof raw === 'number') return formatMMKNumber(raw);
                return formatMMKNumber(job.salary_mmk || 0);
              })()}
            </div>
            <div className="text-gray-400 text-sm">{highlightText(job.address, queryTokens)}</div>
          </div>
          <button onClick={() => onDetails?.(job)} className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 cursor-pointer transition-colors">
            Details
          </button>
        </div>
      </div>
    </div>
    );
  };

  // Modal Component - Apple-like UI with smooth transitions

  const JobDetailModal = ({ job, open, onClose }) => {
    useEffect(() => {
      const onKey = (e) => {
        if (e.key === "Escape") onClose?.();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);
    const [isFull, setIsFull] = useState(false);
    useEffect(() => {
      if (!open) setIsFull(false);
    }, [open]);
  
    if (!job) return null;
  
    // Show required positions instead of applicants
    const positionsText = `${Number.isFinite(Number(job.required_number)) ? Number(job.required_number) : 0} positions`;
  
    return (
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 pointer-events-auto">
            {/* Backdrop */}
            <motion.div
              onClick={onClose}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
            />
  
            {/* Modal Card - slide up */}
            <motion.div
              layout
              className={`absolute inset-0 flex ${isFull ? 'items-stretch justify-stretch p-0' : 'items-end justify-center px-4 sm:px-6 pt-12 sm:pt-16'}`}
              style={{ willChange: 'transform' }}
            >
              <motion.div
                layout
                key="job-modal"
                role="dialog"
                aria-modal="true"
                className={`bg-white border border-black/[0.06] shadow-2xl overflow-hidden flex flex-col min-h-0`}
                initial={{ y: "100%", opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  paddingLeft: isFull ? 32 : 0,
                  paddingRight: isFull ? 16 : 0,
                  borderTopLeftRadius: isFull ? 0 : 16,
                  borderTopRightRadius: isFull ? 0 : 16,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 240, damping: 28, mass: 0.9, layout: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] } }}
                style={{
                  willChange: "transform, opacity, width, height, border-radius",
                  width: isFull ? '100vw' : 'min(100%, 64rem)',
                  height: isFull ? '100vh' : 'calc(100vh - 6rem)'
                }}
              >
                {/* Header */}
                <motion.div className="p-6 sm:p-8" layout="position">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden">
                      <img
                        src={job.org_img || "https://via.placeholder.com/48?text=JB"}
                        alt={job.org_name || "Organization"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
                          {highlightText(job.org_name, queryTokens)}
                        </h2>
                        <span className="text-gray-300">•</span>
                        <p
                          className="text-gray-600 text-sm sm:text-base break-words"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {highlightText(job.job_title, queryTokens)}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                        <span>{highlightText(job.address, queryTokens)}</span>
                        <span>·</span>
                        <span>{new Date(job.posted_date).toLocaleDateString()}</span>
                        <span>·</span>
                        <span>{positionsText}</span>
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        onClick={() => setIsFull(f => !f)}
                        aria-label={isFull ? "Exit full screen" : "Full screen"}
                        title={isFull ? "Exit full screen" : "Full screen"}
                        className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                      >
                        {isFull ? (
                          // Compress icon
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600">
                            <path d="M9 3H5a2 2 0 0 0-2 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M15 21h4a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 9V5a2 2 0 0 0-2-2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 15v4a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          // Expand icon
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600">
                            <path d="M3 9V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 15v4a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M15 3h4a2 2 0 0 1 2 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 21H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={onClose}
                        aria-label="Close"
                        title="Close"
                        className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-gray-500"
                        >
                          <path d="M18 6L6 18" />
                          <path d="M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={() => {
                        try {
                          const jwt = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
                          const jid = job?._id || job?.id || job?.jobId || "";
                          const dest = `/job-portal/job-application-form?jobId=${encodeURIComponent(jid)}`;
                          if (!jwt) {
                            router.push(`/login?redirect=${encodeURIComponent(dest)}`);
                            return;
                          }
                          // Disallow admins/orgs from applying
                          try {
                            const base64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
                            const payload = JSON.parse(atob(base64));
                            const roles = [];
                            if (typeof payload?.role === 'string') roles.push(payload.role);
                            if (Array.isArray(payload?.roles)) roles.push(...payload.roles);
                            if (typeof payload?.user?.role === 'string') roles.push(payload.user.role);
                            const flat = roles.map(r => String(r).toLowerCase());
                            const disallowed = flat.some(r => r.includes('admin') || r.includes('org'));
                            if (disallowed) {
                              router.push(`/login?redirect=${encodeURIComponent(dest)}`);
                              return;
                            }
                          } catch {}
                          // Optional: a light client-side expiry check similar to parseJwt
                          router.push(dest);
                        } catch {
                          router.push('/login');
                        }
                      }}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-indigo-700 text-white text-sm font-medium shadow-sm hover:bg-indigo-800 active:bg-indigo-900 transition-colors"
                    >
                      Apply now
                    </button>
                    <button
                      onClick={() => toggleSave(job.id)}
                      aria-label={isSaved(job.id) ? 'Unsave job' : 'Save job'}
                      title={isSaved(job.id) ? 'Unsave job' : 'Save job'}
                      className="inline-flex items-center gap-2 justify-center px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-900 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      {isSaved(job.id) ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-gray-900">
                          <path d="M5 3h14a2 2 0 0 1 2 2v16l-9-6-9 6V5a2 2 0 0 1 2-2z" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-900">
                          <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      <span>{isSaved(job.id) ? 'Unsave' : 'Save'}</span>
                    </button>
                  </div>
                </motion.div>
  
                <div className="h-px w-full bg-gray-100" />
  
                {/* Body */}
                <motion.div
                  layout="position"
                  className="p-6 sm:p-8 flex-1 min-h-0 overflow-y-auto"
                  data-hide-scrollbar="true"
                  style={{ overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                <h3 className="text-2xl sm:text-[28px] font-semibold text-gray-900 mb-10">About the job</h3>
                  {/* Responsibilities */}
                  {job.responsibilities?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-gray-900 font-semibold mb-2">
                        Responsibilities
                      </h4>
                      <ul className="list-disc pl-6 space-y-1 text-gray-700">
                        {job.responsibilities.map((item, idx) => (
                          <li key={idx}>{highlightText(item, queryTokens)}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Working Type */}
                  {job?.workingType && job.workingType !== "[WorkingType]" && (
                    <div className="mb-6">
                      <h4 className="text-gray-900 font-semibold mb-2">Working type</h4>
                      <ul className="list-disc pl-6 space-y-1 text-gray-700">
                        <li>{highlightText(job.workingType, queryTokens)}</li>
                      </ul>
                    </div>
                  )}

                  {/* Job Level */}
                  {job?.jobLevel && job.jobLevel !== "[JobLevel]" && (
                    <div className="mb-6">
                      <h4 className="text-gray-900 font-semibold mb-2">Job level</h4>
                      <ul className="list-disc pl-6 space-y-1 text-gray-700">
                        <li>{highlightText(job.jobLevel, queryTokens)}</li>
                      </ul>
                    </div>
                  )}

                  {/* Work Time */}
                  {job?.work_time && (
                    <div className="mb-6">
                      <h4 className="text-gray-900 font-semibold mb-2">Working hours</h4>
                      <ul className="list-disc pl-6 space-y-1 text-gray-700">
                        <li>{highlightText(job.work_time, queryTokens)}</li>
                      </ul>
                    </div>
                  )}

                  {/* Salary */}
                  {(() => {
                    const negotiable = !!job?.negotiable;
                    const salaryText = negotiable
                      ? 'Negotiable'
                      : (typeof job?.salary_raw === 'string' && job.salary_raw.trim())
                        ? job.salary_raw
                        : (typeof job?.salary_mmk === 'number' && job.salary_mmk > 0)
                          ? formatMMKNumber(job.salary_mmk)
                          : '';
                    return salaryText ? (
                      <div className="mb-6">
                        <h4 className="text-gray-900 font-semibold mb-2">Salary</h4>
                        <ul className="list-disc pl-6 space-y-1 text-gray-700">
                          <li>{salaryText}</li>
                        </ul>
                      </div>
                    ) : null;
                  })()}
  
                  {/* Required Skills */}
                  {(job.tech_skill && job.tech_skill.length > 0) && (
                    <div className="mb-6">
                      <h4 className="text-gray-900 font-semibold mb-2">
                        Required skills
                      </h4>
                      <ul className="list-disc pl-6 space-y-1 text-gray-700">
                        {job.tech_skill.map((skill, idx) => (
                          <li key={idx}>{highlightText(skill, queryTokens)}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Qualifications */}
                  {(Array.isArray(job.qualification) && job.qualification.length > 0) && (
                    <div>
                      <h4 className="text-gray-900 font-semibold mb-2">
                        Qualifications
                      </h4>
                      {typeof job.qualification[0] === 'string' ? (
                        <ul className="list-disc pl-6 space-y-1 text-gray-700">
                          {job.qualification.map((item, idx) => (
                            <li key={idx}>{highlightText(item, queryTokens)}</li>
                          ))}
                        </ul>
                      ) : (
                        job.qualification.map((q, idx) => (
                          <div key={idx} className="mb-3">
                            {q.education && (
                              <>
                                <p className="text-gray-800 font-medium mb-1">Education</p>
                                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                                  {q.education.map((item, i) => (
                                    <li key={i}>{highlightText(item, queryTokens)}</li>
                                  ))}
                                </ul>
                              </>
                            )}
                            {q.experience && (
                              <>
                                <div className="text-gray-800 font-medium mt-2">
                                  Experience
                                </div>
                                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                                  {q.experience.map((e, i) => (
                                    <li key={i}>{highlightText(e, queryTokens)}</li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };
  

  return (
    <>
      {/* Fixed navbar copied from resume-builder */}
      <nav className="fixed top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm flex items-center justify-between px-4 md:px-8 py-4">
        <div className="ml-4 md:ml-12">
          <NavbarLogo />
        </div>
        {/* Center: search input (desktop) */}
        <div className="hidden md:flex flex-1 justify-center px-4">
          <div className="w-full max-w-xl relative">
            <input
              type="text"
              value={searchQueryInput}
              onChange={(e) => setSearchQueryInput(e.target.value)}
              placeholder="Search jobs by title, company, skill..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80 placeholder:text-slate-400"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {searchQueryInput && (
              <button
                type="button"
                onClick={() => setSearchQueryInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center"
                aria-label="Clear search"
                title="Clear search"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
        {/* Left nav items (kept minimal per current design) */}
        <div className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.link}
              className="text-base font-medium text-zinc-600 hover:text-zinc-800 px-3 py-2 rounded transition"
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-4 mr-4 md:mr-12">
          {/* Saved jobs dropdown trigger */}
          <div className="relative" ref={savedDropdownRef}>
            <button
              type="button"
              onClick={() => setSavedOpen((v) => !v)}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center border ${savedOpen ? 'bg-black text-white border-black' : 'bg-white text-black border-slate-300'} hover:shadow-sm`}
              aria-expanded={savedOpen}
              aria-label={savedOpen ? 'Close saved jobs' : 'Open saved jobs'}
              title={savedOpen ? 'Close saved jobs' : 'Open saved jobs'}
            >
              {savedOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M5 3h14a2 2 0 0 1 2 2v16l-9-6-9 6V5a2 2 0 0 1 2-2z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black">
                  <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {uniqueSavedJobIds.length > 0 && (
                <span className={`absolute -top-1 -right-1 text-[10px] leading-none px-1.5 py-0.5 rounded-full ${savedOpen ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  {uniqueSavedJobIds.length}
                </span>
              )}
            </button>

            {savedOpen && (
              <div className="absolute right-0 mt-3 w-[520px] max-w-[90vw] bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-[60]">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-slate-900 font-semibold">Saved jobs</div>
                  <button
                    className="text-xs font-medium text-indigo-700 hover:text-indigo-900"
                    onClick={() => { setShowSavedOnly(true); setSavedOpen(false); }}
                  >
                    View all
                  </button>
                </div>
                <div className="flex flex-col gap-3 max-h-80 overflow-y-auto" data-hide-scrollbar="true" style={{scrollbarWidth:'none', msOverflowStyle:'none'}}>
                  {savedJobsLoading ? (
                    <div className="text-sm text-slate-500 text-center py-6">Loading...</div>
                  ) : (() => {
                    // Build items from deduped ids to avoid duplicate keys and init order issues
                    const items = uniqueSavedJobIds.map((savedId) => {
                      const jobFromList = Array.isArray(jobs) ? jobs.find(j => String(j.id) === String(savedId)) : null;
                      const jobFromSaved = Array.isArray(savedJobs)
                        ? savedJobs.find(sj => String(sj?.id ?? sj?.jobPost_obj_id ?? sj?._id) === String(savedId))
                        : null;
                      const job = jobFromList || jobFromSaved || { id: savedId };
                      return { key: savedId, job };
                    });
                    return items.length === 0 ? (
                      <div className="text-sm text-slate-500 text-center py-6">No saved jobs</div>
                    ) : items.map(({ key, job }) => (
                      <div
                        key={key}
                        className="w-full border border-slate-200 rounded-xl p-3 cursor-pointer hover:bg-slate-50"
                        onClick={() => { openJobModal(job); setSavedOpen(false); }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { openJobModal(job); setSavedOpen(false); } }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img
                              src={(job.logoUrl && !badLogoIds.has(key)) ? job.logoUrl : ORG_PLACEHOLDER_SVG}
                              alt={job.org_name || '[Org]'}
                              className="w-7 h-7 rounded object-cover"
                              onError={() => setBadLogoIds(prev => { const next = new Set(prev); next.add(key); return next; })}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs text-slate-600 font-medium truncate">{job.org_name || '[Org]'}</div>
                            <div className="text-sm text-slate-900 font-semibold truncate">{job.job_title || '[Job Title]'}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                              onClick={(e)=>{ e.stopPropagation(); toggleSave(key); }}
                            >
                              Unsave
                            </button>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>
          {/* Job Tracker moved next to Saved button with animated gradient border */}
          <div className="hidden md:block rainbow-wrap">
            <Link
              href="/job-portal/job-tracker"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-zinc-700 text-sm font-medium hover:bg-slate-50 active:bg-slate-100 transition relative z-[1]"
            >
              <span>Job Tracker</span>
            </Link>
          </div>
          {mounted && jwt && user ? (
            <div className="relative mr-8 order-first" ref={dropdownRef} key={profileKey}>
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
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setDropdown(false); window.location.href='/settings'; }}>Account Settings</button>
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
        </div>
        {/* Mobile menu button (hamburger) */}
        <div className="md:hidden">
          {/* You can add a mobile menu here if needed */}
        </div>
      </nav>
      <style jsx global>{`
        .rainbow-wrap {
          position: relative;
          border-radius: 9999px; /* full */
          padding: 2px; /* border thickness */
          isolation: isolate; /* contain z-index */
        }
        .rainbow-wrap::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: conic-gradient(from var(--angle),
            #4f46e5, /* indigo-600 */
            #6366f1, /* indigo-500 */
            #3b82f6, /* blue-500 */
            #22d3ee, /* cyan-400 */
            #4f46e5  /* back to indigo */
          );
          animation: spin-conic 4s linear infinite;
          filter: none;
          z-index: 0;
        }
        /* soft glow */
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
          z-index: -1; /* keep glow behind */
        }
        @keyframes spin-conic {
          from { --angle: 0deg; }
          to { --angle: 360deg; }
        }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap" rel="stylesheet" />
      <div className="w-full h-screen bg-white overflow-hidden flex flex-col pt-16" style={{fontFamily: 'Inter, sans-serif', fontWeight: 400}}>

      {/* Header removed and replaced by the fixed navbar above */}

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 max-h-0 mr-8 mb-8 mt-12">
        {/* Sidebar */}
        <aside className="w-80 flex-shrink-0 mr-6">
          {/* Filters */}
          <div
            className="sticky top-24 bg-white/60 backdrop-blur-md rounded-r-2xl p-8 pl-10 border border-slate-200 shadow-md max-h-[calc(100vh-160px)]"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-800 text-lg font-semibold">Filters</span>
              <button onClick={clearAllFilters} className="text-sm text-indigo-700 hover:text-indigo-900 font-medium">Clear all</button>
            </div>

            {/* Scrollable Filters Body */}
            <div
              data-hide-scrollbar="true"
              style={{ overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', flex: '1 1 auto' }}
            >
            {/* Salary Range (Dropdown) */}
            <div className="pb-5 mb-5 border-b border-slate-200">
              <button
                type="button"
                onClick={() => toggleFilterOpen('salary')}
                className="w-full flex items-start justify-between text-slate-700"
                aria-expanded={openFilters.salary}
              >
                <div className="flex-1 text-left">
                  <div className="text-slate-700 text-base font-semibold">Salary range (MMK)</div>
                  <div className="text-xs text-slate-500 text-left">{formatMMKNumber(salaryRange[0])} - {formatMMKNumber(salaryRange[1])}</div>
                </div>
                <svg
                  className={`w-6 h-6 text-slate-500 transition-transform ${openFilters.salary ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                </svg>
              </button>
              <AnimatePresence initial={false}>
                {openFilters.salary && (
                  <motion.div
                    key="salary-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 px-1">
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={minSalary}
                          max={maxSalary}
                          value={salaryRange[0]}
                          onChange={(e) => handleMinSalaryChange(e.target.value)}
                          className="w-full accent-indigo-700"
                        />
                        <input
                          type="range"
                          min={minSalary}
                          max={maxSalary}
                          value={salaryRange[1]}
                          onChange={(e) => handleMaxSalaryChange(e.target.value)}
                          className="w-full accent-indigo-700"
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                        <span>{formatMMKNumber(salaryRange[0])}</span>
                        <span>{formatMMKNumber(salaryRange[1])}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-xs text-slate-600">
                          <div className="font-medium text-slate-700">Include negotiable salaries</div>
                          <div className="text-[11px]">When on, jobs marked as Negotiable are shown regardless of range.</div>
                        </div>
                        <label className="inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={includeNegotiable}
                            onChange={(e)=>setIncludeNegotiable(e.target.checked)}
                          />
                          <div className={"w-10 h-6 rounded-full relative transition-colors duration-200 ease-out " + (includeNegotiable ? "bg-indigo-600" : "bg-slate-300") }>
                            <div className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ease-out " + (includeNegotiable ? "translate-x-4" : "translate-x-0") } />
                          </div>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Job categories (legacy checkboxes) - hidden in favor of capsule bar */}
            {false && (
              <div className="pb-5 mb-5 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => toggleFilterOpen('category')}
                  className="w-full flex items-start justify-between text-slate-700 mb-1"
                  aria-expanded={openFilters.category}
                >
                  <div className="flex-1 text-left">
                    <div className="text-slate-700 text-base font-semibold">Job category</div>
                    <div className="text-xs text-slate-500 text-left">
                      {selectedCategories.length
                        ? `${selectedCategories.length} selected`
                        : 'None selected'}
                    </div>
                  </div>
                  <svg className={`w-6 h-6 text-slate-500 transition-transform ${openFilters.category ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
                </button>
                <AnimatePresence initial={false}>
                  {openFilters.category && (
                    <motion.div
                      key="category-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs text-slate-500">Select categories</span>
                          {selectedCategories.length === JOB_CATEGORIES.length ? (
                            <button
                              type="button"
                              className="text-xs text-indigo-700 hover:text-indigo-900 font-medium"
                              onClick={() => setSelectedCategories([])}
                            >
                              Uncheck all
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="text-xs text-indigo-700 hover:text-indigo-900 font-medium"
                              onClick={() => setSelectedCategories(JOB_CATEGORIES.map(c => c.key))}
                            >
                              Check all
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {JOB_CATEGORIES.map((c) => (
                            <label key={c.key} className="flex items-center gap-3 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                className="accent-indigo-700 rounded"
                                checked={selectedCategories.includes(c.key)}
                                onChange={() => toggleInArray(selectedCategories, c.key, setSelectedCategories)}
                              />
                              <span>{c.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Seniority Level (Dropdown) */}
            <div className="pb-5 mb-5 border-b border-slate-200">
              <button
                type="button"
                onClick={() => toggleFilterOpen('level')}
                className="w-full flex items-start justify-between text-slate-700 mb-1"
                aria-expanded={openFilters.level}
              >
                <div className="flex-1 text-left">
                  <div className="text-slate-700 text-base font-semibold">Seniority level</div>
                  <div className="text-xs text-slate-500 text-left">{filterLevels.length ? `${filterLevels.length} selected` : 'Any'}</div>
                </div>
                <svg className={`w-6 h-6 text-slate-500 transition-transform ${openFilters.level ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
              </button>
              <AnimatePresence initial={false}>
                {openFilters.level && (
                  <motion.div
                    key="level-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 mt-2">
                      {allLevels.map((l) => (
                        <label key={l} className="flex items-center gap-3 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            className="accent-indigo-700 rounded"
                            checked={filterLevels.includes(l)}
                            onChange={() => toggleInArray(filterLevels, l, setFilterLevels)}
                          />
                          <span>{l}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Work Setup (Dropdown) */}
            <div className="pb-5 mb-5 border-b border-slate-200">
              <button
                type="button"
                onClick={() => toggleFilterOpen('work')}
                className="w-full flex items-start justify-between text-slate-700 mb-1"
                aria-expanded={openFilters.work}
              >
                <div className="flex-1 text-left">
                  <div className="text-slate-700 text-base font-semibold">Work Type</div>
                  <div className="text-xs text-slate-500 text-left">{filterWorkingTypes.length ? `${filterWorkingTypes.length} selected` : 'Any'}</div>
                </div>
                <svg className={`w-6 h-6 text-slate-500 transition-transform ${openFilters.work ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
              </button>
              <AnimatePresence initial={false}>
                {openFilters.work && (
                  <motion.div
                    key="work-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 mt-2">
                      {allWorkingTypes.map((t) => (
                        <label key={t} className="flex items-center gap-3 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            className="accent-indigo-700 rounded"
                            checked={filterWorkingTypes.includes(t)}
                            onChange={() => toggleInArray(filterWorkingTypes, t, setFilterWorkingTypes)}
                          />
                          <span>{t}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Companies (Dropdown) */}
            <div className="pb-1">
              <button
                type="button"
                onClick={() => toggleFilterOpen('companies')}
                className="w-full flex items-start justify-between text-slate-700 mb-1"
                aria-expanded={openFilters.companies}
              >
                <div className="flex-1 text-left">
                  <div className="text-slate-700 text-base font-semibold">Companies</div>
                  <div className="text-xs text-slate-500 text-left">{filterCompanies.length ? `${filterCompanies.length} selected` : 'Any'}</div>
                </div>
                <svg className={`w-6 h-6 text-slate-500 transition-transform ${openFilters.companies ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
              </button>
              <AnimatePresence initial={false}>
                {openFilters.companies && (
                  <motion.div
                    key="companies-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 mt-2">
                      {allCompanies.slice(0, 6).map((c) => (
                        <label key={c} className="flex items-center gap-3 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            className="accent-indigo-700 rounded"
                            checked={filterCompanies.includes(c)}
                            onChange={() => toggleInArray(filterCompanies, c, setFilterCompanies)}
                          />
                          <span>{c}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            </div>
          </div>
        </aside>

        {/* Job Listings */}
        <section className="flex-1 min-w-0">
          <div className="flex items-center mb-6 ml-4 gap-4">
            <h1 className="text-gray-800 text-3xl font-extrabold">Vacant Positions</h1>
            <div className="border border-[#BCB6AD] rounded-[25px] text-[#5F5F5F] text-sm font-bold py-2 px-4">{filteredJobs.length}</div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[#BBB] text-sm font-normal">Sort by:</span>
              <span className="text-[#7C7C7C] text-xs font-bold">Last updated</span>
            </div>
          </div>

          {/* Category Capsules Bar */}
          <div className="mb-4 ml-4 pr-4">
            <div
              ref={capsulesRef}
              onMouseDown={handleCapsMouseDown}
              onMouseMove={handleCapsMouseMove}
              onMouseUp={handleCapsMouseUp}
              onMouseLeave={handleCapsMouseLeave}
              onWheel={handleCapsWheel}
              className={`w-full min-w-0 flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden pb-1 select-none ${isCapsDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* All capsule */}
              <button
                type="button"
                onClick={() => setSelectedCategories(allCategoryKeys)}
                className={
                  "whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors " +
                  (allSelected
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-800 border-gray-300 hover:border-gray-500")
                }
                aria-pressed={allSelected}
                title="Show all categories"
              >
                All
              </button>

              {JOB_CATEGORIES.map(c => {
                const count = categoryCounts[c.key] || 0;
                const isActive = !allSelected && selectedCategories.length === 1 && selectedCategories[0] === c.key;
                const isDisabled = count === 0;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => !isDisabled && setSelectedCategories([c.key])}
                    disabled={isDisabled}
                    aria-disabled={isDisabled}
                    aria-pressed={isActive}
                    className={
                      "whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors " +
                      (isDisabled
                        ? "bg-white text-gray-400 border-gray-200 cursor-not-allowed"
                        : isActive
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-800 border-gray-300 hover:border-gray-500")
                    }
                    title={isDisabled ? `${c.label} (no jobs)` : c.label}
                  >
                    {c.label} <span className="opacity-70 font-normal">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job Cards Container */}
          <div
            className="h-[calc(100vh-200px)] pt-4 pb-12 overflow-y-scroll"
            data-hide-scrollbar="true"
            style={{ overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-500">Loading jobs…</div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-500">{error}</div>
            ) : selectedCategories.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500">Select at least one job category to fetch jobs.</div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500">No jobs found. Try adjusting filters.</div>
            ) : (
              <div className="flex flex-wrap gap-6 items-stretch">
                {filteredJobs.map((job, index) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    bgColor={cardBgColors[index % cardBgColors.length]}
                    onDetails={openJobModal}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      </div>

      {/* Modal Mount */}
      <JobDetailModal job={selectedJob} open={isModalOpen} onClose={closeJobModal} />

      {/* Inline CSS to hide WebKit scrollbars for marked elements */}
      <style jsx global>{`
        [data-hide-scrollbar="true"]::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}
