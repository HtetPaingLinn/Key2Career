import React, { useState } from "react";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400"] });

// Vibrant glassmorphism chips with strong contrast and lively hover
const colorSchemes = [
  "bg-gradient-to-br from-indigo-500/30 to-purple-500/30 text-indigo-900 backdrop-blur-md border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:from-indigo-500/45 hover:to-purple-500/45 hover:shadow-lg",
  "bg-gradient-to-br from-sky-500/30 to-cyan-500/30 text-sky-900 backdrop-blur-md border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:from-sky-500/45 hover:to-cyan-500/45 hover:shadow-lg",
  "bg-gradient-to-br from-amber-400/30 to-orange-500/30 text-amber-900 backdrop-blur-md border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:from-amber-400/45 hover:to-orange-500/45 hover:shadow-lg",
  "bg-gradient-to-br from-lime-400/30 to-emerald-500/30 text-emerald-900 backdrop-blur-md border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:from-lime-400/45 hover:to-emerald-500/45 hover:shadow-lg",
  "bg-gradient-to-br from-fuchsia-500/30 to-pink-500/30 text-fuchsia-900 backdrop-blur-md border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:from-fuchsia-500/45 hover:to-pink-500/45 hover:shadow-lg",
];

export default function EmptyState({
  dataset,
  handleGoalClick,
  dragOver,
  elements,
}) {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [step, setStep] = useState(0); // 0: choose goal, 1: choose build mode

  if (elements.length !== 0 || dragOver) return null;

  const handleGoalSelect = (item) => {
    setSelectedGoal(item);
    setStep(1);
  };

  const handleBuildMode = (mode) => {
    handleGoalClick(selectedGoal, mode); // Pass mode to parent
    setSelectedGoal(null);
    setStep(0);
  };

  return (
    <div
      className={`${montserrat.className} absolute inset-0 flex items-center justify-center z-50 pointer-events-none`}
    >
      <div className="bg-white/60 shadow-lg rounded-xl px-8 py-12 min-w-[550px] max-w-xs w-full flex flex-col items-center border border-gray-100 pointer-events-auto">
        <div className="text-4xl mb-2">🎯</div>
        <h3 className="text-xl text-center font-semibold mb-1 text-gray-700">
          Start Building Your Career Roadmap
        </h3>
        <p className="text-gray-700 text-sm mb-4 text-center">
          {step === 0
            ? "Choose your career goal to begin."
            : `As a ${selectedGoal.goal}`}
        </p>
        {step === 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-2">
            {dataset.map((item, index) => (
              <button
                key={item.id}
                className={`px-3 py-1.5 rounded-md text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 hover:-translate-y-0.5 ${colorSchemes[index % colorSchemes.length]}`}
                style={{
                  WebkitBackdropFilter: "blur(10px)",
                  backdropFilter: "blur(10px)",
                }}
                onClick={() => handleGoalSelect(item)}
              >
                {item.goal}
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="flex flex-col gap-2 w-2/3 mt-2">
            <button
              className="w-full px-4 py-1.5 rounded-lg text-md bg-gradient-to-br from-indigo-500/30 to-purple-500/30 text-indigo-900 backdrop-blur-md border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:from-indigo-500/45 hover:to-purple-500/45 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/40 hover:-translate-y-0.5"
              style={{
                WebkitBackdropFilter: "blur(10px)",
                backdropFilter: "blur(10px)",
              }}
              onClick={() => handleBuildMode("auto")}
            >
              Auto-build
            </button>
            <button
              className="w-full px-4 py-1.5 rounded-lg text-md bg-gradient-to-br from-sky-500/25 to-cyan-500/25 text-sky-900 backdrop-blur-md border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:from-sky-500/40 hover:to-cyan-500/40 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/40 hover:-translate-y-0.5"
              style={{
                WebkitBackdropFilter: "blur(10px)",
                backdropFilter: "blur(10px)",
              }}
              onClick={() => handleBuildMode("manual")}
            >
              Build manually
            </button>
            <button
              className="w-full px-2 py-1 mt-1 text-xs text-gray-700 hover:text-gray-600 underline"
              onClick={() => {
                setStep(0);
                setSelectedGoal(null);
              }}
            >
              ← Back to goal selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
