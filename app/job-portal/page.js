"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavbarLogo, NavbarButton } from "@/components/ui/resizable-navbar";
import { useRouter } from "next/navigation";
 
// Navigation items copied from resume-builder navbar
const navItems = [
  // { name: "Home", link: "/" },
  { name: "Job Tracker", link: "/job-portal/job-tracker" },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIds, setSavedIds] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const s = localStorage.getItem('savedJobIds');
        return s ? JSON.parse(s) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem('savedJobIds', JSON.stringify(savedIds));
    } catch {}
  }, [savedIds]);
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
  // Job cards data extracted from the original cards
  const jobsData = [
    {
      id: 1,
      company: "Arasaka",
      title: "Senior Neural Interface Designer",
      logoUrl: "https://api.builder.io/api/v1/image/assets/TEMP/549e3d50309266ae98a2a227892055235f2344cd?width=76",
      tags: ["Gig Economy", "Elite Level", "Remote Ops", "Black Market Project"],
      salary: 250,
      location: "Westbrook, Night City",
      applicants: 25,
      responsibilities: [
        "Engineer and deploy neural link interfaces",
        "Perform braindance user studies",
        "Develop neural wireframes and prototypes"
      ],
      required_skills: ["Neural Interface Design", "Braindance Research", "Neural Mapping", "Prototype Augmentation"],
      Qualifications: [
        { education: ["Bachelor's degree in Cybernetics", "Master's degree in Neural Design"] },
        { experience: ["2+ years in Neural Interface Design", "3+ years in Braindance Research"] }
      ],
      created_at: "2025-08-03T08:35:59.409719Z"
    },
    {
      id: 2,
      company: "Militech",
      title: "Junior Cyberdeck Interface Specialist",
      logoUrl: "https://api.builder.io/api/v1/image/assets/TEMP/14eb911a9f82e69728263892fdf27f96ebbe02d4?width=76",
      tags: ["Full Contract", "Rookie Level"],
      salary: 150,
      location: "City Center, Night City",
      applicants: 0,
      responsibilities: [
        "Assist in cyberdeck interface tasks",
        "Support elite designers",
        "Aid in ICE-breaker usability tests"
      ],
      required_skills: ["Interface Fundamentals", "Daemon Sketching Tools", "Net Communication"],
      Qualifications: [
        { education: ["Bachelor's degree in Cybernetics or related field"] },
        { experience: ["0–1 year of relevant netrunning experience"] }
      ],
      created_at: "2025-08-03T08:40:00.000000Z"
    },
    {
      id: 3,
      company: "Kang Tao",
      title: "Senior Holo-Animation Engineer",
      logoUrl: "https://api.builder.io/api/v1/image/assets/TEMP/b4ae4a8af94358f574fe20d9736aed038f23eab2?width=76",
      tags: ["Gig Economy", "Elite Level"],
      salary: 260,
      location: "Remote Ops",
      applicants: 0,
      responsibilities: [
        "Fabricate holo-animations and motion projections",
        "Collaborate with black ops teams",
        "Enforce corp branding in virtual spaces"
      ],
      required_skills: ["Holo Effects", "Projection Principles", "Virtual Storyboarding"],
      Qualifications: [
        { education: ["Bachelor's degree in Holo-Engineering, Cyber Design, or related field"] },
        { experience: ["3+ years in holo-animation"] }
      ],
      created_at: "2025-08-03T08:45:00.000000Z"
    },
    {
      id: 4,
      company: "Zetatech",
      title: "Braindance Experience Architect",
      logoUrl: "https://api.builder.io/api/v1/image/assets/TEMP/d865519110b56398cda22cad4c5ec7254ca158b3?width=74",
      tags: ["Full Contract", "Mid-Tier Level"],
      salary: 120,
      location: "Watson, Night City",
      applicants: 0,
      responsibilities: [
        "Architect user neural workflows",
        "Execute usability scans on implants",
        "Interface with code slingers for deployment"
      ],
      required_skills: ["Braindance Design", "Neural Flows", "Wireframing Implants", "User Neural Testing"],
      Qualifications: [
        { education: ["Bachelor's degree in Neural Design or HCI Augmentation"] },
        { experience: ["2–4 years in braindance architecture"] }
      ],
      created_at: "2025-08-03T08:50:00.000000Z"
    },
    {
      id: 5,
      company: "Tsunami Defense Systems",
      title: "Chrome Aesthetic Fabricator",
      logoUrl: "https://api.builder.io/api/v1/image/assets/TEMP/1da362b2d69d7dc8dfa6a73359f548f97b56357d?width=76",
      tags: ["Gig Economy", "Elite Level"],
      salary: 300,
      location: "Heywood, Night City",
      applicants: 0,
      responsibilities: [
        "Fabricate visual augmentations for corp propaganda",
        "Design digital and physical chrome collateral",
        "Adhere to mega-corp aesthetic protocols"
      ],
      required_skills: ["Chrome Fabrication", "Augmentation Suite Tools", "Corp Branding"],
      Qualifications: [
        { education: ["Bachelor's degree in Aesthetic Cyber Design"] },
        { experience: ["3+ years in chrome fabrication"] }
      ],
      created_at: "2025-08-03T08:55:00.000000Z"
    },
    {
      id: 6,
      company: "Kiroshi Opticals",
      title: "Visual Augmentation Artist",
      logoUrl: "https://api.builder.io/api/v1/image/assets/TEMP/1af958d5691fa496a46974041139ee4fe1f5ee99?width=74",
      tags: ["Gig Economy", "Remote Ops"],
      salary: 140,
      location: "Pacifica, Night City",
      applicants: 0,
      responsibilities: [
        "Sculpt optic elements and icons",
        "Maintain visual chrome consistency",
        "Interface with neural teams"
      ],
      required_skills: ["Optic Icon Design", "Chrome Illustrator", "Attention to Nano-Details"],
      Qualifications: [
        { education: ["Bachelor's degree in Optic Design or related"] },
        { experience: ["2+ years in visual augmentation"] }
      ],
      created_at: "2025-08-03T09:00:00.000000Z"
    },
    {
      id: 7,
      company: "Biotechnica",
      title: "Netrunner UI Coder",
      logoUrl: "https://api.builder.io/api/v1/image/assets/TEMP/7f21f1b4c658a1f63b7a8dfc5ff2db86?width=76",
      tags: ["Full Contract", "Mid-Tier Level", "Remote Ops"],
      salary: 200,
      location: "Santo Domingo, Night City",
      applicants: 0,
      responsibilities: [
        "Deploy net interface components",
        "Ensure adaptive neural design",
        "Collaborate with interface architects"
      ],
      required_skills: ["Net Code", "ICE Styles", "Daemon Script", "Virtual Framework"],
      Qualifications: [
        { education: ["Bachelor's degree in Net Architecture or related"] },
        { experience: ["2–5 years in netrunning development"] }
      ],
      created_at: "2025-08-03T09:05:00.000000Z"
    },
    {
      id: 8,
      company: "Petrochem",
      title: "Cyberware Product Innovator",
      logoUrl: "https://api.builder.io/api/v1/image/assets/TEMP/29b7a2cf1b8b9260d6b9bb5b0fc8f872?width=76",
      tags: ["Gig Economy", "Elite Level"],
      salary: 280,
      location: "Badlands Outskirts, Night City",
      applicants: 0,
      responsibilities: [
        "Innovate end-to-end augmentation experiences",
        "Prototype and test cyber features",
        "Interface with fixers and techies"
      ],
      required_skills: ["Augmentation Innovation", "Prototype Hacking", "User Implant Testing"],
      Qualifications: [
        { education: ["Bachelor's or Master's in Cyberware Design"] },
        { experience: ["3+ years in cyber product innovation"] }
      ],
      created_at: "2025-08-03T09:10:00.000000Z"
    },
    {
      id: 9,
      company: "Trauma Team",
      title: "Optic Illusion Creator",
      logoUrl: "https://api.builder.io/api/v1/image/assets/TEMP/99b1aa9a1b5dc3e0c6e239ef2f3d92cf?width=76",
      tags: ["Black Market Contract", "Mid-Tier Level"],
      salary: 180,
      location: "Combat Zone, Night City",
      applicants: 0,
      responsibilities: [
        "Create visual deceptions for digital ops",
        "Adapt corp illusions for shadow campaigns",
        "Support extraction teams"
      ],
      required_skills: ["Illusion Creation", "Optic Manipulator", "Reality Editor"],
      Qualifications: [
        { education: ["Bachelor's degree in Visual Deception or Cyber Arts"] },
        { experience: ["2–3 years in optic illusions"] }
      ],
      created_at: "2025-08-03T09:15:00.000000Z"
    },
    {
      id: 10,
      company: "Night Corp",
      title: "MegaCorp Vision Director",
      logoUrl: "https://api.builder.io/api/v1/image/assets/TEMP/7743a92d51db0d8415b07bbcc2e80db0?width=76",
      tags: ["Full Contract", "Elite Level"],
      salary: 350,
      location: "City Center, Night City",
      applicants: 0,
      responsibilities: [
        "Lead dystopian creative vision",
        "Oversee augmentation teams",
        "Establish chrome standards"
      ],
      required_skills: ["Corp Leadership", "Visionary Direction", "Mega Strategy"],
      Qualifications: [
        { education: ["Bachelor's or Master's in Dystopian Design"] },
        { experience: ["5+ years in mega-corp leadership"] }
      ],
      created_at: "2025-08-03T09:20:00.000000Z"
    },
    {
      id: 11,
      company: "Arasaka",
      title: "Narrative Implant Writer",
      logoUrl: "https://api.builder.io/api/v1/image/assets/TEMP/34fa98d1c6d8df3f9152a2b193f0c31e?width=76",
      tags: ["Gig Economy", "Remote Ops"],
      salary: 170,
      location: "Westbrook, Night City",
      applicants: 0,
      responsibilities: [
        "Script and implant user-facing narratives",
        "Ensure tone and style in brain implants",
        "Collaborate with neural experience teams"
      ],
      required_skills: ["Narrative Implantation", "Mind Writing", "Dystopian Storytelling"],
      Qualifications: [
        { education: ["Bachelor's degree in Neural Writing, Propaganda, or Design"] },
        { experience: ["2+ years in narrative implantation"] }
      ],
      created_at: "2025-08-03T09:25:00.000000Z"
    },
    {
      id: 12,
      company: "Militech",
      title: "Augmentation System Architect",
      logoUrl: "https://api.builder.io/api/v1/image/assets/TEMP/baf23f6595d48d015d7cb70a627b7c2b?width=76",
      tags: ["Full Contract", "Elite Level", "Remote Ops", "Shadow Project", "Black Market Contract"],
      salary: 310,
      location: "Remote Ops",
      applicants: 0,
      responsibilities: [
        "Construct and maintain augmentation system components",
        "Integrate with combat frameworks",
        "Ensure scalability in chrome ecosystems"
      ],
      required_skills: ["Aug System Design", "Combat Frameworks", "Chrome Libraries"],
      Qualifications: [
        { education: ["Bachelor's in Cyber Architecture or Aug Design"] },
        { experience: ["3+ years in augmentation systems"] }
      ],
      created_at: "2025-08-03T09:30:00.000000Z"
    }
  ];
  
  
  // Facets and filter state
  const allTypes = Array.from(new Set(jobsData.flatMap(j => j.tags.filter(t => ["Full Contract", "Gig Economy", "Black Market Contract"].includes(t)))));
  const allLevels = Array.from(new Set(jobsData.flatMap(j => j.tags.filter(t => ["Rookie Level", "Mid-Tier Level", "Elite Level"].includes(t)))));
  const allCompanies = Array.from(new Set(jobsData.map(j => j.company)));
  const minSalary = Math.min(...jobsData.map(j => j.salary));
  const maxSalary = Math.max(...jobsData.map(j => j.salary));

  const [filterTypes, setFilterTypes] = useState([]); // values from allTypes
  const [filterLevels, setFilterLevels] = useState([]); // values from allLevels
  const [filterCompanies, setFilterCompanies] = useState([]); // values from allCompanies
  const [remoteOnly, setRemoteOnly] = useState(false); // true -> tag must include "Remote Ops"
  const [salaryRange, setSalaryRange] = useState([minSalary, maxSalary]);

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
    setSalaryRange(([_, hi]) => clampSalary(val, hi));
  };
  const handleMaxSalaryChange = (v) => {
    const val = Number(v);
    setSalaryRange(([lo, _]) => clampSalary(lo, val));
  };

  const clearAllFilters = () => {
    setFilterTypes([]);
    setFilterLevels([]);
    setFilterCompanies([]);
    setRemoteOnly(false);
    setSalaryRange([minSalary, maxSalary]);
  };
  // Helpers for search and save
  const isSaved = (id) => savedIds.includes(id);
  const toggleSave = (id) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const matchesQuery = (job, q) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    const haystacks = [
      job.title,
      job.company,
      ...(job.tags || []),
      ...(job.required_skills || []),
      ...(job.responsibilities || []),
    ].join("\n").toLowerCase();
    return haystacks.includes(s);
  };

  const filteredJobs = jobsData.filter(j => {
    // salary
    if (j.salary < salaryRange[0] || j.salary > salaryRange[1]) return false;
    // remote
    if (remoteOnly && !j.tags.includes("Remote Ops")) return false;
    // types
    if (filterTypes.length > 0 && !filterTypes.some(t => j.tags.includes(t))) return false;
    // levels
    if (filterLevels.length > 0 && !filterLevels.some(l => j.tags.includes(l))) return false;
    // companies
    if (filterCompanies.length > 0 && !filterCompanies.includes(j.company)) return false;
    // saved only toggle
    if (showSavedOnly && !isSaved(j.id)) return false;
    // keyword match
    if (!matchesQuery(j, searchQuery)) return false;
    return true;
  });

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

  // Component to render individual job card using the new design
  const JobCard = ({ job, bgColor, onDetails }) => (
    <div className="flex-[1_1_320px] min-w-[280px] bg-white rounded-[26px] border-[3px] border-gray-200 p-1.5 flex flex-col">
      {/* Map-like region wrapper */}
      <div className="rounded-[20px] p-4" style={{ backgroundColor: bgColor }}>
        {/* Header with date and bookmark */}
        <div className="flex justify-between items-center mb-4">
          <div className="bg-white rounded-full px-3 py-1">
            <span className="text-gray-800 text-sm font-medium">{formatDate(job.created_at)}</span>
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
        <div className="text-gray-900 text-sm font-semibold mb-2">{job.company}</div>

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
              {job.title}
            </h3>
          </div>
          
          {/* Company logo - 25% width */}
          <div className="flex-shrink-0 flex justify-end" style={{flexBasis: '25%'}}>
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
              <img 
                src={job.logoUrl}
                alt={job.company}
                className="w-10 h-10 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-1 min-h-[106px] content-end">
          {job.tags.map((tag, index) => (
            <span key={index} className="text-gray-800 px-3 py-1 border-1 border-gray-500 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer with salary and location */}
      <div className="mt-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-900 text-md font-semibold">${job.salary}/hr</div>
            <div className="text-gray-400 text-sm">{job.location}</div>
          </div>
          <button onClick={() => onDetails?.(job)} className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 cursor-pointer transition-colors">
            Details
          </button>
        </div>
      </div>
    </div>
  );

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
  
    const applicantsText = `${job.applicants || 0} applicant${
      (job.applicants || 0) === 1 ? "" : "s"
    }`;
  
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
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black rounded-xl flex items-center justify-center">
                      <img
                        src={job.logoUrl}
                        alt={job.company}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
                          {job.company}
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
                          {job.title}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                        <span>{job.location}</span>
                        <span>·</span>
                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                        <span>·</span>
                        <span>{applicantsText}</span>
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
                    <Link href="/job-portal/job-application-form" className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-indigo-700 text-white text-sm font-medium shadow-sm hover:bg-indigo-800 active:bg-indigo-900 transition-colors">
                      Apply now
                    </Link>
                    <button className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-gray-300 bg-white text-gray-900 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors">
                      Save
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
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
  
                  {/* Required Skills */}
                  {job.required_skills?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-gray-900 font-semibold mb-2">
                        Required skills
                      </h4>
                      <ul className="list-disc pl-6 space-y-1 text-gray-700">
                        {job.required_skills.map((skill, idx) => (
                          <li key={idx}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                  )}
  
                  {/* Qualifications */}
                  {job.Qualifications?.length > 0 && (
                    <div>
                      <h4 className="text-gray-900 font-semibold mb-2">
                        Qualifications
                      </h4>
                      {job.Qualifications.map((q, idx) => (
                        <div key={idx} className="mb-3">
                          {q.education && (
                            <>
                              <div className="text-gray-800 font-medium">
                                Education
                              </div>
                              <ul className="text-gray-700 list-disc pl-6 space-y-1">
                                {q.education.map((e, i) => (
                                  <li key={i}>{e}</li>
                                ))}
                              </ul>
                            </>
                          )}
                          {q.experience && (
                            <>
                              <div className="text-gray-800 font-medium mt-2">
                                Experience
                              </div>
                              <ul className="text-gray-700 list-disc pl-6 space-y-1">
                                {q.experience.map((e, i) => (
                                  <li key={i}>{e}</li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      ))}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs by title, company, skill..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/80 placeholder:text-slate-400"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 3h14a2 2 0 0 1 2 2v16l-9-6-9 6V5a2 2 0 0 1 2-2z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {savedIds.length > 0 && (
                <span className={`absolute -top-1 -right-1 text-[10px] leading-none px-1.5 py-0.5 rounded-full ${savedOpen ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  {savedIds.length}
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
                  {(([... (savedIds.length ? jobsData.filter(j=>savedIds.includes(j.id)) : jobsData).slice(0,3)])).map((job) => (
                    <div
                      key={job.id}
                      className="w-full border border-slate-200 rounded-xl p-3 cursor-pointer hover:bg-slate-50"
                      onClick={() => { setShowSavedOnly(true); setSavedOpen(false); }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setShowSavedOnly(true); setSavedOpen(false); } }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                          <img src={job.logoUrl} alt={job.company} className="w-7 h-7 rounded" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-slate-600 font-medium truncate">{job.company}</div>
                          <div className="text-sm text-slate-900 font-semibold truncate">{job.title}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            className="text-xs text-slate-500 hover:text-slate-700"
                            onClick={(e)=>{ e.stopPropagation(); toggleSave(job.id); }}
                          >
                            Unsave
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            {/* Salary Range */}
            <div className="pb-5 mb-5 border-b border-slate-200">
              <div className="text-slate-600 text-sm font-medium mb-3">Salary range (per hour)</div>
              <div className="px-1">
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
                  <span>${salaryRange[0]}</span>
                  <span>${salaryRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Job Type */}
            <div className="pb-5 mb-5 border-b border-slate-200">
              <div className="text-slate-600 text-sm font-medium mb-3">Job type</div>
              <div className="space-y-2">
                {allTypes.map((t) => (
                  <label key={t} className="flex items-center gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="accent-indigo-700 rounded"
                      checked={filterTypes.includes(t)}
                      onChange={() => toggleInArray(filterTypes, t, setFilterTypes)}
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Seniority Level */}
            <div className="pb-5 mb-5 border-b border-slate-200">
              <div className="text-slate-600 text-sm font-medium mb-3">Seniority level</div>
              <div className="space-y-2">
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
            </div>

            {/* Work Setup */}
            <div className="pb-5 mb-5 border-b border-slate-200">
              <div className="text-slate-600 text-sm font-medium mb-3">Work setup</div>
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="accent-indigo-700 rounded"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                />
                <span>Remote only</span>
              </label>
            </div>

            {/* Companies */}
            <div className="pb-1">
              <div className="text-slate-600 text-sm font-medium mb-3">Companies</div>
              <div className="space-y-2">
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
            </div>
            </div>
          </div>
        </aside>

        {/* Job Listings */}
        <section className="flex-1 min-w-0">
          <div className="flex items-center mb-6 ml-4 gap-4">
            <h1 className="text-gray-800 text-3xl font-extrabold">Recommended jobs</h1>
            <div className="border border-[#BCB6AD] rounded-[25px] text-[#5F5F5F] text-sm font-bold py-2 px-4">{filteredJobs.length}</div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[#BBB] text-sm font-normal">Sort by:</span>
              <span className="text-[#7C7C7C] text-xs font-bold">Last updated</span>
            </div>
          </div>

          {/* Job Cards Container */}
          <div
            className="h-[calc(100vh-160px)] pt-4 pb-12 overflow-y-scroll"
            data-hide-scrollbar="true"
            style={{ overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
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
