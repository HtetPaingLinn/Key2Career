import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { parseJWT } from "@/lib/jwtUtils";

export async function POST(request) {
  const { type, role, level, techstack, amount, userid, jwtToken } = await request.json();

  try {
    // Get the Firebase user ID from JWT token
    let firebaseUserId = userid; // fallback to original userid
    
    if (jwtToken) {
      try {
        // Parse JWT to get email
        const tokenData = parseJWT(jwtToken);
        if (tokenData && tokenData.email) {
          // Find user in Firebase users collection by email
          const userSnapshot = await db.collection("users").where("email", "==", tokenData.email).get();
          if (!userSnapshot.empty) {
            firebaseUserId = userSnapshot.docs[0].id; // Get document ID
            console.log("Found Firebase user ID:", firebaseUserId, "for email:", tokenData.email);
          } else {
            console.warn("User not found in Firebase users collection for email:", tokenData.email);
          }
        }
      } catch (error) {
        console.error("Error getting Firebase user ID:", error);
        // Continue with original userid as fallback
      }
    }
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: firebaseUserId, // Use Firebase user document ID
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}