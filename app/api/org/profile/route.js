import { NextResponse } from "next/server";

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

    console.log("Fetching organization profile data for email:", orgEmail);

    // Get JWT token from authorization header
    const authHeader = request.headers.get("authorization");
    const headers = {
      "Content-Type": "application/json",
    };

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    // Fetch organization profile data from backend
    const response = await fetch(
      `http://localhost:8080/api/common/profileData?email=${encodeURIComponent(orgEmail)}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      console.error("Backend API error:", response.status);
      // Return empty data structure if organization not found
      return NextResponse.json({
        success: true,
        data: {
          name: "",
          bio: "",
          description: "",
          image_url: null,
        },
      });
    }

    const orgData = await response.json();
    console.log("Organization profile data received:", orgData);

    return NextResponse.json({
      success: true,
      data: orgData,
    });
  } catch (error) {
    console.error("Error fetching organization profile data:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const org_email = formData.get("email");
    const name = formData.get("name");
    const bio = formData.get("about");
    const image = formData.get("image");

    if (!org_email) {
      return NextResponse.json(
        { success: false, error: "Organization email is required" },
        { status: 400 }
      );
    }

    console.log("Updating organization profile data for email:", org_email);
    console.log("Update data:", {
      name,
      bio,
      image: image instanceof File ? image.name : image,
    });

    // Get JWT token from authorization header
    const authHeader = request.headers.get("authorization");
    const headers = {};

    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const results = [];
    const errors = [];

    // Update name if provided
    if (name !== null && name !== undefined && name !== "") {
      try {
        console.log("Updating name to:", name);
        const nameResponse = await fetch(
          `http://localhost:8080/api/common/updateName`,
          {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({
              email: org_email,
              new_name: name,
            }),
          }
        );

        if (nameResponse.ok) {
          // Try to parse as JSON first, fallback to text
          let nameResult;
          const contentType = nameResponse.headers.get("content-type");
          console.log("Name response content-type:", contentType);

          try {
            if (contentType && contentType.includes("application/json")) {
              nameResult = await nameResponse.json();
            } else {
              nameResult = await nameResponse.text();
            }
          } catch (parseError) {
            // If JSON parsing fails, try text
            console.log(
              "JSON parsing failed, trying text:",
              parseError.message
            );
            nameResult = await nameResponse.text();
          }

          results.push({ field: "name", result: nameResult });
          console.log("Name update successful:", nameResult);
        } else {
          const errorText = await nameResponse.text();
          errors.push({ field: "name", error: errorText });
          console.error("Name update failed:", errorText);
        }
      } catch (error) {
        errors.push({ field: "name", error: error.message });
        console.error("Name update error:", error);
      }
    }

    // Update bio/about if provided
    if (bio !== null && bio !== undefined && bio !== "") {
      try {
        console.log("Updating bio to:", bio);
        const bioResponse = await fetch(
          `http://localhost:8080/api/common/updateAbout`,
          {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({
              email: org_email,
              new_about: bio,
            }),
          }
        );

        if (bioResponse.ok) {
          // Try to parse as JSON first, fallback to text
          let bioResult;
          const contentType = bioResponse.headers.get("content-type");
          console.log("Bio response content-type:", contentType);

          try {
            if (contentType && contentType.includes("application/json")) {
              bioResult = await bioResponse.json();
            } else {
              bioResult = await bioResponse.text();
            }
          } catch (parseError) {
            // If JSON parsing fails, try text
            console.log(
              "JSON parsing failed, trying text:",
              parseError.message
            );
            bioResult = await bioResponse.text();
          }

          results.push({ field: "bio", result: bioResult });
          console.log("Bio update successful:", bioResult);
        } else {
          const errorText = await bioResponse.text();
          errors.push({ field: "bio", error: errorText });
          console.error("Bio update failed:", errorText);
        }
      } catch (error) {
        errors.push({ field: "bio", error: error.message });
        console.error("Bio update error:", error);
      }
    }

    // Update image if provided
    if (image instanceof File) {
      try {
        console.log("Updating image to:", image.name);
        const imageFormData = new FormData();
        imageFormData.append("email", org_email);
        imageFormData.append("new_image", image);

        const imageResponse = await fetch(
          `http://localhost:8080/api/common/updatePfImage`,
          {
            method: "POST",
            headers,
            body: imageFormData,
          }
        );

        if (imageResponse.ok) {
          // Try to parse as JSON first, fallback to text
          let imageResult;
          const contentType = imageResponse.headers.get("content-type");
          console.log("Image response content-type:", contentType);

          try {
            if (contentType && contentType.includes("application/json")) {
              imageResult = await imageResponse.json();
            } else {
              imageResult = await imageResponse.text();
            }
          } catch (parseError) {
            // If JSON parsing fails, try text
            console.log(
              "JSON parsing failed, trying text:",
              parseError.message
            );
            imageResult = await imageResponse.text();
          }

          results.push({ field: "image", result: imageResult });
          console.log("Image update successful:", imageResult);
        } else {
          const errorText = await imageResponse.text();
          errors.push({ field: "image", error: errorText });
          console.error("Image update failed:", errorText);
        }
      } catch (error) {
        errors.push({ field: "image", error: error.message });
        console.error("Image update error:", error);
      }
    }

    // Check if any updates were successful
    if (results.length === 0 && errors.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    // Return results
    if (errors.length === 0) {
      // All updates successful
      return NextResponse.json({
        success: true,
        message: "Organization profile updated successfully",
        data: results,
      });
    } else if (results.length === 0) {
      // All updates failed
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update organization profile",
          details: errors,
        },
        { status: 400 }
      );
    } else {
      // Partial success
      return NextResponse.json({
        success: true,
        message: "Organization profile partially updated",
        data: results,
        warnings: errors,
      });
    }
  } catch (error) {
    console.error("Error updating organization profile data:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
