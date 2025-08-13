"use client";
import Image from "next/image";
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
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { LuPlus } from "react-icons/lu";
import toast from "react-hot-toast";
import moment from "moment";
import axios from "axios";

// Import components
import SummaryCard from "@/components/interview/Cards/SummaryCard";
import Modal from "@/components/interview/Modal";
import CodingTestCreateForm from "@/components/interview/CodingTestCreateForm";
import DeleteAlertContent from "@/components/interview/DeleteAlertContent";


const navItems = [
  { name: "Job Tracker", link: "#" },
  { name: "Resume Builder", link: "/resume-builder" },
  { name: "CV Verification", link: "#" },
  { 
    name: "Interview Q&A", 
    link: "/interview-prep",
    dropdown: [
      { name: "Dashboard", link: "" },
      { name: "Interview Practice", link: "" },
      { name: "Coding Page", link: "" }
    ]
  },
  { name: "Career Roadmap", link: "#" },
];

const CARD_BG = [
  { id: 1, bgcolor: 'linear-gradient(135deg, #e6f8f3 0%, #f7fcfa 100%)' },
  { id: 2, bgcolor: 'linear-gradient(135deg, #fef9e7 0%, #fffdf4 100%)' },
  { id: 3, bgcolor: 'linear-gradient(135deg, #eaf7ff 0%, #f3fbff 100%)' },
  { id: 4, bgcolor: 'linear-gradient(135deg, #fff2e9 0%, #fff8f3 100%)' },
  { id: 5, bgcolor: 'linear-gradient(135deg, #e7f6fe 0%, #f4fafd 100%)' },
  { id: 6, bgcolor: 'linear-gradient(135deg, #f5f5f5 0%, #fbfbfb 100%)' },
  { id: 7, bgcolor: 'linear-gradient(135deg, #fff4fc 0%, #fff8fd 100%)' },
  { id: 8, bgcolor: 'linear-gradient(135deg, #e8fef3 0%, #f5fef8 100%)' },
  { id: 9, bgcolor: 'linear-gradient(135deg, #f0ecff 0%, #f7f5ff 100%)' },
  { id: 10, bgcolor: 'linear-gradient(135deg, #fef2f2 0%, #fff8f8 100%)' },
];

// API configuration for standalone backend
const API_BASE_URL = "http://localhost:5001";
const API_PATHS = {
  ACTUAL: {
    CREATE: "/api/actual/create",
    GET_ALL: "/api/actual/my-sessions",
    GET_ONE: (id) => `/api/actual/${id}`,
    DELETE: (id) => `/api/actual/${id}`,
    SUBMIT: (id) => `/api/actual/${id}/submit`,
    USER_FEEDBACK: (id) => `/api/actual/${id}/user-feedback`,
  },
  AI: {
    GENERATE_QUESTIONS: "/api/ai/generate-questions",
    GENERATE_EXPLANATION: "/api/ai/generate-explanation", 
    GENERATE_FEEDBACK: "/api/ai/generate-feedback",
  },
};

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

