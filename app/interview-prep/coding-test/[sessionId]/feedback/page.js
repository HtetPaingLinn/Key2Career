"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
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
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";

const navItems = [
  { name: "Job Tracker", link: "#" },
  { name: "Resume Builder", link: "/resume-builder" },
  { name: "CV Verification", link: "#" },
  { name: "Interview Q&A", link: "/interview-prep" },
  { name: "Career Roadmap", link: "#" },
];

// API configuration for standalone backend
const API_BASE_URL = "http://localhost:5001";
const API_PATHS = {
  ACTUAL: {
    GET_ONE: (id) => `/api/actual/${id}`,
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

const CodingTestFeedback = () => {
  const params = useParams();
  const sessionId = params.sessionId;
  const router = useRouter();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [dropdown, setDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileKey, setProfileKey] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
    if (!jwt) {
      router.replace("/login?redirect=/interview-prep/coding-test");
    } else {
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    if (!checkingAuth && sessionId) {
      const fetchSession = async () => {
        try {
          setLoading(true);
          const axiosInstance = getAxiosInstance();
          const response = await axiosInstance.get(API_PATHS.ACTUAL.GET_ONE(sessionId));
          
          if (response.data && (response.data.session || response.data)) {
            const session = response.data.session || response.data;
            setSessionData(session);
          }
        } catch (error) {
          console.error("Error fetching session:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSession();
    }
  }, [sessionId, checkingAuth]);

  useEffect(() => { setMounted(true); }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <Navbar className="fixed top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <NavBody>
            {({ visible }) => (
              <>
                {!visible && <NavbarLogo />}
                <NavItems items={navItems} />
                {!visible && (
                  <div className="flex items-center gap-4 -mr-[130px]">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </>
            )}
          </NavBody>
        </Navbar>
        <div className="p-10 text-center pt-20">Loading...</div>
      </div>
    );
  }

  if (!sessionData?.feedback) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar className="fixed top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <NavBody>
            {({ visible }) => (
              <>
                {!visible && <NavbarLogo />}
                <NavItems items={navItems} />
                {!visible && (
                  <div className="flex items-center gap-4 -mr-[130px]">
                    {mounted && jwt && user ? (
                      <div className="relative mr-8 order-first" key={profileKey}>
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
        </Navbar>
        
        <div className="max-w-5xl mx-auto p-4 pt-20">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Feedback Available</h1>
            <p className="text-gray-600 mb-6">Feedback is not available for this coding test yet.</p>
            <button
              onClick={() => router.push('/interview-prep/coding-test')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Coding Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  const feedback = sessionData.feedback;
  const correctAnswers = sessionData.questions?.filter(q => q.userAnswer === q.answer).length || 0;
  const totalQuestions = sessionData.questions?.length || 0;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // Extract percentage from summary if available
  let overallPercent = percentage;
  if (feedback.summary) {
    const match = feedback.summary.match(/(\d+)% accuracy/);
    if (match) {
      overallPercent = parseInt(match[1]);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar className="fixed top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <NavBody>
          {({ visible }) => (
            <>
              {!visible && <NavbarLogo />}
              <NavItems items={navItems} />
              {!visible && (
                <div className="flex items-center gap-4 -mr-[130px]">
                  {mounted && jwt && user ? (
                    <div className="relative mr-8 order-first" key={profileKey}>
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
      </Navbar>

      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-5xl mx-auto p-4 pt-4">
          
          {/* Water-like Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg backdrop-blur-sm">
                  Coding Test
                </div>
                <div className="bg-white/20 backdrop-blur-md border border-white/30 text-green-800 px-4 py-2 rounded-xl text-sm font-medium shadow-lg">
                  {sessionData?.role || "Target Role"}
                </div>
                <div className="bg-white/20 backdrop-blur-md border border-white/30 text-green-800 px-4 py-2 rounded-xl text-sm font-medium shadow-lg">
                  {sessionData?.topicsToFocus || "Topics to Focus"}
                </div>
              </div>
              <button
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-300 text-sm font-medium shadow-lg backdrop-blur-sm"
                onClick={() => router.push(`/interview-prep/coding-test/${sessionId}`)}
              >
                ← Back to Test
              </button>
            </div>
          </div>

          {/* Water-like Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            
            {/* Overall Performance - Water Droplet Style */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-2xl sticky top-4 relative overflow-hidden">
                {/* Water droplet effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-100/20 to-teal-100/20 rounded-2xl"></div>
                
                <div className="relative z-10">
                  <h3 className="text-sm font-semibold text-green-800 mb-3 text-center">Overall</h3>
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center shadow-lg">
                        <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-lg font-bold text-green-700">{overallPercent}%</span>
                        </div>
                      </div>
                      {/* Water ripple effect */}
                      <div className="absolute inset-0 rounded-full bg-green-300/30 animate-ping"></div>
                    </div>
                    <div className="text-xs text-green-700 font-medium">
                      Performance
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {correctAnswers}/{totalQuestions} Correct
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Skills Breakdown - Water Glass Effect */}
              {feedback.skillsBreakdown && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-2xl relative overflow-hidden">
                  {/* Water glass layers */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-50/20 to-teal-50/20 rounded-2xl"></div>
                  
                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                      <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-teal-500 rounded-full mr-3"></div>
                      Skills Breakdown
                    </h3>
                    
                    <div className="space-y-4">
                      {feedback.skillsBreakdown.map((item, idx) => {
                        const total = item.total || 5;
                        const percentage = total > 0 ? Math.round((item.score / total) * 100) : 0;
                        
                        return (
                          <div key={idx} className="border-b border-white/30 pb-4 last:border-b-0 last:pb-0">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-green-800 text-sm">{item.skill}</span>
                              <span className="text-xs bg-green-100/50 backdrop-blur-sm text-green-700 px-2 py-1 rounded-md font-medium border border-green-200/30">
                                {item.score}/{total}
                              </span>
                            </div>
                            <div className="w-full bg-white/30 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-white/20">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-green-600 mt-1 font-medium">
                              {percentage}% proficiency
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Strengths and Improvements - Water Droplets */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Strengths Card - Water Droplet */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-2xl relative overflow-hidden">
                  {/* Water droplet layers */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-50/20 to-green-50/20 rounded-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mr-2 shadow-lg">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <h3 className="text-sm font-semibold text-emerald-800">Strengths</h3>
                    </div>
                    {feedback.strengths && feedback.strengths.length > 0 ? (
                      <ul className="space-y-2">
                        {feedback.strengths.slice(0, 4).map((item, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-gray-600 mr-2 mt-0.5 text-xs">•</span>
                            <span className="text-gray-700 text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 italic text-sm">Good problem-solving approach and code structure.</p>
                    )}
                  </div>
                </div>

                {/* Areas for Improvement Card - Water Droplet */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-2xl relative overflow-hidden">
                  {/* Water droplet layers */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-50/20 to-red-50/20 rounded-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-2 shadow-lg">
                        <span className="text-white text-xs">×</span>
                      </div>
                      <h3 className="text-sm font-semibold text-orange-700">Areas for Improvement</h3>
                    </div>
                    {feedback.areasForImprovement && feedback.areasForImprovement.length > 0 ? (
                      <ul className="space-y-2">
                        {feedback.areasForImprovement.slice(0, 4).map((item, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-gray-600 mr-2 mt-0.5 text-xs">•</span>
                            <span className="text-gray-700 text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 italic text-sm">Focus on algorithm optimization and edge case handling.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Question-by-Question Analysis */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-2xl relative overflow-hidden">
                {/* Water glass layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/20 to-indigo-50/20 rounded-2xl"></div>
                
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-3"></div>
                    Question Analysis
                  </h3>
                  
                  <div className="space-y-4">
                    {sessionData.questions?.map((question, index) => (
                      <div key={question._id} className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">Question {index + 1}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            question.userAnswer === question.answer 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {question.userAnswer === question.answer ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">{question.question}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Your Answer:</span>
                            <p className="text-gray-700 bg-white/30 rounded p-2 mt-1 font-mono text-xs">
                              {question.userAnswer || "No answer provided"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Correct Answer:</span>
                            <p className="text-gray-700 bg-white/30 rounded p-2 mt-1 font-mono text-xs">
                              {question.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary Section - Water Glass */}
              {feedback.summary && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-2xl relative overflow-hidden">
                  {/* Water glass layers */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-50/20 to-pink-50/20 rounded-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-2 shadow-lg">
                        <span className="text-white text-xs">!</span>
                      </div>
                      <h3 className="text-sm font-semibold text-purple-800">Summary & Recommendations</h3>
                    </div>
                    
                    {/* Enhanced Summary Content */}
                    <div className="space-y-4">
                      {/* Main Summary */}
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {feedback.summary}
                        </p>
                      </div>
                      
                      {/* Performance Quality Assessment */}
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                        <h4 className="text-xs font-semibold text-gray-800 mb-2 flex items-center">
                          <span className="w-2 h-2 bg-gray-600 rounded-full mr-2"></span>
                          Coding Performance Assessment
                        </h4>
                        <div className="text-gray-700 text-sm leading-relaxed">
                          {overallPercent >= 80 ? (
                            <p>🏆 <strong>Excellent Coding Skills:</strong> You demonstrated exceptional problem-solving abilities and clean code practices. Your solutions were efficient and well-structured.</p>
                          ) : overallPercent >= 60 ? (
                            <p>✅ <strong>Good Coding Skills:</strong> You showed solid programming fundamentals with room for optimization. Your approach was generally correct with minor improvements needed.</p>
                          ) : overallPercent >= 40 ? (
                            <p>⚠️ <strong>Developing Skills:</strong> You have basic programming knowledge but need more practice with algorithms and data structures. Focus on problem-solving patterns.</p>
                          ) : (
                            <p>📚 <strong>Needs Practice:</strong> Consider strengthening your programming fundamentals. Practice more coding problems and review algorithm concepts.</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Coding Specific Suggestions */}
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                        <h4 className="text-xs font-semibold text-gray-800 mb-2 flex items-center">
                          <span className="w-2 h-2 bg-gray-600 rounded-full mr-2"></span>
                          Coding Practice Recommendations
                        </h4>
                        <div className="space-y-2">
                          <div className="text-gray-700 text-sm">
                            <p className="mb-2"><strong>💻 Technical Skills:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-xs ml-2 text-gray-700">
                              <li>Practice algorithm problems on platforms like LeetCode or HackerRank</li>
                              <li>Review data structures: arrays, linked lists, trees, graphs</li>
                              <li>Study time and space complexity (Big O notation)</li>
                              <li>Learn common algorithm patterns: two pointers, sliding window, etc.</li>
                            </ul>
                          </div>
                          
                          <div className="text-gray-700 text-sm">
                            <p className="mb-2"><strong>🔧 Code Quality:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-xs ml-2 text-gray-700">
                              <li>Write clean, readable code with proper variable names</li>
                              <li>Add comments to explain complex logic</li>
                              <li>Handle edge cases and error conditions</li>
                              <li>Test your solutions with different inputs</li>
                            </ul>
                          </div>
                          
                          <div className="text-gray-700 text-sm">
                            <p className="mb-2"><strong>🎯 Next Steps:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-xs ml-2 text-gray-700">
                              <li>Solve 2-3 coding problems daily</li>
                              <li>Focus on topics you scored lowest in</li>
                              <li>Join coding communities and discuss solutions</li>
                              <li>Take more coding tests to track progress</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      {/* Encouragement Message */}
                      <div className="bg-gradient-to-r from-gray-50/50 to-slate-50/50 backdrop-blur-sm rounded-xl p-3 border border-gray-200/30">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          🚀 <strong>Keep Coding!</strong> Every problem you solve makes you a better programmer. Focus on understanding the logic behind solutions, not just memorizing code.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
        
        <style jsx>{`
          @keyframes ping {
            75%, 100% {
              transform: scale(2);
              opacity: 0;
            }
          }
          .animate-ping {
            animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default CodingTestFeedback;