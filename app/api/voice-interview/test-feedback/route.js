import { NextResponse } from "next/server";
import { createFeedback } from "@/lib/actions/voice-general.action";

export async function POST(request) {
  try {
    const testTranscript = [
      { role: "user", content: "Hello, I'm excited about this opportunity." },
      {
        role: "assistant",
        content: "Great! Tell me about your experience with React.",
      },
      {
        role: "user",
        content:
          "I've been working with React for 3 years, building scalable applications.",
      },
      {
        role: "assistant",
        content: "That's impressive. How do you handle state management?",
      },
      {
        role: "user",
        content:
          "I prefer using Redux Toolkit for complex state and React Context for simpler cases.",
      },
    ];

    const result = await createFeedback({
      interviewId: "test-interview-123",
      userId: "test-user-123",
      transcript: testTranscript,
    });

    return NextResponse.json({
      success: true,
      result,
      message: "Test feedback generation completed",
    });
  } catch (error) {
    console.error("Test feedback error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
