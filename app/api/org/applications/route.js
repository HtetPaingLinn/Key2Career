import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgEmail = searchParams.get("org_email");

    if (!orgEmail) {
      return NextResponse.json(
        { success: false, error: "Organization email is required" },
        { status: 400 }
      );
    }

    console.log("Fetching applications data for organization:", orgEmail);

    // Connect to MongoDB using the same method as other routes
    const { db } = await connectToDatabase();
    console.log("Connected to MongoDB using connectToDatabase");

    let applicationsCollection = db.collection("application");

    // First, get all job posts for this organization from Spring Boot backend
    let jobPosts = [];
    try {
      console.log(
        "Attempting to fetch job posts from Spring Boot backend for email:",
        orgEmail
      );

      // Get JWT token from authorization header
      const authHeader = request.headers.get("authorization");
      const headers = {
        "Content-Type": "application/json",
      };

      if (authHeader) {
        headers["Authorization"] = authHeader;
        console.log(
          "Applications API - Authorization header received and passed through"
        );
      } else {
        console.warn("Applications API - No authorization header received");
      }

      // Fetch from Spring Boot backend (same as overview route)
      const jobPostsResponse = await fetch(
        `http://localhost:8080/api/org/postedJobs?org_email=${encodeURIComponent(orgEmail)}`,
        {
          method: "GET",
          headers,
        }
      );

      console.log("Job posts response status:", jobPostsResponse.status);
      console.log("Job posts response ok:", jobPostsResponse.ok);

      if (jobPostsResponse.ok) {
        jobPosts = await jobPostsResponse.json();
        console.log("Fetched job posts from backend:", jobPosts.length);
        console.log("Job posts data:", JSON.stringify(jobPosts, null, 2));
      } else {
        const errorText = await jobPostsResponse.text();
        console.error(
          "Failed to fetch job posts from Spring Boot backend. Status:",
          jobPostsResponse.status
        );
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch job posts from backend: ${jobPostsResponse.status} - ${errorText}`
        );
      }
    } catch (error) {
      console.error(
        "Error fetching job posts from Spring Boot backend:",
        error.message
      );
      console.error("Error details:", error);
      throw new Error(
        `Failed to fetch job posts from backend: ${error.message}`
      );
    }

    // Get all applications for these job posts
    const jobIds = jobPosts.map((job) => job.id || job._id);
    console.log("Job IDs to search for:", jobIds);

    if (jobIds.length === 0) {
      console.log("No job IDs found, returning empty data");
      return NextResponse.json({
        success: true,
        activeJobPosts: [],
        totalActiveJobs: 0,
        totalApplications: 0,
        totalPending: 0,
        totalAccepted: 0,
        totalRejected: 0,
        totalHired: 0,
      });
    }

    const applications = await applicationsCollection
      .find({ jobId: { $in: jobIds } })
      .toArray();

    console.log("Fetched applications:", applications.length);

    // Group applications by job
    const applicationsByJob = {};
    let totalApplications = 0;
    let totalPending = 0;
    let totalAccepted = 0;
    let totalRejected = 0;
    let totalHired = 0;

    applications.forEach((app) => {
      if (!applicationsByJob[app.jobId]) {
        applicationsByJob[app.jobId] = [];
      }
      applicationsByJob[app.jobId].push(app);

      totalApplications++;

      switch (app.status) {
        case "applied":
          totalPending++;
          break;
        case "accepted":
          totalAccepted++;
          break;
        case "rejected":
          totalRejected++;
          break;
        case "hired":
          totalHired++;
          break;
      }
    });

    // Create the response structure
    const activeJobPosts = jobPosts.map((job) => {
      const jobApplications = applicationsByJob[job.id || job._id] || [];
      const pendingApplications = jobApplications.filter(
        (app) => app.status === "applied"
      ).length;
      const acceptedApplications = jobApplications.filter(
        (app) => app.status === "accepted"
      ).length;
      const rejectedApplications = jobApplications.filter(
        (app) => app.status === "rejected"
      ).length;
      const hiredApplications = jobApplications.filter(
        (app) => app.status === "hired"
      ).length;

      return {
        jobPost: job,
        totalApplications: jobApplications.length,
        pendingApplications,
        acceptedApplications,
        rejectedApplications,
        hiredApplications,
        applications: jobApplications,
      };
    });

    const responseData = {
      activeJobPosts,
      totalActiveJobs: jobPosts.length,
      totalApplications,
      totalPending,
      totalAccepted,
      totalRejected,
      totalHired,
    };

    console.log("Response data structure:", {
      totalActiveJobs: responseData.totalActiveJobs,
      totalApplications: responseData.totalApplications,
      totalPending: responseData.totalPending,
      totalAccepted: responseData.totalAccepted,
      totalRejected: responseData.totalRejected,
      totalHired: responseData.totalHired,
    });

    return NextResponse.json({
      success: true,
      ...responseData,
    });
  } catch (error) {
    console.error("Error fetching applications data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error: " + error.message,
        activeJobPosts: [],
        totalActiveJobs: 0,
        totalApplications: 0,
        totalPending: 0,
        totalAccepted: 0,
        totalRejected: 0,
        totalHired: 0,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { applicationId, status, orgEmail } = body;

    if (!applicationId || !status || !orgEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Application ID, status, and organization email are required",
        },
        { status: 400 }
      );
    }

    console.log("Updating application status:", {
      applicationId,
      status,
      orgEmail,
    });

    // Connect to MongoDB using the same method as other routes
    const { db } = await connectToDatabase();
    console.log("Connected to MongoDB using connectToDatabase");

    let applicationsCollection = db.collection("application");

    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = new ObjectId(applicationId);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid application ID format" },
        { status: 400 }
      );
    }

    // Update the application status
    const result = await applicationsCollection.updateOne(
      { _id: objectId },
      {
        $set: {
          status: status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    console.log("Application status updated successfully");

    return NextResponse.json({
      success: true,
      message: "Application status updated successfully",
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
