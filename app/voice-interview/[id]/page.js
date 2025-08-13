"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Agent from "@/components/voice-interview/Agent";
import { getRandomInterviewCover } from "@/lib/utils";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/voice-general.action";
import { checkOrCreateFirebaseUser } from "@/lib/actions/voice-auth.action";
import { useAuth } from "@/lib/useAuth";
import DisplayTechIcons from "@/components/voice-interview/DisplayTechIcons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import "@/styles/voice-interview.css";

export default function InterviewDetailsPage({ params }) {
  const { userEmail, isLoading: authLoading, isAuthenticated } = useAuth();
  const [user, setUser] = useState(null);
  const [interview, setInterview] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !userEmail) {
        setLoading(false);
        return;
      }

      try {
        const { id } = await params;
        
        // Get JWT token and Firebase user
        const jwt = localStorage.getItem('jwt');
        if (!jwt) {
          console.error("No JWT token found");
          setLoading(false);
          return;
        }

        const userResult = await checkOrCreateFirebaseUser(jwt);
        if (!userResult.success || !userResult.user) {
          console.error("Failed to get Firebase user:", userResult.message);
          setLoading(false);
          return;
        }

        const firebaseUser = userResult.user;
        setUser(firebaseUser);

        // Fetch interview data
        const interviewData = await getInterviewById(id);
        if (!interviewData) {
          router.push("/voice-interview");
          return;
        }
        setInterview(interviewData);

        // Fetch feedback data
        const feedbackData = await getFeedbackByInterviewId({
          interviewId: id,
          userId: firebaseUser.id,
        });
        setFeedback(feedbackData);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [params, isAuthenticated, userEmail, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">Please log in to take this interview.</p>
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!user || !interview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Interview Not Found</h2>
          <p className="mb-4">The requested interview could not be found.</p>
          <Button asChild>
            <Link href="/voice-interview">Back to Voice Interviews</Link>
          </Button>
        </div>
      </div>
    );
  }

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
      
      {/* Voice Interview Details Content */}
      <div className="voice-interview relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Interview Header */}
            <div className="flex flex-row gap-4 justify-between items-center mb-8 bg-transparent rounded-xl p-6">
              <div className="flex flex-row gap-4 items-center max-sm:flex-col">
                <div className="flex flex-row gap-4 items-center">
                  <Image
                    src={getRandomInterviewCover()}
                    alt="cover-image"
                    width={40}
                    height={40}
                    className="rounded-full object-cover size-[40px]"
                  />
                  <h1 className="text-2xl font-bold capitalize text-gray-800">
                    {interview.role} Interview
                  </h1>
                </div>

                <DisplayTechIcons techStack={interview.techstack} />
              </div>

              <div className="bg-transparent text-gray-800 px-4 py-2 rounded-lg h-fit font-medium border border-gray-300">
                {interview.type}
              </div>
            </div>

            {/* Agent Interface */}
            <Agent
              userName={user.email.split('@')[0]} // Use email prefix as name
              userId={user.id}
              interviewId={interview.id}
              type="interview"
              questions={interview.questions}
              feedbackId={feedback?.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
