"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const email = searchParams.get("email");
    const qs = email ? `?email=${encodeURIComponent(email)}` : "";
    router.replace(`/interview-prep/verify-email${qs}`);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirecting to Interview Prep verification…</p>
    </div>
  );
}