"use client";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function FeatureIcon({ children }) {
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 mr-4">
      {children}
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  console.log("Redirect param:", searchParams.get("redirect"));

  const handleSubmit = async (e) => {
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
        setSuccess("Login successful!");
        // Store JWT (customize as needed)
        localStorage.setItem("jwt", data.jwtToken || "");
        // Redirect to dashboard or home
        const redirect = searchParams.get("redirect");
        if (redirect) {
          router.replace(redirect);
        } else {
          router.replace("/");
        }
      } else {
        const data = await res.json();
        if (data.message && data.message.toLowerCase().includes("verify")) {
          setError("Your account is not verified. Please verify your email.");
        } else {
          setError(data.message || "Login failed. Please check your credentials.");
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#f7f7fb] to-[#f7f7fb]">
      <div className="flex w-full max-w-5xl bg-white bg-opacity-0 rounded-lg shadow-none">
        {/* Left Side */}
        <div className="w-1/2 flex flex-col justify-center px-12 py-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Unlock Your Career Potential</h2>
          <ul className="space-y-8 mb-8">
            <li className="flex items-center">
              <FeatureIcon>
                {/* Resume SVG */}
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M8 7h8M8 11h8M8 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </FeatureIcon>
              <span className="text-gray-800 text-base font-medium">Build professional resumes with ease</span>
            </li>
            <li className="flex items-center">
              <FeatureIcon>
                {/* Advice SVG */}
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </FeatureIcon>
              <span className="text-gray-800 text-base font-medium">Access expert career advice and resources</span>
            </li>
            <li className="flex items-center">
              <FeatureIcon>
                {/* Trophy SVG */}
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M8 21h8M12 17v4M4 5v2a8 8 0 0 0 16 0V5" stroke="currentColor" strokeWidth="2"/><rect x="2" y="3" width="20" height="4" rx="2" stroke="currentColor" strokeWidth="2"/></svg>
              </FeatureIcon>
              <span className="text-gray-800 text-base font-medium">Showcase your achievements to top employers</span>
            </li>
          </ul>
          <p className="text-sm text-gray-700">
            Join thousands of successful job seekers on <span className="font-bold text-purple-700">Key2Career</span>
          </p>
        </div>
        {/* Right Side */}
        <div className="w-1/2 flex flex-col justify-center px-12 py-16 bg-white rounded-lg shadow-lg border border-gray-100">
          <div className="flex justify-center mb-6">
            <img src="/mainlogo.png" alt="Key2Career Logo" className="h-12 w-auto" />
          </div>
          <h2 className="text-2xl font-semibold text-center mb-8 text-gray-900">Sign in to Key2Career</h2>
          <div className="flex justify-center gap-4 mb-6">
            <button className="flex items-center gap-2 border rounded px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"><svg width="20" height="20" fill="currentColor" className="text-blue-700" viewBox="0 0 24 24"><path d="M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14Zm-2.5 4h-1.75v2.25H16.5V7Zm-2.25 0h-1.5v2.25h1.5V7Zm-2.25 0H7.5v2.25h1.75V7Z"/></svg> LinkedIn</button>
            <button className="flex items-center gap-2 border rounded px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"><svg width="20" height="20" fill="currentColor" className="text-red-500" viewBox="0 0 24 24"><path d="M21.35 11.1h-9.18v2.92h5.27c-.23 1.25-1.4 3.67-5.27 3.67-3.18 0-5.78-2.63-5.78-5.86s2.6-5.86 5.78-5.86c1.81 0 3.03.77 3.73 1.43l2.55-2.48C16.18 3.6 14.29 2.7 12.17 2.7 6.97 2.7 2.7 6.97 2.7 12.17c0 5.2 4.27 9.47 9.47 9.47 5.2 0 9.47-4.27 9.47-9.47 0-.63-.07-1.25-.19-1.84Z"/></svg> Google</button>
            <button className="flex items-center gap-2 border rounded px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"><svg width="20" height="20" fill="currentColor" className="text-blue-600" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24h11.495v-9.294H9.692v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0"/></svg> Facebook</button>
          </div>
          <div className="text-center text-gray-400 mb-4">or use your email</div>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input type="email" placeholder="Your Email" className="border rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-200" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" className="border rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-200" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" className="bg-green-500 text-white rounded py-3 font-semibold text-lg mt-2 hover:bg-green-600 transition" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
          </form>
          {error && <div className="mt-4 text-red-600 text-center">{error} {error.toLowerCase().includes("verify") && (
            <Link href={`/verify?email=${encodeURIComponent(email)}`} className="text-purple-700 underline ml-2">Verify now</Link>
          )}</div>}
          {success && <div className="mt-4 text-green-600 text-center">{success}</div>}
          <div className="flex flex-col items-center mt-6 gap-2">
            <Link href="#" className="text-purple-700 text-sm font-medium hover:underline">Forgot your password?</Link>
            <div className="text-gray-600 text-sm">First time here? <Link href="/signup" className="text-purple-700 font-medium hover:underline">Create an account</Link></div>
          </div>
        </div>
      </div>
    </div>
  );
} 