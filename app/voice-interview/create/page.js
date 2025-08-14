"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Agent from "@/components/voice-interview/Agent";
import { checkOrCreateFirebaseUser } from "@/lib/actions/voice-auth.action";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import "@/styles/voice-interview.css";

export default function VoiceInterviewCreatePage() {
  const { userEmail, isLoading: authLoading, isAuthenticated } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeUser = async () => {
      if (!isAuthenticated || !userEmail) {
        setLoading(false);
        return;
      }

      try {
        // Get JWT token from localStorage
        const jwt = localStorage.getItem('jwt');
        if (!jwt) {
          console.error("No JWT token found");
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

        setUser(userResult.user);
      } catch (error) {
        console.error("Error initializing user:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      initializeUser();
    }
  }, [isAuthenticated, userEmail, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">Please log in to create voice interviews.</p>
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Unable to Initialize User</h2>
          <p className="mb-4">There was an error setting up your account. Please try again.</p>
          <Button onClick={() => window.location.reload()}>
            Retry
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
      
      {/* Voice Interview Create Content */}
      <div className="voice-interview relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Generate Interview Questions
              </h1>
              <p className="text-gray-600">
                Tell our AI what kind of interview you want to practice and it will generate personalized questions for you.
              </p>
            </div>
            <br/><br/><br/>

            <Agent
              userName={user.email.split('@')[0]} // Use email prefix as name
              userId={user.id}
              type="generate"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
