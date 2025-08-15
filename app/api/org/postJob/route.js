import { NextResponse } from "next/server";
import { addMockJobPost } from "../mockData";

export async function POST(request) {
  try {
    const jobData = await request.json();
    const authHeader = request.headers.get("authorization");

    console.log("Received job post data:", jobData);

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      // Add authorization header if provided
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      const response = await fetch("http://localhost:8080/api/org/postJob", {
        method: "POST",
        headers,
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Backend API error:", errorData);
        throw new Error(errorData.message || "Backend API returned an error");
      }

      const result = await response.json();
      console.log("Job post created successfully in backend:", result);

      return NextResponse.json(result);
    } catch (backendError) {
      console.warn(
        "Backend API not available, simulating job post creation:",
        backendError.message
      );

      // Simulate successful job post creation when backend is not available
      const mockJobId = `mock_${Date.now()}`;
      const mockJobPost = {
        id: mockJobId,
        orgEmail: jobData.org_email,
        org_name: "Test Organization",
        org_img: jobData.org_img,
        job_title: jobData.job_title,
        job_field: ["Software Development"],
        jobLevel: jobData.job_level,
        workingType: jobData.working_type,
        tag: jobData.tag,
        work_time: jobData.work_time,
        address: jobData.address,
        cv_email: jobData.cv_email,
        contact_ph_number: jobData.contact_ph_number,
        responsibility: [jobData.responsibility],
        qualification: [jobData.qualification],
        salary_mmk: jobData.salary_mmk,
        required_number: jobData.required_number,
        tech_skill: jobData.tech_skill,
        due_date: jobData.due_date,
        posted_date: new Date().toISOString(),
      };

      // Store the mock job post in memory
      addMockJobPost(mockJobPost);

      const mockResult = {
        message:
          "Job post created successfully (mock mode - backend not available)",
        jobId: mockJobId,
        timestamp: new Date().toISOString(),
        data: jobData,
      };

      console.log("Mock job post created and stored:", mockResult);
      return NextResponse.json(mockResult);
    }
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
