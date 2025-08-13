"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400"] });

export default function EnterEmailPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      // First check for CV skills
      const cvRes = await fetch(
        `/api/cv-skills?email=${encodeURIComponent(email)}`
      );
      const cvData = await cvRes.json();

      // Then check for roadmap data
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.roadmap) {
        // Clear any existing localStorage data first to prevent data from previous users
        localStorage.removeItem("roadmaps");
        localStorage.removeItem("canvas");
        localStorage.removeItem("selectedGoal");
        localStorage.removeItem("skills");
        localStorage.removeItem("foldedSkills");
        localStorage.removeItem("removedCvSkills");

        // Set the new user email
        localStorage.setItem("userEmail", email);

        // Store CV skills if they exist (normalize shape to { technical, soft })
        const skillsPayload = cvData?.skills || cvData;
        if (skillsPayload?.technical || skillsPayload?.soft) {
          localStorage.setItem("cvSkills", JSON.stringify(skillsPayload));
        }

        // Store the complete roadmap data in localStorage for the context to use
        // Only store data if it exists and belongs to this user
        if (data.roadmaps && Object.keys(data.roadmaps).length > 0) {
          localStorage.setItem("roadmaps", JSON.stringify(data.roadmaps));
        }
        if (data.canvas) {
          localStorage.setItem("canvas", JSON.stringify(data.canvas));
        }
        if (data.selectedGoal) {
          localStorage.setItem(
            "selectedGoal",
            JSON.stringify(data.selectedGoal)
          );
        }
        if (data.skills && data.skills.length > 0) {
          localStorage.setItem("skills", JSON.stringify(data.skills));
        }
        if (data.foldedSkills && data.foldedSkills.length > 0) {
          localStorage.setItem(
            "foldedSkills",
            JSON.stringify(data.foldedSkills)
          );
        }

        router.replace("/roadmap");
      } else {
        setError(data.error || "Failed to check roadmap.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] ${montserrat.className}`}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white px-20 py-20 rounded-2xl shadow-xl w-full max-w-lg flex flex-col items-center"
      >
        <h2 className="mb-2 font-bold text-2xl text-[#22223b] tracking-tight">
          Welcome To Roadmap Builder
        </h2>
        <p className="mb-5 text-[#4f5d75] text-xs text-center w-2/3">
          Enter your email to continue to your interactive career roadmap
        </p>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 mb-2 rounded-lg text-indigo-800 border border-[#bfc9d9] text-sm focus:outline-none focus:border-[#4361ee] transition"
          required
        />
        {error && (
          <div className="text-red-500 mb-2 text-sm w-full text-left">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="w-full py-3 mt-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold text-sm shadow transition"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
