"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

function checkPasswordStrength(password) {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const strong =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  return strong.test(password);
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default function OrganizationRegistrationPage() {
  const [orgName, setOrgName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgPassword, setOrgPassword] = useState("");
  const [about, setAbout] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation checks
    if (!orgName.trim()) {
      setError("Organization name is required.");
      return;
    }

    if (!validateEmail(orgEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!checkPasswordStrength(orgPassword)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (!about.trim()) {
      setError("About section is required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/auth/org.signUp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_name: orgName,
          org_email: orgEmail,
          org_password: orgPassword,
          about,
        }),
      });

      if (res.ok) {
        // Parse JSON safely; some backends may return empty body or non-JSON with 200
        let data: any = null;
        try {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            data = await res.json();
          } else {
            const text = await res.text();
            data = text ? JSON.parse(text) : null;
          }
          setSuccess(data?.message || "Registration successful!");
        } catch (_) {
          // On parse error, assume success without data
          setSuccess("Registration successful!");
        }

        setError("");

        // Store JWT token and org email if provided
        if (data?.jwtToken) {
          localStorage.setItem("jwt", data.jwtToken);
        }
        localStorage.setItem("orgEmail", orgEmail);

        // Delay redirect to allow success message to be seen
        setTimeout(() => {
          router.replace("/org/dashboard/overview");
        }, 2000);
      } else {
        try {
          const data = await res.json();
          if (data.message && data.message.toLowerCase().includes("email")) {
            setError("Email already exists. Please use a different email.");
          } else {
            setError(data.message || `Error: ${res.status}. Please try again.`);
          }
        } catch (_) {
          setError("An unexpected server error occurred. Please try again.");
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden org-register"
      style={{
        width: "100vw",
        height: "100vh",
        background: "#1D1D1F",
        fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
      }}
    >
      {/* Main Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
        {/* Header Text */}
        <div className="flex flex-col items-center gap-5 mb-20">
          <h1
            className="relative text-center text-white"
            style={{
              fontFamily:
                "Space Grotesk, -apple-system, Roboto, Helvetica, sans-serif",
              fontSize: "54px",
              fontWeight: "500",
              lineHeight: "normal",
              letterSpacing: "-4.32px",
            }}
          >
            Register Organization
          </h1>
          <p
            className="relative max-w-2xl text-center"
            style={{
              color: "#898889",
              fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
              fontSize: "22px",
              fontWeight: "500",
              lineHeight: "normal",
              letterSpacing: "-1px",
            }}
          >
            Create your organization account to get started with Key2Career
            resources.
          </p>
        </div>

        {/* Main Container */}
        <div className="flex items-start justify-center w-full max-w-6xl">
          {/* Form Fields */}
          <div
            className="flex flex-col items-center gap-4"
            style={{ width: "440px" }}
          >
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {/* Organization Name Field */}
              <div
                className="flex flex-col focus-within:ring-2 focus-within:ring-[#A9A5FD] focus-within:ring-opacity-50"
                style={{
                  width: "440px",
                  height: "72px",
                  borderRadius: "8px",
                  background: "#222",
                }}
              >
                <div
                  className="flex flex-col justify-center h-full"
                  style={{
                    padding: "8px 0 8px 32px",
                    borderRadius: "4px 4px 0 0",
                  }}
                >
                  <div className="flex flex-col justify-center h-10 pr-8">
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Organization Name"
                      required
                      className="bg-transparent border-none outline-none text-white placeholder-[#898889] w-full"
                      style={{
                        fontFamily:
                          "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "18px",
                        fontWeight: "500",
                        lineHeight: "24px",
                        letterSpacing: "0.5px",
                        outline: "none",
                        color: "#FFFFFF",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Organization Email Field */}
              <div
                className="flex flex-col focus-within:ring-2 focus-within:ring-[#A9A5FD] focus-within:ring-opacity-50"
                style={{
                  width: "440px",
                  height: "72px",
                  borderRadius: "8px",
                  background: "#222",
                }}
              >
                <div
                  className="flex flex-col justify-center h-full"
                  style={{
                    padding: "8px 0 8px 32px",
                    borderRadius: "8px",
                  }}
                >
                  <div className="flex flex-col justify-center h-10 pr-8">
                    <input
                      type="email"
                      value={orgEmail}
                      onChange={(e) => setOrgEmail(e.target.value)}
                      placeholder="Organization Email"
                      required
                      className="bg-transparent border-none outline-none text-white placeholder-[#898889] w-full"
                      style={{
                        fontFamily:
                          "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "18px",
                        fontWeight: "500",
                        lineHeight: "24px",
                        letterSpacing: "0.5px",
                        outline: "none",
                        color: "#FFFFFF",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Organization Password Field */}
              <div
                className="flex flex-col focus-within:ring-2 focus-within:ring-[#A9A5FD] focus-within:ring-opacity-50"
                style={{
                  width: "440px",
                  height: "72px",
                  borderRadius: "8px",
                  background: "#222",
                }}
              >
                <div
                  className="flex flex-col justify-center h-full"
                  style={{
                    padding: "8px 0 8px 32px",
                    borderRadius: "8px",
                  }}
                >
                  <div className="flex flex-col justify-center h-10 pr-8">
                    <input
                      type="password"
                      value={orgPassword}
                      onChange={(e) => {
                        setOrgPassword(e.target.value);
                        setShowPasswordStrength(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowPasswordStrength(true)}
                      onBlur={() => setShowPasswordStrength(false)}
                      placeholder="Password"
                      required
                      className="bg-transparent border-none outline-none text-white placeholder-[#898889] w-full"
                      style={{
                        fontFamily:
                          "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "18px",
                        fontWeight: "500",
                        lineHeight: "24px",
                        letterSpacing: "0.5px",
                        outline: "none",
                        color: "#FFFFFF",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {showPasswordStrength && (
                <div className="mt-2 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#898889]">Password strength:</span>
                    <span
                      className={`font-medium ${
                        checkPasswordStrength(orgPassword)
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {checkPasswordStrength(orgPassword) ? "Strong" : "Weak"}
                    </span>
                  </div>
                  <div className="text-xs text-[#898889]">
                    Must contain at least 8 characters with uppercase,
                    lowercase, number, and special character
                  </div>
                </div>
              )}

              {/* About Field */}
              <div
                className="flex flex-col focus-within:ring-2 focus-within:ring-[#A9A5FD] focus-within:ring-opacity-50"
                style={{
                  width: "440px",
                  height: "120px",
                  borderRadius: "8px",
                  background: "#222",
                }}
              >
                <div
                  className="flex flex-col justify-center h-full"
                  style={{
                    padding: "8px 0 8px 32px",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    className="flex flex-col justify-center pr-8"
                    style={{ height: "100%" }}
                  >
                    <textarea
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      placeholder="About your organization"
                      required
                      className="bg-transparent border-none outline-none text-white placeholder-[#898889] w-full resize-none"
                      style={{
                        fontFamily:
                          "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "18px",
                        fontWeight: "500",
                        lineHeight: "24px",
                        letterSpacing: "0.5px",
                        outline: "none",
                        height: "100%",
                        color: "#FFFFFF",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative flex items-center justify-between overflow-hidden group"
                  style={{
                    width: "440px",
                    height: "72px",
                    padding: "0 32px",
                    borderRadius: "8px",
                    background:
                      "linear-gradient(90deg, #A9A5FD 0%, #EBD75D 101.62%)",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  <span
                    className="font-bold text-black"
                    style={{
                      fontFamily:
                        "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                      fontSize: "18px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {loading ? "Registering..." : "Register"}
                  </span>

                  {/* Arrow Icon */}
                  <div className="flex items-center">
                    <svg width="25" height="20" viewBox="0 0 25 20" fill="none">
                      <path
                        d="M7.865 10.202L22.886 10.0574"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17.763 0.9999C20.112 4.7174 22.542 6.8115 22.886 10.0572C18.125 12.6734 15.741 14.527 12.991 19.8852"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </button>

                {/* Supporting Text */}
                <div
                  className="flex items-start w-full gap-2 mt-1"
                  style={{
                    width: "432px",
                    padding: "4px 8px 0 8px",
                  }}
                >
                  <p
                    className="flex-1"
                    style={{
                      fontFamily:
                        "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                      fontSize: "12px",
                      lineHeight: "normal",
                    }}
                  >
                    <span style={{ color: "#898889", fontWeight: "400" }}>
                      Already have an account?{" "}
                    </span>
                    <Link
                      href="/admin/login"
                      className="hover:underline"
                      style={{ color: "#FFF", fontWeight: "700" }}
                    >
                      Log in now!
                    </Link>
                  </p>
                </div>
              </div>
            </form>

            {/* Error/Success Messages */}
            {error && (
              <div className="mt-4 text-sm text-center text-red-500">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-4 text-sm text-center text-green-500">
                {success}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div
        className="absolute flex items-start justify-between"
        style={{
          width: "100vw",
          padding: "0 70px",
          left: "0",
          top: "916px",
          height: "22px",
        }}
      >
        <Link
          href="/privacy-policy"
          className="text-center hover:underline"
          style={{
            color: "#898889",
            fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
            fontSize: "18px",
            fontWeight: "400",
            lineHeight: "normal",
            letterSpacing: "-1.44px",
          }}
        >
          Privacy Policy
        </Link>
        <span
          className="text-center"
          style={{
            color: "#898889",
            fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
            fontSize: "18px",
            fontWeight: "400",
            lineHeight: "normal",
            letterSpacing: "-1.44px",
          }}
        >
          Copyright@Key2Career 2024
        </span>
      </div>
    </div>
  );
}
