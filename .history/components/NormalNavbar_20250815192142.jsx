"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { NavbarLogo, NavbarButton } from "@/components/ui/resizable-navbar";

const NormalNavbar = ({ 
  navItems = [], 
  showSearch = false, 
  searchQuery = "", 
  onSearchChange = null,
  showSavedJobs = false,
  savedJobsCount = 0,
  onSavedJobsToggle = null,
  savedJobsOpen = false,
  children = null 
}) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [jwt, setJwt] = useState(null);
  const [user, setUser] = useState(null);
  const [dropdown, setDropdown] = useState(false);
  const [profileKey, setProfileKey] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('jwt');
    if (token) {
      setJwt(token);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch (error) {
        console.error('Error parsing JWT:', error);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setJwt(null);
    setUser(null);
    setDropdown(false);
    setProfileKey((k) => k + 1);
    router.replace('/login');
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm flex items-center justify-between px-4 md:px-8 py-4">
      <div className="ml-4 md:ml-12">
        <NavbarLogo />
      </div>
      
      {/* Center: search input (if enabled) */}
      {showSearch && (
        <div className="hidden md:flex flex-1 justify-center px-4">
          <div className="w-full max-w-xl relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
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
                onClick={() => onSearchChange?.("")}
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
      )}

      {/* Navigation items */}
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

      {/* Right side: Saved jobs, user menu, auth buttons */}
      <div className="flex items-center gap-4 mr-4 md:mr-12">
        {/* Saved jobs dropdown (if enabled) */}
        {showSavedJobs && (
          <div className="relative">
            <button
              type="button"
              onClick={() => onSavedJobsToggle?.()}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center border ${savedJobsOpen ? 'bg-black text-white border-black' : 'bg-white text-black border-slate-300'} hover:shadow-sm`}
              aria-expanded={savedJobsOpen}
              aria-label={savedJobsOpen ? 'Close saved jobs' : 'Open saved jobs'}
              title={savedJobsOpen ? 'Close saved jobs' : 'Open saved jobs'}
            >
              {savedJobsOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 3h14a2 2 0 0 1 2 2v16l-9-6-9 6V5a2 2 0 0 1 2-2z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {savedJobsCount > 0 && (
                <span className={`absolute -top-1 -right-1 text-[10px] leading-none px-1.5 py-0.5 rounded-full ${savedJobsOpen ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  {savedJobsCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Custom children (for saved jobs dropdown content, etc.) */}
        {children}

        {/* User menu or auth buttons */}
        {mounted && jwt && user ? (
          <div className="relative mr-8 order-first" ref={dropdownRef} key={profileKey}>
            <button
              className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-200 text-purple-800 font-bold text-lg focus:outline-none"
              onClick={() => setDropdown((d) => !d)}
              aria-label="User menu"
            >
              {user.name ? user.name[0].toUpperCase() : user.email?.[0]?.toUpperCase() || <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" stroke="currentColor" strokeWidth="2"/></svg>}
            </button>
            <AnimatePresence>
              {dropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-semibold text-gray-900">{user.name || user.username || user.email}</div>
                  </div>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setDropdown(false); window.location.href='/account'; }}>Account Settings</button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600" onClick={handleLogout}>Logout</button>
                </motion.div>
              )}
            </AnimatePresence>
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
  );
};

export default NormalNavbar;
