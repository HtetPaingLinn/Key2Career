"use client";
import Link from "next/link";
import { useState } from "react";

function FeatureIcon({ children }) {
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 mr-4">
      {children}
    </div>
  );
}

function checkPasswordStrength(password) {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  return strong.test(password);
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tos, setTos] = useState(false);
  const [advice, setAdvice] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!checkPasswordStrength(password)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/auth/signUp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        setSuccess("Signup successful! Please check your email for the verification code.");
        window.location.href = `/verify?email=${encodeURIComponent(email)}`;
      } else {
        const data = await res.json();
        if (data.message && data.message.toLowerCase().includes("email")) {
          setError("Email already exists. Please use a different email.");
        } else {
          setError(data.message || "Signup failed. Please try again.");
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
          <h2 className="text-2xl font-semibold text-center mb-8 text-gray-900">Create your Key2Career account</h2>
          <div className="flex justify-center gap-4 mb-6">
            <button className="flex items-center gap-2 border rounded px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"><svg width="20" height="20" fill="currentColor" className="text-blue-700" viewBox="0 0 24 24"><path d="M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14Zm-2.5 4h-1.75v2.25H16.5V7Zm-2.25 0h-1.5v2.25h1.5V7Zm-2.25 0H7.5v2.25h1.75V7Z"/></svg> LinkedIn</button>
            <button className="flex items-center gap-2 border rounded px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"><svg width="20" height="20" fill="currentColor" className="text-red-500" viewBox="0 0 24 24"><path d="M21.35 11.1h-9.18v2.92h5.27c-.23 1.25-1.4 3.67-5.27 3.67-3.18 0-5.78-2.63-5.78-5.86s2.6-5.86 5.78-5.86c1.81 0 3.03.77 3.73 1.43l2.55-2.48C16.18 3.6 14.29 2.7 12.17 2.7 6.97 2.7 2.7 6.97 2.7 12.17c0 5.2 4.27 9.47 9.47 9.47 5.2 0 9.47-4.27 9.47-9.47 0-.63-.07-1.25-.19-1.84Z"/></svg> Google</button>
          </div>
          <div className="text-center text-gray-400 mb-4">or sign up with email</div>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input type="text" placeholder="Your name*" className="border rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-200" value={name} onChange={e => setName(e.target.value)} required />
            <input type="email" placeholder="Email*" className="border rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-200" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password*" className="border rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-200" value={password} onChange={e => setPassword(e.target.value)} required />
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="tos" checked={tos} onChange={e => setTos(e.target.checked)} required />
              <label htmlFor="tos" className="text-xs text-gray-700">I agree to <Link href="#" className="text-purple-700 font-medium hover:underline">Terms of Service</Link> and <Link href="#" className="text-purple-700 font-medium hover:underline">Privacy policy</Link>*</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="advice" checked={advice} onChange={e => setAdvice(e.target.checked)} />
              <label htmlFor="advice" className="text-xs text-gray-700">Email me tailored resume advice & updates from Key2Career</label>
            </div>
            <button type="submit" className="bg-green-500 text-white rounded py-3 font-semibold text-lg mt-2 hover:bg-green-600 transition" disabled={loading}>{loading ? "Creating..." : "Create Account"}</button>
          </form>
          {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
          {success && <div className="mt-4 text-green-600 text-center">{success}</div>}
          <div className="flex flex-col items-center mt-6 gap-2">
            <div className="text-gray-600 text-sm">Already have an account? <Link href="/login" className="text-purple-700 font-medium hover:underline">Sign in</Link></div>
          </div>
        </div>
      </div>
    </div>
  );
} 