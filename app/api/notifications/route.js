import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const applicationsCollection = db.collection("application");
    const jobPostsCollection = db.collection("jobPosts");

    console.log("Connected to MongoDB, searching for applications...");

    // First, check if user has already accepted any offer
    const acceptedApplication = await applicationsCollection.findOne({
      email: email.toLowerCase(),
      status: "accept",
    });

    const hasAcceptedOffer = !!acceptedApplication;

    // Get user's applications with status changes that should trigger notifications
    const applications = await applicationsCollection
      .find({
        email: email.toLowerCase(),
        status: { $in: ["interview", "offer", "reject"] },
      })
      .sort({ updatedAt: -1 })
      .limit(50) // Limit to prevent too many notifications
      .toArray();

    console.log(
      `Found ${applications.length} applications with notification statuses:`,
      applications.map((app) => ({
        id: app._id,
        jobId: app.jobId,
        status: app.status,
        fullName: app.fullName,
      }))
    );

    const notifications = [];

    for (const app of applications) {
      // Get job details to include organization info
      let jobDetails = null;
      try {
        console.log(`Looking for job details for jobId: ${app.jobId}`);

        // Try to convert jobId to ObjectId if it's a valid ObjectId string
        let jobIdQuery = app.jobId;
        if (ObjectId.isValid(app.jobId)) {
          jobIdQuery = new ObjectId(app.jobId);
          console.log(`Converted jobId to ObjectId: ${jobIdQuery}`);
        }

        // First try to find in local jobPosts collection
        jobDetails = await jobPostsCollection.findOne({ _id: jobIdQuery });

        if (!jobDetails) {
          // Try searching by string jobId as well
          jobDetails = await jobPostsCollection.findOne({ _id: app.jobId });
        }

        if (!jobDetails) {
          console.log(
            `Job not found in local jobPosts collection, trying Spring Boot backend...`
          );

          // If not found locally, try to fetch from Spring Boot backend
          try {
            const jobResponse = await fetch(
              `http://localhost:8080/api/jobs/getPost?obj_id=${encodeURIComponent(app.jobId)}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (jobResponse.ok) {
              jobDetails = await jobResponse.json();
              console.log(
                `Found job details from Spring Boot backend:`,
                jobDetails
              );
            } else if (jobResponse.status === 404) {
              console.log(
                `Job not found in Spring Boot backend (404): ${app.jobId}`
              );
            } else {
              console.warn(
                `Failed to fetch job from Spring Boot backend: ${jobResponse.status}`
              );
            }
          } catch (backendError) {
            console.warn(
              `Error fetching from Spring Boot backend:`,
              backendError
            );
          }
        } else {
          console.log(`Found job details in local collection:`, jobDetails);
        }
      } catch (error) {
        console.warn(
          `Could not find job details for jobId: ${app.jobId}`,
          error
        );
      }

      const notification = {
        id: app._id.toString(),
        applicationId: app._id.toString(),
        jobId: app.jobId,
        status: app.status,
        fullName: app.fullName,
        jobTitle:
          jobDetails?.job_title ||
          jobDetails?.title ||
          jobDetails?.position ||
          "Unknown Position",
        orgName:
          jobDetails?.org_name ||
          jobDetails?.company ||
          jobDetails?.companyName ||
          getOrgNameFromEmail(jobDetails?.orgEmail) ||
          "Unknown Organization",
        orgImg: jobDetails?.org_logo || jobDetails?.logo || null,
        message: getNotificationMessage(
          app.status,
          jobDetails?.job_title || jobDetails?.title || jobDetails?.position
        ),
        createdAt: app.updatedAt || app.createdAt,
        type: app.status, // 'interview', 'offer', 'reject'
        // Add flag to indicate if user can accept this offer
        canAccept: app.status === "offer" && !hasAcceptedOffer,
        hasAcceptedOffer: hasAcceptedOffer,
      };

      notifications.push(notification);
    }

    console.log(`Found ${notifications.length} notifications for ${email}`);

    return NextResponse.json({
      success: true,
      notifications: notifications.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
      hasAcceptedOffer: hasAcceptedOffer,
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Helper function to map organization emails to organization names
function getOrgNameFromEmail(orgEmail) {
  if (!orgEmail) return "Unknown Organization";

  const emailDomain = orgEmail.toLowerCase();

  // Map common organization emails to names
  const orgMap = {
    "delamain@org.net": "Delamain AI",
    "akari@corp.com": "Akari Mobile",
    "quantum@gmail.com": "Quantum Tech",
    "noreply@delamain.support.com": "Delamain AI",
    "delamain@org.com": "Delamain AI",
    "akari@corp.net": "Akari Mobile",
    "quantum@tech.com": "Quantum Tech",
  };

  return (
    orgMap[emailDomain] || orgEmail.split("@")[0] || "Unknown Organization"
  );
}

// Helper function to generate appropriate notification messages
function getNotificationMessage(status, jobTitle) {
  const title = jobTitle || "this position";
  switch (status) {
    case "interview":
      return `Congratulations! You've been selected for an interview for the ${title} position. Please check your email for interview details.`;
    case "offer":
      return `Great news! You've received a job offer for the ${title} position. Please review and respond to the offer.`;
    case "reject":
      return `Thank you for your interest in the ${title} position. Unfortunately, we have decided to move forward with other candidates.`;
    default:
      return `Your application status has been updated to ${status}.`;
  }
}

// PUT endpoint to update application status (for accepting/declining offers)
export async function PUT(req) {
  try {
    const body = await req.json();
    const { applicationId, action } = body;

    if (!applicationId || !action) {
      return NextResponse.json(
        { success: false, error: "Application ID and action are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const applicationsCollection = db.collection("application");

    // If trying to accept an offer, first check if user has already accepted another offer
    if (action === "accept") {
      // Get the application to find the user's email
      const application = await applicationsCollection.findOne({
        _id: new ObjectId(applicationId),
      });

      if (!application) {
        return NextResponse.json(
          { success: false, error: "Application not found" },
          { status: 404 }
        );
      }

      // Check if user has already accepted another offer
      const existingAcceptedOffer = await applicationsCollection.findOne({
        email: application.email,
        status: "accept",
        _id: { $ne: new ObjectId(applicationId) }, // Exclude current application
      });

      if (existingAcceptedOffer) {
        return NextResponse.json(
          {
            success: false,
            error:
              "You have already accepted another job offer. You can only accept one offer at a time.",
          },
          { status: 409 }
        );
      }
    }

    let newStatus;
    if (action === "accept") {
      newStatus = "accept";
    } else if (action === "decline") {
      newStatus = "decline";
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Must be "accept" or "decline"',
        },
        { status: 400 }
      );
    }

    const result = await applicationsCollection.updateOne(
      { _id: new ObjectId(applicationId) },
      {
        $set: {
          status: newStatus,
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

    return NextResponse.json({
      success: true,
      message: `Application ${action}ed successfully`,
      newStatus,
    });
  } catch (error) {
    console.error("Failed to update application status:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
