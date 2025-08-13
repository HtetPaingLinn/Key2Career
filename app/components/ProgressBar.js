"use client";

import { useMemo, useState } from "react";
import { useRoadmap } from "../context/RoadmapContext";
import dataset from "../data/dataset.json";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ProgressBar() {
  const { elements, selectedGoal } = useRoadmap();
  const [isFolded, setIsFolded] = useState(false);

  // Calculate completion percentage for the current goal
  const progressData = useMemo(() => {
    if (!selectedGoal) {
      return { percentage: 0, completed: 0, total: 0, goalName: null };
    }

    // Get all skills and tools for the current goal from dataset
    const goalData = dataset.find((goal) => goal.goal === selectedGoal.goal);
    if (!goalData) {
      return {
        percentage: 0,
        completed: 0,
        total: 0,
        goalName: selectedGoal.goal,
      };
    }

    // Count total skills and tools
    let totalSkills = 0;
    let totalTools = 0;

    Object.values(goalData.skills).forEach((skill) => {
      totalSkills++;
      if (skill.tools && Array.isArray(skill.tools)) {
        totalTools += skill.tools.length;
      }
    });

    const total = totalSkills + totalTools;

    // Count completed skills and tools
    let completedSkills = 0;
    let completedTools = 0;

    elements.forEach((element) => {
      if (element.type === "technology" && element.completed) {
        const elementName = element.technology.name;

        // Check if it's a skill
        if (goalData.skills[elementName]) {
          completedSkills++;
        }

        // Check if it's a tool
        Object.values(goalData.skills).forEach((skill) => {
          if (skill.tools && skill.tools.includes(elementName)) {
            completedTools++;
          }
        });
      }
    });

    const completed = completedSkills + completedTools;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      percentage,
      completed,
      total,
      goalName: selectedGoal.goal,
      completedSkills,
      totalSkills,
      completedTools,
      totalTools,
    };
  }, [elements, selectedGoal]);

  // Don't show if no goal is selected or no progress
  if (!selectedGoal || progressData.total === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-4 min-w-[280px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-800 truncate">
              {progressData.goalName}
            </h3>
            <button
              onClick={() => setIsFolded(!isFolded)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title={
                isFolded
                  ? "Expand progress details"
                  : "Collapse progress details"
              }
            >
              {isFolded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">
              {progressData.percentage}%
            </span>
          </div>
        </div>

        {/* Progress Bar - foldable */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isFolded ? "max-h-0 opacity-0 mb-0" : "max-h-8 opacity-100 mb-3"
          }`}
        >
          <div className="relative">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressData.percentage}%` }}
              />
            </div>
            {/* Progress indicator dot */}
            <div
              className="absolute top-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full shadow-sm transform -translate-y-1/2 transition-all duration-500 ease-out"
              style={{ left: `calc(${progressData.percentage}% - 6px)` }}
            />
          </div>
        </div>

        {/* Foldable content */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isFolded ? "max-h-0 opacity-0" : "max-h-32 opacity-100"
          }`}
        >
          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <div className="flex items-center space-x-4">
              <span>
                {progressData.completedSkills}/{progressData.totalSkills} skills
              </span>
              {progressData.totalTools > 0 && (
                <span>
                  {progressData.completedTools}/{progressData.totalTools} tools
                </span>
              )}
            </div>
            <span className="font-medium">
              {progressData.completed}/{progressData.total} completed
            </span>
          </div>

          {/* Completion message */}
          {progressData.percentage === 100 && (
            <div className="text-xs text-green-600 font-medium flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Goal completed! 🎉
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
