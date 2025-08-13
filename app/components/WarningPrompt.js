// UniversalWarningPrompt: Shows both level gap and cross-goal/cross-skill warnings in a single popover.
// Use this for all roadmap/canvas warnings that require user attention.
import React, { useCallback, useState, useRef, useEffect } from "react";
import { DM_Sans, Lexend } from "next/font/google";
import dataset from "../data/dataset.json";
import { useRoadmap } from "../context/RoadmapContext";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});
const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend",
});

export default function UniversalWarningPrompt({
  levelGapPrompts = [],
  crossGoalWarning,
  commonCompletedSkills,
  lastSkillDeletionWarning,
  cvSkills,
  onClose,
  onSwitchGoal, // (goalObj, skillName, isFromCvSkill = false) => void
  onAddCommonSkills,
  onAddCvSkill,
  onClearCvSkillsWarning,
}) {
  const {
    removedCvSkills,
    addRemovedCvSkill,
    clearRemovedCvSkills,
    selectedGoal,
    roadmaps,
  } = useRoadmap();

  const isMultiple = levelGapPrompts.length > 1;
  const hasLevelGap = levelGapPrompts.length > 0;
  const hasCrossGoal = !!crossGoalWarning;
  const hasCommonSkills = !!commonCompletedSkills;
  const hasLastSkillWarning = !!lastSkillDeletionWarning;
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

  const hasCvSkills = React.useMemo(() => {
    if (!cvSkills || !Array.isArray(cvSkills.technical)) return false;
    const remainingCount = cvSkills.technical.filter((entry) => {
      const name = typeof entry === "string" ? entry : entry?.name;
      if (!name || typeof name !== "string") return false;
      // Resolve goalId by entry or dataset match
      let goalId = typeof entry === "string" ? undefined : entry?.goalId;
      if (!goalId) {
        const normalized = name.toLowerCase().trim();
        for (const goal of dataset) {
          const skillNames = Object.keys(goal.skills);
          if (skillNames.some((s) => s.toLowerCase().trim() === normalized)) {
            goalId = goal.id;
            break;
          }
          if (
            skillNames.some((s) =>
              (goal.skills[s]?.tools || []).some(
                (t) => String(t).toLowerCase().trim() === normalized
              )
            )
          ) {
            goalId = goal.id;
            break;
          }
        }
      }
      if (!goalId) return false;
      const skillKey = `${name}-${goalId}`;
      const isRemoved = removedCvSkills.has(skillKey);
      const isAlreadyInRoadmap = isCvSkillAlreadyInRoadmap(name, goalId);
      return !isRemoved && !isAlreadyInRoadmap;
    }).length;
    console.log("WarningPrompt - CV skills debug:", {
      hasCvSkills: !!cvSkills,
      hasTechnical: !!(cvSkills && cvSkills.technical),
      totalSkills: Array.isArray(cvSkills?.technical)
        ? cvSkills.technical.length
        : 0,
      remainingCount,
      removedSkills: Array.from(removedCvSkills),
      cvSkills: cvSkills?.technical,
      roadmaps: Object.keys(roadmaps || {}),
    });
    return remainingCount > 0;
  }, [cvSkills, removedCvSkills, roadmaps]);

  // State to track animating skills for animations (local state for UI transitions)
  const [animatingSkills, setAnimatingSkills] = useState(new Set());

  // Track remaining skills to show as buttons
  const [remainingSkills, setRemainingSkills] = useState([]);
  const remainingSkillsRef = useRef(remainingSkills);
  useEffect(() => {
    if (
      hasCommonSkills &&
      commonCompletedSkills &&
      Array.isArray(commonCompletedSkills.skills)
    ) {
      setRemainingSkills(commonCompletedSkills.skills.filter(Boolean));
    } else {
      setRemainingSkills([]);
    }
  }, [hasCommonSkills, commonCompletedSkills]);
  remainingSkillsRef.current = remainingSkills;

  const handleAddSkill = useCallback(
    (skill) => {
      if (onAddCommonSkills) {
        onAddCommonSkills([skill]);
      }
      setRemainingSkills((prev) => prev.filter((s) => s.name !== skill.name));
      if (remainingSkillsRef.current.length === 1 && onClose) {
        onClose();
      }
    },
    [onAddCommonSkills, onClose]
  );

  // Handle CV skill removal with animation
  const handleCvSkillRemoval = useCallback(
    (skillToRemove) => {
      // Create a unique key for the skill
      const skillKey = `${skillToRemove.name}-${skillToRemove.goalId || "unknown"}`;

      // Start animation
      setAnimatingSkills((prev) => new Set([...prev, skillKey]));

      // After animation completes, mark as removed
      setTimeout(() => {
        addRemovedCvSkill(skillKey);
        setAnimatingSkills((prev) => {
          const newSet = new Set(prev);
          newSet.delete(skillKey);
          return newSet;
        });
      }, 250); // Match CSS transition duration
    },
    [addRemovedCvSkill]
  );

  // Handle CV skill click with removal callback
  const handleCvSkillClick = useCallback(
    (skill) => {
      if (onAddCvSkill) {
        // Call the original onAddCvSkill with a callback for successful addition
        onAddCvSkill(skill, () => {
          // This callback will be called after successful addition
          // Note: CV skill removal is now handled automatically in handleAddCvSkill
          // so we don't need to call handleCvSkillRemoval here anymore
        });
      }
    },
    [onAddCvSkill]
  );

  return (
    <div
      className={
        "relative min-w-[480px] max-w-lg bg-white shadow-xl rounded-lg py-1 flex flex-col animate-bounce-in"
      }
    >
      {/* Close button */}
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-base font-bold px-1"
        onClick={onClose}
        title="Close"
        style={{ lineHeight: 1 }}
      >
        ×
      </button>

      {/* Level Gap Section */}
      {hasLevelGap && (
        <div
          className="border-l-4 border-red-500 pl-4 py-4 bg-red-50/30 rounded-md"
          style={{ borderLeftColor: "#ef4444" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-100 text-red-600 rounded-full p-1 flex items-center justify-center">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86l-8.53 14.78A2 2 0 0 0 3.18 21h17.64a2 2 0 0 0 1.71-2.36L14.71 3.86a2 2 0 0 0-3.42 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="font-semibold text-base text-red-700">
              Level Gap Detected
            </span>
          </div>
          <div className={`${dmSans.className} text-gray-700 text-xs`}>
            {isMultiple
              ? `You are adding multiple skills that are not consecutive. Here are the recommended orders:`
              : `You are adding skills that are not consecutive. Here's the recommended order:`}
          </div>
          <div className="flex flex-col gap-2 mt-3">
            {levelGapPrompts.map((gap, i) => (
              <React.Fragment key={i}>
                {i > 0 && <hr className="my-2 border-gray-200" />}
                <div className="flex flex-wrap items-center gap-1 text-sm font-medium">
                  {gap.sequence.map((skill, idx) => (
                    <span key={skill} className="flex items-center">
                      <span
                        className={
                          gap.missingSkills.includes(skill)
                            ? "bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-semibold border border-yellow-200 shadow-sm"
                            : "bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-normal border border-blue-100"
                        }
                        style={{
                          minWidth: 0,
                          fontSize: "0.8em",
                          padding: "2px 8px",
                        }}
                      >
                        {skill}
                      </span>
                      {idx < gap.sequence.length - 1 && (
                        <span
                          className="text-gray-400 mx-0.5"
                          style={{ fontSize: "1em" }}
                        >
                          →
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Separator if both warnings exist */}
      {hasLevelGap &&
        (hasCrossGoal || hasCommonSkills || hasLastSkillWarning) && (
          <hr className="border-gray-300" />
        )}

      {/* Cross-goal warning section */}
      {hasCrossGoal && (
        <div className="flex flex-col gap-2 border-l-4 border-yellow-500 pl-4 py-4 bg-yellow-50/30 rounded-md">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-yellow-100 text-yellow-700 rounded-full p-1 flex items-center justify-center">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86l-8.53 14.78A2 2 0 0 0 3.18 21h17.64a2 2 0 0 0 1.71-2.36L14.71 3.86a2 2 0 0 0-3.42 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="font-semibold text-base text-yellow-700">
              Skill Not in Current Roadmap
            </span>
          </div>
          <div className="text-gray-700 text-xs">
            {crossGoalWarning.isCvSkill ? (
              <>
                &ldquo;{crossGoalWarning.skillName}&rdquo; does not belong to
                the &ldquo;{selectedGoal?.goal || "current roadmap"}&rdquo;. Do
                you want to continue with &ldquo;{crossGoalWarning.otherGoal}
                &rdquo;?
              </>
            ) : (
              <>
                &ldquo;{crossGoalWarning.skillName}&rdquo; is not part of your
                current roadmap.
                <br />
                {crossGoalWarning.possibleGoals &&
                crossGoalWarning.possibleGoals.length > 1 ? (
                  <>
                    This skill exists in multiple goals. Please select which
                    goal context to use:
                    <br />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {crossGoalWarning.possibleGoals.map((goalName) => {
                        const goalObj = dataset.find(
                          (g) => g.goal === goalName
                        );
                        return (
                          <button
                            key={goalName}
                            className="px-3 py-1 rounded-lg text-xs bg-yellow-100 text-yellow-800 font-semibold hover:bg-yellow-200 border border-yellow-300 transition"
                            onClick={() =>
                              onSwitchGoal &&
                              goalObj &&
                              onSwitchGoal(
                                goalObj,
                                crossGoalWarning.skillName,
                                crossGoalWarning.isCvSkill || false
                              )
                            }
                            style={{ minWidth: 0 }}
                          >
                            {goalName}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    Do you want to start a new roadmap for{" "}
                    <span className="font-semibold text-yellow-700">
                      {crossGoalWarning.otherGoal}
                    </span>
                    ?
                  </>
                )}
              </>
            )}
          </div>
          {/* Only show Cancel if not multi-goal selection */}
          {!(
            crossGoalWarning.possibleGoals &&
            crossGoalWarning.possibleGoals.length > 1
          ) && (
            <div className="flex justify-end mt-2 px-4">
              <button
                className="px-4 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition mr-2"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1.5 rounded-lg text-xs bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
                onClick={() => {
                  if (
                    onSwitchGoal &&
                    crossGoalWarning &&
                    crossGoalWarning.otherGoal
                  ) {
                    const newGoalObj = dataset.find(
                      (g) => g.goal === crossGoalWarning.otherGoal
                    );
                    if (newGoalObj)
                      onSwitchGoal(
                        newGoalObj,
                        crossGoalWarning.skillName,
                        crossGoalWarning.isCvSkill || false
                      );
                  }
                  if (onClose) onClose();
                }}
              >
                OK
              </button>
            </div>
          )}
        </div>
      )}

      {/* Separator if common skills exist */}
      {(hasCrossGoal || hasLastSkillWarning) && hasCommonSkills && (
        <hr className=" border-gray-300" />
      )}

      {/* Common completed skills section */}
      {hasCommonSkills && (
        <div className="flex flex-col gap-2 border-l-4 border-green-500 pl-4 py-4 bg-green-50/30 rounded-md">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-green-100 text-green-700 rounded-full p-1 flex items-center justify-center">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="font-semibold text-base text-green-700">
              Common Completed Skills Found
            </span>
          </div>
          <div className="text-gray-700 text-xs">
            You have completed these skills in your previous roadmap. Click a
            skill to add it (and its next step) to the current roadmap.
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex flex-wrap gap-2">
              {remainingSkills &&
                remainingSkills.length > 0 &&
                remainingSkills.map((skill) => (
                  <button
                    key={skill.name}
                    type="button"
                    onClick={() => handleAddSkill(skill)}
                    className="px-3 py-1 rounded-full text-xs font-medium border transition bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                    style={{ cursor: "pointer", fontWeight: 600 }}
                  >
                    {skill.name}
                  </button>
                ))}
              {(!remainingSkills || remainingSkills.length === 0) && (
                <span className="text-gray-500 text-xs italic">
                  No common completed skills to add.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Separator if last skill warning exists */}
      {(hasLevelGap || hasCrossGoal || hasCommonSkills) &&
        hasLastSkillWarning && <hr className=" border-gray-300" />}

      {/* Last skill deletion warning section */}
      {hasLastSkillWarning && (
        <div className="flex flex-col gap-2 border-l-4 border-orange-500 pl-4 py-4 bg-orange-50/30 rounded-md">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-orange-100 text-orange-700 rounded-full p-1 flex items-center justify-center">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86l-8.53 14.78A2 2 0 0 0 3.18 21h17.64a2 2 0 0 0 1.71-2.36L14.71 3.86a2 2 0 0 0-3.42 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="font-semibold text-base text-orange-700">
              Skill Removal Not Allowed
            </span>
          </div>
          <div className="text-gray-700 text-xs">
            {lastSkillDeletionWarning}
          </div>
          <div className="flex justify-end mt-2 px-4">
            <button
              className="px-4 py-1.5 rounded-lg text-xs bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Separator if CV skills exist */}
      {(hasLevelGap ||
        hasCrossGoal ||
        hasCommonSkills ||
        hasLastSkillWarning) &&
        hasCvSkills && <hr className=" border-gray-300" />}

      {/* CV Skills section */}
      {hasCvSkills && (
        <div className="flex flex-col gap-2 border-l-4 border-indigo-500 px-4 py-4 bg-indigo-50/30 rounded-md">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-100 text-indigo-700 rounded-full p-1 flex items-center justify-center">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="font-semibold text-base text-indigo-700">
              CV Skills Found
            </span>
          </div>
          <div className="text-gray-700 text-xs">
            Skills received from CV. Click each skill to add it.
          </div>
          <div className="flex flex-col gap-3 mt-2">
            {/* Group skills by goal */}
            {(() => {
              const goalGroups = {};

              // Group CV skills by goal
              if (cvSkills.technical && cvSkills.technical.length > 0) {
                cvSkills.technical.forEach((skill) => {
                  let foundGoal = null;
                  let foundGoalId = null;

                  // Normalize the CV skill name (support string or object form)
                  const rawName =
                    typeof skill === "string"
                      ? skill
                      : (skill &&
                          typeof skill.name === "string" &&
                          skill.name) ||
                        "";
                  const normalizedCvSkillName = rawName.toLowerCase().trim();
                  if (!normalizedCvSkillName) {
                    return; // skip invalid entries
                  }

                  // Check which goal this skill belongs to using strict exact matching
                  for (const goal of dataset) {
                    const skillNames = Object.keys(goal.skills);
                    let isMatched = false;

                    // Check exact match with skill names
                    for (const skillName of skillNames) {
                      const normalizedGoalSkillName = skillName
                        .toLowerCase()
                        .trim();
                      if (normalizedCvSkillName === normalizedGoalSkillName) {
                        isMatched = true;
                        break;
                      }
                    }

                    // If not matched with skill names, check tools arrays
                    if (!isMatched) {
                      for (const skillName of skillNames) {
                        const skillData = goal.skills[skillName];
                        if (
                          skillData &&
                          skillData.tools &&
                          Array.isArray(skillData.tools)
                        ) {
                          for (const toolName of skillData.tools) {
                            const normalizedToolName = toolName
                              .toLowerCase()
                              .trim();
                            if (normalizedCvSkillName === normalizedToolName) {
                              isMatched = true;
                              break;
                            }
                          }
                          if (isMatched) break;
                        }
                      }
                    }

                    if (isMatched) {
                      foundGoal = goal.goal;
                      foundGoalId = goal.id;
                      break;
                    }
                  }

                  // Only include skills that matched a goal
                  if (foundGoal && foundGoalId) {
                    if (!goalGroups[foundGoal]) {
                      goalGroups[foundGoal] = [];
                    }

                    // Debug logging
                    console.log(
                      `CV Skill "${skill.name}" matched to goal: "${foundGoal}" (goalId: ${foundGoalId})`
                    );

                    // Add goalId to the skill object
                    const normalizedSkillObj =
                      typeof skill === "string"
                        ? { name: rawName, goalId: foundGoalId }
                        : { ...skill, goalId: foundGoalId };
                    goalGroups[foundGoal].push(normalizedSkillObj);
                  }
                });
              }

              return Object.entries(goalGroups).map(
                ([goalName, skills], index) => {
                  // Filter out removed skills and already added skills for this group
                  const visibleSkills = skills.filter((skill) => {
                    if (
                      !skill ||
                      !skill.name ||
                      typeof skill.name !== "string"
                    ) {
                      return false;
                    }
                    const skillKey = `${skill.name}-${skill.goalId || "unknown"}`;
                    const isRemoved = removedCvSkills.has(skillKey);
                    const isAlreadyInRoadmap = skill.goalId
                      ? isCvSkillAlreadyInRoadmap(skill.name, skill.goalId)
                      : false;

                    return !isRemoved && !isAlreadyInRoadmap;
                  });

                  // If no skills remain in this group, skip rendering
                  if (visibleSkills.length === 0) return null;

                  return (
                    <React.Fragment key={goalName}>
                      {index > 0 && <hr className="border-gray-200 -my-0.5" />}
                      <div className="px-3 bg-white/50">
                        <div className="text-xs font-semibold text-indigo-800 mb-1">
                          {goalName}
                        </div>
                        <div className="cv-skills-flex">
                          {visibleSkills.map((skill, idx) => {
                            const skillKey = `${skill.name}-${skill.goalId || "unknown"}`;
                            const isAnimating = animatingSkills.has(skillKey);

                            return (
                              <button
                                key={skillKey}
                                type="button"
                                onClick={() => handleCvSkillClick(skill)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border bg-indigo-100 text-indigo-700 border-indigo-300 hover:bg-indigo-200 ${
                                  isAnimating
                                    ? "cv-skill-removing"
                                    : "cv-skill-normal"
                                }`}
                                style={{
                                  cursor: "pointer",
                                  fontWeight: 600,
                                }}
                              >
                                {skill.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                }
              );
            })()}
            <div className="flex justify-end">
              <button
                className="px-3 py-1 rounded-lg text-xs bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition"
                onClick={() => {
                  // Clear the persistent removed CV skills state
                  clearRemovedCvSkills();
                  if (onClearCvSkillsWarning) {
                    onClearCvSkillsWarning();
                  }
                  if (onClose) onClose();
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