export default function CodingTestPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [dropdown, setDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileKey, setProfileKey] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Dashboard states
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
    if (!jwt) {
      router.replace("/login?redirect=/interview-prep/coding-test");
    } else {
      setCheckingAuth(false);
      fetchAllSessions();
    }
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

  // Axios instance for interview backend
  const createAxiosInstance = (token) => {
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
  };

  const getAxiosInstance = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt');
      return createAxiosInstance(token);
    }
    return createAxiosInstance(null);
  };

  const fetchAllSessions = async () => {
    try {
      setIsLoading(true);
      const axiosInstance = getAxiosInstance();
      const response = await axiosInstance.get(API_PATHS.ACTUAL.GET_ALL);
      
      // Handle response like original - data is directly the sessions array
      console.log("Coding test sessions response:", response.data);
      setSessions(response.data || []);
    } catch (error) {
      console.error("Error fetching coding test session data:", error);
      toast.error("Failed to fetch coding test sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionData) => {
    try {
      const axiosInstance = getAxiosInstance();
      await axiosInstance.delete(API_PATHS.ACTUAL.DELETE(sessionData?._id));

      toast.success("Coding Test Session Deleted Successfully");
      setOpenDeleteAlert({
        open: false,
        data: null,
      });
      fetchAllSessions();
    } catch (error) {
      console.error("Error deleting coding test session data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    setDropdown(false);
    setProfileKey(prev => prev + 1);
    router.replace("/login");
  };

  // Get user data for navbar
  let jwt = null;
  let user = null;
  if (typeof window !== 'undefined') {
    jwt = localStorage.getItem('jwt');
    if (jwt) user = parseJwt(jwt);
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar - matching HeroSection.js */}
      <Navbar className="fixed top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
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
                              <div className="font-semibold text-gray-900">{user.name || user.username || user.email}</div>
                            </div>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setDropdown(false); router.push('/account'); }}>Account Settings</button>
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
              {mounted && jwt && user ? (
                <>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 font-semibold"
                    onClick={() => { setIsMobileMenuOpen(false); router.push('/account'); }}
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

      {/* Main Dashboard Content - matching interview-prep-ai */}
      <div className="min-h-screen bg-white relative overflow-hidden pt-24">
        <div className="container mx-auto pt-8 pb-4 relative z-10">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : sessions && sessions.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-1 pb-6 px-4 md:px-0">
              {sessions.map((data, index) => (
                <div key={data?._id} className="h-full flex flex-col">
                  <div className="flex-1 h-full min-h-[400px]">
                    <SummaryCard
                      colors={CARD_BG[index % CARD_BG.length]}
                      role={data?.role || ""}
                      topicsToFocus={data?.topicsToFocus || ""}
                      experience={data?.experience || "-"}
                      questions={data?.questions?.length || "-"}
                      description={data?.description || ""}
                      lastUpdated={
                        data?.updatedAt
                          ? moment(data.updatedAt).format("Do MMM YYYY")
                          : ""
                      }
                      onSelect={() => router.push(`/interview-prep/coding-test/${data?._id}`)}
                      onDelete={() => setOpenDeleteAlert({ open: true, data })}
                    />
                  </div>
                </div>
              ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m-4 4l4 4-4 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No coding tests found</h3>
              <p className="text-gray-500 mb-4">Create your first coding test to get started</p>
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={() => setOpenCreateModal(true)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Coding Test
                </button>
                <button
                  onClick={() => router.push('/interview-prep/dashboard')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Interview Questions
                </button>
              </div>
            </div>
          )}

          {/* Floating Add Button - matching interview-prep-ai but green for coding */}
          <button
            className="h-12 md:h-12 flex items-center justify-center gap-3 text-sm font-semibold text-white px-7 py-2.5 rounded-full transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-green-300 fixed bottom-10 md:bottom-20 right-10 md:right-20 z-20 backdrop-blur-sm"
            style={{ 
              background: 'linear-gradient(to right, rgb(34, 197, 94), rgb(22, 163, 74))'
            }}
            onClick={() => setOpenCreateModal(true)}
          >
            <LuPlus className="text-2xl text-white" />
            Add New
          </button>
        </div>

        {/* Inline Create Form Overlay */}
        {openCreateModal && (
          <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm overflow-y-auto">
            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Create New Coding Test</h2>
                  <button
                    onClick={() => setOpenCreateModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <CodingTestCreateForm
                  onClose={() => setOpenCreateModal(false)}
                  onSuccess={() => {
                    setOpenCreateModal(false);
                    fetchAllSessions();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Delete Alert Modal */}
        <Modal
          isOpen={openDeleteAlert?.open}
          onClose={() => {
            setOpenDeleteAlert({ open: false, data: null });
          }}
          title="Delete Alert"
        >
          <div className="w-[30vw]">
            <DeleteAlertContent
              content="Are you sure you want to delete this coding test session?"
              onDelete={() => deleteSession(openDeleteAlert.data)}
            />
          </div>
        </Modal>
      </div>
    </div>
  );
}