import crypto from "crypto";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;

    if (!cloud_name || !api_key || !api_secret) {
      return new Response(
        JSON.stringify({ error: "Cloudinary server credentials are missing" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const public_id = url.searchParams.get("public_id");
    const resource_type = url.searchParams.get("resource_type") || "raw"; // raw for pdf/doc
    const type = url.searchParams.get("type") || "upload"; // upload or authenticated
    const attachment = url.searchParams.get("attachment") ?? "true";
    const target_filename = url.searchParams.get("filename") || undefined;

    if (!public_id) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: public_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);

    // Build params for signature (alphabetically sorted by key)
    const params = {
      attachment: String(attachment),
      public_id,
      resource_type,
      timestamp,
      type,
    };
    if (target_filename) params.target_filename = target_filename;

    const sorted = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join("&");

    const signature = crypto
      .createHash("sha1")
      .update(sorted + api_secret)
      .digest("hex");

    const qs = new URLSearchParams({
      ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
      api_key,
      signature,
    });

    const downloadUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/${resource_type}/download?${qs.toString()}`;

    return new Response(JSON.stringify({ url: downloadUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message || "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
