"use client";
import Image from "next/image";
import { NavbarLogo, NavbarButton } from "@/components/ui/resizable-navbar";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaLinkedin, FaGithub, FaFilePdf, FaUserTie, FaDatabase, FaTasks, FaLaptopCode, FaChartLine, FaHardHat, FaCalculator, FaPencilRuler, FaBullhorn } from "react-icons/fa";

const navItems = [
  { name: "Home", link: "/" },
  { name: "Job Tracker", link: "/job-portal/job-tracker" },
  { name: "Resume Builder", link: "/resume-builder" },
  { name: "CV Verification", link: "/pdf-verification" },
  { name: "Interview Q&A", link: "/interview-prep" },
  { name: "Career Roadmap", link: "/roadmap" },
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

// --- Resume Example Section State and Data ---
const jobImages = {
  BusinessAnalyst: '/BusinessAnalyst.png',
  DataScientist: '/DataScientist.png',
  ProductManager: '/ProductManager.png',
  SoftwareEngineer: '/SoftwareEngineer.png',
  Sales: '/Sales.png',
  Engineer: '/Engineer.png',
  Accounting: '/Accounting.png',
  Designer: '/Designer.png',
  Marketing: '/Marketing.png',
};
const jobLogos = {
  BusinessAnalyst: '/flaticons/business-analyst.svg',
  DataScientist: '/flaticons/data-scientist.svg',
  ProductManager: '/flaticons/product-manager.svg',
  SoftwareEngineer: '/flaticons/software-engineer.svg',
  Sales: '/flaticons/sales.svg',
  Engineer: '/flaticons/engineer.svg',
  Accounting: '/flaticons/accounting.svg',
  Designer: '/flaticons/designer.svg',
  Marketing: '/flaticons/marketing.svg',
};
function getDefaultJob() {
  return 'BusinessAnalyst';
}

const jobList = [
  { key: 'BusinessAnalyst', label: 'Business Analyst', icon: <FaUserTie size={24} /> },
  { key: 'DataScientist', label: 'Data Scientist', icon: <FaDatabase size={24} /> },
  { key: 'ProductManager', label: 'Product Manager', icon: <FaTasks size={24} /> },
  { key: 'SoftwareEngineer', label: 'Software Engineer', icon: <FaLaptopCode size={24} /> },
  { key: 'Sales', label: 'Sales', icon: <FaChartLine size={24} /> },
  { key: 'Engineer', label: 'Engineer', icon: <FaHardHat size={24} /> },
  { key: 'Accounting', label: 'Accounting', icon: <FaCalculator size={24} /> },
  { key: 'Designer', label: 'Designer', icon: <FaPencilRuler size={24} /> },
  { key: 'Marketing', label: 'Marketing', icon: <FaBullhorn size={24} /> },
];

// Add a mapping from job key to Font Awesome icon
const jobFaIcons = {
  BusinessAnalyst: <FaUserTie size={28} />,
  DataScientist: <FaDatabase size={28} />,
  ProductManager: <FaTasks size={28} />,
  SoftwareEngineer: <FaLaptopCode size={28} />,
  Sales: <FaChartLine size={28} />,
  Engineer: <FaHardHat size={28} />,
  Accounting: <FaCalculator size={28} />,
  Designer: <FaPencilRuler size={28} />,
  Marketing: <FaBullhorn size={28} />,
};

export default function ResumeBuilderPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [dropdown, setDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileKey, setProfileKey] = useState(0);
  const dropdownRef = useRef(null);
  // Resume Example Section state
  const [selectedJob, setSelectedJob] = useState(getDefaultJob());

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
    if (!jwt) {
      router.replace("/login?redirect=/resume-builder");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);
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

  // Always get JWT and user info on every render
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
    router.replace('/login?redirect=/resume-builder');
  };

  if (checkingAuth) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm flex items-center justify-between px-4 md:px-8 py-4">
        <div className="ml-4 md:ml-12">
          <NavbarLogo />
        </div>
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
          {mounted && jwt && user ? (
            <div className="relative mr-8 order-first" ref={dropdownRef} key={profileKey}>
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-200 text-purple-800 font-bold text-lg focus:outline-none"
                onClick={() => setDropdown((d) => !d)}
                aria-label="User menu"
              >
                {user.name ? user.name[0].toUpperCase() : <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" stroke="currentColor" strokeWidth="2"/></svg>}
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
      <div className="pt-16">
        <section className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center md:gap-24 gap-12 z-10">
            {/* Left: Text */}
            <div className="flex-[1.7] max-w-3xl flex flex-col items-start text-left">
              <h1 className="text-5xl md:text-6xl font-extrabold mb-12 leading-tight text-slate-900">
                K2C's <span className="text-purple-600">CV Maker</span>
                <br />
                helps you create a professional CV that stands out
              </h1>
              <div className="flex flex-row gap-4 mb-10">
                <button
                  className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold px-8 py-3 rounded-lg text-lg shadow-md transition"
                  onClick={() => router.push('/cv-customization')}
                >
                  Build Your CV
                </button>
                <button 
                  className="border border-blue-200 text-blue-700 font-semibold px-8 py-3 rounded-lg text-lg bg-white hover:bg-blue-50 transition"
                  onClick={() => router.push('/resume-templates')}
                >
                  View Templates
                </button>
              </div>
              <p className="text-2xl text-slate-700 font-medium mb-10">
                Build a modern, job-winning CV in minutes with K2C's easy-to-use online maker.
              </p>
            </div>
            {/* Right: ResumeFlipCarousel */}
            <div className="flex-[0.5] flex items-center justify-center relative md:ml-16">
              <ResumeFlipCarousel />
            </div>
          </div>
        </section>
      </div>
      {/* Features Section */}
      <motion.section
        className="w-full bg-slate-50 py-16 flex justify-center items-center"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="max-w-6xl w-full mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {/* Feature 1 */}
            <div className="flex flex-col items-center">
              <span className="mb-4">
                {/* Checkmark Icon */}
                <svg width="40" height="40" fill="none" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="20" fill="#34D399" fillOpacity="0.2"/>
                  <path d="M28 15l-8.25 10L12 19.5" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="text-xl md:text-2xl font-medium text-slate-600">
                ATS-friendly professionally<br/>designed resumes
              </div>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col items-center">
              <span className="mb-4">
                {/* Drop Icon */}
                <svg width="40" height="40" fill="none" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="20" fill="#34D399" fillOpacity="0.2"/>
                  <path d="M20 10c2.5 5 7 8.5 7 13a7 7 0 11-14 0c0-4.5 4.5-8 7-13z" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="text-xl md:text-2xl font-medium text-slate-600 mb-2">
                Change the font, color<br/>and background combinations
              </div>
              <a href="/resume-templates" className="text-purple-700 font-semibold underline hover:text-purple-900 transition text-base mt-2">Browse Resume Templates <span aria-hidden="true">→</span></a>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col items-center">
              <span className="mb-4">
                {/* Layout Icon */}
                <svg width="40" height="40" fill="none" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="20" fill="#34D399" fillOpacity="0.2"/>
                  <rect x="12" y="14" width="16" height="4" rx="1.5" stroke="#34D399" strokeWidth="2.5"/>
                  <rect x="12" y="22" width="7" height="4" rx="1.5" stroke="#34D399" strokeWidth="2.5"/>
                  <rect x="21" y="22" width="7" height="4" rx="1.5" stroke="#34D399" strokeWidth="2.5"/>
                </svg>
              </span>
              <div className="text-xl md:text-2xl font-medium text-slate-600">
                Two-column, single-column,<br/>and multi-page layouts
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Resume Examples Section */}
      <section className="w-full bg-[#f7f8fa] py-24 flex items-center justify-center relative overflow-x-hidden min-h-[70vh] mx-auto">
        {/* Wavy SVG background */}
        <svg className="absolute left-0 bottom-0 w-[60vw] h-[30vh] md:w-[40vw] md:h-[25vh] z-0" viewBox="0 0 700 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 100 Q 175 200 350 100 T 700 100 V200 H0Z" fill="#e6eef7" />
        </svg>
        <div className="max-w-3xl w-full mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 z-10">
          {/* Sidebar Buttons */}
          <div className="flex flex-row md:flex-col gap-4 md:gap-3 items-center md:items-start w-full md:w-auto md:min-w-[260px]">
            {jobList.map((job, idx) => (
              <button
                key={job.key}
                onClick={() => setSelectedJob(job.key)}
                className={`group flex items-center gap-4 px-0 py-0 rounded-full font-semibold text-base transition-all duration-200 focus:outline-none w-full`}
                style={{ minWidth: 180 }}
              >
                <span
                  className={`flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full transition-all duration-200
                    ${selectedJob === job.key ? 'bg-emerald-500 shadow-lg text-white' : 'bg-[#e6eef7] text-emerald-600'}
                    group-hover:bg-emerald-100 group-hover:text-emerald-700
                  `}
                >
                  {job.icon}
                </span>
                <span className={`ml-2 text-left ${selectedJob === job.key ? 'text-emerald-600 font-bold bg-white px-4 py-2 rounded-full shadow' : 'text-slate-700 font-medium'}`}>{job.label}</span>
              </button>
            ))}
          </div>
          {/* Resume Preview */}
          <div className="flex-1 flex flex-col items-center justify-center relative min-h-[420px]">
            <div className="relative w-full max-w-md mx-auto group">
              <div className="absolute -top-6 right-0 z-10">
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 shadow-lg border-4 border-white text-white">
                  {jobFaIcons[selectedJob]}
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedJob}
                  src={jobImages[selectedJob]}
                  alt={selectedJob + ' resume example'}
                  className="w-full rounded-2xl shadow-2xl border border-slate-200 bg-white"
                  style={{ minHeight: 340, objectFit: 'cover' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              </AnimatePresence>
              {/* Go to Example Button (appears on hover) */}
              <a
                href="#"
                className="absolute left-1/2 -translate-x-1/2 bottom-4 z-20 px-5 py-2 rounded-full bg-emerald-500 text-white font-semibold shadow-lg text-base
                  opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto"
              >
                Go to Example
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Import Sources Section */}
      <section className="w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 py-20 flex justify-center items-center border-t border-slate-100">
        <div className="max-w-5xl w-full mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Easily Import Your Data</h2>
          <p className="text-lg md:text-xl text-slate-600 mb-12">Our CV builder can automatically import your information from three sources to help you create your CV faster and more accurately.</p>
          <div className="flex flex-col md:flex-row gap-8 md:gap-10 justify-center items-stretch">
            {/* LinkedIn */}
            <div className="flex-1 min-w-[220px] bg-white rounded-2xl shadow-xl border border-slate-100 p-8 flex flex-col items-center transition-transform hover:-translate-y-2 hover:shadow-2xl group">
              <span className="mb-4">
                <FaLinkedin size={56} className="text-[#0A66C2] bg-[#0A66C2]/10 rounded-full p-3" />
              </span>
              <div className="font-semibold text-slate-900 text-xl mb-2 group-hover:text-blue-700 transition-colors">LinkedIn</div>
              <div className="text-slate-600 text-base">Import your profile and work experience directly from your LinkedIn account.</div>
            </div>
            {/* GitHub */}
            <div className="flex-1 min-w-[220px] bg-white rounded-2xl shadow-xl border border-slate-100 p-8 flex flex-col items-center transition-transform hover:-translate-y-2 hover:shadow-2xl group">
              <span className="mb-4">
                <FaGithub size={56} className="text-[#181717] bg-[#181717]/10 rounded-full p-3" />
              </span>
              <div className="font-semibold text-slate-900 text-xl mb-2 group-hover:text-gray-900 transition-colors">GitHub</div>
              <div className="text-slate-600 text-base">Import your projects and skills from your GitHub account to showcase your work.</div>
            </div>
            {/* CV PDF */}
            <div className="flex-1 min-w-[220px] bg-white rounded-2xl shadow-xl border border-slate-100 p-8 flex flex-col items-center transition-transform hover:-translate-y-2 hover:shadow-2xl group">
              <span className="mb-4">
                <FaFilePdf size={56} className="text-[#EA4335] bg-[#EA4335]/10 rounded-full p-3" />
              </span>
              <div className="font-semibold text-slate-900 text-xl mb-2 group-hover:text-red-600 transition-colors">CV PDF</div>
              <div className="text-slate-600 text-base">Upload your existing CV in PDF format and we'll extract your information automatically.</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ResumeFlipCarousel() {
  const images = ["/cvhero1.png", "/cvhero2.png", "/cvhero3.png"];
  const [rotateY, setRotateY] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRotateY((prev) => prev + 2);
    }, 33); // ~30fps
    return () => clearInterval(intervalRef.current);
  }, []);

  // Calculate which images to show based on rotateY
  const step = Math.floor(rotateY / 180);
  const frontIndex = step % images.length;
  const backIndex = (frontIndex + 1) % images.length;
  const localAngle = rotateY % 360;

  return (
    <div
      className="mx-auto relative flex justify-center items-center"
      style={{ perspective: 1200, minWidth: 500, minHeight: 400 }}
    >
      <div className="relative" style={{ minWidth: 500, minHeight: 400 }}>
        <div
          style={{
            width: "100%",
            height: "auto",
            minWidth: 500,
            minHeight: 400,
            position: "relative",
            transformStyle: "preserve-3d",
            transform: `rotateY(${localAngle}deg)`,
            transition: "transform 0.033s linear",
          }}
        >
          {/* Front face (current image) */}
          <img
            src={images[frontIndex]}
            alt={`Resume ${frontIndex + 1}`}
            style={{
              width: "100%",
              height: "auto",
              minWidth: 500,
              minHeight: 400,
              backfaceVisibility: "hidden",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
          {/* Back face (next image) */}
          <img
            src={images[backIndex]}
            alt={`Resume ${backIndex + 1}`}
            style={{
              width: "100%",
              height: "auto",
              minWidth: 500,
              minHeight: 400,
              backfaceVisibility: "hidden",
              position: "absolute",
              top: 0,
              left: 0,
              transform: "rotateY(180deg)",
            }}
          />
        </div>
      </div>
    </div>
  );
} 