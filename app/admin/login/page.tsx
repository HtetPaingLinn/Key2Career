"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Function to convert technical errors to user-friendly messages
  const getUserFriendlyError = (error: string) => {
    if (error.includes("JDBC Connection")) {
      return "We're having trouble connecting to our servers. Please try again in a few minutes.";
    }
    if (error.includes("Connection is not available")) {
      return "Our service is temporarily unavailable. Please try again later.";
    }
    if (error.includes("request timed out")) {
      return "The request took too long to complete. Please check your internet connection and try again.";
    }
    if (error.includes("credentials")) {
      return "The email or password you entered is incorrect. Please try again.";
    }
    if (error.includes("verify")) {
      return "Please verify your email address before logging in.";
    }
    // Default error message
    return "Something went wrong. Please try again or contact support if the problem persists.";
  };

  // Function to parse JWT and extract role
  const parseJWTForRole = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      return payload.role || null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Login response:', data);
        
        // Store JWT token and admin email
        const jwtToken = data.jwtToken || "";
        localStorage.setItem("jwt", jwtToken);
        localStorage.setItem("adminEmail", email);
        
        // Check user role from JWT
        const userRole = parseJWTForRole(jwtToken);
        console.log('Admin Login - JWT Token:', jwtToken);
        console.log('Admin Login - Parsed User role:', userRole, 'Type:', typeof userRole);
        
        // Also log the full JWT payload for debugging
        try {
          const payload = JSON.parse(atob(jwtToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
          console.log('Admin Login - Full JWT payload:', payload);
        } catch (e) {
          console.error('Admin Login - Error parsing JWT payload:', e);
        }
        
        if (userRole === "ADMIN") {
          setSuccess("Admin login successful!");
          console.log('Admin Login - Redirecting to admin dashboard');
          // Redirect directly to org-mgmt for admin users
          router.replace("/admin/dashboard/org-mgmt");
        } else {
          // Clear admin data and redirect to home for non-admin users
          console.log('Admin Login - Access denied for role:', userRole);
          localStorage.removeItem("jwt");
          localStorage.removeItem("adminEmail");
          setError("Access denied. Only administrators can access this area.");
        }
      } else {
        const data = await res.json();
        setError(getUserFriendlyError(data.message || "credentials"));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error";
      setError(getUserFriendlyError(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        width: '100vw',
        height: '100vh',
        background: '#1D1D1F',
        fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif'
      }}
    >
      {/* Main Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
        {/* Header Text */}
        <div className="flex flex-col items-center gap-5 mb-20">
          <h1
            className="text-white text-center relative"
            style={{
              fontFamily: 'Space Grotesk, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '54px',
              fontWeight: '500',
              lineHeight: 'normal',
              letterSpacing: '-4.32px'
            }}
          >
            Log In to Admin
          </h1>
          <p
            className="text-center relative max-w-2xl"
            style={{
              color: '#898889',
              fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '22px',
              fontWeight: '500',
              lineHeight: 'normal',
              letterSpacing: '-1px'
            }}
          >
            Welcome back! Please log in to access your administrator account
            and manage Key2Career resources.
          </p>
        </div>

        {/* Main Container */}
        <div className="flex justify-center items-start max-w-6xl w-full">
          {/* Form Fields */}
          <div className="flex flex-col items-center gap-4" style={{ width: '440px' }}>
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {/* Email Field */}
              <div
                className="flex flex-col focus-within:ring-2 focus-within:ring-[#A9A5FD] focus-within:ring-opacity-50"
                style={{
                  width: '440px',
                  height: '72px',
                  borderRadius: '8px',
                  background: '#222'
                }}
              >
                <div
                  className="flex h-full flex-col justify-center"
                  style={{
                    padding: '8px 0 8px 32px',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  <div className="flex h-10 pr-8 flex-col justify-center">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      required
                      className="bg-transparent border-none outline-none text-white placeholder-[#898889] w-full"
                      style={{
                                                  fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                          fontSize: '18px',
                          fontWeight: '500',
                          lineHeight: '24px',
                          letterSpacing: '0.5px',
                          outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div
                className="flex flex-col focus-within:ring-2 focus-within:ring-[#A9A5FD] focus-within:ring-opacity-50"
                style={{
                  width: '440px',
                  height: '72px',
                  borderRadius: '8px',
                  background: '#222122'
                }}
              >
                <div
                  className="flex h-full flex-col justify-center"
                  style={{
                    padding: '8px 0 8px 32px',
                    borderRadius: '8px'
                  }}
                >
                  <div className="flex h-10 pr-8 flex-col justify-center">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="bg-transparent border-none outline-none text-white placeholder-[#898889] w-full"
                      style={{
                                                  fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                          fontSize: '18px',
                          fontWeight: '500',
                          lineHeight: '24px',
                          letterSpacing: '0.5px',
                          outline: 'none'
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
                  className="flex justify-between items-center relative overflow-hidden group"
                  style={{
                    width: '440px',
                    height: '72px',
                    padding: '0 32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(90deg, #A9A5FD 0%, #EBD75D 101.62%)',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <span
                    className="text-black font-bold"
                    style={{
                      fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '18px',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {loading ? "Logging In..." : "Log In"}
                  </span>

                  {/* Arrow Icon */}
                  <div className="flex items-center">
                    <svg width="25" height="20" viewBox="0 0 25 20" fill="none">
                      <path d="M7.865 10.202L22.886 10.0574" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17.763 0.9999C20.112 4.7174 22.542 6.8115 22.886 10.0572C18.125 12.6734 15.741 14.527 12.991 19.8852" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>

                {/* Supporting Text */}
                <div
                  className="flex w-full items-start gap-2 mt-1"
                  style={{
                    width: '432px',
                    padding: '4px 8px 0 8px'
                  }}
                >
                  <p
                    className="flex-1"
                    style={{
                      fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                      fontSize: '12px',
                      lineHeight: 'normal'
                    }}
                  >
                    <span style={{ color: '#898889', fontWeight: '400' }}>Don't have an account? </span>
                    <Link
                      href="/admin/signup"
                      className="hover:underline"
                      style={{ color: '#FFF', fontWeight: '700' }}
                    >
                      Create one now!
                    </Link>
                  </p>
                </div>
              </div>
            </form>

            {/* Error/Success Messages */}
            {error && (
              <div className="text-red-500 text-center mt-4 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-500 text-center mt-4 text-sm">
                {success}
              </div>
            )}
          </div>
        </div>


      </div>

      {/* Footer Links */}
      <div
        className="absolute flex justify-between items-start"
        style={{
          width: '100vw',
          padding: '0 70px',
          left: '0',
          top: '916px',
          height: '22px'
        }}
      >
        <Link
          href="/privacy-policy"
          className="text-center hover:underline"
          style={{
            color: '#898889',
            fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            fontSize: '18px',
            fontWeight: '400',
            lineHeight: 'normal',
            letterSpacing: '-1.44px'
          }}
        >
          Privacy Policy
        </Link>
        <span
          className="text-center"
          style={{
            color: '#898889',
            fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            fontSize: '18px',
            fontWeight: '400',
            lineHeight: 'normal',
            letterSpacing: '-1.44px'
          }}
        >
          Copyright@Key2Career 2024
        </span>
      </div>
    </div>
  );
}