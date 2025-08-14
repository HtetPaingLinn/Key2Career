"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi, CallStatus } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants/voice-interview";
import { createFeedback, updateInterviewUserId } from "@/lib/actions/voice-general.action";
import "@/styles/voice-interview.css";

/**
 * @typedef {Object} SavedMessage
 * @property {"user" | "system" | "assistant"} role
 * @property {string} content
 */

/**
 * Agent component for voice interviews
 * @param {import('@/types/voice-interview').AgentProps} props
 */
const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
  /** @type {[SavedMessage[], Function]} */
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const [newInterviewId, setNewInterviewId] = useState(null);

  // Define handleUpdateNewInterviewUserId before it's used
  const handleUpdateNewInterviewUserId = useCallback(async () => {
    try {
      // Wait a moment for the interview to be created by Vapi workflow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get the most recent interview created in the last 30 seconds
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
      const { db } = await import('@/firebase/client');
      const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
      
      const q = query(
        collection(db, 'interviews'),
        where('createdAt', '>=', thirtySecondsAgo),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const recentInterview = querySnapshot.docs[0];
        const interviewData = recentInterview.data();
        
        // Check if this interview was created by the current user (conversation name matches)
        if (interviewData.userId !== userId) {
          console.log('Found recently created interview:', recentInterview.id, 'updating userId from', interviewData.userId, 'to', userId);
          
          // Update the userId to the correct Firebase user ID
          const result = await updateInterviewUserId(recentInterview.id, userId);
          if (result.success) {
            console.log('Successfully updated interview userId');
          } else {
            console.error('Failed to update interview userId:', result.error);
          }
        }
      }
    } catch (error) {
      console.error('Error updating new interview userId:', error);
    }
  }, [userId]);

  // Check environment variables
  useEffect(() => {
    if (type === "generate" && !process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID) {
      console.error(
        "Missing NEXT_PUBLIC_VAPI_WORKFLOW_ID environment variable"
      );
    }
    if (!process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN) {
      console.error("Missing NEXT_PUBLIC_VAPI_WEB_TOKEN environment variable");
    }
  }, [type]);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      console.log("Call ended, setting status to FINISHED");
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message) => {
      console.log("Vapi message received:", message);

      if (message.type === "transcript" && message.transcriptType === "final") {
        console.log("Final transcript received:", message.transcript);
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => {
          const updated = [...prev, newMessage];
          console.log("Updated messages:", updated);
          return updated;
        });
      } else if (message.type === "transcript") {
        console.log("Partial transcript received:", message.transcript);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages) => {
      console.log("handleGenerateFeedback called");
      console.log("Messages:", messages);
      console.log("Interview ID:", interviewId);
      console.log("User ID:", userId);
      console.log("Feedback ID:", feedbackId);

      if (!interviewId || !userId) {
        console.error("Missing required parameters:", { interviewId, userId });
        router.push("/voice-interview");
        return;
      }

      try {
        const {
          success,
          feedbackId: id,
          error,
        } = await createFeedback({
          interviewId: interviewId,
          userId: userId,
          transcript: messages,
          feedbackId,
        });

        console.log("createFeedback result:", { success, id, error });

        if (success && id) {
          console.log(
            "Feedback created successfully, redirecting to feedback page"
          );
          router.push(`/voice-interview/${interviewId}/feedback`);
        } else {
          console.error("Error saving feedback:", error);
          router.push("/voice-interview");
        }
      } catch (error) {
        console.error("Exception in handleGenerateFeedback:", error);
        router.push("/voice-interview");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      console.log("Call finished, type:", type);
      if (type === "generate") {
        // Check for newly created interview and update userId
        handleUpdateNewInterviewUserId();
        router.push("/voice-interview");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId, handleUpdateNewInterviewUserId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      // Get JWT token for authentication
      const jwtToken = localStorage.getItem('jwt');
      
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID, {
        variableValues: {
          username: userName,
          userid: userId,
          jwtToken: jwtToken, // Pass JWT token to VAPI workflow
        },
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <div className="voice-interview">
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover rounded-full"
            >
              <source src="/voice1.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/BladeRunner_Style_539x539.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>
      
      

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Debug Information - Hidden */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
          <h4 className="font-bold mb-2">Debug Info:</h4>
          <p>Call Status: {callStatus}</p>
          <p>Messages Count: {messages.length}</p>
          <p>Type: {type}</p>
          <p>Interview ID: {interviewId || "None"}</p>
          <p>User ID: {userId || "None"}</p>
          <p>Feedback ID: {feedbackId || "None"}</p>
          <p>Is Speaking: {isSpeaking ? "Yes" : "No"}</p>
        </div>
      )} */}
      <br/><br/>
      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button 
            className="relative bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg transition-all duration-200 flex items-center gap-3" 
            onClick={() => handleCall()}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75 bg-green-400",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative flex items-center gap-2">
              {/* Call Icon */}
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                />
              </svg>
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </div>
  );
};

export default Agent;