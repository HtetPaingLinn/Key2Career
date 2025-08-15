import { NextResponse } from "next/server";
import { getMockJobPosts } from "../mockData";

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

    try {
      // Try to fetch from external backend
      const headers = {
        "Content-Type": "application/json",
      };

      // Add authorization header if provided
      if (authHeader) {
        headers["Authorization"] = authHeader;
        console.log(
          "API Route - Added authorization header to backend request"
        );
      } else {
        console.warn("API Route - No authorization header provided");
      }

      const backendUrl = `http://localhost:8080/api/org/postedJobs?org_email=${encodeURIComponent(orgEmail)}`;
      console.log("API Route - Backend URL:", backendUrl);
      console.log("API Route - Backend request headers:", headers);

      const response = await fetch(backendUrl, {
        method: "GET",
        headers,
      });

      console.log("API Route - Backend response status:", response.status);
      console.log(
        "API Route - Backend response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Route - Backend API error:", errorData);
        console.error("API Route - Backend response status:", response.status);
        throw new Error(
          errorData.message || `Backend API returned status ${response.status}`
        );
      }

      const jobPosts = await response.json();
      console.log(
        `API Route - Successfully fetched ${jobPosts.length} job posts from backend for organization: ${orgEmail}`
      );

      return NextResponse.json(jobPosts);
    } catch (backendError) {
      console.warn(
        "API Route - Backend API not available, using mock data:",
        backendError.message
      );
      console.error("API Route - Backend error details:", backendError);

      // Fallback to mock data when backend is not available
      // Return any mock job posts that were created during this session
      const sessionMockJobPosts = getMockJobPosts(orgEmail);

      // If no mock job posts exist for this organization, return default mock data
      if (sessionMockJobPosts.length === 0) {
        const defaultMockJobPosts = [
          {
            id: "1",
            orgEmail: orgEmail,
            org_name:
              orgEmail === "delamain@org.net"
                ? "Delamain Corporation"
                : "Tech Solutions Inc",
            job_title: "Senior Software Engineer",
            job_field: ["Software Development", "Web Development"],
            job_level: "Senior",
            working_type: "Full-time",
            tag: ["React", "Node.js", "TypeScript"],
            work_time: "9 AM - 6 PM, Monday to Friday",
            address: "Yangon, Myanmar",
            contact_ph_number: "+95 9 123 456 789",
            responsibility: [
              "Develop and maintain web applications using React and Node.js",
              "Collaborate with cross-functional teams to define and implement new features",
              "Write clean, maintainable, and efficient code",
              "Participate in code reviews and technical discussions",
            ],
            qualification: [
              "Bachelor's degree in Computer Science or related field",
              "5+ years of experience in software development",
              "Strong knowledge of React, Node.js, and TypeScript",
              "Experience with database design and API development",
            ],
            salary_mmk: "1,500,000 - 2,500,000 MMK",
            required_number: 2,
            tech_skill: [
              "React",
              "Node.js",
              "TypeScript",
              "MongoDB",
              "PostgreSQL",
            ],
            due_date: "2024-07-15T10:00:00Z",
            posted_date: "2024-06-15T10:00:00Z",
            cv_email:
              orgEmail === "delamain@org.net"
                ? "hr@delamain.org"
                : "hr@techsolutions.com",
          },
          {
            id: "2",
            orgEmail: orgEmail,
            org_name:
              orgEmail === "delamain@org.net"
                ? "Delamain Corporation"
                : "Tech Solutions Inc",
            job_title: "Product Manager",
            job_field: ["Product Management", "Business Analysis"],
            job_level: "Mid",
            working_type: "Full-time",
            tag: ["Product Management", "Agile", "User Research"],
            work_time: "9 AM - 6 PM, Monday to Friday",
            address: "Yangon, Myanmar",
            contact_ph_number: "+95 9 123 456 789",
            responsibility: [
              "Define product vision, strategy, and roadmap",
              "Gather and prioritize product requirements",
              "Work closely with engineering, design, and marketing teams",
              "Analyze market trends and competitor activities",
            ],
            qualification: [
              "Bachelor's degree in Business, Computer Science, or related field",
              "3+ years of experience in product management",
              "Strong analytical and problem-solving skills",
              "Experience with Agile methodologies",
            ],
            salary_mmk: "1,200,000 - 1,800,000 MMK",
            required_number: 1,
            tech_skill: [
              "Product Management",
              "Agile",
              "User Research",
              "Analytics",
            ],
            due_date: "2024-07-10T10:00:00Z",
            posted_date: "2024-06-10T10:00:00Z",
            cv_email:
              orgEmail === "delamain@org.net"
                ? "hr@delamain.org"
                : "hr@techsolutions.com",
          },
          {
            id: "3",
            orgEmail: orgEmail,
            org_name:
              orgEmail === "delamain@org.net"
                ? "Delamain Corporation"
                : "Tech Solutions Inc",
            job_title: "UI/UX Designer",
            job_field: ["Design", "User Experience"],
            job_level: "Junior",
            working_type: "Part-time",
            tag: ["UI/UX", "Figma", "Design Systems"],
            work_time: "10 AM - 4 PM, Monday to Friday",
            address: "Yangon, Myanmar",
            contact_ph_number: "+95 9 123 456 789",
            responsibility: [
              "Create user-centered designs by understanding business requirements",
              "Create user flows, wireframes, prototypes, and mockups",
              "Translate requirements into style guides, design systems, and design patterns",
              "Create original graphic designs and illustrations",
            ],
            qualification: [
              "Bachelor's degree in Design, Fine Arts, or related field",
              "1+ years of experience in UI/UX design",
              "Proficiency in design tools like Figma, Sketch, or Adobe Creative Suite",
              "Strong portfolio demonstrating design skills",
            ],
            salary_mmk: "800,000 - 1,200,000 MMK",
            required_number: 1,
            tech_skill: [
              "Figma",
              "Sketch",
              "Adobe Creative Suite",
              "Prototyping",
            ],
            due_date: "2024-07-05T10:00:00Z",
            posted_date: "2024-06-05T10:00:00Z",
            cv_email:
              orgEmail === "delamain@org.net"
                ? "hr@delamain.org"
                : "hr@techsolutions.com",
          },
        ];

        console.log(
          `API Route - Using default mock data: ${defaultMockJobPosts.length} job posts for organization: ${orgEmail}`
        );

        return NextResponse.json(defaultMockJobPosts);
      } else {
        console.log(
          `API Route - Using session mock data: ${sessionMockJobPosts.length} job posts for organization: ${orgEmail}`
        );

        return NextResponse.json(sessionMockJobPosts);
      }
    }
  } catch (error) {
    console.error("API Route - Error fetching job posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch job posts", details: error.message },
      { status: 500 }
    );
  }
}
