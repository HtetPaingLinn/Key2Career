"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import InterviewCardWrapper from "@/components/voice-interview/InterviewCardWrapper";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import "@/styles/voice-interview.css";

import { checkOrCreateFirebaseUser } from "@/lib/actions/voice-auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
  fixUserInterviewIds,
} from "@/lib/actions/voice-general.action";
import { useAuth } from "@/lib/useAuth";

// Navigation items for the voice interview page
const navItems = [
  { name: "Home", link: "/" },
  { name: "Job Portal", link: "/job-portal" },
  { name: "Resume Builder", link: "/resume-builder" },
  { name: "CV Verification", link: "#" },
  { name: "Interview Q&A", link: "/interview-prep" },
  { name: "Voice Interview", link: "/voice-interview" },
  { name: "Career Roadmap", link: "#" },
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

export default function VoiceInterviewHome() {
  const { userEmail, isLoading: authLoading, isAuthenticated } = useAuth();
  const [user, setUser] = useState(null);
  const [userInterviews, setUserInterviews] = useState(null);
  const [allInterview, setAllInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation state variables
  const [dropdown, setDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileKey, setProfileKey] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setDropdown(false);
    setProfileKey((k) => k + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !userEmail) {
        setLoading(false);
        return;
      }

      try {
        // Get JWT token from localStorage
        const jwt = localStorage.getItem('jwt');
        if (!jwt) {
          setLoading(false);
          return;
        }

        // Check or create Firebase user
        const userResult = await checkOrCreateFirebaseUser(jwt);
        if (!userResult.success || !userResult.user) {
          console.error("Failed to get Firebase user:", userResult.message);
          setLoading(false);
          return;
        }

        const firebaseUser = userResult.user;
        setUser(firebaseUser);

        // Fix any existing interviews with incorrect userId
        try {
          const fixResult = await fixUserInterviewIds(jwt);
          if (fixResult.success && fixResult.updatedCount > 0) {
            console.log(`Fixed ${fixResult.updatedCount} interviews with correct userId`);
          }
        } catch (error) {
          console.error("Error fixing interview userIds:", error);
        }

        // Fetch user interviews and all interviews
        const [userInterviewsData, allInterviewData] = await Promise.all([
          getInterviewsByUserId(firebaseUser.id),
          getLatestInterviews({ userId: firebaseUser.id }),
        ]);
        
        setUserInterviews(userInterviewsData);
        setAllInterview(allInterviewData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [isAuthenticated, userEmail, authLoading]);

  const handleDeleteInterview = (interviewId) => {
    // Remove from userInterviews
    setUserInterviews(
      (prev) =>
        prev?.filter((interview) => interview.id !== interviewId) || null
    );
    // Remove from allInterview
    setAllInterview(
      (prev) =>
        prev?.filter((interview) => interview.id !== interviewId) || null
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">Please log in to access voice interviews.</p>
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  const hasPastInterviews = userInterviews?.length > 0;
  const hasUpcomingInterviews = allInterview?.length > 0;

  return (
    <div className="min-h-screen w-full bg-white relative text-gray-800">
      {/* Concentric Squares - Light Pattern */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(75, 85, 99, 0.06) 5px, rgba(75, 85, 99, 0.06) 6px, transparent 6px, transparent 15px),
            repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(75, 85, 99, 0.06) 5px, rgba(75, 85, 99, 0.06) 6px, transparent 6px, transparent 15px),
            repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(107, 114, 128, 0.04) 10px, rgba(107, 114, 128, 0.04) 11px, transparent 11px, transparent 30px),
            repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(107, 114, 128, 0.04) 10px, rgba(107, 114, 128, 0.04) 11px, transparent 11px, transparent 30px)
          `,
        }}
      />
      
      {/* Voice Interview Content */}
      <div className="voice-interview relative z-10">
        {/* Navigation Bar */}
        <Navbar className="fixed top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          {/* Desktop Navigation */}
          <NavBody>
            {({ visible }) => (
              <>
                {!visible && <NavbarLogo />}
                <NavItems items={navItems} />
                {!visible && (
                  <div className="flex items-center gap-4 -mr-[130px]">
                    {mounted && isAuthenticated ? (
                      <div className="relative mr-8 order-first" ref={dropdownRef} key={profileKey}>
                        <button
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-200 text-purple-800 font-bold text-lg focus:outline-none"
                          onClick={() => setDropdown((d) => !d)}
                          aria-label="User menu"
                        >
                          {userEmail ? userEmail[0].toUpperCase() : <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" stroke="currentColor" strokeWidth="2"/></svg>}
                        </button>
                        {dropdown && (
                          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <div className="px-4 py-3 border-b border-gray-100">
                              <div className="font-semibold text-gray-900">{userEmail || 'User'}</div>
                            </div>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setDropdown(false); window.location.href='/account'; }}>Account Settings</button>
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
                )}
              </>
            )}
          </NavBody>
          {/* Mobile Navigation */}
          <MobileNav>
            <MobileNavHeader>
              <NavbarLogo />
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </MobileNavHeader>
            <MobileNavMenu
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            >
              {navItems.map((item, idx) => (
                <a
                  key={`mobile-link-${idx}`}
                  href={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative text-neutral-600 dark:text-neutral-300 font-medium text-lg py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                >
                  <span className="block">{item.name}</span>
                </a>
              ))}
              <div 
                className="flex w-full flex-col gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-neutral-700"
              >
                {mounted && isAuthenticated ? (
                  <>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 font-semibold"
                      onClick={() => { setIsMobileMenuOpen(false); window.location.href='/account'; }}
                    >Account Settings</button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 font-semibold"
                      onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                    >Logout</button>
                  </>
                ) : (
                  <>
                    <NavbarButton
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      variant="primary"
                      className="w-full"
                    >
                      Login
                    </NavbarButton>
                    <NavbarButton
                      href="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      variant="primary"
                      className="w-full"
                    >
                      Sign up for free
                    </NavbarButton>
                  </>
                )}
              </div>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>

        {/* Main Content with top padding for fixed navbar */}
        <div className="pt-24">
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Hero Section */}
            <section className="card-cta mb-12 py-12 px-8">
              <Image
                src="/imageR.png"
                alt="AI Voice Interview Assistant"
                width={350}
                height={350}
                className="max-sm:hidden"
              />

              <div className="flex flex-col gap-8 max-w-2xl">
                <h1 className="text-4xl font-bold text-gray-800 leading-tight">
                  Start Voice Interview with AI-Powered Practice and Feedback
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Practice real interview questions with our AI voice assistant and get instant feedback to improve your skills.
                </p>

                <Button asChild className="max-sm:w-full w-fit text-lg px-8 py-3" style={{
                  background: 'rgb(40 168 255 / 57%)',
                  color: 'black',
                  border: 'none'
                }}>
                  <Link href="/voice-interview/create">Start an Interview</Link>
                </Button>
              </div>
            </section>

            {/* Your Interviews Section */}
            <section className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Interviews</h2>
              
              <div className="interviews-section">
                {hasPastInterviews ? (
                  userInterviews?.map((interview) => (
                    <InterviewCardWrapper
                      key={interview.id}
                      userId={user?.id}
                      interviewId={interview.id}
                      role={interview.role}
                      type={interview.type}
                      techstack={interview.techstack}
                      createdAt={interview.createdAt}
                      onDelete={() => handleDeleteInterview(interview.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-left py-8 pl-0">
                    <p className="text-gray-600 mb-3">You haven't taken any interviews yet</p>
                    <Button asChild className="max-sm:w-full w-fit text-lg px-8 py-3" style={{
                      background: 'rgb(40 168 255 / 57%)',
                      color: 'black',
                      border: 'none'
                    }}>
                      <Link href="/voice-interview/create">Create Your First Interview</Link>
                    </Button>
                  </div>
                )}
              </div>
            </section>

            {/* Available Interviews Section */}
            <section className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Take Interviews</h2>
              
              <div className="interviews-section">
                {hasUpcomingInterviews ? (
                  allInterview?.map((interview) => (
                    <InterviewCardWrapper
                      key={interview.id}
                      userId={user?.id}
                      interviewId={interview.id}
                      role={interview.role}
                      type={interview.type}
                      techstack={interview.techstack}
                      createdAt={interview.createdAt}
                      onDelete={() => handleDeleteInterview(interview.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-600">There are no interviews available right now</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
