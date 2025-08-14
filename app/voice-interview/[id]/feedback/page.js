"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";

import { Button } from "@/components/ui/button";
import DisplayTechIcons from "@/components/voice-interview/DisplayTechIcons";

import { getFeedbackByInterviewId, getFeedbackByInterviewIdFallback, fixFeedbackUserId } from "@/lib/actions/voice-general.action";
import { getInterviewById } from "@/lib/actions/voice-general.action";
import { checkOrCreateFirebaseUser } from "@/lib/actions/voice-auth.action";
import { useAuth } from "@/lib/useAuth";
import "@/styles/voice-interview.css";

export default function FeedbackPage({ params }) {
  const { userEmail, isLoading: authLoading, isAuthenticated } = useAuth();
  const [interview, setInterview] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting fetchData...');
        console.log('isAuthenticated:', isAuthenticated);
        console.log('userEmail:', userEmail);
        
        if (!isAuthenticated || !userEmail) {
          console.log('Not authenticated or no user email');
          setLoading(false);
          return;
        }

        const { id } = await params;
        console.log('Interview ID from params:', id);
        
        // Get JWT token and Firebase user
        const jwt = localStorage.getItem('jwt');
        if (!jwt) {
          console.log('No JWT token found');
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        console.log('JWT token found, checking Firebase user...');
        const userResult = await checkOrCreateFirebaseUser(jwt);
        if (!userResult.success || !userResult.user) {
          console.log('Failed to get Firebase user:', userResult.message);
          setError('Failed to authenticate user');
          setLoading(false);
          return;
        }

        const firebaseUser = userResult.user;
        console.log('Firebase user found:', firebaseUser);
        setUser(firebaseUser);

        // Fetch interview and feedback data
        console.log('Fetching interview data...');
        const interviewData = await getInterviewById(id);
        console.log('Interview data result:', interviewData);
        
        if (interviewData) {
          setInterview(interviewData);
          console.log('Interview data:', interviewData);
          console.log('Interview userId:', interviewData.userId);
          console.log('Firebase user ID:', firebaseUser.id);

          // Try multiple approaches to find feedback
          let feedbackData = null;
          
          // Method 1: Search with Firebase user ID
          console.log('Method 1 - Searching with Firebase user ID...');
          feedbackData = await getFeedbackByInterviewId({
            interviewId: id,
            userId: firebaseUser.id,
          });
          console.log('Method 1 - Firebase user ID search result:', feedbackData);
          
          // Method 2: If no feedback found, try with interview's userId
          if (!feedbackData && interviewData.userId !== firebaseUser.id) {
            console.log('Method 2 - Trying with interview userId:', interviewData.userId);
            feedbackData = await getFeedbackByInterviewId({
              interviewId: id,
              userId: interviewData.userId,
            });
            console.log('Method 2 result:', feedbackData);
          }
          
          // Method 3: Final fallback - search by interviewId only
          if (!feedbackData) {
            console.log('Method 3 - Using fallback search by interviewId only');
            feedbackData = await getFeedbackByInterviewIdFallback(id);
            console.log('Method 3 result:', feedbackData);
          }
          
          // If feedback was found but with wrong userId, fix it automatically
          if (feedbackData && feedbackData.userId !== firebaseUser.id) {
            console.log('Feedback found with wrong userId, fixing automatically...');
            console.log('Current feedback userId:', feedbackData.userId);
            console.log('Correct userId:', firebaseUser.id);
            
            try {
              const fixResult = await fixFeedbackUserId(feedbackData.id, firebaseUser.id);
              if (fixResult.success) {
                console.log('Successfully fixed feedback userId');
                // Update the feedback object with the correct userId
                feedbackData.userId = firebaseUser.id;
              } else {
                console.error('Failed to fix feedback userId:', fixResult.error);
              }
            } catch (fixError) {
              console.error('Error fixing feedback userId:', fixError);
            }
          }
          
          setFeedback(feedbackData);
        } else {
          console.log('No interview data found');
          setError('Interview not found');
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
        setError(error.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [params, isAuthenticated, userEmail, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Feedback</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button asChild>
            <Link href="/voice-interview">Back to Voice Interviews</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">Please log in to view feedback.</p>
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!interview || !feedback) {
    console.log('Debug - interview:', interview);
    console.log('Debug - feedback:', feedback);
    console.log('Debug - user:', user);
    console.log('Debug - params:', params);
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Feedback Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested feedback could not be loaded.
          </p>
          <div className="text-sm text-gray-500 space-y-1 mb-4">
            <p>Interview: {interview ? 'Found' : 'Not Found'}</p>
            <p>Feedback: {feedback ? 'Found' : 'Not Found'}</p>
            <p>User: {user ? 'Authenticated' : 'Not Authenticated'}</p>
          </div>
          <Button asChild>
            <Link href="/voice-interview">Back to Voice Interviews</Link>
          </Button>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  return (
    <div className="voice-interview">
      <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Interview Feedback
            </h1>
            <p className="text-xl text-gray-600">
              Your Performance Journey Visualized
            </p>
          </div>

          {/* Overall Score Card */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20 relative overflow-hidden">
              <div className="text-center space-y-8 relative z-10">
                <div className="relative mx-auto w-44 h-44">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center border-8 border-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 shadow-2xl relative overflow-hidden">
                    <span className="text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent relative z-10">
                      {feedback?.totalScore || 'N/A'}
                    </span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Overall Score
                </h3>
                <div className="flex items-center justify-center gap-3 text-gray-500 text-sm font-medium">
                  <div className="w-5 h-5 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center">
                    <Image
                      src="/calendar.svg"
                      width={12}
                      height={12}
                      alt="calendar"
                      className="filter dark:invert"
                    />
                  </div>
                  <span>
                    {feedback?.createdAt
                      ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags Row */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <span className="px-5 py-2.5 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 rounded-full text-xs font-semibold shadow-lg border border-emerald-200">
              ✨ Interview
            </span>
            <span className="px-5 py-2.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg border border-blue-200">
              <span>🚀 Techstack:</span>
              <span className="font-bold">{interview?.techstack?.join(", ") || 'N/A'}</span>
            </span>
            <span className="px-5 py-2.5 bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 rounded-full text-xs font-semibold shadow-lg border border-slate-200">
              📋 {interview?.type || 'N/A'}
            </span>
          </div>

          {/* Strengths & Areas for Improvement */}
          <div className="grid md:grid-cols-2 gap-10">
            {/* Strengths Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-white/20">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center shadow-xl border-4 border-emerald-200">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Strengths
                </h3>
              </div>
              <ul className="space-y-4">
                {feedback?.strengths?.map((strength, index) => (
                  <li key={index} className="flex items-start gap-4 text-gray-700 text-base p-3 rounded-xl">
                    <span className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full mt-2 flex-shrink-0 shadow-md" />
                    {strength}
                  </li>
                )) || (
                  <li className="text-gray-500 italic">No strengths data available</li>
                )}
              </ul>
            </div>

            {/* Areas for Improvement Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-white/20">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-red-100 rounded-full flex items-center justify-center shadow-xl border-4 border-rose-200">
                  <svg className="w-7 h-7 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
                  Areas for Improvement
                </h3>
              </div>
              <ul className="space-y-4">
                {feedback?.areasForImprovement?.map((area, index) => (
                  <li key={index} className="flex items-start gap-4 text-gray-700 text-base p-3 rounded-xl">
                    <span className="w-3 h-3 bg-gradient-to-r from-rose-400 to-red-400 rounded-full mt-2 flex-shrink-0 shadow-md" />
                    {area}
                  </li>
                )) || (
                  <li className="text-gray-500 italic">No improvement areas data available</li>
                )}
              </ul>
            </div>
          </div>

          {/* Detailed Breakdown Section */}
          {feedback?.categoryScores && feedback.categoryScores.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20">
              <div className="flex items-center gap-5 mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-xl border-4 border-blue-200">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Detailed Breakdown
                </h3>
              </div>

              <div className="space-y-8">
                {feedback.categoryScores.map((category, index) => (
                  <div key={index} className="space-y-5 p-8 bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm rounded-2xl border border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-700">
                        {index + 1}. {category.name}
                      </span>
                      <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {category.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200/80 rounded-full h-4 shadow-inner overflow-hidden">
                      <div 
                        className="h-4 rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 shadow-md transition-all duration-1000 ease-out"
                        style={{ width: `${category.score}%` }}
                      />
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {category.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Assessment */}
          {feedback?.finalAssessment && (
            <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/30">
              <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Final Assessment
              </h3>
              <p className="text-gray-700 text-base leading-relaxed text-center max-w-6xl mx-auto">
                {feedback.finalAssessment}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-row justify-center gap-6 mt-12 mb-8">
            <Button asChild className="bg-white/90 backdrop-blur-sm text-gray-700 border-2 border-gray-200 hover:bg-gray-50 px-8 py-4 rounded-2xl font-semibold shadow-xl">
              <Link href="/voice-interview" className="flex items-center gap-2">
                <span>←</span>
                Back to Voice Interviews
              </Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 px-8 py-4 rounded-2xl font-semibold shadow-xl">
              <Link href={`/voice-interview/${interview?.id}`} className="flex items-center gap-2">
                <span>🔄</span>
                Retake Interview
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
