import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request) {
  try {
    const jobData = await request.json();
    const authHeader = request.headers.get("authorization");

    console.log("Received job post data:", jobData);

    // Validate required fields
    if (!jobData.org_email || !jobData.job_title) {
      return NextResponse.json(
        { error: "Organization email and job title are required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB and save the job post
    const { db } = await connectToDatabase();
    const collection = db.collection("jobPosts");

    // Add timestamps
    const jobPostWithTimestamps = {
      ...jobData,
      posted_date: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Insert the job post
    const result = await collection.insertOne(jobPostWithTimestamps);

    console.log("Job post created successfully in MongoDB:", result.insertedId);

    return NextResponse.json({
      success: true,
      message: "Job post created successfully",
      jobId: result.insertedId.toString(),
      jobData: jobPostWithTimestamps,
    });
  } catch (error) {
    console.error("Error creating job post:", error);
    return NextResponse.json(
      {
        error: "Failed to create job post",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
