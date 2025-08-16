"use client";

import { Montserrat } from "next/font/google";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Lightbulb,
  PanelRightClose,
  PanelRight,
  Hand,
  Bell,
  Undo2,
  Redo2,
  Folder,
  X,
  MousePointer,
  BarChart3,
  Loader2,
} from "lucide-react";
import { useRoadmap } from "../context/RoadmapContext";
import WarningPrompt from "./WarningPrompt";
import dataset from "../data/dataset.json";
import { roadmapData } from "../data/roadmapData";
import { useAuth } from "../../lib/useAuth";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400"] });

// Helper to get the first skill technology for a goal (moved from RoadmapCanvas.js)
function getFirstSkillTechnology(goalData, roadmapData) {
  const skills = goalData.skills;
  const firstSkillName = Object.keys(skills).find(
    (skillName) => skills[skillName].level === 1
  );
  if (!firstSkillName) return null;
  // Find the technology in roadmapData that matches the skill name
  const technology = roadmapData.technologies.find(
    (tech) => tech.name.toLowerCase() === firstSkillName.toLowerCase()
  );
  if (technology) {
    return technology;
  }
  // If not found in roadmapData, create a basic technology object
  return {
    id: firstSkillName.toLowerCase().replace(/\s+/g, "-"),
    name: firstSkillName,
    category: "others",
    level: "beginner",
    prerequisites: [],
    nextSteps: [],
    description: `Starting point for ${goalData.goal} career path`,
    popularity: 50,
  };
}

