"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants/voice-interview";

/**
 * Create feedback for interview
 * @param {import('@/types/voice-interview').CreateFeedbackParams} params
 * @returns {Promise<{success: boolean, feedbackId?: string, error?: string}>}
 */
export async function createFeedback(params) {
  const { interviewId, userId, transcript, feedbackId } = params;

  console.log("createFeedback called with params:", {
    interviewId,
    userId,
    feedbackId,
    transcriptLength: transcript.length,
  });

  try {
    const formattedTranscript = transcript
      .map(
        (sentence) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    console.log("Formatted transcript:", formattedTranscript);

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem Solving**: Ability to analyze problems and propose solutions.
        - **Cultural Fit**: Alignment with company values and job role.
        - **Confidence and Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    console.log("AI generated object:", object);

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    console.log("Feedback object to save:", feedback);

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);
    console.log("Feedback saved successfully with ID:", feedbackRef.id);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error in createFeedback:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
      name: error instanceof Error ? error.name : "Unknown error type",
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get interview by ID
 * @param {string} id
 * @returns {Promise<import('@/types/voice-interview').Interview|null>}
 */
export async function getInterviewById(id) {
  const interview = await db.collection("interviews").doc(id).get();

  if (!interview.exists) {
    return null;
  }

  return {
    id: interview.id,
    ...interview.data()
  };
}

/**
 * Get feedback by interview ID
 * @param {import('@/types/voice-interview').GetFeedbackByInterviewIdParams} params
 * @returns {Promise<import('@/types/voice-interview').Feedback|null>}
 */
export async function getFeedbackByInterviewId(params) {
  const { interviewId, userId } = params;

  // Return null if userId is undefined
  if (!userId) {
    return null;
  }

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() };
}

/**
 * Get feedback by interview ID with fallback for userId mismatches
 * @param {string} interviewId - Interview document ID
 * @returns {Promise<import('@/types/voice-interview').Feedback|null>}
 */
export async function getFeedbackByInterviewIdFallback(interviewId) {
  try {
    console.log(`Searching for feedback with interviewId: ${interviewId}`);
    
    // First, try to find any feedback for this interview (regardless of userId)
    const feedbackSnapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .limit(1)
      .get();

    if (!feedbackSnapshot.empty) {
      const feedbackDoc = feedbackSnapshot.docs[0];
      const feedbackData = feedbackDoc.data();
      console.log(`Found feedback with userId: ${feedbackData.userId}`);
      return { id: feedbackDoc.id, ...feedbackData };
    }

    console.log(`No feedback found for interview: ${interviewId}`);
    return null;
  } catch (error) {
    console.error("Error in getFeedbackByInterviewIdFallback:", error);
    return null;
  }
}

/**
 * Get latest interviews
 * @param {import('@/types/voice-interview').GetLatestInterviewsParams} params
 * @returns {Promise<import('@/types/voice-interview').Interview[]|null>}
 */
export async function getLatestInterviews(params) {
  const { userId, limit = 20 } = params;

  // Return null if userId is undefined
  if (!userId) {
    return null;
  }

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Get interviews by user ID
 * @param {string} userId
 * @returns {Promise<import('@/types/voice-interview').Interview[]|null>}
 */
export async function getInterviewsByUserId(userId) {
  // Return null if userId is undefined or empty
  if (!userId) {
    return null;
  }

  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Delete interview
 * @param {string} interviewId
 * @returns {Promise<{success: boolean}>}
 */
export async function deleteInterview(interviewId) {
  try {
    // Delete the interview
    await db.collection("interviews").doc(interviewId).delete();

    // Delete associated feedback
    const feedbackQuerySnapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .get();

    // Delete all feedback documents for this interview
    const deletePromises = feedbackQuerySnapshot.docs.map((doc) =>
      doc.ref.delete()
    );
    await Promise.all(deletePromises);

    return { success: true };
  } catch (error) {
    console.error("Error deleting interview:", error);
    return { success: false };
  }
}

/**
 * Update interview userId with correct Firebase user ID
 * @param {string} interviewId - Interview document ID
 * @param {string} correctUserId - Correct Firebase user document ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateInterviewUserId(interviewId, correctUserId) {
  try {
    await db.collection("interviews").doc(interviewId).update({
      userId: correctUserId,
    });

    console.log("Updated interview", interviewId, "with correct userId:", correctUserId);
    return { success: true };
  } catch (error) {
    console.error("Error updating interview userId:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fix all interviews with incorrect userId (that match user's email from users collection)
 * @param {string} jwtToken - JWT token to extract user email
 * @returns {Promise<{success: boolean, updatedCount?: number, error?: string}>}
 */
export async function fixUserInterviewIds(jwtToken) {
  try {
    const { parseJWT } = await import("@/lib/jwtUtils");
    
    // Parse JWT to get email
    const tokenData = parseJWT(jwtToken);
    if (!tokenData || !tokenData.email) {
      return { success: false, error: "Invalid JWT token or missing email" };
    }

    // Find user in Firebase users collection by email
    const userSnapshot = await db.collection("users").where("email", "==", tokenData.email).get();
    if (userSnapshot.empty) {
      return { success: false, error: "User not found in Firebase users collection" };
    }

    const correctUserId = userSnapshot.docs[0].id;
    console.log("Found correct Firebase user ID:", correctUserId, "for email:", tokenData.email);

    // Find all interviews that might belong to this user but have incorrect userId
    // Look for interviews with userId that doesn't match the correct Firebase user ID
    const interviewsSnapshot = await db.collection("interviews").get();
    
    let updatedCount = 0;
    const updatePromises = [];

    interviewsSnapshot.docs.forEach((doc) => {
      const interviewData = doc.data();
      
      // Check if this interview should belong to the current user
      // We'll update interviews that have userId that's not a valid Firebase document ID format
      // (Firebase IDs are typically 20 characters long and contain alphanumeric characters)
      const currentUserId = interviewData.userId;
      const isValidFirebaseId = currentUserId && 
        typeof currentUserId === 'string' && 
        currentUserId.length === 20 && 
        /^[a-zA-Z0-9]+$/.test(currentUserId);

      // If userId doesn't look like a valid Firebase ID, it might be user speech
      if (!isValidFirebaseId && currentUserId !== correctUserId) {
        console.log(`Found interview ${doc.id} with potentially incorrect userId:`, currentUserId);
        
        // Update the interview with the correct userId
        updatePromises.push(
          db.collection("interviews").doc(doc.id).update({
            userId: correctUserId,
          })
        );
        updatedCount++;
      }
    });

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      console.log(`Successfully updated ${updatedCount} interviews with correct userId`);
    }

    return { success: true, updatedCount };
  } catch (error) {
    console.error("Error fixing user interview IDs:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fix feedback userId if it's incorrect
 * @param {string} feedbackId - Feedback document ID
 * @param {string} correctUserId - Correct Firebase user ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function fixFeedbackUserId(feedbackId, correctUserId) {
  try {
    await db.collection("feedback").doc(feedbackId).update({
      userId: correctUserId,
    });

    console.log("Updated feedback", feedbackId, "with correct userId:", correctUserId);
    return { success: true };
  } catch (error) {
    console.error("Error updating feedback userId:", error);
    return { success: false, error: error.message };
  }
}