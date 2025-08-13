"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert, LuListCollapse, LuArrowUp } from "react-icons/lu";
import { toast } from "react-hot-toast";
import axios from "axios";
import moment from "moment";

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
import Drawer from "@/components/interview/Drawer";
import SkeletonLoader from "@/components/interview/Loader/SkeletonLoader";
import AIResponsePreview from "@/components/interview/AIResponsePreview";
import Timer from "@/components/interview/Timer/Timer";
import ConfirmationModal from "@/components/interview/Modal/ConfirmationModal";

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
  SESSION: {
    GET_ONE: (id) => `/api/sessions/${id}`,
    SUBMIT: (id) => `/api/sessions/${id}/submit`,
    USER_FEEDBACK: (id) => `/api/sessions/${id}/user-feedback`,
  },
  AI: {
    GENERATE_EXPLANATION: "/api/ai/generate-explanation",
  },
  QUESTION: {
    PIN: (id) => `/api/questions/${id}/pin`,
    UPDATE_NOTE: (id) => `/api/questions/${id}/note`,
    ANSWER: (id) => `/api/questions/${id}/answer`,
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

const InterviewPrep = () => {
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

  const [openLeanMoreDrawer, setOpenLeanMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollToQuestionId, setScrollToQuestionId] = useState(null);
  const [timer, setTimer] = useState(60 * 60); // 1 hour in seconds
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [isTimerStopped, setIsTimerStopped] = useState(false);
  const QUESTIONS_PER_PAGE = 5;
  const [showBackToTop, setShowBackToTop] = useState(false);
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
      router.replace("/login?redirect=/interview-prep");
    } else {
      setCheckingAuth(false);
    }
  }, []);

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
      const autoSubmit = async () => {
        try {
          // First, ensure all answers are saved to database
          const savePromises = sessionData.questions.map(async (q) => {
            if (q.userAnswer && q.userAnswer.trim() !== '') {
              try {
                const axiosInstance = getAxiosInstance();
                await axiosInstance.post(API_PATHS.QUESTION.ANSWER(q._id), {
                  answer: q.userAnswer,
                });
                console.log('Auto-saved answer for question:', q._id);
              } catch (error) {
                console.error('Failed to auto-save answer for question:', q._id, error);
              }
            }
          });
          
          await Promise.all(savePromises);
          
          // Then submit the session
          await handleSubmitSession();
          
        } catch (error) {
          console.error("Error auto-submitting:", error);
          toast.error("Failed to auto-submit session");
        }
      };
      
      autoSubmit();
    }
  }, [isTimerExpired, sessionData]);

  // Fetch session data
  const fetchSessionData = async () => {
    if (!sessionId) return;
    
    try {
      const axiosInstance = getAxiosInstance();
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ONE(sessionId));
      
      if (response.data && response.data.session) {
        const session = response.data.session;
        console.log("Session data:", session);
        setSessionData(session);
        
        // Set timer from session data
        if (session.remainingTime !== undefined) {
          setTimer(session.remainingTime);
          if (session.remainingTime <= 0) {
            setIsTimerExpired(true);
          }
        }
      
        // Calculate score only if submitted
        if (session.isFinalSubmitted) {
          const correct = session.questions.filter(
            (q) => q.userAnswer && q.userAnswer === q.answer
          ).length;
          setScore(correct);
          // Stop timer if session is already submitted
          setIsTimerStopped(true);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg("Failed to load interview session");
    }
  };

  useEffect(() => {
    if (!checkingAuth && sessionId) {
      fetchSessionData();
    }
  }, [sessionId, checkingAuth]);

  // Generate Concept Explanation
  const generateConceptExplanation = async (question) => {
    try {
      setErrorMsg("");
      setExplanation(null);

      setIsLoading(true);
      setOpenLeanMoreDrawer(true);

      const axiosInstance = getAxiosInstance();
      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        {
          question,
        }
      );

      if (response.data) {
        setExplanation(response.data);
      }
    } catch (error) {
      setExplanation(null);
      setErrorMsg("Failed to generate explanation, Try again later");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitSession = async () => {
    try {
      setIsLoading(true);
      
      // Prepare answers object
      const answerMap = {};
      sessionData.questions.forEach((q) => {
        answerMap[q._id] = q.userAnswer || "";
      });

      const axiosInstance = getAxiosInstance();
      await axiosInstance.post(API_PATHS.SESSION.SUBMIT(sessionId), {
        answers: answerMap,
      });

      toast.success("Session submitted successfully!");
      setIsTimerStopped(true);
      setShowSubmitConfirmation(false);
      
      // Refresh session data to get feedback
      await fetchSessionData();
      
    } catch (error) {
      console.error("Error submitting session:", error);
      toast.error("Failed to submit session");
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
      await axiosInstance.post(API_PATHS.SESSION.USER_FEEDBACK(sessionId), {
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
        
        <div className=" pt-24">
          <LuCircleAlert className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading Session</h2>
          <p className="text-gray-600 mb-4">{errorMsg}</p>
          <button
            onClick={() => router.push('/interview-prep/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
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
          <SpinnerLoader />
        </div>
      </div>
    );
  }

  const totalQuestions = sessionData.questions?.length || 0;

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
        isCodingTest={false}
      />
      
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
                        const buttonStyle = hasAnswer 
                          ? "bg-green-500 text-white" 
                          : isCurrentPage 
                            ? "bg-blue-500 text-white" 
                            : "bg-gray-200 text-gray-700";

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
                className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
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
                className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
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
              openLeanMoreDrawer ? "md:col-span-7" : "md:col-span-8"
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
                />
              ));
            })()}

            {/* Submit Section */}
            {!sessionData.isFinalSubmitted && !isTimerExpired && (
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Ready to Submit?</h3>
                <p className="text-gray-600 mb-4">
                  Make sure you've answered all questions before submitting. You won't be able to change your answers after submission.
                </p>
                <button
                  onClick={() => setShowSubmitConfirmation(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Interview
                </button>
              </div>
            )}

            {/* Feedback Section */}
            {sessionData.isFinalSubmitted && (
              <div className="mt-8 p-6 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Interview Completed!</h3>
                <p className="text-gray-600 mb-4">
                  Your interview has been submitted. You can view detailed feedback by clicking the button below.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => router.push(`/interview-prep/${sessionId}/feedback`)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View Feedback
                  </button>
                  <button
                    onClick={() => router.push('/interview-prep/dashboard')}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>

                {/* User Feedback Input */}
                <div className="mt-6 pt-6 border-t border-green-200">
                  <h4 className="font-semibold mb-2">Share Your Experience (Optional)</h4>
                  <textarea
                    value={userFeedbackInput}
                    onChange={(e) => setUserFeedbackInput(e.target.value)}
                    placeholder="How was your interview experience? Any suggestions for improvement?"
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                    disabled={userFeedbackSaved}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSaveUserFeedback}
                      disabled={isSavingUserFeedback || userFeedbackSaved || !userFeedbackInput.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingUserFeedback ? "Saving..." : userFeedbackSaved ? "Feedback Saved" : "Save Feedback"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer for AI explanations */}
      <Drawer isOpen={openLeanMoreDrawer} onClose={() => setOpenLeanMoreDrawer(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">AI Explanation</h3>
            <button
              onClick={() => setOpenLeanMoreDrawer(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <LuListCollapse className="w-5 h-5" />
            </button>
          </div>
          {isLoading ? (
            <SkeletonLoader />
          ) : explanation ? (
            <AIResponsePreview response={explanation} />
          ) : (
            <p className="text-gray-600">No explanation available.</p>
          )}
        </div>
      </Drawer>

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
        title="Submit Interview"
        message="Are you sure you want to submit your interview? You won't be able to make changes after submission."
        confirmText="Submit Interview"
        isLoading={isLoading}
      />
    </div>
  );
};

export default InterviewPrep;