export default function Toolbar({
  levelGapPrompt,
  levelGapCount,
  showGapPopover,
  setShowGapPopover,
  onCloseLevelGapPrompt,
  levelGapPrompts,
  showSidebar,
  toggleSidebar,
  crossGoalWarning,
  setCrossGoalWarning,
  commonCompletedSkillsWarning,
  setCommonCompletedSkillsWarning,
  lastSkillDeletionWarning,
  setLastSkillDeletionWarning,
  onAddCommonCompletedSkills,
  onToggleKeyboardHints,
  showKeyboardHintsProp,
  pointerToolActive,
  togglePointerTool,
  handToolActive,
  toggleHandTool,
  cvSkills,
  justSelectedGoalFromEmptyState,
  onAddCvSkill,
  onClearCvSkillsWarning,
  onGoalSwitchComplete,
  onSetFirstTimeUser,
  onSetJustSwitchedToGoalFromCvSkill,
}) {
  const {
    showSuggestions,
    toggleSuggestions,
    canvas,
    setZoom,
    resetView,
    showKeyboardHints,
    toggleKeyboardHints,
    selectedGoal,
    setSelectedGoal,
    previousGoal,
    roadmaps,
    switchGoal,
    elements,
    deleteSelectedElements,
    addElement,
    setSuggestions,
    completedTechnologies,
    addMultipleElements,
    undo,
    redo,
    undoStack,
    redoStack,
    removedCvSkills,
    addRemovedCvSkill,
  } = useRoadmap();

  const router = useRouter();
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const handleViewStats = () => {
    setIsLoadingStats(true);
    router.push("/roadmap/stats");
  };

  // Ensure no default goal is set for new users
  useEffect(() => {
    // If there is no selectedGoal and no roadmaps, do NOT set any default goal
    // (This prevents 'Backend Developer' or any other goal from being pre-selected)
    // If you want to show an empty state, handle it in the UI below
  }, [selectedGoal, roadmaps]);

  // Helper function to check if a CV skill is already present in any roadmap
  const isCvSkillAlreadyInRoadmap = useCallback(
    (skillName, goalId) => {
      if (!roadmaps || !goalId) return false;
      if (!skillName || typeof skillName !== "string") return false;

      // Check if the skill exists in the specific goal's roadmap
      const goalElements = roadmaps[goalId];
      if (!goalElements) return false;

      // Normalize the skill name for comparison
      const normalizedSkillName = skillName.toLowerCase().trim();

      // Check for exact match with skill names
      const skillExists = goalElements.some((element) => {
        if (element.type === "technology" && !element.isTool) {
          return (
            element.technology.name.toLowerCase().trim() === normalizedSkillName
          );
        }
        return false;
      });

      if (skillExists) return true;

      // Check for match with tool names
      const toolExists = goalElements.some((element) => {
        if (element.type === "technology" && element.isTool) {
          return (
            element.technology.name.toLowerCase().trim() === normalizedSkillName
          );
        }
        return false;
      });

      return toolExists;
    },
    [roadmaps]
  );

  // Helper: find matched goalId for a CV skill/tool name across dataset
  const findCvMatchedGoalId = useCallback((name) => {
    if (!name || typeof name !== "string") return undefined;
    const normalized = name.toLowerCase().trim();
    for (const goal of dataset) {
      const skillNames = Object.keys(goal.skills);
      // direct skill match
      for (const skillName of skillNames) {
        if (skillName.toLowerCase().trim() === normalized) {
          return goal.id;
        }
      }
      // tool match within skills
      for (const skillName of skillNames) {
        const skillData = goal.skills[skillName];
        const tools = skillData?.tools;
        if (Array.isArray(tools)) {
          for (const tool of tools) {
            if (String(tool).toLowerCase().trim() === normalized) {
              return goal.id;
            }
          }
        }
      }
    }
    return undefined;
  }, []);

  // Compute remaining CV skills count (excluding removed skills and already added ones)
  const remainingCvSkillsCount = useMemo(() => {
    if (!cvSkills || !Array.isArray(cvSkills.technical)) return 0;
    const count = cvSkills.technical.filter((entry) => {
      const name = typeof entry === "string" ? entry : entry?.name;
      if (!name || typeof name !== "string") return false;
      // Resolve goalId if not provided
      let goalId = typeof entry === "string" ? undefined : entry?.goalId;
      if (!goalId) goalId = findCvMatchedGoalId(name);
      // If not matchable to any goal, ignore from count
      if (!goalId) return false;
      const skillKey = `${name}-${goalId || "unknown"}`;
      const isRemoved = removedCvSkills.has(skillKey);
      const isAlreadyInRoadmap = goalId
        ? isCvSkillAlreadyInRoadmap(name, goalId)
        : false;

      return !isRemoved && !isAlreadyInRoadmap;
    }).length;
    console.log("Toolbar - CV skills debug:", {
      totalSkills: Array.isArray(cvSkills.technical)
        ? cvSkills.technical.length
        : 0,
      removedSkills: Array.from(removedCvSkills),
      remainingCount: count,
      justSelectedGoalFromEmptyState,
      cvSkills: cvSkills.technical,
      roadmaps: Object.keys(roadmaps || {}),
    });
    return count;
  }, [
    cvSkills,
    removedCvSkills,
    justSelectedGoalFromEmptyState,
    isCvSkillAlreadyInRoadmap,
  ]);

  // Track all selected goals (from roadmaps keys)
  const selectedGoals = Object.keys(roadmaps)
    .map((goalId) => dataset.find((g) => g.id === parseInt(goalId)))
    .filter(Boolean);

  const [showGoalDropdown, setShowGoalDropdown] = useState(false);
  const [pendingGoal, setPendingGoal] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const buttonRef = useRef(null);
  const [dropdownWidth, setDropdownWidth] = useState(undefined);
  const [showAddGoalDropdown, setShowAddGoalDropdown] = useState(false);

  useEffect(() => {
    if (showGoalDropdown && buttonRef.current) {
      setDropdownWidth(buttonRef.current.offsetWidth);
    }
  }, [showGoalDropdown]);

  useEffect(() => {
    function handleKeyDown(e) {
      // Ctrl+Z for Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        if (undoStack && undoStack.length > 0) {
          e.preventDefault();
          undo();
        }
      }
      // Ctrl+Y for Redo
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        if (redoStack && redoStack.length > 0) {
          e.preventDefault();
          redo();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo, undoStack, redoStack]);

  // Helper to open LevelGapPrompt (sidebar closing handled by parent)
  const handleOpenGapPopover = () => {
    setShowGapPopover(true);
  };

  // Helper to toggle sidebar and close LevelGapPrompt if open
  const handleToggleSidebar = () => {
    if (showGapPopover) setShowGapPopover(false);
    toggleSidebar();
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(4, canvas.zoom * 1.2);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.01, canvas.zoom / 1.2);
    setZoom(newZoom);
  };

  const handleResetView = () => {
    resetView(); // Reset to 100%
  };

  // Handle goal switch
  const handleGoalSwitch = (goalObj) => {
    setShowGoalDropdown(false);
    if (!selectedGoal || goalObj.goal === selectedGoal.goal) return;
    if (elements.length === 0) {
      setSelectedGoal(goalObj);
      return;
    }
    setPendingGoal(goalObj);
    setShowConfirm(true);
  };

  const handleConfirmSwitch = () => {
    if (pendingGoal) {
      deleteSelectedElements();
      setSelectedGoal(pendingGoal);
      setPendingGoal(null);
      setShowConfirm(false);
    }
  };

  const handleCancelSwitch = () => {
    setPendingGoal(null);
    setShowConfirm(false);
  };

  // Dropdown animation classes
  const dropdownAnim =
    "transition-all duration-200 ease-out transform opacity-100 scale-100";
  const dropdownAnimHidden = "opacity-0 scale-95 pointer-events-none";

  // Profile circle state
  const [showEmailPopover, setShowEmailPopover] = useState(false);
  const profileCircleRef = useRef(null);
  const { userEmail } = useAuth();

  // Helper to get first letter and color
  function getProfileCircleData(email) {
    if (!email) return { letter: "", color: "#e0e7ff" };
    const letter = email[0].toUpperCase();
    return { letter };
  }
  const { letter } = getProfileCircleData(userEmail);

  return (
    <div
      className={`${montserrat.className} bg-white px-4 py-2 flex items-center justify-between shadow-sm fixed top-0 left-0 right-0 z-50`}
    >
      <div className="flex items-center space-x-4">
        {/* If one or more goals are selected, show dropdown with all selected goals and 'Add another goal' */}
        {selectedGoal && (
          <div className="relative">
            <button
              ref={buttonRef}
              className="flex justify-center items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-blue-200 shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all text-blue-800 text-sm min-w-[230px] max-w-md"
              onClick={() => setShowGoalDropdown((v) => !v)}
              style={{ boxShadow: "0 1px 4px rgba(30,64,175,0.04)" }}
            >
              <span className="font-medium text-blue-900 text-sm flex items-center justify-center">
                {selectedGoal.goal}
              </span>
              <svg
                className={`w-4 h-4 text-blue-400 transition-transform ${showGoalDropdown ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {/* Dropdown with all selected goals and Add another goal */}
            <div
              className={`absolute left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow z-50 ${showGoalDropdown ? dropdownAnim : dropdownAnimHidden}`}
              style={{ minWidth: dropdownWidth, width: dropdownWidth }}
            >
              <div className="rounded-md">
                {selectedGoals.map((goalObj) => (
                  <button
                    key={goalObj.id}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 transition-colors text-left group hover:bg-blue-50 text-gray-800 ${goalObj.id === selectedGoal.id ? "font-bold" : ""}`}
                    onClick={() => {
                      setShowGoalDropdown(false);
                      if (goalObj.id !== selectedGoal.id) switchGoal(goalObj);
                    }}
                    style={{ fontSize: "0.85rem" }}
                  >
                    <span className="flex-1 truncate">{goalObj.goal}</span>
                  </button>
                ))}
                {/* Wrap the Add another goal button and sub-dropdown in a relative div */}
                <div className="relative">
                  <button
                    className={`w-full flex items-center gap-2 px-3 py-1.5 transition-colors text-left group hover:bg-green-50 text-green-700 font-medium border-t border-gray-100 ${showAddGoalDropdown ? "bg-green-100" : ""}`}
                    style={{
                      fontSize: "0.85rem",
                      position: "relative",
                      zIndex: 10,
                    }}
                    onClick={() => setShowAddGoalDropdown(true)}
                    type="button"
                  >
                    {/* <Folder size={16} className="text-green-500" /> */}
                    <span className="flex-1 truncate">+ Add another goal</span>
                    <svg
                      className={`w-4 h-4 text-green-400 transition-transform ${showAddGoalDropdown ? "rotate-90" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  {/* Add another goal sub-dropdown, now positioned relative to the button */}
                  {showAddGoalDropdown && (
                    <div
                      className="absolute left-full top-0 ml-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 transition-transform duration-200 ease-out transform"
                      style={{
                        minWidth: dropdownWidth,
                        width: dropdownWidth,
                        boxShadow: "0 4px 16px rgba(30,64,175,0.10)",
                        transform: showAddGoalDropdown
                          ? "translateX(0)"
                          : "translateX(-20px)",
                        opacity: showAddGoalDropdown ? 1 : 0,
                      }}
                    >
                      <div className="rounded-md max-h-60 overflow-y-auto">
                        {dataset
                          .filter(
                            (goalObj) =>
                              !selectedGoals.some((g) => g.id === goalObj.id) &&
                              goalObj.id !== selectedGoal.id
                          )
                          .map((goalObj) => (
                            <button
                              key={goalObj.id}
                              className="w-full flex items-center gap-2 px-3 py-1.5 transition-colors text-left group hover:bg-blue-50 text-gray-800"
                              onClick={() => {
                                setShowAddGoalDropdown(false);
                                setShowGoalDropdown(false);
                                switchGoal(goalObj); // This will save current roadmap and show a new empty one for the new goal
                                // Mark user as no longer first-time since they're switching goals
                                if (onSetFirstTimeUser) {
                                  onSetFirstTimeUser(false);
                                }
                                // --- Immediately add the first skill for the new goal ---
                                const technology = getFirstSkillTechnology(
                                  goalObj,
                                  roadmapData
                                );
                                if (technology) {
                                  addElement({
                                    id: `${technology.id}-${Date.now()}`,
                                    type: "technology",
                                    technology: technology,
                                    position: { x: 400, y: 200 }, // Center-ish
                                    size: { width: 150, height: 40 },
                                    completed: false,
                                    isSkill: true,
                                    skillData: goalObj.skills[technology.name],
                                    goalData: goalObj,
                                  });
                                }
                              }}
                              style={{ fontSize: "0.85rem" }}
                            >
                              <span className="flex-1 truncate">
                                {goalObj.goal}
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* UI prompt if no goal is selected */}
        {!selectedGoal && (
          <div className="text-gray-500 italic px-2 py-1">
            Please select a goal to get started!
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 relative">
        <button
          onClick={handleToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-900"
          title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
        >
          {showSidebar ? (
            <PanelRightClose size={16} />
          ) : (
            <PanelRight size={16} />
          )}
        </button>

        {/* Pointer Tool */}
        <button
          onClick={togglePointerTool}
          className={`p-2 rounded-md transition-colors ${
            pointerToolActive
              ? "bg-blue-100 text-blue-600"
              : "hover:bg-gray-100 text-gray-600"
          }`}
          title="Pointer Tool (V)"
          aria-label="Pointer Tool"
        >
          <MousePointer size={16} />
        </button>

        {/* Hand Tool */}
        <button
          onClick={toggleHandTool}
          className={`p-2 rounded-md transition-colors ${
            handToolActive
              ? "bg-blue-100 text-blue-600"
              : "hover:bg-gray-100 text-gray-600"
          }`}
          title="Hand Tool (Spacebar + Left Click)"
        >
          <Hand size={16} />
        </button>

        <div className="flex items-center space-x-1 bg-white rounded-lg p-1 border border-gray-300">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-md transition-colors text-gray-300 hover:text-gray-500"
            title="Zoom Out (Alt + Scroll)"
          >
            <ZoomOut size={16} />
          </button>

          <span className="px-2 text-sm font-medium text-gray-700 min-w-[60px] text-center">
            {Math.round(canvas.zoom * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            className="p-2 rounded-md transition-colors text-gray-300 hover:text-gray-500"
            title="Zoom In (Alt + Scroll)"
          >
            <ZoomIn size={16} />
          </button>
          {/* Undo Button */}
          <button
            onClick={undo}
            className={`p-2 rounded-md transition-colors ${undoStack && undoStack.length > 0 ? "text-gray-600 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed"}`}
            title="Undo (Ctrl+Z)"
            disabled={!undoStack || undoStack.length === 0}
            type="button"
          >
            <Undo2 size={16} />
          </button>
          {/* Redo Button */}
          <button
            onClick={redo}
            className={`p-2 rounded-md transition-colors ${redoStack && redoStack.length > 0 ? "text-gray-600 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed"}`}
            title="Redo (Ctrl+Y)"
            disabled={!redoStack || redoStack.length === 0}
            type="button"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* <button
          onClick={handleResetView}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          title="Reset View"
        >
          <RotateCcw size={16} />
        </button> */}

        <button
          onClick={onToggleKeyboardHints}
          className={`p-2 rounded-md transition-colors ${
            showKeyboardHintsProp
              ? "bg-blue-100 text-blue-600"
              : "hover:bg-gray-100 text-gray-600"
          }`}
          title="Toggle Keyboard Hints"
        >
          <Lightbulb size={16} />
        </button>

        {/* Stats Button */}
        <button
          onClick={handleViewStats}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600"
          title="View Statistics"
          disabled={isLoadingStats}
        >
          {isLoadingStats ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <BarChart3 size={16} />
          )}
        </button>

        {/* Profile Circle */}
        <div className="relative">
          <button
            ref={profileCircleRef}
            className={`p-2 rounded-md transition-colors border-2 ${showEmailPopover ? "bg-indigo-100 border-indigo-200" : "bg-indigo-50 border-indigo-100"} text-indigo-500 font-semibold flex items-center justify-center`}
            style={{ width: 36, height: 36, fontSize: "0.9rem", lineHeight: 1 }}
            onClick={() => setShowEmailPopover((v) => !v)}
            title="Profile"
            type="button"
          >
            {letter}
          </button>
          {/* Popover for email */}
          {showEmailPopover && userEmail && (
            <div
              className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 px-4 py-2 min-w-[300px] text-gray-800 text-sm"
              style={{ whiteSpace: "nowrap" }}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="font-semibold">Signed in as</div>
                <button
                  className="ml-4 p-1 rounded hover:bg-gray-100 focus:outline-none"
                  onClick={() => setShowEmailPopover(false)}
                  type="button"
                  aria-label="Close"
                >
                  <X size={13} />
                </button>
              </div>
              <div className="break-all">{userEmail}</div>
            </div>
          )}
        </div>

        {/* Level Gap Warning Icon */}
        {(levelGapCount > 0 && levelGapPrompts && levelGapPrompts.length > 0) ||
        crossGoalWarning ||
        commonCompletedSkillsWarning ||
        lastSkillDeletionWarning ||
        (justSelectedGoalFromEmptyState &&
          cvSkills &&
          cvSkills.technical &&
          remainingCvSkillsCount > 0) ? (
          <div className="relative">
            <button
              onClick={() =>
                showGapPopover
                  ? setShowGapPopover(false)
                  : handleOpenGapPopover()
              }
              className={`p-2 rounded-md transition-colors border-2 ${
                justSelectedGoalFromEmptyState &&
                cvSkills &&
                cvSkills.technical &&
                remainingCvSkillsCount > 0
                  ? showGapPopover
                    ? "bg-indigo-100 border-indigo-400"
                    : "bg-indigo-50 border-indigo-200"
                  : showGapPopover
                    ? "bg-red-100 border-red-400"
                    : "bg-red-50 border-red-200"
              } ${
                justSelectedGoalFromEmptyState &&
                cvSkills &&
                cvSkills.technical &&
                remainingCvSkillsCount > 0
                  ? "text-indigo-600"
                  : "text-red-600"
              }`}
              title={
                justSelectedGoalFromEmptyState &&
                cvSkills &&
                cvSkills.technical &&
                remainingCvSkillsCount > 0
                  ? "Show CV Skills"
                  : "Show Level Gap Suggestion"
              }
              style={{ position: "relative", zIndex: 20 }}
            >
              {justSelectedGoalFromEmptyState &&
              cvSkills &&
              cvSkills.technical &&
              remainingCvSkillsCount > 0 ? (
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M10.3 21a1.94 1.94 0 0 0 3.4 0"
                  />
                </svg>
              ) : (
                <Bell size={16} />
              )}
              {/* Notification badge */}
              {levelGapCount > 0 &&
                !(
                  justSelectedGoalFromEmptyState &&
                  cvSkills &&
                  cvSkills.technical &&
                  remainingCvSkillsCount > 0
                ) && (
                  <span
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold border-2 border-white shadow"
                    style={{ padding: "0 4px", lineHeight: 1 }}
                  >
                    {levelGapCount}
                  </span>
                )}
              {/* CV Skills notification badge */}
              {justSelectedGoalFromEmptyState &&
                cvSkills &&
                cvSkills.technical &&
                remainingCvSkillsCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[10px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold border-2 border-white shadow"
                    style={{ padding: "0 4px", lineHeight: 1 }}
                  >
                    {remainingCvSkillsCount}
                  </span>
                )}
            </button>
            {showGapPopover && (
              <div
                className="absolute right-0 mt-2 z-50"
                style={{ minWidth: 320 }}
              >
                <div className="pointer-events-auto relative z-50">
                  <WarningPrompt
                    levelGapPrompts={levelGapPrompts}
                    crossGoalWarning={crossGoalWarning}
                    commonCompletedSkills={commonCompletedSkillsWarning}
                    lastSkillDeletionWarning={lastSkillDeletionWarning}
                    cvSkills={
                      justSelectedGoalFromEmptyState &&
                      cvSkills &&
                      remainingCvSkillsCount > 0
                        ? cvSkills
                        : null
                    }
                    onClose={() => {
                      setShowGapPopover(false);
                      setCrossGoalWarning(null);
                      setCommonCompletedSkillsWarning(null);
                      setLastSkillDeletionWarning(null);
                    }}
                    onSwitchGoal={(
                      goalObj,
                      skillName,
                      isFromCvSkill = false
                    ) => {
                      // Check if this is a CV skill warning
                      if (
                        crossGoalWarning &&
                        crossGoalWarning.isCvSkill &&
                        crossGoalWarning.cvSkill
                      ) {
                        // For CV skills, the switchGoal function already handles adding the skill/tool correctly
                        // No need to call onAddCvSkill separately as it would create duplicates
                        switchGoal(goalObj, skillName, isFromCvSkill); // Pass the isFromCvSkill parameter
                        setCrossGoalWarning(null);
                        setShowGapPopover(false);

                        // ✅ FIX: Remove the CV skill from the list after successful goal switch
                        // The skill will be added by switchGoal, so we need to mark it as removed
                        if (crossGoalWarning.cvSkill) {
                          // Create a unique key for the CV skill
                          const skillKey = `${crossGoalWarning.cvSkill.name}-${goalObj.id || "unknown"}`;
                          // Add to removed CV skills to hide it from the list
                          addRemovedCvSkill(skillKey);
                        }

                        // Clear the flag to allow EmptyState to show again if needed
                        if (onGoalSwitchComplete) {
                          onGoalSwitchComplete();
                        }
                        // Mark user as no longer first-time since they're switching goals
                        if (onSetFirstTimeUser) {
                          onSetFirstTimeUser(false);
                        }
                      } else {
                        // Regular sidebar skill goal switch
                        switchGoal(goalObj, skillName, isFromCvSkill); // Pass the isFromCvSkill parameter
                        setCrossGoalWarning(null);
                        setShowGapPopover(false);
                        // Clear the flag to allow EmptyState to show again if needed
                        if (onGoalSwitchComplete) {
                          onGoalSwitchComplete();
                        }
                        // Mark user as no longer first-time since they're switching goals
                        if (onSetFirstTimeUser) {
                          onSetFirstTimeUser(false);
                        }
                      }
                    }}
                    onAddCommonSkills={onAddCommonCompletedSkills}
                    onAddCvSkill={onAddCvSkill}
                    onClearCvSkillsWarning={onClearCvSkillsWarning}
                  />
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
