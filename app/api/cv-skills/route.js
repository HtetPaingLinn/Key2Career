import { NextResponse } from "next/server";
import clientPromise from "../../../backend/mongodb";
import { ObjectId } from "mongodb";

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

export async function GET(request) {
  try {
    // Get email from JWT token instead of query parameter
    const email = getEmailFromJWT(request);

    if (!email) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ForCVs");
    const collection = db.collection("CVs");

    // Fetch the CV document with the specific email
    const cv = await collection.findOne({ email: email });

    if (!cv || !cv.skills) {
      return NextResponse.json({ skills: { technical: [], soft: [] } }); // Return empty skills object if no skills found
    }

    return NextResponse.json({ skills: cv.skills });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
