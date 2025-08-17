import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgEmail = searchParams.get("org_email");
    const authHeader = request.headers.get("authorization");

    console.log("API Route - Request received:");
    console.log("Organization email:", orgEmail);
    console.log(
      "Authorization header:",
      authHeader ? "Present" : "Not present"
    );

    if (!orgEmail) {
      console.error("API Route - Missing organization email");
      return NextResponse.json(
        { error: "Organization email is required" },
        { status: 400 }
      );
    }

    console.log(`API Route - Fetching job posts for organization: ${orgEmail}`);

    // Connect to MongoDB and fetch real job posts
    const { db } = await connectToDatabase();
    const collection = db.collection("jobPosts");

    // Find all job posts for this organization
    const jobPosts = await collection
      .find({
        org_email: orgEmail,
      })
      .sort({ posted_date: -1 })
      .toArray();

    console.log(
      `API Route - Successfully fetched ${jobPosts.length} job posts from MongoDB for organization: ${orgEmail}`
    );

    return NextResponse.json(jobPosts);
  } catch (error) {
    console.error("API Route - Error fetching job posts:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch job posts",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
