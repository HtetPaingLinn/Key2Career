"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("http://localhost:8080/auth/verifyUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, verification_code: code }),
      });
      if (res.ok) {
        setMessage("Verification successful! Redirecting to login...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        const data = await res.json();
        setError(data.message || "Verification failed. Please check your code.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`http://localhost:8080/auth/resendCode?email=${encodeURIComponent(email)}`, {
        method: "POST",
      });
      if (res.ok) {
        setMessage("Verification code resent. Please check your email.");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to resend code.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#f7f7fb] to-[#f7f7fb]">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-gray-100">
        <div className="flex justify-center mb-6">
          <img src="/mainlogo.png" alt="Key2Career Logo" className="h-12 w-auto" />
        </div>
        <h2 className="text-2xl font-semibold text-center mb-8 text-gray-900">Verify Your Email</h2>
        <form className="flex flex-col gap-4" onSubmit={handleVerify}>
          <input
            type="email"
            placeholder="Your Email"
            className="border rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-gray-100"
            value={email}
            readOnly
            required
          />
          <input
            type="text"
            placeholder="Verification Code"
            className="border rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-200"
            value={code}
            onChange={e => setCode(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-green-500 text-white rounded py-3 font-semibold text-lg mt-2 hover:bg-green-600 transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
        <button
          onClick={handleResend}
          className="w-full mt-4 text-purple-700 font-medium hover:underline disabled:opacity-60"
          disabled={resendLoading || !email}
        >
          {resendLoading ? "Resending..." : "Resend Code"}
        </button>
        {message && <div className="mt-4 text-green-600 text-center">{message}</div>}
        {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
      </div>
    </div>
  );
} 