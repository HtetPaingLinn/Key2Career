"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
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

const CollapsibleNavbar = ({ 
  navItems = [], 
  className = "",
  showMobileNav = true 
}) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [jwt, setJwt] = useState(null);
  const [user, setUser] = useState(null);
  const [dropdown, setDropdown] = useState(false);
  const [profileKey, setProfileKey] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <Navbar className={`fixed top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm ${className}`}>
      {/* Desktop Navigation */}
      <NavBody>
        {({ visible }) => (
          <>
            {!visible && <NavbarLogo />}
            <NavItems items={navItems} />
            {!visible && (
              <div className="flex items-center gap-4 -mr-[130px]">
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
                            <div className="font-semibold text-black">{user.name || user.username || user.email}</div>
                          </div>
                          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-black" onClick={() => { setDropdown(false); window.location.href='/account'; }}>Account Settings</button>
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
            )}
          </>
        )}
      </NavBody>

      {/* Mobile Navigation */}
      {showMobileNav && (
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
            <div className="flex w-full flex-col gap-4 mt-6 pt-6 border-t border-gray-200">
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
      )}
    </Navbar>
  );
};

export default CollapsibleNavbar;
