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
  { name: "Job Tracker", link: "/job-portal/job-tracker" },
  { name: "Resume Builder", link: "/resume-builder" },
  { name: "CV Verification", link: "/pdf-verification" },
  { name: "Interview Q&A", link: "/interview-prep" },
  { name: "Career Roadmap", link: "/roadmap" },
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
  
  // Debug logging to see the actual data structure
  console.log('Coding Test Session Data:', sessionData);
  console.log('Questions:', sessionData.questions);
  console.log('Feedback:', feedback);
  
  // Handle different possible data structures for coding tests
  let correctAnswers = 0;
  let totalQuestions = 0;
  
  if (sessionData.questions && Array.isArray(sessionData.questions)) {
    totalQuestions = sessionData.questions.length;
    // For coding tests, use the isCorrect field that the backend sets
    correctAnswers = sessionData.questions.filter(q => {
      console.log('Question:', q);
      console.log('User Answer:', q.userAnswer);
      console.log('Correct Answer:', q.answer);
      console.log('Is Correct (Backend):', q.isCorrect);
      
      // Use the backend's isCorrect field if available, otherwise fallback to comparison
      if (q.isCorrect !== undefined) {
        console.log('Using backend isCorrect field:', q.isCorrect);
        return q.isCorrect === true;
      }
      
      // Fallback: try to compare answers directly
      const userAnswer = q.userAnswer || q.submittedAnswer || q.response || q.code;
      const correctAnswer = q.answer || q.correctAnswer || q.solution || q.expectedAnswer;
      
      if (!userAnswer || !correctAnswer) {
        console.log('Missing answer data');
        return false;
      }
      
      // Simple string comparison for fallback
      const isCorrect = userAnswer.trim() === correctAnswer.trim();
      console.log('Fallback comparison result:', isCorrect);
      
      return isCorrect;
    }).length;
  }
  
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  console.log('Calculated Score:', { correctAnswers, totalQuestions, percentage });

  // Extract percentage from summary if available, otherwise use calculated percentage
  let overallPercent = percentage;
  if (feedback && feedback.summary) {
    const match = feedback.summary.match(/(\d+)% accuracy/);
    if (match) {
      // For coding tests, prioritize the calculated percentage over summary
      // as the summary might use a different marking scheme
      console.log('Summary shows:', parseInt(match[1]), 'but calculated shows:', percentage);
      // Use calculated percentage for accuracy
      overallPercent = percentage;
    } else {
      // If no percentage found in summary, use calculated percentage
      overallPercent = percentage;
      console.log('Using calculated percentage:', overallPercent);
    }
  }
  
  // Ensure we always show the actual calculated score
  overallPercent = percentage;

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
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg backdrop-blur-sm">
                  Key2Career
                </div>
                <div className="bg-white/20 backdrop-blur-md border border-white/30 text-cyan-800 px-4 py-2 rounded-xl text-sm font-medium shadow-lg">
                  {sessionData?.role || "Target Role"}
                </div>
                <div className="bg-white/20 backdrop-blur-md border border-white/30 text-cyan-800 px-4 py-2 rounded-xl text-sm font-medium shadow-lg">
                  {sessionData?.topicsToFocus || "Topics to Focus"}
                </div>
              </div>
              <button
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 text-sm font-medium shadow-lg backdrop-blur-sm"
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
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-100/20 to-blue-100/20 rounded-2xl"></div>
                
                <div className="relative z-10">
                  <h3 className="text-sm font-semibold text-cyan-800 mb-3 text-center">Overall</h3>
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                        <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-lg font-bold text-cyan-700">{overallPercent}%</span>
                        </div>
                      </div>
                      {/* Water ripple effect */}
                      <div className="absolute inset-0 rounded-full bg-cyan-300/30 animate-ping"></div>
                    </div>
                    <div className="text-xs text-cyan-700 font-medium">
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
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-50/20 to-blue-50/20 rounded-2xl"></div>
                  
                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-cyan-800 mb-4 flex items-center">
                      <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full mr-3"></div>
                      Skills Breakdown
                    </h3>
                    
                    <div className="space-y-4">
                      {feedback.skillsBreakdown.map((item, idx) => {
                        const total = item.total || 5;
                        const percentage = total > 0 ? Math.round((item.score / total) * 100) : 0;
                        
                        return (
                          <div key={idx} className="border-b border-white/30 pb-4 last:border-b-0 last:pb-0">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-cyan-800 text-sm">{item.skill}</span>
                              <span className="text-xs bg-cyan-100/50 backdrop-blur-sm text-cyan-700 px-2 py-1 rounded-md font-medium border border-cyan-200/30">
                                {item.score}/{total}
                              </span>
                            </div>
                            <div className="w-full bg-white/30 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-white/20">
                              <div 
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-cyan-600 mt-1 font-medium">
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
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-50/20 to-green-50/20 rounded-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-teal-500 to-green-500 rounded-full flex items-center justify-center mr-2 shadow-lg">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <h3 className="text-sm font-semibold text-teal-800">Strengths</h3>
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
                      <p className="text-gray-600 italic text-sm">No specific strengths identified.</p>
                    )}
                  </div>
                </div>

                {/* Areas for Improvement Card - Water Droplet */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-2xl relative overflow-hidden">
                  {/* Water droplet layers */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-50/20 to-blue-50/20 rounded-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mr-2 shadow-lg">
                        <span className="text-white text-xs">×</span>
                      </div>
                      <h3 className="text-sm font-semibold text-rose-700">Areas for Improvement</h3>
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
                      <p className="text-gray-600 italic text-sm">No specific areas identified.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary Section - Water Glass */}
              {feedback.summary && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-2xl relative overflow-hidden">
                  {/* Water glass layers */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/20 to-cyan-50/20 rounded-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-2 shadow-lg">
                        <span className="text-white text-xs">!</span>
                      </div>
                      <h3 className="text-sm font-semibold text-blue-800">Summary</h3>
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
                          Performance Quality Assessment
                        </h4>
                        <div className="text-gray-700 text-sm leading-relaxed">
                          {overallPercent >= 80 ? (
                            <p>🎯 <strong>Excellent Performance:</strong> You demonstrated exceptional knowledge and problem-solving skills. Your responses were well-structured, accurate, and showed deep understanding of the concepts.</p>
                          ) : overallPercent >= 60 ? (
                            <p>✅ <strong>Good Performance:</strong> You showed solid understanding of core concepts with room for improvement in specific areas. Your approach was generally correct with some minor gaps.</p>
                          ) : overallPercent >= 40 ? (
                            <p>⚠️ <strong>Fair Performance:</strong> You have a basic understanding but need more practice in several key areas. Focus on strengthening fundamental concepts and problem-solving techniques.</p>
                          ) : (
                            <p>📚 <strong>Needs Improvement:</strong> Consider revisiting the foundational concepts and practicing more problems. Focus on understanding core principles before tackling advanced topics.</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Additional Suggestions */}
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                        <h4 className="text-xs font-semibold text-gray-800 mb-2 flex items-center">
                          <span className="w-2 h-2 bg-gray-600 rounded-full mr-2"></span>
                          Additional Suggestions
                        </h4>
                        <div className="space-y-2">
                          <div className="text-gray-700 text-sm">
                            <p className="mb-2"><strong>📖 Study Recommendations:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-xs ml-2 text-gray-700">
                              <li>Review the topics where you scored lowest</li>
                              <li>Practice similar problems to build confidence</li>
                              <li>Focus on understanding underlying concepts rather than memorizing</li>
                              <li>Consider joining study groups or finding a mentor</li>
                            </ul>
                          </div>
                          
                          <div className="text-gray-700 text-sm">
                            <p className="mb-2"><strong>⏰ Time Management:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-xs ml-2 text-gray-700">
                              <li>Practice with time constraints to improve speed</li>
                              <li>Learn to quickly identify problem types</li>
                              <li>Develop a systematic approach to problem-solving</li>
                            </ul>
                          </div>
                          
                          <div className="text-gray-700 text-sm">
                            <p className="mb-2"><strong>🎯 Next Steps:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-xs ml-2 text-gray-700">
                              <li>Take more practice sessions focusing on weak areas</li>
                              <li>Review this feedback after each practice session</li>
                              <li>Track your progress over time</li>
                              <li>Consider scheduling regular review sessions</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      {/* Encouragement Message */}
                      <div className="bg-gradient-to-r from-gray-50/50 to-slate-50/50 backdrop-blur-sm rounded-xl p-3 border border-gray-200/30">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          💪 <strong>Keep Going!</strong> Every practice session is a step toward improvement. Focus on progress rather than perfection, and remember that consistent practice is the key to success.
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