import { NextResponse } from "next/server";
import { removeMockJobPost } from "../mockData";

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

    try {
      // Try to delete from external backend
      const headers = {
        "Content-Type": "application/json",
      };

      // Add authorization header if provided
      if (authHeader) {
        headers["Authorization"] = authHeader;
        console.log(
          "Delete API Route - Added authorization header to backend request"
        );
      } else {
        console.warn("Delete API Route - No authorization header provided");
      }

      const backendUrl = `http://localhost:8080/api/org/deletePost?jobPost_obj_id=${encodeURIComponent(jobPostObjId)}`;
      console.log("Delete API Route - Backend URL:", backendUrl);
      console.log("Delete API Route - Backend request headers:", headers);

      const response = await fetch(backendUrl, {
        method: "DELETE",
        headers,
      });

      console.log(
        "Delete API Route - Backend response status:",
        response.status
      );
      console.log(
        "Delete API Route - Backend response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Delete API Route - Backend API error:", errorData);
        console.error(
          "Delete API Route - Backend response status:",
          response.status
        );
        throw new Error(
          errorData.message || `Backend API returned status ${response.status}`
        );
      }

      const result = await response.json();
      console.log(
        `Delete API Route - Successfully deleted job post from backend with ID: ${jobPostObjId}`
      );

      return NextResponse.json(result);
    } catch (backendError) {
      console.warn(
        "Delete API Route - Backend API not available, using mock deletion:",
        backendError.message
      );
      console.error("Delete API Route - Backend error details:", backendError);

      // Fallback to mock deletion when backend is not available
      try {
        const mockResult = removeMockJobPost(jobPostObjId);

        if (mockResult) {
          console.log(
            `Delete API Route - Successfully deleted mock job post with ID: ${jobPostObjId}`
          );

          return NextResponse.json({
            message:
              "Job post deleted successfully (mock mode - backend not available)",
            jobId: jobPostObjId,
            timestamp: new Date().toISOString(),
          });
        } else {
          console.log(
            `Delete API Route - Mock job post not found with ID: ${jobPostObjId}`
          );

          return NextResponse.json({
            message: "Job post not found (mock mode)",
            jobId: jobPostObjId,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (mockError) {
        console.error("Delete API Route - Mock deletion error:", mockError);
        return NextResponse.json(
          {
            error: "Failed to delete job post (mock mode)",
            details: mockError.message,
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Delete API Route - Error deleting job post:", error);
    return NextResponse.json(
      { error: "Failed to delete job post", details: error.message },
      { status: 500 }
    );
  }
}
