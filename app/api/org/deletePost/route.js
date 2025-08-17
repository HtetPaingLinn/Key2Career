import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobPostObjId = searchParams.get("jobPost_obj_id");
    const authHeader = request.headers.get("authorization");

    console.log("Delete API Route - Request received:");
    console.log("Job Post ID:", jobPostObjId);
    console.log(
      "Authorization header:",
      authHeader ? "Present" : "Not present"
    );

    if (!jobPostObjId) {
      console.error("Delete API Route - Missing job post ID");
      return NextResponse.json(
        { error: "Job post ID is required" },
        { status: 400 }
      );
    }

    console.log(
      `Delete API Route - Deleting job post with ID: ${jobPostObjId}`
    );

    // First, delete the job post from Spring Boot backend
    const jwt = authHeader?.replace("Bearer ", "") || "";
    const springBootHeaders = {
      "Content-Type": "application/json",
    };

    if (jwt) {
      springBootHeaders["Authorization"] = `Bearer ${jwt}`;
    }

    const springBootDeleteUrl = `http://localhost:8080/api/org/deletePost?jobPost_obj_id=${jobPostObjId}`;

    try {
      const springBootResponse = await fetch(springBootDeleteUrl, {
        method: "DELETE",
        headers: springBootHeaders,
      });

      if (!springBootResponse.ok) {
        console.error(
          "Delete API Route - Failed to delete job post from Spring Boot backend"
        );
        return NextResponse.json(
          { error: "Failed to delete job post from backend" },
          { status: springBootResponse.status }
        );
      }

      console.log(
        "Delete API Route - Job post deleted successfully from Spring Boot backend"
      );
    } catch (error) {
      console.error(
        "Delete API Route - Error calling Spring Boot backend:",
        error
      );
      return NextResponse.json(
        { error: "Failed to communicate with backend" },
        { status: 500 }
      );
    }

    // Delete all applications associated with this job post
    const { db } = await connectToDatabase();
    const applicationsCollection = db.collection("application");

    console.log(
      `Delete API Route - Searching for applications with jobId: ${jobPostObjId}`
    );

    const applicationsDeleteResult = await applicationsCollection.deleteMany({
      jobId: jobPostObjId,
    });

    console.log(
      `Delete API Route - Deleted ${applicationsDeleteResult.deletedCount} applications associated with job post ${jobPostObjId}`
    );

    return NextResponse.json({
      success: true,
      message: `Job post and ${applicationsDeleteResult.deletedCount} associated applications deleted successfully`,
      deletedId: jobPostObjId,
      deletedApplicationsCount: applicationsDeleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Delete API Route - Error deleting job post:", error);
    return NextResponse.json(
      { error: "Failed to delete job post", details: error.message },
      { status: 500 }
    );
  }
}
