import { NextResponse } from "next/server";
import clientPromise from "../../../backend/mongodb";

// Helper function to extract email from JWT token
const getEmailFromJWT = (req) => {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload.email || payload.sub || null;
  } catch (error) {
    console.error("Error parsing JWT:", error);
    return null;
  }
};

export async function POST(req) {
  try {
    // Get email from JWT token instead of request body
    const email = getEmailFromJWT(req);
    if (!email) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ForCVs");
    const collection = db.collection("roadmapData");

    // Try to find the user by email
    let userDoc = await collection.findOne({ email });

    if (!userDoc) {
      // If not found, create a new document for this email
      const today = new Date();
      const todayString = today.toISOString().split("T")[0]; // YYYY-MM-DD format

      const newDoc = {
        email,
        createdAt: today, // Track when user was created
        lastActivity: today, // Track last activity
        skills: [],
        goals: [],
        roadmaps: {}, // Store complete roadmap data for each goal
        canvas: {
          zoom: 1,
          position: { x: 0, y: 0 },
          gridSize: 20,
        },
        selectedGoal: null,
        foldedSkills: [], // Store folded skills state
        removedCvSkills: [], // Store removed CV skills state
        skillCompletions: [], // Track skill completion dates
        activityLog: [todayString], // Track daily activity for streak calculation - start with today
      };
      const insertResult = await collection.insertOne(newDoc);
      userDoc = newDoc;
    }

    // Return the complete roadmap data
    return NextResponse.json({
      roadmap: true,
      roadmaps: userDoc.roadmaps || {},
      canvas: userDoc.canvas || {
        zoom: 1,
        position: { x: 0, y: 0 },
        gridSize: 20,
      },
      selectedGoal: userDoc.selectedGoal || null,
      skills: userDoc.skills || [],
      foldedSkills: userDoc.foldedSkills || [],
      removedCvSkills: userDoc.removedCvSkills || [],
    });
  } catch (err) {
    console.error("API /api/roadmap error:", err);
    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    // Get email from JWT token instead of request body
    const email = getEmailFromJWT(req);
    if (!email) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      );
    }

    const {
      skills,
      roadmaps,
      canvas,
      selectedGoal,
      foldedSkills,
      removedCvSkills,
      completedSkill,
    } = await req.json();

    const client = await clientPromise;
    const db = client.db("ForCVs");
    const collection = db.collection("roadmapData");

    // Prepare update data
    const updateData = {};
    if (Array.isArray(skills)) {
      updateData.skills = skills;
    }
    if (roadmaps && typeof roadmaps === "object") {
      updateData.roadmaps = roadmaps;
    }
    if (canvas && typeof canvas === "object") {
      updateData.canvas = canvas;
    }
    if (selectedGoal !== undefined) {
      updateData.selectedGoal = selectedGoal;
    }
    if (Array.isArray(foldedSkills)) {
      updateData.foldedSkills = foldedSkills;
    }
    if (Array.isArray(removedCvSkills)) {
      updateData.removedCvSkills = removedCvSkills;
    }

    // Track skill completion and activity
    if (completedSkill) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of day

      // Update the user's data with skill completion tracking
      const updateResult = await collection.updateOne(
        { email },
        {
          $set: { ...updateData, lastActivity: new Date() },
          $push: {
            skillCompletions: {
              skillId: completedSkill.id,
              skillName: completedSkill.name,
              completedAt: new Date(),
            },
          },
          $addToSet: {
            activityLog: today.toISOString().split("T")[0], // YYYY-MM-DD format
          },
        },
        { upsert: true }
      );
    } else {
      // Always update last activity
      updateData.lastActivity = new Date();

      // Update the user's data
      const updateResult = await collection.updateOne(
        { email },
        { $set: updateData },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API /api/roadmap PATCH error:", err);
    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
