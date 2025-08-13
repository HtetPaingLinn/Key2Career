"use client";

import { useState } from "react";
import { X, ArrowRight, Lightbulb, MousePointer } from "lucide-react";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400"] });

export default function DemoGuide({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Career Roadmap Builder!",
      description:
        "Build your personalized learning path by dragging technologies onto the canvas.",
      icon: "🎯",
      action: "Let's get started!",
    },
    {
      title: "Browse Technologies",
      description:
        "Click on the 'Technologies' tab in the sidebar to see all available technologies organized by category.",
      icon: "💻",
      action: "Next",
    },
    {
      title: "Drag & Drop",
      description:
        "Drag any technology from the sidebar onto the canvas to add it to your roadmap.",
      icon: "🖱️",
      action: "Next",
    },
    {
      title: "Get Suggestions",
      description:
        "Switch to the 'Suggestions' tab to see intelligent recommendations for your next steps.",
      icon: "💡",
      action: "Next",
    },
    {
      title: "Organize & Customize",
      description:
        "Drag elements around the canvas to organize your learning path. Click to select and delete unwanted elements.",
      icon: "🎨",
      action: "Get Started!",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <div
      className={`${montserrat.className} fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50`}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Quick Start Guide</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100/80 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{steps[currentStep].icon}</div>
          <h3 className="text-[20px] font-semibold text-gray-800 mb-2">
            {steps[currentStep].title}
          </h3>
          <p className="text-gray-600 text-xs max-w-xs mx-auto">
            {steps[currentStep].description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? "bg-indigo-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-sm px-4 py-2 rounded-lg transition-colors border border-gray-200 bg-gray-50/80 hover:bg-gray-100/80 backdrop-blur-sm"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors shadow-sm"
            >
              <span className="text-sm">{steps[currentStep].action}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
