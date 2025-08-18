import { v2 as cloudinary } from "cloudinary";
// Ensure Node.js runtime (not Edge) for Cloudinary signing
export const runtime = "nodejs";

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
    const type = url.searchParams.get("type") || "upload"; // upload/authenticated/private
    const attachment = url.searchParams.get("attachment") ?? "true";
    const target_filename = url.searchParams.get("filename") || undefined;

    console.log("CV Download API - Input parameters:", {
      public_id,
      resource_type,
      type,
      attachment,
      target_filename,
    });
    console.log("CV Download API - Using cloud:", cloud_name);

    if (!public_id) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: public_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build variations to try: public_id, resource_type, and type
    const publicIdVariations = (() => {
      const list = [public_id];
      // Remove version prefix like v1699999/...
      list.push(public_id.replace(/^v\d+\//, ""));
      // Try last two path segments
      const parts = public_id.split("/");
      if (parts.length >= 2) list.push(parts.slice(-2).join("/"));
      // Try last segment only (no folder)
      if (parts.length >= 1) list.push(parts.slice(-1)[0]);
      // Deduplicate
      return Array.from(new Set(list.filter(Boolean)));
    })();

    const resourceTypeVariations = Array.from(
      new Set([
        resource_type,
        resource_type === "raw" ? "auto" : "raw",
        "image",
      ])
    );

    const typeVariations = Array.from(
      new Set([
        type,
        "authenticated",
        "private",
        "upload",
      ])
    );

    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    const formatVariations = [undefined, "pdf", "doc", "docx"]; // for raw deliveries
    let lastStatuses = [];

    for (const pid of publicIdVariations) {
      for (const rt of resourceTypeVariations) {
        for (const dt of typeVariations) {
          try {
            // Optional: probe resource via Admin API, but don't fail hard
            try {
              const info = await cloudinary.api.resource(pid, {
                resource_type: rt,
                type: dt,
              });
              console.log("CV Download API - Resource probe OK:", info.public_id, rt, dt);
              // If probe succeeded, try with authoritative values first
              try {
                const authPublicId = info.public_id;
                const authRt = info.resource_type || rt;
                const authDt = info.type || dt;
                const authFmt = info.format; // e.g., pdf for raw
                const signedUrlAuth = cloudinary.url(authPublicId, {
                  resource_type: authRt,
                  type: authDt,
                  attachment: attachment === "true",
                  target_filename,
                  sign_url: true,
                  secure: true,
                  ...(authRt === "raw" && authFmt ? { format: authFmt } : {}),
                });
                const headAuth = await fetch(signedUrlAuth, { method: "HEAD", headers: { "User-Agent": userAgent } });
                if (headAuth.ok) {
                  console.log("CV Download API - Using signed URL (authoritative):", signedUrlAuth);
                  return new Response(JSON.stringify({ url: signedUrlAuth }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                  });
                }
                lastStatuses.push({ pid: authPublicId, rt: authRt, dt: authDt, signed: headAuth.status, source: 'probe' });
                const openUrlAuth = cloudinary.url(authPublicId, {
                  resource_type: authRt,
                  type: authDt,
                  attachment: attachment === "true",
                  target_filename,
                  secure: true,
                  ...(authRt === "raw" && authFmt ? { format: authFmt } : {}),
                });
                const headOpenAuth = await fetch(openUrlAuth, { method: "HEAD", headers: { "User-Agent": userAgent } });
                if (headOpenAuth.ok) {
                  console.log("CV Download API - Using open URL (authoritative):", openUrlAuth);
                  return new Response(JSON.stringify({ url: openUrlAuth }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                  });
                }
                lastStatuses.push({ pid: authPublicId, rt: authRt, dt: authDt, open: headOpenAuth.status, source: 'probe' });
              } catch (authErr) {
                console.warn("CV Download API - Authoritative URL attempt failed:", authErr?.message);
              }
            } catch (probeErr) {
              console.warn("CV Download API - Probe failed (continuing):", pid, rt, dt, probeErr?.message);
            }

            // Generate signed/open URLs; if raw, iterate through likely formats
            const formatsToTry = rt === "raw" ? formatVariations : [undefined];
            for (const fmt of formatsToTry) {
              // Signed first
              const signedUrl = cloudinary.url(pid, {
                resource_type: rt,
                type: dt,
                attachment: attachment === "true",
                target_filename,
                sign_url: true,
                secure: true,
                ...(fmt ? { format: fmt } : {}),
              });
              const head = await fetch(signedUrl, { method: "HEAD", headers: { "User-Agent": userAgent } });
              if (head.ok) {
                console.log("CV Download API - Using signed URL:", signedUrl);
                return new Response(JSON.stringify({ url: signedUrl }), {
                  status: 200,
                  headers: { "Content-Type": "application/json" },
                });
              }
              lastStatuses.push({ pid, rt, dt, signed: head.status, fmt });

              // Open fallback
              const openUrl = cloudinary.url(pid, {
                resource_type: rt,
                type: dt,
                attachment: attachment === "true",
                target_filename,
                secure: true,
                ...(fmt ? { format: fmt } : {}),
              });
              const head2 = await fetch(openUrl, { method: "HEAD", headers: { "User-Agent": userAgent } });
              if (head2.ok) {
                console.log("CV Download API - Using open URL:", openUrl);
                return new Response(JSON.stringify({ url: openUrl }), {
                  status: 200,
                  headers: { "Content-Type": "application/json" },
                });
              }
              lastStatuses.push({ pid, rt, dt, open: head2.status, fmt });
            }
          } catch (variantErr) {
            console.warn("CV Download API - Variant attempt failed:", pid, rt, dt, variantErr?.message);
          }
        }
      }
    }

    console.error("CV Download API - All variations failed", lastStatuses);
    return new Response(
      JSON.stringify({
        error: "CV file is not accessible. Please check Cloudinary resource parameters and permissions.",
        attempts: lastStatuses,
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
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
