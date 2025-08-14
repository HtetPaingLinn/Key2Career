"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert, LuArrowUp } from "react-icons/lu";
import { toast } from "react-hot-toast";
import axios from "axios";

// Import components
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
import SpinnerLoader from "@/components/interview/Loader/SpinnerLoader";
import RoleInfoHeader from "@/components/interview/RoleInfoHeader";
import QuestionCard from "@/components/interview/Cards/QuestionCard";
import SkeletonLoader from "@/components/interview/Loader/SkeletonLoader";
import Timer from "@/components/interview/Timer/Timer";
import ConfirmationModal from "@/components/interview/Modal/ConfirmationModal";
import moment from "moment";

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

// API configuration for standalone backend
const API_BASE_URL = "http://localhost:5001";
const API_PATHS = {
  ACTUAL: {
    GET_ONE: (id) => `/api/actual/${id}`,
    ANSWER: (id) => `/api/actual/answer/${id}`,
    SUBMIT: (id) => `/api/actual/${id}/submit`,
    USER_FEEDBACK: (id) => `/api/actual/${id}/user-feedback`,
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

const QUESTIONS_PER_PAGE = 5;

const CodingTestSession = () => {
  const params = useParams();
  const sessionId = params.sessionId;
  const router = useRouter();

  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [dropdown, setDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileKey, setProfileKey] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollToQuestionId, setScrollToQuestionId] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const [timer, setTimer] = useState(60 * 60); // 1 hour in seconds
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [isTimerStopped, setIsTimerStopped] = useState(false);
  
  const [userFeedbackInput, setUserFeedbackInput] = useState("");
  const [isSavingUserFeedback, setIsSavingUserFeedback] = useState(false);
  const [userFeedbackSaved, setUserFeedbackSaved] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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

  // Auth check
  useEffect(() => {
    const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
    if (!jwt) {
      router.replace("/login?redirect=/interview-prep/coding-test");
    } else {
      setCheckingAuth(false);
    }
  }, []);

  // Fetch session data
  const fetchSessionData = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      const axiosInstance = getAxiosInstance();
      const response = await axiosInstance.get(API_PATHS.ACTUAL.GET_ONE(sessionId));
      
      if (response.data && (response.data.session || response.data)) {
        const session = response.data.session || response.data;
        console.log("Coding test session data:", session);
        setSessionData(session);
        
        // Set timer from session data
        if (session.remainingTime !== undefined) {
          setTimer(session.remainingTime);
          if (session.remainingTime <= 0) {
            setIsTimerExpired(true);
          }
        }

        // Stop timer if session is already submitted
        if (session.isFinalSubmitted) {
          setIsTimerStopped(true);
        }
      }
    } catch (error) {
      console.error("Error fetching session:", error);
      setErrorMsg("Failed to load coding test session");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!checkingAuth && sessionId) {
      fetchSessionData();
    }
  }, [sessionId, checkingAuth]);

  // Timer effect
  useEffect(() => {
    if (timer <= 0 || isTimerStopped) {
      if (timer <= 0) {
        setIsTimerExpired(true);
      }
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setIsTimerExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, isTimerStopped]);

  // Auto-submit when timer expires
  useEffect(() => {
    if (isTimerExpired && sessionData && !sessionData.isFinalSubmitted) {
      handleAutoSubmit();
    }
  }, [isTimerExpired, sessionData]);

  const handleAutoSubmit = async () => {
    try {
      // First, ensure all answers are saved to database
      const savePromises = sessionData.questions.map(async (q) => {
        if (q.userAnswer && q.userAnswer.trim() !== '') {
          try {
            const axiosInstance = getAxiosInstance();
            await axiosInstance.post(API_PATHS.ACTUAL.ANSWER(q._id), {
              answer: q.userAnswer,
            });
            console.log('Auto-saved answer for question:', q._id);
          } catch (error) {
            console.error('Failed to auto-save answer for question:', q._id, error);
          }
        }
      });
      
      await Promise.all(savePromises);
      
      const answerMap = {};
      sessionData.questions.forEach((q) => {
        answerMap[q._id] = q.userAnswer || "";
      });

      const axiosInstance = getAxiosInstance();
      await axiosInstance.post(API_PATHS.ACTUAL.SUBMIT(sessionId), {
        answers: answerMap,
      });

      toast.success("Time's up! Test submitted automatically.");
      setIsTimerStopped(true);
      
      // Refresh session data to get feedback
      await fetchSessionData();
      
    } catch (error) {
      console.error("Error auto-submitting:", error);
      toast.error("Failed to auto-submit test");
    }
  };

  const handleSubmitSession = async () => {
    try {
      setIsLoading(true);
      
      const answerMap = {};
      sessionData.questions.forEach((q) => {
        answerMap[q._id] = q.userAnswer || "";
      });

      const axiosInstance = getAxiosInstance();
      await axiosInstance.post(API_PATHS.ACTUAL.SUBMIT(sessionId), {
        answers: answerMap,
      });

      toast.success("Coding test submitted successfully!");
      setIsTimerStopped(true);
      setShowSubmitConfirmation(false);
      
      // Refresh session data to get feedback
      await fetchSessionData();
      
    } catch (error) {
      console.error("Error submitting session:", error);
      toast.error("Failed to submit coding test");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUserFeedback = async () => {
    if (!userFeedbackInput.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    try {
      setIsSavingUserFeedback(true);
      const axiosInstance = getAxiosInstance();
      await axiosInstance.post(API_PATHS.ACTUAL.USER_FEEDBACK(sessionId), {
        feedback: userFeedbackInput.trim(),
      });

      toast.success("Feedback saved successfully!");
      setUserFeedbackSaved(true);
    } catch (error) {
      console.error("Error saving user feedback:", error);
      toast.error("Failed to save feedback");
    } finally {
      setIsSavingUserFeedback(false);
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

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isLoading) {
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
                    <div className="flex items-center space-x-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </div>
                )}
              </>
            )}
          </NavBody>
        </Navbar>

        <div className="flex justify-center items-center min-h-[400px] pt-24">
          <SpinnerLoader />
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar className="fixed top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <NavBody>
            {({ visible }) => (
              <>
                {!visible && <NavbarLogo />}
                <NavItems items={navItems} />
              </>
            )}
          </NavBody>
        </Navbar>
        
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center pt-24">
          <LuCircleAlert className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading Session</h2>
          <p className="text-gray-600 mb-4">{errorMsg}</p>
          <button
            onClick={() => router.push('/interview-prep/coding-test')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Coding Tests
          </button>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar className="fixed top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <NavBody>
            {({ visible }) => (
              <>
                {!visible && <NavbarLogo />}
                <NavItems items={navItems} />
              </>
            )}
          </NavBody>
        </Navbar>
        
        <div className="flex justify-center items-center min-h-[400px] pt-24">
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  const totalQuestions = sessionData.questions?.length || 0;
  const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const currentQuestions = sessionData.questions?.slice(startIndex, startIndex + QUESTIONS_PER_PAGE) || [];

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
                  <div className="flex items-center space-x-4">
                    {/* Timer
                    <Timer 
                      initialTime={timer}
                      onExpire={() => setIsTimerExpired(true)}
                      isStopped={isTimerStopped}
                      className="text-center text-sm"
                    /> */}
                    
                    {mounted && jwt && user ? (
                      <div className="relative" key={profileKey}>
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
                </div>
              )}
            </>
          )}
        </NavBody>
      </Navbar>

      {/* Role Info Header */}
      <RoleInfoHeader
        role={sessionData.role}
        topicsToFocus={sessionData.topicsToFocus}
        experience={sessionData.experience}
        questions={totalQuestions}
        description={sessionData.description}
        lastUpdated={moment(sessionData.updatedAt).format("Do MMM YYYY")}
      />
      
      {/* Question Page Indicator */}
      <div className="flex justify-end pr-8 mt-4">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 border border-gray-200">
          <span className="text-sm text-gray-600 font-medium">Page:</span>
          <div className="flex gap-1">
            {Array.from({ length: Math.ceil(totalQuestions / QUESTIONS_PER_PAGE) }, (_, i) => i + 1).map((pageNum) => {
              const isCurrentPage = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => {
                    setCurrentPage(pageNum);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors cursor-pointer hover:opacity-80 ${
                    isCurrentPage 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-row w-full">
        {/* left panel: Mini Map */}
        <div className="container w-1/4 max-h-[80vh] sticky flex flex-col items-center top-24">
          {/* Timer display */}
          <Timer 
            initialTime={timer}
            onExpire={() => setIsTimerExpired(true)}
            className="mb-4 mt-8"
            isStopped={isTimerStopped}
          />
          {sessionData?.questions && sessionData.questions.length > 0 && (
            <div className="bg-transparent rounded-lg p-4 mt-4">
              <div className="flex flex-row flex-wrap gap-x-1">
                {(() => {
                  const questions = sessionData.questions;
                  const columns = Math.ceil(questions.length / 5);
                  const grouped = Array.from({ length: columns }, (_, colIdx) =>
                    questions.slice(colIdx * 5, colIdx * 5 + 5)
                  );

                  return grouped.map((group, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-y-1">
                      {group.map((q, i) => {
                        const idx = colIndex * 5 + i;
                        const page = Math.floor(idx / QUESTIONS_PER_PAGE) + 1;
                        const isCurrentPage = page === currentPage;

                        // Determine button styling based on answer status
                        const hasAnswer = q.userAnswer && q.userAnswer.trim() !== '';
                        let buttonStyle;
                        
                        if (sessionData.isFinalSubmitted) {
                          // After submission: green for correct, red for incorrect
                          const isCorrect = q.userAnswer && q.userAnswer === q.answer;
                          buttonStyle = isCorrect 
                            ? "bg-green-500 text-white" 
                            : "bg-red-500 text-white";
                        } else {
                          // Before submission: orange for current page, blue for answered questions, gray for others
                          if (isCurrentPage) {
                            buttonStyle = "bg-orange-500 text-white";
                          } else if (hasAnswer) {
                            buttonStyle = "bg-blue-500 text-white";
                          } else {
                            buttonStyle = "bg-gray-200 text-gray-700";
                          }
                        }

                        return (
                          <button
                            key={q._id}
                            className={`w-8 h-8 text-xs font-medium rounded ${buttonStyle} hover:opacity-80 transition-opacity`}
                            onClick={() => {
                              setCurrentPage(page);
                              setScrollToQuestionId(q._id);
                              setTimeout(() => {
                                const element = document.getElementById(`question-card-${q._id}`);
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                              }, 100);
                            }}
                            title={`Question ${idx + 1}${hasAnswer ? ' (Answered)' : ''}`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
          
          {/* Pagination Controls */}
          {sessionData?.questions && sessionData.questions.length > QUESTIONS_PER_PAGE && (
            <div className="flex items-center gap-2 mt-4">
              <button
                className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 text-black"
                onClick={() => {
                  setCurrentPage((prev) => {
                    const newPage = Math.max(1, prev - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return newPage;
                  });
                }}
                disabled={currentPage === 1}
                aria-label="Previous Page"
              >
                &#8592;
              </button>
              <span className="text-sm text-gray-600">
                {currentPage} / {Math.ceil(sessionData.questions.length / QUESTIONS_PER_PAGE)}
              </span>
              <button
                className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 text-black"
                onClick={() => {
                  setCurrentPage((prev) => {
                    const nextPage = Math.min(prev + 1, Math.ceil(sessionData.questions.length / QUESTIONS_PER_PAGE));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return nextPage;
                  });
                }}
                disabled={currentPage === Math.ceil(sessionData.questions.length / QUESTIONS_PER_PAGE)}
                aria-label="Next Page"
              >
                &#8594;
              </button>
            </div>
          )}
        </div>

        <div className="w-full gap-4 mt-8 mb-10">
          <div
            className={`col-span-12 ${
              false ? "md:col-span-7" : "md:col-span-8"
            } `}
          >
            {/* Questions */}
            {(() => {
              if (!sessionData?.questions) return null;
              const startIdx = (currentPage - 1) * QUESTIONS_PER_PAGE;
              const endIdx = startIdx + QUESTIONS_PER_PAGE;
              const paginatedQuestions = sessionData.questions.slice(startIdx, endIdx);
              return paginatedQuestions.map((data, index) => (
                <QuestionCard
                  key={data._id}
                  questionId={data._id}
                  question={data.question}
                  answer={data.answer}
                  userAnswer={data.userAnswer}
                  isFinalSubmitted={sessionData?.isFinalSubmitted}
                  id={`question-card-${data._id}`}
                  questionNumber={startIdx + index + 1}
                  type={data.type}
                  customApiEndpoint={API_PATHS.ACTUAL.ANSWER(data._id)}
                  onAnswerChange={(questionId, newAnswer) => {
                    setSessionData(prev => ({
                      ...prev,
                      questions: prev.questions.map(q => 
                        q._id === questionId ? { ...q, userAnswer: newAnswer } : q
                      )
                    }));
                  }}
                />
              ));
            })()}

            {/* Submit Section */}
            {!sessionData.isFinalSubmitted && !isTimerExpired && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setShowSubmitConfirmation(true)}
                  className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ 
                    background: 'linear-gradient(to right, rgb(47, 114, 47), oklch(0.51 0.2 145.36))'
                  }}
                >
                  Submit Coding Test
                </button>
              </div>
            )}

            {/* Feedback Section */}
            {sessionData.isFinalSubmitted && (
              <>
                {/* Pagination Controls */}
                {sessionData?.questions && sessionData.questions.length > QUESTIONS_PER_PAGE && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                      className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 text-black"
                      onClick={() => {
                        setCurrentPage((prev) => {
                          const newPage = Math.max(1, prev - 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          return newPage;
                        });
                      }}
                      disabled={currentPage === 1}
                      aria-label="Previous Page"
                    >
                      ←
                    </button>
                    <span className="text-sm text-gray-600">
                      {currentPage} / {Math.ceil(sessionData.questions.length / QUESTIONS_PER_PAGE)}
                    </span>
                    <button
                      className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 text-black"
                      onClick={() => {
                        setCurrentPage((prev) => {
                          const nextPage = Math.min(prev + 1, Math.ceil(sessionData.questions.length / QUESTIONS_PER_PAGE));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          return nextPage;
                        });
                      }}
                      disabled={currentPage === Math.ceil(sessionData.questions.length / QUESTIONS_PER_PAGE)}
                      aria-label="Next Page"
                    >
                      →
                    </button>
                  </div>
                )}
                
                <div className="mt-8 flex justify-center gap-4">
                  <button
                    onClick={() => router.push(`/interview-prep/coding-test/${sessionId}/feedback`)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View Feedback
                  </button>
                  <button
                    onClick={() => router.push('/interview-prep/coding-test')}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Back to Tests
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-20 right-4 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-40"
          >
            <LuArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Submit Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSubmitConfirmation}
        onClose={() => setShowSubmitConfirmation(false)}
        onConfirm={handleSubmitSession}
        title="Submit Coding Test"
        message="Are you sure you want to submit your coding test? You won't be able to make changes after submission."
        confirmText="Submit Test"
        isLoading={isLoading}
      />
    </div>
  );
};

export default CodingTestSession;
