"use client";
import Image from 'next/image';
import { WorldMap } from './ui/world-map';
import { Button } from './ui/moving-border';
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
import { useState, useEffect, useRef } from 'react';

const chainDots = [
  // Path 1
  { start: { lat: 47.6062, lng: -122.3321 }, end: { lat: 19.4326, lng: -99.1332 } },    // Seattle → Mexico City
  { start: { lat: 19.4326, lng: -99.1332 }, end: { lat: -22.9068, lng: -43.1729 } },    // Mexico City → Rio de Janeiro
  { start: { lat: -22.9068, lng: -43.1729 }, end: { lat: 48.8566, lng: 2.3522 } },      // Rio de Janeiro → Paris
  { start: { lat: 48.8566, lng: 2.3522 }, end: { lat: 30.0444, lng: 31.2357 } },        // Paris → Cairo
  { start: { lat: 30.0444, lng: 31.2357 }, end: { lat: 39.9042, lng: 116.4074 } },      // Cairo → Beijing

  // Path 2 (new branch)
  { start: { lat: -33.8688, lng: 151.2093 }, end: { lat: 1.3521, lng: 103.8198 } },     // Sydney → Singapore
  { start: { lat: 1.3521, lng: 103.8198 }, end: { lat: 16.8409, lng: 96.1735 } },       // Singapore → Yangon
  { start: { lat: 16.8409, lng: 96.1735 }, end: { lat: 25.2048, lng: 55.2708 } },       // Yangon → Dubai

  // Path 3 (Africa branch)
  { start: { lat: 6.5244, lng: 3.3792 }, end: { lat: 30.0444, lng: 31.2357 } },        // Lagos → Cairo
  { start: { lat: 6.5244, lng: 3.3792 }, end: { lat: -26.2041, lng: 28.0473 } },        // Lagos → Johannesburg
  { start: { lat: -26.2041, lng: 28.0473 }, end: { lat: 48.8566, lng: 2.3522 } },       // Johannesburg → Paris

  // Path 4 (Japan branch)
  { start: { lat: 35.6762, lng: 139.6503 }, end: { lat: 39.9042, lng: 116.4074 } },     // Tokyo → Beijing
  { start: { lat: 35.6762, lng: 139.6503 }, end: { lat: 1.3521, lng: 103.8198 } },      // Tokyo → Singapore
  { start: { lat: 35.6762, lng: 139.6503 }, end: { lat: 37.5665, lng: 126.9780 } },     // Tokyo → Seoul
];

const navItems = [
  { name: 'Job Portal', link: '/job-portal' },
  { name: 'Resume Builder', link: '/resume-builder' },
  { name: 'CV Verification', link: '/pdf-verification' },
  { name: 'Interview Q&A', link: '/interview-prep' },
  { name: 'Voice Interview', link: '/voice-interview' },
  { name: 'Career Roadmap', link: '/roadmap' },
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

export default function HeroSection() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [profileKey, setProfileKey] = useState(0); // for re-render

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always get JWT and user info on every render
  let jwt = null;
  let user = null;
  if (typeof window !== 'undefined') {
    jwt = localStorage.getItem('jwt');
    if (jwt) user = parseJwt(jwt);
    console.log('JWT token:', jwt);
    console.log('Parsed user data:', user);
  }

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
    setProfileKey((k) => k + 1); // force re-render
  };

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center text-center overflow-hidden">
      {/* WorldMap as background */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-40 flex items-center justify-center pt-20">
        <WorldMap dots={chainDots} simultaneous={true} />
      </div>
      
      {/* Resizable Navbar from shadcn/ui */}
      <Navbar className="fixed top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm navbar-text">
        {/* Desktop Navigation */}
        <NavBody>
          {({ visible }) => (
            <>
              {!visible && <NavbarLogo />}
              <NavItems items={navItems} />
              {!visible && (
                <div className="flex items-center gap-4 -mr-[130px]">
                  {mounted && jwt && user && user.role === 'USER' ? (
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
                            <div className="font-semibold text-black">{user.name || user.username || user.email}</div>
                          </div>
                          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-black" onClick={() => { setDropdown(false); window.location.href='/account'; }}>Account Settings</button>
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
                className="relative text-black font-medium text-lg py-3 px-4 rounded-lg hover:bg-gray-100"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div 
              className="flex w-full flex-col gap-4 mt-6 pt-6 border-t border-gray-200"
            >
              {mounted && jwt && user ? (
                <>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 font-semibold text-black"
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

      {/* Main Content */}
      <div className="max-w-5xl mx-auto z-10 relative px-6 pt-24">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-4">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
          <span className="text-sm font-semibold text-blue-700">Trusted by 50,000+ professionals worldwide</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] mb-8 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          <span className="text-slate-900">Unlock Your</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Career Potential</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed font-medium" style={{ fontFamily: 'var(--font-sans)' }}>
          Transform your career journey with AI-powered tools that create winning resumes, 
          prepare you for interviews, and provide personalized career roadmaps to accelerate your professional growth.
        </p>

        {/* Value Propositions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Resume Builder</h3>
            <p className="text-slate-600 text-sm">AI-powered templates that adapt to your industry and experience level</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Interview Preparation</h3>
            <p className="text-slate-600 text-sm">Practice with industry-specific questions and get real-time feedback</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">AI Career Roadmap</h3>
            <p className="text-slate-600 text-sm">Personalized career guidance with skill development paths and growth strategies</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex justify-center items-center mb-16">
          <Button
            borderRadius="2rem"
            className="bg-white text-slate-900 border-neutral-200 font-semibold text-lg px-8 py-4 h-16 w-auto min-w-[200px]"
            containerClassName="h-16 w-auto min-w-[200px]"
          >
            Get Started
          </Button>
        </div>
        </div>
    </section>
  );
} 