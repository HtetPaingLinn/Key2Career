import { v2 as cloudinary } from "cloudinary";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const cloud_name =
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;

    console.log("CV Download API - Environment variables check:", {
      cloud_name: cloud_name ? "Set" : "Not set",
      api_key: api_key ? "Set" : "Not set",
      api_secret: api_secret ? "Set" : "Not set",
    });

    if (!cloud_name || !api_key || !api_secret) {
      console.error("CV Download API - Missing credentials:", {
        cloud_name: !!cloud_name,
        api_key: !!api_key,
        api_secret: !!api_secret,
      });
      return new Response(
        JSON.stringify({ error: "Cloudinary server credentials are missing" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Configure Cloudinary
    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
    });

    const public_id = url.searchParams.get("public_id");
    const resource_type = url.searchParams.get("resource_type") || "raw"; // raw for pdf/doc
    const type = url.searchParams.get("type") || "upload"; // upload or authenticated
    const attachment = url.searchParams.get("attachment") ?? "true";
    const target_filename = url.searchParams.get("filename") || undefined;

    console.log("CV Download API - Input parameters:", {
      public_id,
      resource_type,
      type,
      attachment,
      target_filename,
    });

    if (!public_id) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: public_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // First, try to verify if the resource exists
    let resourceExists = false;
    let resourceInfo = null;

    try {
      resourceInfo = await cloudinary.api.resource(public_id, {
        resource_type,
        type,
      });
      console.log("CV Download API - Resource exists:", resourceInfo.public_id);
      resourceExists = true;
    } catch (resourceError) {
      console.error(
        "CV Download API - Resource not found:",
        resourceError.message
      );

      // Instead of failing immediately, try to generate URL anyway
      // Some files might be accessible via URL even if API resource check fails
      console.log(
        "CV Download API - Continuing with URL generation despite resource check failure"
      );
    }

    // Generate signed URL with better error handling
    let finalUrl;
    try {
      if (attachment === "true") {
        // For download, generate a signed URL with fl_attachment
        finalUrl = cloudinary.url(public_id, {
          resource_type,
          type,
          attachment: true,
          target_filename,
          sign_url: true,
          secure: true,
        });
      } else {
        // For preview, generate a signed URL without transformation parameters
        finalUrl = cloudinary.url(public_id, {
          resource_type,
          type,
          sign_url: true,
          secure: true,
        });
      }

      console.log("CV Download API - Generated URL:", finalUrl);
    } catch (urlError) {
      console.error(
        "CV Download API - URL generation failed:",
        urlError.message
      );
      return new Response(
        JSON.stringify({
          error: "Failed to generate download URL",
          details: urlError.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Test if the URL is accessible with better error handling
    try {
      const testResponse = await fetch(finalUrl, {
        method: "HEAD",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!testResponse.ok) {
        console.warn("CV Download API - Generated URL is not accessible:", {
          status: testResponse.status,
          statusText: testResponse.statusText,
          url: finalUrl,
        });

        // If signed URL fails, try generating a non-signed URL as fallback
        console.log("CV Download API - Trying fallback non-signed URL");
        const fallbackUrl = cloudinary.url(public_id, {
          resource_type,
          type,
          attachment: attachment === "true",
          target_filename,
          secure: true,
        });

        // Test fallback URL
        const fallbackResponse = await fetch(fallbackUrl, {
          method: "HEAD",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });

        if (fallbackResponse.ok) {
          console.log("CV Download API - Fallback URL works:", fallbackUrl);
          finalUrl = fallbackUrl;
        } else {
          console.error(
            "CV Download API - Both signed and fallback URLs failed"
          );
          return new Response(
            JSON.stringify({
              error:
                "CV file is not accessible. Please check file permissions.",
              signed_url_status: testResponse.status,
              fallback_url_status: fallbackResponse.status,
            }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    } catch (testError) {
      console.warn(
        "CV Download API - Could not test URL accessibility:",
        testError.message
      );
      // Continue with the generated URL even if test fails
    }

    return new Response(JSON.stringify({ url: finalUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("CV Download API - Error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
