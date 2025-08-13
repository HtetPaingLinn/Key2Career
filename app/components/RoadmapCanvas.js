"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useRoadmap } from "../context/RoadmapContext";
import { roadmapData } from "../data/roadmapData";
import dataset from "../data/dataset.json";
import TechnologyElement from "./TechnologyElement";
import ConnectorElement from "./ConnectorElement";
import Toolbar from "./Toolbar";
import KeyboardShortcutsHint from "./KeyboardShortcutsHint";
import EmptyState from "./EmptyState";
import ProgressBar from "./ProgressBar";

export default function RoadmapCanvas({ onShowInfo }) {
  const {
    elements,
    canvas,
    updateCanvas,
    addElement,
    addMultipleElements,
    selectedElement,
    selectedElements,
    selectionBox,
    setSelectedElement,
    setSelectedElements,
    addToSelection,
    removeFromSelection,
    clearSelection,
    setSelectionBox,
    moveSelectedElements,
    deleteSelectedElements,
    isDragging,
    setDragging,
    handToolActive,
    toggleHandTool = () => {},
    showKeyboardHints,
    toggleKeyboardHints,
    showSidebar,
    toggleSidebar,
    removeElement,
    setSelectedGoal,
    selectedGoal,
    commonCompletedSkills,
    addCommonCompletedSkills,
    lastSkillDeletionWarning,
    setLastSkillDeletionWarning,
    saveSkillsToBackend,
    roadmaps,
    foldedSkills,
    setFoldedSkills,
    toggleFoldedSkill,
    generateUniqueConnectorId,
    addNextStepsForCompletedSkill,
    toggleCompletion,
    addRemovedCvSkill,
  } = useRoadmap();
  const canvasRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isSpacebarPressed, setIsSpacebarPressed] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [showGapPopover, setShowGapPopover] = useState(false);
  const [crossGoalWarning, setCrossGoalWarning] = useState(null);
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [commonCompletedSkillsWarning, setCommonCompletedSkillsWarning] =
    useState(null);
  const [cvSkills, setCvSkills] = useState(null);
  const [pointerToolActive, setPointerToolActive] = useState(true);
  const [justSelectedGoalFromEmptyState, setJustSelectedGoalFromEmptyState] =
    useState(false);
  const [isSwitchingGoalFromCvSkill, setIsSwitchingGoalFromCvSkill] =
    useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const justSwitchedToGoalFromCvSkill = useRef(false);

  const togglePointerTool = useCallback(() => {
    setPointerToolActive((prev) => {
      if (!prev) setIsPanning(false);
      return true;
    });
    if (handToolActive) {
      // If switching from hand tool, deactivate it
      if (typeof toggleHandTool === "function") toggleHandTool();
    }
  }, [handToolActive, toggleHandTool]);

  // When hand tool is activated, deactivate pointer tool
  useEffect(() => {
    if (handToolActive) setPointerToolActive(false);
  }, [handToolActive]);

  useEffect(() => {
    // Load cvSkills from backend API
    const loadCvSkillsFromBackend = async () => {
      try {
        const email =
          typeof window !== "undefined"
            ? localStorage.getItem("userEmail")
            : null;
        if (!email) return;

        const response = await fetch(
          `/api/cv-skills?email=${encodeURIComponent(email)}`
        );
        if (response.ok) {
          const data = await response.json();

          if (
            data &&
            data.skills &&
            (data.skills.technical || data.skills.soft)
          ) {
            setCvSkills(data.skills);
            // Set flag to show CV skills warning if there are technical skills
            if (data.skills.technical && data.skills.technical.length > 0) {
              setJustSelectedGoalFromEmptyState(true);
            }
          }
        } else {
          console.error(
            "Failed to load CV skills:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error loading CV skills from backend:", error);
      }
    };

    // Check localStorage for cvSkills (legacy support)
    const stored = localStorage.getItem("cvSkills");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const normalized = parsed?.skills || parsed;
        setCvSkills(normalized);
        localStorage.removeItem("cvSkills"); // Clean up localStorage
        // Set flag to show CV skills warning if there are technical skills
        if (
          normalized &&
          Array.isArray(normalized.technical) &&
          normalized.technical.length > 0
        ) {
          setJustSelectedGoalFromEmptyState(true);
        }
      } catch {}
    } else {
      // Load from backend if not in localStorage
      loadCvSkillsFromBackend();
    }
  }, []);

  // Reset the justSelectedGoalFromEmptyState flag after 5 seconds
  // useEffect(() => {
  //   if (justSelectedGoalFromEmptyState) {
  //     const timer = setTimeout(() => {
  //       setJustSelectedGoalFromEmptyState(false);
  //     }, 5000); // 5 seconds
  //     return () => clearTimeout(timer);
  //   }
  // }, [justSelectedGoalFromEmptyState]);

  // Detect if user has existing data and is not a first-time user
  useEffect(() => {
    // If user has a selected goal or existing elements, they are not a first-time user
    if (selectedGoal || elements.length > 0) {
      setIsFirstTimeUser(false);
    }
  }, [selectedGoal, elements.length]);

  const closeSidebar = useCallback(() => {
    if (showSidebar) toggleSidebar();
  }, [showSidebar, toggleSidebar]);

  // Update grid size and grid style based on zoom level
  useEffect(() => {
    const updateGridSize = () => {
      const zoom = canvas.zoom || 1;
      let size, opacity, thickness, multiplier;
      if (zoom < 0.01) {
        size = 1000;
        opacity = 0.35;
        thickness = "2px";
        multiplier = 10;
      } else if (zoom < 0.05) {
        size = 500;
        opacity = 0.3;
        thickness = "2px";
        multiplier = 10;
      } else if (zoom < 0.1) {
        size = 200;
        opacity = 0.25;
        thickness = "1.5px";
        multiplier = 8;
      } else if (zoom < 0.5) {
        size = 100;
        opacity = 0.18;
        thickness = "1.2px";
        multiplier = 5;
      } else if (zoom < 1) {
        size = 50;
        opacity = 0.13;
        thickness = "1px";
        multiplier = 5;
      } else if (zoom < 2) {
        size = 20;
        opacity = 0.1;
        thickness = "1px";
        multiplier = 5;
      } else {
        size = 10;
        opacity = 0.08;
        thickness = "1px";
        multiplier = 5;
      }
      setGridSize(size);
      if (canvasRef.current) {
        canvasRef.current.style.setProperty("--grid-opacity", opacity);
        canvasRef.current.style.setProperty("--grid-thickness", thickness);
        canvasRef.current.style.setProperty("--grid-multiplier", multiplier);
      }
    };
    updateGridSize();
  }, [canvas.zoom]);

  // Global event listeners for Spacebar + Left Click and Touch events
  useEffect(() => {
    const handleGlobalMouseDown = (e) => {
      if ((isSpacebarPressed && e.button === 0) || handToolActive) {
        // Spacebar + Left Click or Hand Tool Active
        e.preventDefault();
        setIsPanning(true);
        setPanStart({
          x: e.clientX - canvas.position.x,
          y: e.clientY - canvas.position.y,
        });
        setLastMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleGlobalMouseMove = (e) => {
      if (isPanning) {
        e.preventDefault();
        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;

        updateCanvas({
          position: {
            x: canvas.position.x + deltaX,
            y: canvas.position.y + deltaY,
          },
        });

        setLastMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsPanning(false);
    };

    // Touch event handlers for mobile/tablet panning
    const handleGlobalTouchStart = (e) => {
      // Only handle single touch for panning
      if (e.touches.length === 1 && (handToolActive || isSpacebarPressed)) {
        e.preventDefault();
        setIsPanning(true);
        const touch = e.touches[0];
        setPanStart({
          x: touch.clientX - canvas.position.x,
          y: touch.clientY - canvas.position.y,
        });
        setLastMousePos({ x: touch.clientX, y: touch.clientY });
      }
    };

    const handleGlobalTouchMove = (e) => {
      if (isPanning && e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastMousePos.x;
        const deltaY = touch.clientY - lastMousePos.y;

        updateCanvas({
          position: {
            x: canvas.position.x + deltaX,
            y: canvas.position.y + deltaY,
          },
        });

        setLastMousePos({ x: touch.clientX, y: touch.clientY });
      }
    };

    const handleGlobalTouchEnd = () => {
      setIsPanning(false);
    };

    const handleKeyDown = (e) => {
      // Ignore shortcuts if focus is in an input, textarea, or contenteditable
      const active = document.activeElement;
      const isTextInput =
        active &&
        ((active.tagName === "INPUT" && active.type === "text") ||
          active.tagName === "TEXTAREA" ||
          active.isContentEditable);
      if (isTextInput) return;

      if (e.code === "Space" && !e.repeat) {
        e.preventDefault(); // Prevent page scroll
        setIsSpacebarPressed(true);
      }

      // Ctrl key detection
      if (e.key === "Control" || e.metaKey) {
        setIsCtrlPressed(true);
      }

      // Keyboard shortcuts
      if (e.key === "a" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        // Select all elements
        setSelectedElements(elements.map((el) => el.id));
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (selectedElements.length > 0) {
          deleteSelectedElements();
        }
      }

      // Arrow keys for moving selected elements
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        if (selectedElements.length > 0) {
          const step = e.shiftKey ? 10 : 1; // Shift for larger steps
          let deltaX = 0,
            deltaY = 0;

          switch (e.key) {
            case "ArrowUp":
              deltaY = -step;
              break;
            case "ArrowDown":
              deltaY = step;
              break;
            case "ArrowLeft":
              deltaX = -step;
              break;
            case "ArrowRight":
              deltaX = step;
              break;
          }

          moveSelectedElements(deltaX, deltaY);
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        setIsSpacebarPressed(false);
      }

      // Ctrl key detection
      if (e.key === "Control" || e.metaKey) {
        setIsCtrlPressed(false);
      }
    };

    // Add global event listeners
    document.addEventListener("mousedown", handleGlobalMouseDown);
    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);
    document.addEventListener("touchstart", handleGlobalTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleGlobalTouchMove, {
      passive: false,
    });
    document.addEventListener("touchend", handleGlobalTouchEnd);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleGlobalMouseDown);
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("touchstart", handleGlobalTouchStart);
      document.removeEventListener("touchmove", handleGlobalTouchMove);
      document.removeEventListener("touchend", handleGlobalTouchEnd);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    isPanning,
    lastMousePos,
    canvas.position,
    updateCanvas,
    handToolActive,
    isSpacebarPressed,
    elements,
    selectedElements,
    setSelectedElements,
    deleteSelectedElements,
    moveSelectedElements,
  ]);

  // Function to find the first skill with value 1 and create a technology object
  const getFirstSkillTechnology = useCallback(
    (goalData) => {
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
    },
    [roadmapData]
  );

  // Function to find next skills from dataset
  const getNextSkillsFromDataset = useCallback(
    (currentSkillName, goalData, completedElement) => {
      const skills = goalData.skills;
      const currentSkill = skills[currentSkillName];

      if (!currentSkill) return [];

      const currentSkillValue = currentSkill.level;
      const nextSkillValue = currentSkillValue + 1;
      const nextSkillNames = Object.keys(skills).filter(
        (skillName) => skills[skillName].level === nextSkillValue
      );

      const newElements = [];

      // Special layout for "less than" sign (<) pattern
      if (nextSkillNames.length === 2) {
        // For exactly 2 skills at the same level, create a "less than" sign layout
        const skillGap = 200; // Horizontal gap between skills
        const verticalOffset = 100; // Vertical offset for the "less than" pattern

        nextSkillNames.forEach((skillName, skillIndex) => {
          const skillData = skills[skillName];

          // Create the main skill element
          const skillTechnology = roadmapData.technologies.find(
            (tech) => tech.name.toLowerCase() === skillName.toLowerCase()
          ) || {
            id: skillName.toLowerCase().replace(/\s+/g, "-"),
            name: skillName,
            category: "others",
            level: "beginner",
            prerequisites: [],
            nextSteps: [],
            description: `Next step in ${goalData.goal} career path`,
            popularity: 50,
          };

          // Calculate position for "less than" sign layout
          let offsetX, offsetY;
          if (skillIndex === 0) {
            // First skill: top-right position
            offsetX = skillGap;
            offsetY = -verticalOffset;
          } else {
            // Second skill: bottom-right position
            offsetX = skillGap;
            offsetY = verticalOffset;
          }

          const skillElement = {
            id: `${skillTechnology.id}-${Date.now()}-${skillIndex}`,
            type: "technology",
            technology: skillTechnology,
            position: {
              x: completedElement.position.x + offsetX,
              y: completedElement.position.y + offsetY,
            },
            size: { width: 150, height: 40 },
            completed: false,
            isSkill: true, // Mark as a skill element
            skillData: skillData, // Store the skill data for tools
            goalData: goalData, // Store the goal data for future reference
          };

          newElements.push(skillElement);

          // If the skill has tools, create tool elements
          if (skillData.tools && skillData.tools.length > 0) {
            // Horizontal layout for tools under a parent skill
            const toolWidth = 100;
            const toolGap = 50; // Increased from 30 to 50 for better spacing between tools
            const toolCount = skillData.tools.length;
            const totalWidth =
              toolCount * toolWidth + (toolCount - 1) * toolGap;
            const startX =
              skillElement.position.x +
              (skillElement.size.width - totalWidth) / 2;
            const toolY =
              skillElement.position.y + skillElement.size.height + 60; // Increased from 40 to 60 for better separation from parent

            skillData.tools.forEach((toolName, toolIndex) => {
              // Try to find the tool in roadmapData.technologies for more info
              const toolTech = roadmapData.technologies.find(
                (t) => t.name.toLowerCase() === toolName.toLowerCase()
              ) || {
                id: toolName.toLowerCase().replace(/\s+/g, "-"),
                name: toolName,
                category: "tools",
                level: "beginner",
                prerequisites: [],
                nextSteps: [],
                description: `Tool: ${toolName}`,
                popularity: 50,
              };
              const toolElement = {
                id: `${toolTech.id}-${Date.now()}-${skillIndex}-${toolIndex}`,
                type: "technology",
                technology: toolTech,
                position: {
                  x: startX + toolIndex * (toolWidth + toolGap),
                  y: toolY,
                },
                size: { width: toolWidth, height: 35 },
                completed: false,
                isTool: true,
                parentSkillId: skillElement.id,
              };
              newElements.push(toolElement);
            });
          }
        });
      } else {
        // For other cases (1 skill or 3+ skills), use the original circular layout
        nextSkillNames.forEach((skillName) => {
          const skillData = skills[skillName];

          // Create the main skill element
          const skillTechnology = roadmapData.technologies.find(
            (tech) => tech.name.toLowerCase() === skillName.toLowerCase()
          ) || {
            id: skillName.toLowerCase().replace(/\s+/g, "-"),
            name: skillName,
            category: "others",
            level: "beginner",
            prerequisites: [],
            nextSteps: [],
            description: `Next step in ${goalData.goal} career path`,
            popularity: 50,
          };

          // Calculate position for the skill element (circular layout)
          const skillIndex = nextSkillNames.indexOf(skillName);
          const angle = (skillIndex * 2 * Math.PI) / nextSkillNames.length;
          const radius = 375;
          const offsetX = Math.cos(angle) * radius;
          const offsetY = Math.sin(angle) * radius;

          const skillElement = {
            id: `${skillTechnology.id}-${Date.now()}-${skillIndex}`,
            type: "technology",
            technology: skillTechnology,
            position: {
              x: completedElement.position.x + offsetX,
              y: completedElement.position.y + offsetY,
            },
            size: { width: 150, height: 40 },
            completed: false,
            isSkill: true, // Mark as a skill element
            skillData: skillData, // Store the skill data for tools
            goalData: goalData, // Store the goal data for future reference
          };

          newElements.push(skillElement);

          // If the skill has tools, create tool elements
          if (skillData.tools && skillData.tools.length > 0) {
            // Horizontal layout for tools under a parent skill
            const toolWidth = 100;
            const toolGap = 50; // Increased from 30 to 50 for better spacing between tools
            const toolCount = skillData.tools.length;
            const totalWidth =
              toolCount * toolWidth + (toolCount - 1) * toolGap;
            const startX =
              skillElement.position.x +
              (skillElement.size.width - totalWidth) / 2;
            const toolY =
              skillElement.position.y + skillElement.size.height + 60; // Increased from 40 to 60 for better separation from parent

            skillData.tools.forEach((toolName, toolIndex) => {
              // Try to find the tool in roadmapData.technologies for more info
              const toolTech = roadmapData.technologies.find(
                (t) => t.name.toLowerCase() === toolName.toLowerCase()
              ) || {
                id: toolName.toLowerCase().replace(/\s+/g, "-"),
                name: toolName,
                category: "tools",
                level: "beginner",
                prerequisites: [],
                nextSteps: [],
                description: `Tool: ${toolName}`,
                popularity: 50,
              };
              const toolElement = {
                id: `${toolTech.id}-${Date.now()}-${skillIndex}-${toolIndex}`,
                type: "technology",
                technology: toolTech,
                position: {
                  x: startX + toolIndex * (toolWidth + toolGap),
                  y: toolY,
                },
                size: { width: toolWidth, height: 35 },
                completed: false,
                isTool: true,
                parentSkillId: skillElement.id,
              };
              newElements.push(toolElement);
            });
          }
        });
      }

      return newElements;
    },
    [roadmapData]
  );

  // Function to handle adding next skills when a technology is completed
  const handleTechnologyCompleted = useCallback(
    (completedElement) => {
      // Only proceed if this is a skill element (not a tool)
      if (completedElement.isTool) {
        return;
      }

      // Use the goalData stored in the element instead of trying to find it
      const goalData = completedElement.goalData;
      if (!goalData) return;

      let nextSkills = getNextSkillsFromDataset(
        completedElement.technology.name,
        goalData,
        completedElement
      );
      if (nextSkills.length === 0) return;

      // --- Prevent duplicates: filter out skills/tools that already exist ---
      const existingNames = new Set(
        elements
          .filter(
            (el) =>
              el &&
              el.type === "technology" &&
              el.technology &&
              el.technology.name
          )
          .map((el) => el.technology.name)
      );
      nextSkills = nextSkills.filter(
        (el) =>
          el &&
          el.technology &&
          el.technology.name &&
          !existingNames.has(el.technology.name)
      );

      // Separate skill elements and tool elements
      const skillElements = nextSkills.filter((element) => element.isSkill);
      const toolElements = nextSkills.filter((element) => element.isTool);

      // --- Remove obsolete connectors ---
      // For each connector where source is completedElement and target is a higher-level skill,
      // if the new skill is now in between, remove that connector.
      const completedSkillName = completedElement.technology.name;
      const completedSkillLevel = goalData.skills[completedSkillName]?.level;
      // Find all connectors from completedElement to other skills
      elements.forEach((el) => {
        if (el.type === "connector" && el.sourceId === completedElement.id) {
          // Find the target element
          const targetElement = elements.find(
            (e) => e.id === el.targetId && e.type === "technology"
          );
          if (targetElement) {
            const targetSkillName = targetElement.technology.name;
            const targetSkillLevel = goalData.skills[targetSkillName]?.level;
            // If the target is a higher-level skill and the new skill is between them, remove the connector
            if (
              typeof completedSkillLevel === "number" &&
              typeof targetSkillLevel === "number" &&
              targetSkillLevel > completedSkillLevel
            ) {
              // For each new skill, check if its level is between completed and target
              skillElements.forEach((newSkill) => {
                const newSkillName = newSkill.technology.name;
                const newSkillLevel = goalData.skills[newSkillName]?.level;
                if (
                  typeof newSkillLevel === "number" &&
                  newSkillLevel > completedSkillLevel &&
                  newSkillLevel < targetSkillLevel
                ) {
                  // Remove the obsolete connector
                  removeElement(el.id);
                }
              });
            }
          }
        }
      });

      // --- Add new connectors ---
      // Connect completedElement to each new skill
      const skillConnectors = skillElements.map((skillElement) => ({
        id: `connector-${completedElement.id}-${skillElement.id}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        type: "connector",
        sourceId: completedElement.id,
        targetId: skillElement.id,
      }));

      // For each new skill, check if there are higher-level skills that were previously connected, and rewire
      const rewiredConnectors = [];
      skillElements.forEach((newSkill) => {
        const newSkillName = newSkill.technology.name;
        const newSkillLevel = goalData.skills[newSkillName]?.level;
        if (typeof newSkillLevel !== "number") return;
        // Find all technology elements on canvas with higher level
        const higherLevelSkills = elements.filter(
          (el) =>
            el &&
            el.type === "technology" &&
            !el.isTool &&
            el.technology &&
            el.technology.name &&
            el.id !== newSkill.id &&
            el.id !== completedElement.id &&
            typeof goalData.skills[el.technology.name]?.level === "number" &&
            goalData.skills[el.technology.name].level > newSkillLevel
        );
        // Find the lowest higher-level skill
        let lowestHigher = null;
        higherLevelSkills.forEach((el) => {
          if (!el.technology || !el.technology.name) return;
          const elSkillLevel = goalData.skills[el.technology.name].level;
          if (
            !lowestHigher ||
            elSkillLevel < goalData.skills[lowestHigher.technology.name].level
          ) {
            lowestHigher = el;
          }
        });
        if (lowestHigher) {
          // Check if a connector already exists from newSkill to lowestHigher
          const connectorExists = elements.some(
            (conn) =>
              conn.type === "connector" &&
              conn.sourceId === newSkill.id &&
              conn.targetId === lowestHigher.id
          );
          if (!connectorExists) {
            let connectionType = undefined;
            if (
              goalData.skills[lowestHigher.technology.name].level -
                newSkillLevel !==
              1
            ) {
              connectionType = "warning";
            }
            rewiredConnectors.push({
              id: `connector-${newSkill.id}-${lowestHigher.id}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
              type: "connector",
              sourceId: newSkill.id,
              targetId: lowestHigher.id,
              ...(connectionType ? { connectionType } : {}),
            });
          }
        }
      });

      // Create connector elements from skill elements to their tools
      const toolConnectors = toolElements.map((toolElement) => ({
        id: `connector-${toolElement.parentSkillId}-${toolElement.id}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        type: "connector",
        sourceId: toolElement.parentSkillId,
        targetId: toolElement.id,
      }));

      // Add all new elements and connectors
      addMultipleElements([
        ...nextSkills,
        ...skillConnectors,
        ...rewiredConnectors,
        ...toolConnectors,
      ]);

      // --- NEW LOGIC: Connect completedElement to existing next-level skills ---
      // Find all skills on canvas that are at the next level from completedElement
      const nextLevelSkills = elements.filter((el) => {
        if (
          !el ||
          el.type !== "technology" ||
          el.isTool ||
          !el.technology ||
          !el.technology.name
        )
          return false;
        const elSkillName = el.technology.name;
        const elSkillLevel = goalData.skills[elSkillName]?.level;
        return (
          typeof elSkillLevel === "number" &&
          elSkillLevel === completedSkillLevel + 1
        );
      });

      // Create connectors from completedElement to existing next-level skills
      const additionalConnectors = nextLevelSkills
        .map((nextSkill) => {
          // Check if connector already exists
          const connectorExists = elements.some(
            (conn) =>
              conn.type === "connector" &&
              conn.sourceId === completedElement.id &&
              conn.targetId === nextSkill.id
          );
          // --- FIX: If a new skill (C2) is being added between completedElement (C1) and nextSkill (S1), do NOT add C1->S1 connector ---
          const c2 = skillElements.find((se) => {
            if (
              !se ||
              !se.technology ||
              !se.technology.name ||
              !nextSkill ||
              !nextSkill.technology ||
              !nextSkill.technology.name
            )
              return false;
            const seLevel = goalData.skills[se.technology.name]?.level;
            const nextSkillLevel =
              goalData.skills[nextSkill.technology.name]?.level;
            return (
              typeof seLevel === "number" &&
              typeof nextSkillLevel === "number" &&
              seLevel > completedSkillLevel &&
              seLevel < nextSkillLevel
            );
          });
          if (!connectorExists && !c2) {
            return {
              id: `connector-${completedElement.id}-${nextSkill.id}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
              type: "connector",
              sourceId: completedElement.id,
              targetId: nextSkill.id,
            };
          }
          return null;
        })
        .filter(Boolean);

      // Add the additional connectors
      if (additionalConnectors.length > 0) {
        addMultipleElements(additionalConnectors);
      }
    },
    [getNextSkillsFromDataset, addMultipleElements, elements, removeElement]
  );

  // Function to handle goal button click
  const handleGoalClick = useCallback(
    (goalData, mode = "manual") => {
      // Set flag to indicate goal was just selected from EmptyState
      setJustSelectedGoalFromEmptyState(true);
      // Mark user as no longer first-time since they've selected a goal
      setIsFirstTimeUser(false);

      if (mode === "auto") {
        // Auto-build: add all skills and tools for the goal, in order, with connectors
        setSelectedGoal(goalData);
        // Start at left top corner, below the toolbar
        const startX = 40;
        const startY = 100; // Increased to account for toolbar height (60px) + padding
        const skillGapY = 100;
        const toolWidth = 100;
        const toolGap = 50; // Increased from 30 to 50 for better spacing between tools
        const skillEntries = Object.entries(goalData.skills)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => a.level - b.level);
        const newElements = [];
        const skillIdMap = {};
        // --- Track skills with tools to fold them later ---
        const skillsWithTools = [];
        // --- Zig-zag horizontal layout: 4 skills per row ---
        const skillsPerRow = 4;
        const skillWidth = 150;
        const skillHeight = 40;
        const horizontalGap = 120; // Increased gap for more space
        const verticalGap = 140; // Increased gap for more space
        const toolHeight = 35;
        const toolGapBelowSkill = 40; // Increased from 20 to 40 for better separation from parent skill
        const bottomMargin = 100; // Additional margin at the bottom

        // Track the maximum Y position to add bottom margin
        let maxY = startY;

        skillEntries.forEach((skill, idx) => {
          const row = Math.floor(idx / skillsPerRow);
          const colInRow = idx % skillsPerRow;
          // Zig-zag: even rows left-to-right, odd rows right-to-left
          const isEvenRow = row % 2 === 0;
          const col = isEvenRow ? colInRow : skillsPerRow - 1 - colInRow;
          const x = startX + col * (skillWidth + horizontalGap);
          const y = startY + row * (skillHeight + verticalGap);
          const skillId = `${skill.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}-${idx}`;
          skillIdMap[skill.name] = skillId;
          const skillElement = {
            id: skillId,
            type: "technology",
            technology: roadmapData.technologies.find(
              (tech) => tech.name.toLowerCase() === skill.name.toLowerCase()
            ) || {
              id: skill.name.toLowerCase().replace(/\s+/g, "-"),
              name: skill.name,
              category: "others",
              level: "beginner",
              prerequisites: [],
              nextSteps: [],
              description: `Skill for ${goalData.goal}`,
              popularity: 50,
            },
            position: { x, y },
            size: { width: skillWidth, height: skillHeight },
            completed: false,
            isSkill: true,
            skillData: skill,
            goalData: goalData,
          };
          newElements.push(skillElement);

          // Track the Y position for this skill
          let currentMaxY = y + skillHeight;

          // Add tools for this skill
          if (
            skill.tools &&
            Array.isArray(skill.tools) &&
            skill.tools.length > 0
          ) {
            // --- Mark this skill for folding ---
            skillsWithTools.push(skillId);
            const toolCount = skill.tools.length;
            const totalWidth =
              toolCount * toolWidth + (toolCount - 1) * toolGap;
            // Place tools below the skill, centered
            const toolStartX = x + (skillWidth - totalWidth) / 2;
            const toolY = y + skillHeight + toolGapBelowSkill;

            // Update current max Y to include tools
            currentMaxY = toolY + toolHeight;

            skill.tools.forEach((toolName, toolIdx) => {
              const toolTech = roadmapData.technologies.find(
                (t) => t.name.toLowerCase() === toolName.toLowerCase()
              ) || {
                id: toolName.toLowerCase().replace(/\s+/g, "-"),
                name: toolName,
                category: "tools",
                level: "beginner",
                prerequisites: [],
                nextSteps: [],
                description: `Tool: ${toolName}`,
                popularity: 50,
              };
              const toolId = `${toolTech.id}-${Date.now()}-${toolIdx}-${idx}`;
              const toolElement = {
                id: toolId,
                type: "technology",
                technology: toolTech,
                position: {
                  x: toolStartX + toolIdx * (toolWidth + toolGap),
                  y: toolY,
                },
                size: { width: toolWidth, height: toolHeight },
                completed: false,
                isTool: true,
                parentSkillId: skillId,
              };
              newElements.push(toolElement);
              // Connector from skill to tool
              newElements.push({
                id: `connector-${skillId}-${toolId}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
                type: "connector",
                sourceId: skillId,
                targetId: toolId,
              });
            });
          }

          // Update global max Y
          maxY = Math.max(maxY, currentMaxY);
        });

        // Add bottom margin by adjusting canvas height or adding padding
        // We'll add a dummy element at the bottom to ensure proper spacing
        if (maxY > 0) {
          const bottomPaddingElement = {
            id: `bottom-padding-${Date.now()}`,
            type: "padding",
            position: { x: 0, y: maxY + bottomMargin },
            size: { width: 1, height: 1 },
            invisible: true,
          };
          newElements.push(bottomPaddingElement);
        }
        // --- New: Connect every skill at each level to every skill at the next level ---
        const levelToSkillIds = {};
        skillEntries.forEach((skill, idx) => {
          const level = skill.level;
          const skillId = skillIdMap[skill.name];
          if (!levelToSkillIds[level]) levelToSkillIds[level] = [];
          levelToSkillIds[level].push(skillId);
        });
        const levels = Object.keys(levelToSkillIds)
          .map(Number)
          .sort((a, b) => a - b);
        for (let i = 0; i < levels.length - 1; ++i) {
          const currentLevel = levels[i];
          const nextLevel = levels[i + 1];
          const fromIds = levelToSkillIds[currentLevel];
          const toIds = levelToSkillIds[nextLevel];
          fromIds.forEach((fromId) => {
            toIds.forEach((toId) => {
              newElements.push({
                id: `connector-${fromId}-${toId}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
                type: "connector",
                sourceId: fromId,
                targetId: toId,
              });
            });
          });
        }
        addMultipleElements(newElements);
        // --- Fold all skills with tools by default ---
        if (skillsWithTools.length > 0) {
          setFoldedSkills(new Set(skillsWithTools));
        }
        return;
      }
      const technology = getFirstSkillTechnology(goalData);

      if (technology) {
        // Set the selected goal in context
        setSelectedGoal(goalData);
        // Calculate center position for the new element
        const rect = canvasRef.current?.getBoundingClientRect();
        const centerX = rect ? rect.width / 2 - 75 : 100; // 75 is half of element width (150px)
        const centerY = rect ? rect.height / 2 - 20 : 100; // 20 is half of element height

        const newElements = [];

        // Find the skill data for this technology
        const skillData = goalData.skills[technology.name];

        // --- Prevent duplicate: check if already exists ---
        const exists = elements.some(
          (el) =>
            el &&
            el.type === "technology" &&
            el.technology &&
            el.technology.name === technology.name
        );
        if (exists) return;
        // Create the main skill element
        const skillElement = {
          id: `${technology.id}-${Date.now()}`,
          type: "technology",
          technology: technology,
          position: { x: centerX, y: centerY },
          size: { width: 150, height: 40 },
          completed: false,
          isSkill: true,
          skillData: skillData,
          goalData: goalData, // Store the goal data for future reference
        };

        newElements.push(skillElement);

        // If the skill has tools, create tool elements
        if (skillData && skillData.tools && skillData.tools.length > 0) {
          const toolWidth = 100;
          const toolGap = 50; // Increased from 30 to 50 for better spacing between tools
          const toolCount2 = skillData.tools.length;
          const totalWidth2 =
            toolCount2 * toolWidth + (toolCount2 - 1) * toolGap;
          const startX2 = centerX + (150 - totalWidth2) / 2;
          const toolY2 = centerY + 40 + 60; // Increased from 40 to 60 for better separation from parent
          skillData.tools.forEach((toolName, toolIndex) => {
            // --- Prevent duplicate tool ---
            if (
              elements.some(
                (el) =>
                  el &&
                  el.type === "technology" &&
                  el.technology &&
                  el.technology.name === toolName
              )
            )
              return;
            const toolTechnology = roadmapData.technologies.find(
              (tech) => tech.name.toLowerCase() === toolName.toLowerCase()
            ) || {
              id: toolName.toLowerCase().replace(/\s+/g, "-"),
              name: toolName,
              category: "others",
              level: "beginner",
              prerequisites: [],
              nextSteps: [],
              description: `Tool option for ${technology.name}`,
              popularity: 50,
            };

            const toolElement2 = {
              id: `${toolTechnology.id}-${Date.now()}-${toolIndex}`,
              type: "technology",
              technology: toolTechnology,
              position: {
                x: startX2 + toolIndex * (toolWidth + toolGap),
                y: toolY2,
              },
              size: { width: toolWidth, height: 35 },
              completed: false,
              isTool: true,
              parentSkillId: skillElement.id,
            };

            newElements.push(toolElement2);
          });
          // Create connector elements from skill to its tools (fix: check both new and existing tool elements)
          const toolConnectors = skillData.tools
            .map((toolName, toolIndex) => {
              // Find the tool element in newElements or elements
              let toolElement = newElements.find(
                (element) =>
                  element.isTool &&
                  element.technology.name === toolName &&
                  element.parentSkillId === skillElement.id
              );
              if (!toolElement) {
                // Try to find in existing elements (must match parentSkillId)
                toolElement = elements.find(
                  (element) =>
                    element.isTool &&
                    element.technology.name === toolName &&
                    element.parentSkillId === skillElement.id
                );
              }
              if (!toolElement) return null;
              // Check if connector already exists
              const connectorExists =
                elements.some(
                  (conn) =>
                    conn.type === "connector" &&
                    conn.sourceId === skillElement.id &&
                    conn.targetId === toolElement.id
                ) ||
                newElements.some(
                  (conn) =>
                    conn.type === "connector" &&
                    conn.sourceId === skillElement.id &&
                    conn.targetId === toolElement.id
                );
              if (connectorExists) return null;
              return {
                id: `connector-${skillElement.id}-${toolElement.id}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
                type: "connector",
                sourceId: skillElement.id,
                targetId: toolElement.id,
              };
            })
            .filter(Boolean);

          newElements.push(...toolConnectors);
        }

        // Add all elements
        addMultipleElements(newElements);
      } else {
        console.error("No first skill found for this goal");
      }
    },
    [
      getFirstSkillTechnology,
      addMultipleElements,
      roadmapData,
      elements,
      setSelectedGoal,
    ]
  );

  // Helper to get skill sequence between two skills
  const getSkillSequence = useCallback(
    (fromSkill, toSkill) => {
      // Find the goal that contains both skills
      let foundGoal = null;
      for (const goalObj of dataset) {
        if (
          goalObj.skills &&
          goalObj.skills[fromSkill] &&
          goalObj.skills[toSkill]
        ) {
          foundGoal = goalObj;
          break;
        }
      }
      if (!foundGoal) return null;
      const skills = foundGoal.skills;
      const fromLevel = skills[fromSkill].level;
      const toLevel = skills[toSkill].level;
      if (fromLevel === undefined || toLevel === undefined) return null;
      // Get all skills in level order
      const ordered = Object.entries(skills)
        .map(([name, data]) => ({ name, level: data.level }))
        .sort((a, b) => a.level - b.level);
      // Get the sequence between fromLevel and toLevel (inclusive)
      const min = Math.min(fromLevel, toLevel);
      const max = Math.max(fromLevel, toLevel);
      const sequence = ordered
        .filter((s) => s.level >= min && s.level <= max)
        .map((s) => s.name);
      // Find missing skills (exclude endpoints)
      const missingSkills = sequence.filter(
        (s) => s !== fromSkill && s !== toSkill
      );
      return {
        sequence: fromLevel < toLevel ? sequence : sequence.slice().reverse(),
        missingSkills,
        from: fromSkill,
        to: toSkill,
      };
    },
    [dataset]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      setDragging(false);

      try {
        const technology = JSON.parse(
          e.dataTransfer.getData("application/json")
        );
        const rect = canvasRef.current.getBoundingClientRect();

        // Calculate drop position relative to the canvas, accounting for zoom and pan
        const rawX = e.clientX - rect.left;
        const rawY = e.clientY - rect.top;

        // Transform the position back to canvas coordinates
        const x = (rawX - canvas.position.x) / canvas.zoom;
        const y = (rawY - canvas.position.y) / canvas.zoom;

        // --- Prevent duplicate: check if already exists ---
        if (
          elements.some(
            (el) =>
              el &&
              el.type === "technology" &&
              el.technology &&
              el.technology.name === technology.name
          )
        ) {
          return;
        }

        // --- Cross-goal skill detection logic ---
        // Find the current goal (from selectedGoal in context or from any element on canvas)
        let currentGoal = null;
        if (elements.length > 0) {
          // Try to get from any element with goalData
          const elWithGoal = elements.find(
            (el) => el.goalData && el.goalData.goal
          );
          if (elWithGoal) currentGoal = elWithGoal.goalData.goal;
        }
        // Fallback: try to get from selected goal in context
        if (!currentGoal && selectedGoal) {
          currentGoal = selectedGoal.goal;
        }

        // Find all goals that contain this skill
        const goalsWithSkill = dataset.filter((g) => {
          if (!g.skills) return false;

          // Check if it's a top-level skill
          if (g.skills[technology.name]) return true;

          // Check if it's a tool within any skill's tools array
          for (const skillName in g.skills) {
            const skillData = g.skills[skillName];
            if (
              skillData &&
              skillData.tools &&
              Array.isArray(skillData.tools)
            ) {
              if (skillData.tools.includes(technology.name)) {
                return true;
              }
            }
          }

          return false;
        });
        // If not in any goal, allow (custom/extra skill)
        if (goalsWithSkill.length === 0) {
          // ... proceed as normal ...
        } else {
          // Is this skill in the current goal?
          const inCurrentGoal = goalsWithSkill.some(
            (g) => g.goal === currentGoal
          );
          if (!inCurrentGoal) {
            // If it exists in multiple goals, show all options
            if (goalsWithSkill.length > 1) {
              setCrossGoalWarning({
                skillName: technology.name,
                otherGoal: goalsWithSkill[0]?.goal,
                possibleGoals: goalsWithSkill.map((g) => g.goal),
              });
            } else {
              // Single other goal case
              setCrossGoalWarning({
                skillName: technology.name,
                otherGoal: goalsWithSkill[0]?.goal,
              });
            }
            if (showSidebar) toggleSidebar();
            setShowGapPopover(true);
            return; // Block add for now
          }
        }

        // Determine if this is a tool or a skill
        const isTool = technology.category === "tools" || technology.isTool;

        const newElement = {
          id: `${technology.id}-${Date.now()}`,
          type: "technology",
          technology: technology,
          position: { x, y },
          size: { width: 150, height: 40 },
          completed: false,
          isTool: isTool,
          // Attach goalData and skillData for completion logic if not a tool
          ...(isTool
            ? {}
            : (() => {
                // Use the current selected goal to ensure correct goalData
                const currentGoal = selectedGoal;
                if (
                  currentGoal &&
                  currentGoal.skills &&
                  currentGoal.skills[technology.name]
                ) {
                  return {
                    goalData: currentGoal,
                    skillData: currentGoal.skills[technology.name],
                  };
                }

                // Fallback: Find the goal in dataset that contains this skill
                let goalObj = null;
                let skillData = null;
                for (const g of dataset) {
                  if (g.skills && g.skills[technology.name]) {
                    goalObj = g;
                    skillData = g.skills[technology.name];
                    break;
                  }
                }
                return goalObj ? { goalData: goalObj, skillData } : {};
              })()),
        };

        // Only connect if this is a skill (not a tool)
        if (!isTool) {
          // Find all existing skills on the canvas
          const skillsOnCanvas = elements.filter(
            (el) =>
              el.type === "technology" &&
              !el.isTool &&
              el.technology &&
              el.technology.name
          );
          // Helper: get numeric level from dataset.json for a skill name
          const getNumericLevel = (skillName) => {
            for (const goalObj of dataset) {
              if (goalObj.skills && goalObj.skills[skillName]) {
                return goalObj.skills[skillName].level;
              }
            }
            return undefined;
          };
          // Fallback: string to number mapping
          const levelToNumber = (level) => {
            if (typeof level === "number") return level;
            if (typeof level === "string") {
              switch (level.toLowerCase()) {
                case "beginner":
                  return 1;
                case "intermediate":
                  return 2;
                case "advanced":
                  return 3;
                default:
                  return 0;
              }
            }
            return 0;
          };
          // Get the new skill's level
          let newSkillLevel = getNumericLevel(technology.name);
          if (newSkillLevel === undefined) {
            newSkillLevel = levelToNumber(technology.level);
          }
          // Build array of {el, level}
          const skillLevels = skillsOnCanvas
            .map((el) => {
              let lvl = getNumericLevel(el.technology.name);
              if (lvl === undefined) lvl = levelToNumber(el.technology.level);
              return { el, level: lvl };
            })
            .sort((a, b) => a.level - b.level);
          // Find predecessor and successor
          let predecessor = null,
            successor = null;
          for (let i = 0; i < skillLevels.length; ++i) {
            if (skillLevels[i].level < newSkillLevel)
              predecessor = skillLevels[i];
            if (skillLevels[i].level > newSkillLevel && !successor)
              successor = skillLevels[i];
          }
          // Remove direct connector between predecessor and successor if it exists
          let elementsToAdd = [newElement];
          let elementsToRemove = [];
          if (predecessor && successor) {
            const directConnector = elements.find(
              (el) =>
                el.type === "connector" &&
                el.sourceId === predecessor.el.id &&
                el.targetId === successor.el.id
            );
            if (directConnector) {
              removeElement(directConnector.id);
            }
          }
          // Add children tools if any
          let goalObjWithSkill = null;
          let skillData = null;
          for (const goalObj of dataset) {
            if (goalObj.skills && goalObj.skills[technology.name]) {
              goalObjWithSkill = goalObj;
              skillData = goalObj.skills[technology.name];
              break;
            }
          }
          let toolElements = [];
          let toolConnectors = [];
          if (skillData && skillData.tools && Array.isArray(skillData.tools)) {
            const toolWidth = 100;
            const toolGap = 50; // Increased from 30 to 50 for better spacing between tools
            const toolCount3 = skillData.tools.length;
            const totalWidth3 =
              toolCount3 * toolWidth + (toolCount3 - 1) * toolGap;
            const startX3 = x + (150 - totalWidth3) / 2;
            const toolY3 = y + 40 + 60; // Increased from 40 to 60 for better separation from parent
            skillData.tools.forEach((toolName, toolIndex) => {
              const toolTech = roadmapData.technologies.find(
                (t) => t.name.toLowerCase() === toolName.toLowerCase()
              ) || {
                id: toolName.toLowerCase().replace(/\s+/g, "-"),
                name: toolName,
                category: "tools",
                level: "beginner",
                prerequisites: [],
                nextSteps: [],
                description: `Tool: ${toolName}`,
                popularity: 50,
              };
              const toolElement3 = {
                id: `${toolTech.id}-${Date.now()}-${toolIndex}`,
                type: "technology",
                technology: toolTech,
                position: {
                  x: startX3 + toolIndex * (toolWidth + toolGap),
                  y: toolY3,
                },
                size: { width: toolWidth, height: 35 },
                completed: false,
                isTool: true,
                parentSkillId: newElement.id,
              };
              toolElements.push(toolElement3);
              toolConnectors.push({
                id: `connector-${newElement.id}-${toolElement3.id}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
                type: "connector",
                sourceId: newElement.id,
                targetId: toolElement3.id,
              });
            });
          }
          elementsToAdd.push(...toolElements, ...toolConnectors);
          // Add connectors
          if (predecessor) {
            let connectionType = undefined;
            if (Math.abs(newSkillLevel - predecessor.level) !== 1) {
              connectionType = "warning";
              setShowGapPopover(true);
            }
            elementsToAdd.push({
              id: `connector-${predecessor.el.id}-${newElement.id}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
              type: "connector",
              sourceId: predecessor.el.id,
              targetId: newElement.id,
              ...(connectionType ? { connectionType } : {}),
            });
          }
          if (successor) {
            let connectionType = undefined;
            if (Math.abs(successor.level - newSkillLevel) !== 1) {
              connectionType = "warning";
              setShowGapPopover(true);
            }
            elementsToAdd.push({
              id: `connector-${newElement.id}-${successor.el.id}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
              type: "connector",
              sourceId: newElement.id,
              targetId: successor.el.id,
              ...(connectionType ? { connectionType } : {}),
            });
          }
          addMultipleElements(elementsToAdd);
          // Remove any connector from a carried skill (C1) to the trigger skill (S1)
          // C1 is a newly added skill with id ending in '-carried', S1 is the most recent uncompleted skill
          const carriedSkill = elementsToAdd.find(
            (el) =>
              el.type === "technology" &&
              !el.isTool &&
              el.id.endsWith("-carried")
          );
          const s1Skill = elementsToAdd.find(
            (el) => el.type === "technology" && !el.isTool && !el.completed
          );
          if (carriedSkill && s1Skill) {
            const c1ToS1Connector = elements.find(
              (el) =>
                el.type === "connector" &&
                el.sourceId === carriedSkill.id &&
                el.targetId === s1Skill.id
            );
            if (c1ToS1Connector) {
              removeElement(c1ToS1Connector.id);
            }
          }
          return;
        }
        // If not a skill, or no skills to connect, just add the new element
        addElement(newElement);
      } catch (error) {
        console.error("Error dropping element:", error);
      }
    },
    [
      addElement,
      addMultipleElements,
      setDragging,
      canvas.position,
      canvas.zoom,
      elements,
      setSelectedGoal,
    ]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragOver to false if we're leaving the canvas entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOver(false);
    }
  }, []);

  const handleCanvasClick = useCallback(
    (e) => {
      if (e.target === canvasRef.current) {
        // Only clear selection if not Ctrl+clicking (for multi-selection)
        if (!isCtrlPressed) {
          clearSelection();
        }
      }
    },
    [clearSelection, isCtrlPressed]
  );

  // Handle wheel for zooming
  const handleWheel = useCallback(
    (e) => {
      // Only zoom when Alt key is pressed
      if (!e.altKey) {
        return;
      }

      e.preventDefault();

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate zoom factor
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.01, Math.min(4, canvas.zoom * zoomFactor));

      // Calculate new position to zoom towards mouse
      const scaleChange = newZoom / canvas.zoom;
      const newX = mouseX - (mouseX - canvas.position.x) * scaleChange;
      const newY = mouseY - (mouseY - canvas.position.y) * scaleChange;

      updateCanvas({
        zoom: newZoom,
        position: { x: newX, y: newY },
      });
    },
    [canvas.zoom, canvas.position, updateCanvas]
  );

  // Touch zoom state
  const [touchZoomState, setTouchZoomState] = useState({
    initialDistance: 0,
    initialZoom: 1,
    initialCenter: { x: 0, y: 0 },
  });

  // Handle touch zoom (pinch-to-zoom) and drag-and-drop from sidebar
  const handleTouchStart = useCallback(
    (e) => {
      if (e.touches.length === 2) {
        // Two-finger pinch to zoom
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;

        setTouchZoomState({
          initialDistance: distance,
          initialZoom: canvas.zoom,
          initialCenter: { x: centerX, y: centerY },
        });
      } else if (e.touches.length === 1) {
        // Single touch - check if we have sidebar drag data
        if (window.sidebarDragData) {
          e.preventDefault();
          setDragOver(true);
        }
      }
    },
    [canvas.zoom]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (e.touches.length === 2 && touchZoomState.initialDistance > 0) {
        e.preventDefault();

        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );

        const scale = currentDistance / touchZoomState.initialDistance;
        const newZoom = Math.max(
          0.01,
          Math.min(4, touchZoomState.initialZoom * scale)
        );

        const rect = canvasRef.current.getBoundingClientRect();
        const centerX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
        const centerY = (touch1.clientY + touch2.clientY) / 2 - rect.top;

        // Calculate new position to zoom towards the center point
        const scaleChange = newZoom / touchZoomState.initialZoom;
        const newX = centerX - (centerX - canvas.position.x) * scaleChange;
        const newY = centerY - (centerY - canvas.position.y) * scaleChange;

        updateCanvas({
          zoom: newZoom,
          position: { x: newX, y: newY },
        });
      } else if (e.touches.length === 1 && window.sidebarDragData) {
        // Single touch with sidebar drag data - keep drag over state
        e.preventDefault();
        setDragOver(true);
      }
    },
    [touchZoomState, canvas.position, updateCanvas]
  );

  const handleTouchEnd = useCallback(
    (e) => {
      setTouchZoomState({
        initialDistance: 0,
        initialZoom: 1,
        initialCenter: { x: 0, y: 0 },
      });

      // Handle touch-based drop from sidebar
      if (
        window.sidebarDragData &&
        e.changedTouches &&
        e.changedTouches.length > 0
      ) {
        e.preventDefault();
        setDragOver(false);
        setDragging(false);

        try {
          const technology = window.sidebarDragData.technology;
          const touch = e.changedTouches[0];
          const rect = canvasRef.current.getBoundingClientRect();

          // Calculate drop position relative to the canvas, accounting for zoom and pan
          const rawX = touch.clientX - rect.left;
          const rawY = touch.clientY - rect.top;

          // Transform the position back to canvas coordinates
          const x = (rawX - canvas.position.x) / canvas.zoom;
          const y = (rawY - canvas.position.y) / canvas.zoom;

          // --- Prevent duplicate: check if already exists ---
          if (
            elements.some(
              (el) =>
                el &&
                el.type === "technology" &&
                el.technology &&
                el.technology.name === technology.name
            )
          ) {
            window.sidebarDragData = null;
            return;
          }

          // --- Cross-goal skill detection logic ---
          // Find the current goal (from selectedGoal in context or from any element on canvas)
          let currentGoal = null;
          if (elements.length > 0) {
            // Try to get from any element with goalData
            const elWithGoal = elements.find(
              (el) => el.goalData && el.goalData.goal
            );
            if (elWithGoal) currentGoal = elWithGoal.goalData.goal;
          }
          // Fallback: try to get from selected goal in context
          if (!currentGoal && selectedGoal) {
            currentGoal = selectedGoal.goal;
          }

          // Find all goals that contain this skill
          const goalsWithSkill = dataset.filter((g) => {
            if (!g.skills) return false;

            // Check if it's a top-level skill
            if (g.skills[technology.name]) return true;

            // Check if it's a tool within any skill's tools array
            for (const skillName in g.skills) {
              const skillData = g.skills[skillName];
              if (
                skillData &&
                skillData.tools &&
                Array.isArray(skillData.tools)
              ) {
                if (skillData.tools.includes(technology.name)) {
                  return true;
                }
              }
            }

            return false;
          });
          // If not in any goal, allow (custom/extra skill)
          if (goalsWithSkill.length === 0) {
            // ... proceed as normal ...
          } else {
            // Is this skill in the current goal?
            const inCurrentGoal = goalsWithSkill.some(
              (g) => g.goal === currentGoal
            );
            if (!inCurrentGoal) {
              // If it exists in multiple goals, show all options
              if (goalsWithSkill.length > 1) {
                setCrossGoalWarning({
                  skillName: technology.name,
                  otherGoal: goalsWithSkill[0]?.goal,
                  possibleGoals: goalsWithSkill.map((g) => g.goal),
                });
              } else {
                // Single other goal case
                setCrossGoalWarning({
                  skillName: technology.name,
                  otherGoal: goalsWithSkill[0]?.goal,
                });
              }
              if (showSidebar) toggleSidebar();
              setShowGapPopover(true);
              window.sidebarDragData = null;
              return; // Block add for now
            }
          }

          // Determine if this is a tool or a skill
          const isTool = technology.category === "tools" || technology.isTool;

          const newElement = {
            id: `${technology.id}-${Date.now()}`,
            type: "technology",
            technology: technology,
            position: { x, y },
            size: { width: 150, height: 40 },
            completed: false,
            isTool: isTool,
            // Attach goalData and skillData for completion logic if not a tool
            ...(isTool
              ? {}
              : (() => {
                  // Use the current selected goal to ensure correct goalData
                  const currentGoal = selectedGoal;
                  if (
                    currentGoal &&
                    currentGoal.skills &&
                    currentGoal.skills[technology.name]
                  ) {
                    return {
                      goalData: currentGoal,
                      skillData: currentGoal.skills[technology.name],
                    };
                  }

                  // Fallback: Find the goal in dataset that contains this skill
                  let goalObj = null;
                  let skillData = null;
                  for (const g of dataset) {
                    if (g.skills && g.skills[technology.name]) {
                      goalObj = g;
                      skillData = g.skills[technology.name];
                      break;
                    }
                  }
                  return goalObj ? { goalData: goalObj, skillData } : {};
                })()),
          };

          // Only connect if this is a skill (not a tool)
          if (!isTool) {
            // Find all existing skills on the canvas
            const skillsOnCanvas = elements.filter(
              (el) =>
                el.type === "technology" &&
                !el.isTool &&
                el.technology &&
                el.technology.name
            );
            // Helper: get numeric level from dataset.json for a skill name
            const getNumericLevel = (skillName) => {
              for (const goalObj of dataset) {
                if (goalObj.skills && goalObj.skills[skillName]) {
                  return goalObj.skills[skillName].level;
                }
              }
              return undefined;
            };
            // Fallback: string to number mapping
            const levelToNumber = (level) => {
              if (typeof level === "number") return level;
              if (typeof level === "string") {
                switch (level.toLowerCase()) {
                  case "beginner":
                    return 1;
                  case "intermediate":
                    return 2;
                  case "advanced":
                    return 3;
                  default:
                    return 0;
                }
              }
              return 0;
            };
            // Get the new skill's level
            let newSkillLevel = getNumericLevel(technology.name);
            if (newSkillLevel === undefined) {
              newSkillLevel = levelToNumber(technology.level);
            }
            // Build array of {el, level}
            const skillLevels = skillsOnCanvas
              .map((el) => {
                let lvl = getNumericLevel(el.technology.name);
                if (lvl === undefined) lvl = levelToNumber(el.technology.level);
                return { el, level: lvl };
              })
              .sort((a, b) => a.level - b.level);
            // Find predecessor and successor
            let predecessor = null,
              successor = null;
            for (let i = 0; i < skillLevels.length; ++i) {
              if (skillLevels[i].level < newSkillLevel)
                predecessor = skillLevels[i];
              if (skillLevels[i].level > newSkillLevel && !successor)
                successor = skillLevels[i];
            }
            // Remove direct connector between predecessor and successor if it exists
            let elementsToAdd = [newElement];
            let elementsToRemove = [];
            if (predecessor && successor) {
              const directConnector = elements.find(
                (el) =>
                  el.type === "connector" &&
                  el.sourceId === predecessor.el.id &&
                  el.targetId === successor.el.id
              );
              if (directConnector) {
                removeElement(directConnector.id);
              }
            }
            // Add children tools if any
            let goalObjWithSkill = null;
            let skillData = null;
            for (const goalObj of dataset) {
              if (goalObj.skills && goalObj.skills[technology.name]) {
                goalObjWithSkill = goalObj;
                skillData = goalObj.skills[technology.name];
                break;
              }
            }
            let toolElements = [];
            let toolConnectors = [];
            if (
              skillData &&
              skillData.tools &&
              Array.isArray(skillData.tools)
            ) {
              const toolWidth = 100;
              const toolGap = 50; // Increased from 30 to 50 for better spacing between tools
              const toolCount3 = skillData.tools.length;
              const totalWidth3 =
                toolCount3 * toolWidth + (toolCount3 - 1) * toolGap;
              const startX3 = x + (150 - totalWidth3) / 2;
              const toolY3 = y + 40 + 60; // Increased from 40 to 60 for better separation from parent
              skillData.tools.forEach((toolName, toolIndex) => {
                const toolTech = roadmapData.technologies.find(
                  (t) => t.name.toLowerCase() === toolName.toLowerCase()
                ) || {
                  id: toolName.toLowerCase().replace(/\s+/g, "-"),
                  name: toolName,
                  category: "tools",
                  level: "beginner",
                  prerequisites: [],
                  nextSteps: [],
                  description: `Tool: ${toolName}`,
                  popularity: 50,
                };
                const toolElement3 = {
                  id: `${toolTech.id}-${Date.now()}-${toolIndex}`,
                  type: "technology",
                  technology: toolTech,
                  position: {
                    x: startX3 + toolIndex * (toolWidth + toolGap),
                    y: toolY3,
                  },
                  size: { width: toolWidth, height: 35 },
                  completed: false,
                  isTool: true,
                  parentSkillId: newElement.id,
                };
                toolElements.push(toolElement3);
                toolConnectors.push({
                  id: `connector-${newElement.id}-${toolElement3.id}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
                  type: "connector",
                  sourceId: newElement.id,
                  targetId: toolElement3.id,
                });
              });
            }
            elementsToAdd.push(...toolElements, ...toolConnectors);
            // Add connectors
            if (predecessor) {
              let connectionType = undefined;
              if (Math.abs(newSkillLevel - predecessor.level) !== 1) {
                connectionType = "warning";
                setShowGapPopover(true);
              }
              elementsToAdd.push({
                id: `connector-${predecessor.el.id}-${newElement.id}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
                type: "connector",
                sourceId: predecessor.el.id,
                targetId: newElement.id,
                ...(connectionType ? { connectionType } : {}),
              });
            }
            if (successor) {
              let connectionType = undefined;
              if (Math.abs(successor.level - newSkillLevel) !== 1) {
                connectionType = "warning";
                setShowGapPopover(true);
              }
              elementsToAdd.push({
                id: `connector-${newElement.id}-${successor.el.id}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
                type: "connector",
                sourceId: newElement.id,
                targetId: successor.el.id,
                ...(connectionType ? { connectionType } : {}),
              });
            }
            addMultipleElements(elementsToAdd);
            // Remove any connector from a carried skill (C1) to the trigger skill (S1)
            // C1 is a newly added skill with id ending in '-carried', S1 is the most recent uncompleted skill
            const carriedSkill = elementsToAdd.find(
              (el) =>
                el.type === "technology" &&
                !el.isTool &&
                el.id.endsWith("-carried")
            );
            const s1Skill = elementsToAdd.find(
              (el) => el.type === "technology" && !el.isTool && !el.completed
            );
            if (carriedSkill && s1Skill) {
              const c1ToS1Connector = elements.find(
                (el) =>
                  el.type === "connector" &&
                  el.sourceId === carriedSkill.id &&
                  el.targetId === s1Skill.id
              );
              if (c1ToS1Connector) {
                removeElement(c1ToS1Connector.id);
              }
            }
            window.sidebarDragData = null;
            return;
          }
          // If not a skill, or no skills to connect, just add the new element
          addElement(newElement);
          window.sidebarDragData = null;
        } catch (error) {
          console.error("Error dropping element via touch:", error);
          window.sidebarDragData = null;
        }
      }
    },
    [
      addElement,
      addMultipleElements,
      setDragging,
      canvas.position,
      canvas.zoom,
      elements,
      setSelectedGoal,
      selectedGoal,
      dataset,
      roadmapData.technologies,
      removeElement,
      showSidebar,
      toggleSidebar,
      setShowGapPopover,
      setCrossGoalWarning,
    ]
  );

  const handleTransformChange = useCallback(
    (ref, state) => {
      updateCanvas({
        zoom: state.scale,
        position: {
          x: state.positionX,
          y: state.positionY,
        },
      });
    },
    [updateCanvas]
  );

  // Area selection handlers (works with both mouse and touch)
  const handleSelectionMouseDown = useCallback(
    (e) => {
      if (
        !pointerToolActive ||
        e.target !== canvasRef.current ||
        isPanning ||
        handToolActive ||
        isSpacebarPressed
      ) {
        return;
      }

      // Get coordinates from either mouse or touch event
      let clientX, clientY;
      if (e.type === "touchstart") {
        const touch = e.touches[0];
        if (!touch) return;
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      // Transform to canvas coordinates
      const canvasX = (mouseX - canvas.position.x) / canvas.zoom;
      const canvasY = (mouseY - canvas.position.y) / canvas.zoom;

      setIsSelecting(true);
      setSelectionStart({ x: canvasX, y: canvasY });
      setSelectionBox({
        start: { x: canvasX, y: canvasY },
        end: { x: canvasX, y: canvasY },
      });

      // Clear selection if not Ctrl+clicking (for mouse only)
      if (!isCtrlPressed) {
        clearSelection();
      }
    },
    [
      pointerToolActive,
      isPanning,
      handToolActive,
      isSpacebarPressed,
      canvas.position,
      canvas.zoom,
      isCtrlPressed,
      clearSelection,
      setSelectionBox,
    ]
  );

  const handleSelectionMouseMove = useCallback(
    (e) => {
      if (!isSelecting) return;

      // Get coordinates from either mouse or touch event
      let clientX, clientY;
      if (e.type === "touchmove") {
        const touch = e.touches[0];
        if (!touch) return;
        clientX = touch.clientX;
        clientY = touch.clientY;
        e.preventDefault(); // Prevent scrolling on touch
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      // Transform to canvas coordinates
      const canvasX = (mouseX - canvas.position.x) / canvas.zoom;
      const canvasY = (mouseY - canvas.position.y) / canvas.zoom;

      setSelectionBox({
        start: selectionStart,
        end: { x: canvasX, y: canvasY },
      });

      // Check which elements are in the selection box
      const selectedIds = elements
        .filter((element) => {
          // Only process elements that have position and size properties (technology elements)
          if (
            !element.position ||
            !element.size ||
            element.type !== "technology"
          ) {
            return false;
          }

          const elementCenter = {
            x: element.position.x + element.size.width / 2,
            y: element.position.y + element.size.height / 2,
          };

          const left = Math.min(selectionStart.x, canvasX);
          const right = Math.max(selectionStart.x, canvasX);
          const top = Math.min(selectionStart.y, canvasY);
          const bottom = Math.max(selectionStart.y, canvasY);

          return (
            elementCenter.x >= left &&
            elementCenter.x <= right &&
            elementCenter.y >= top &&
            elementCenter.y <= bottom
          );
        })
        .map((element) => element.id);

      setSelectedElements(selectedIds);
    },
    [
      isSelecting,
      canvas.position,
      canvas.zoom,
      selectionStart,
      elements,
      setSelectionBox,
      setSelectedElements,
    ]
  );

  const handleSelectionMouseUp = useCallback(() => {
    setIsSelecting(false);
    setSelectionBox(null);
  }, [setSelectionBox]);

  // Area selection event listeners
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.addEventListener("mousedown", handleSelectionMouseDown);
      canvasRef.current.addEventListener(
        "touchstart",
        handleSelectionMouseDown
      );
      document.addEventListener("mousemove", handleSelectionMouseMove);
      document.addEventListener("touchmove", handleSelectionMouseMove);
      document.addEventListener("mouseup", handleSelectionMouseUp);
      document.addEventListener("touchend", handleSelectionMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleSelectionMouseMove);
      document.removeEventListener("touchmove", handleSelectionMouseMove);
      document.removeEventListener("mouseup", handleSelectionMouseUp);
      document.removeEventListener("touchend", handleSelectionMouseUp);
    };
  }, [
    handleSelectionMouseDown,
    handleSelectionMouseMove,
    handleSelectionMouseUp,
  ]);

  // Handler to open LevelGapPrompt and close sidebar (for connectors)
  const handleOpenLevelGapPrompt = useCallback(() => {
    setShowGapPopover(true);
    if (showSidebar) toggleSidebar();
  }, [showSidebar, toggleSidebar]);

  // Mutually exclusive: when showGapPopover is set to true, close sidebar
  const handleSetShowGapPopover = useCallback(
    (val) => {
      setShowGapPopover(val);
      if (val && showSidebar) toggleSidebar();
    },
    [showSidebar, toggleSidebar]
  );

  // --- Mutual Exclusivity: Whenever B is opened, close A ---
  useEffect(() => {
    // Only close sidebar for level gap or cross-goal warnings, not for common completed skills
    if ((showGapPopover || crossGoalWarning) && showSidebar) {
      toggleSidebar();
    }
  }, [showGapPopover, crossGoalWarning, showSidebar, toggleSidebar]);

  // --- Mutual Exclusivity: Whenever A is opened by trigger, close B ---
  const handleToggleSidebar = useCallback(() => {
    if (!showSidebar) {
      if (showGapPopover) setShowGapPopover(false);
      if (crossGoalWarning) setCrossGoalWarning(null);
      // Do NOT clear commonCompletedSkillsWarning here; let the user dismiss it manually
    }
    toggleSidebar();
  }, [showSidebar, showGapPopover, crossGoalWarning, toggleSidebar]);

  // Check if a tool should be hidden due to parent skill being folded
  const isToolHidden = useCallback(
    (toolElement) => {
      if (!toolElement.isTool || !toolElement.parentSkillId) return false;
      return foldedSkills.has(toolElement.parentSkillId);
    },
    [foldedSkills]
  );

  // Handler to toggle fold state of a skill
  const handleToggleFold = useCallback(
    (skillId) => {
      toggleFoldedSkill(skillId);
    },
    [toggleFoldedSkill]
  );

  // Memoize elements rendering to prevent unnecessary re-renders
  const renderedElements = useMemo(() => {
    // Build a set of valid element IDs (excluding hidden tools, but including padding elements)
    const validIds = new Set(
      elements
        .filter(
          (el) =>
            (el.type === "technology" && (!el.isTool || !isToolHidden(el))) ||
            el.type === "padding"
        )
        .map((el) => el.id)
    );

    return elements.map((element) => {
      if (element.type === "technology") {
        // Hide tool elements if their parent is folded
        if (element.isTool && isToolHidden(element)) {
          return null;
        }
        // Hide skills if they are tools and hidden
        if (!element.isTool && isToolHidden(element)) {
          return null;
        }
        return (
          <TechnologyElement
            key={element.id}
            element={element}
            isSelected={selectedElements.includes(element.id)}
            isFolded={foldedSkills.has(element.id)}
            onToggleFold={handleToggleFold}
            onSelect={(e) => {
              if (isCtrlPressed) {
                // Multi-selection
                if (selectedElements.includes(element.id)) {
                  removeFromSelection(element.id);
                } else {
                  addToSelection(element.id);
                }
              } else {
                // Toggle selection: deselect if already selected
                if (
                  selectedElements.length === 1 &&
                  selectedElements[0] === element.id
                ) {
                  clearSelection();
                } else {
                  setSelectedElement(element);
                }
              }
            }}
            onCompleted={handleTechnologyCompleted}
            onShowInfo={onShowInfo}
          />
        );
      }
      if (element.type === "connector") {
        // Only render connector if both source and target exist and are not hidden
        const sourceElement = elements.find((el) => el.id === element.sourceId);
        const targetElement = elements.find((el) => el.id === element.targetId);

        const sourceValid = validIds.has(element.sourceId);
        const targetValid = validIds.has(element.targetId);
        const sourceHidden = sourceElement ? isToolHidden(sourceElement) : true;
        const targetHidden = targetElement ? isToolHidden(targetElement) : true;

        if (
          sourceElement &&
          targetElement &&
          !sourceHidden &&
          !targetHidden &&
          sourceValid &&
          targetValid
        ) {
          return (
            <ConnectorElement
              key={element.id}
              element={element}
              elements={elements}
              onOpenLevelGapPrompt={handleOpenLevelGapPrompt}
            />
          );
        }

        return null;
      }
      if (element.type === "padding") {
        // Render invisible padding element to ensure proper spacing
        return (
          <div
            key={element.id}
            className="absolute pointer-events-none"
            style={{
              left: element.position.x,
              top: element.position.y,
              width: element.size.width,
              height: element.size.height,
              opacity: 0,
            }}
          />
        );
      }
      return null;
    });
  }, [
    elements,
    selectedElements,
    setSelectedElement,
    addToSelection,
    removeFromSelection,
    isCtrlPressed,
    handleTechnologyCompleted,
    handleOpenLevelGapPrompt,
    foldedSkills,
    handleToggleFold,
    isToolHidden,
    onShowInfo,
  ]);

  // --- Level Gap Detection ---
  // Find all connectors with connectionType: 'warning'
  const levelGapConnectors = useMemo(() => {
    return elements.filter(
      (el) => el.type === "connector" && el.connectionType === "warning"
    );
  }, [elements]);

  // For each gap, get the sequence info for the prompt
  const levelGapPrompts = useMemo(() => {
    // Use a Map to deduplicate by (from, to) skill name
    const uniquePairs = new Map();
    levelGapConnectors.forEach((connector) => {
      const source = elements.find(
        (el) => el.id === connector.sourceId && el.type === "technology"
      );
      const target = elements.find(
        (el) => el.id === connector.targetId && el.type === "technology"
      );
      if (source && target) {
        const from = source.technology.name;
        const to = target.technology.name;
        const key = `${from}__${to}`;
        if (!uniquePairs.has(key)) {
          const seq = getSkillSequence(from, to);
          if (seq) uniquePairs.set(key, seq);
        }
      }
    });
    return Array.from(uniquePairs.values());
  }, [levelGapConnectors, elements]);

  // Handler to close the popover (not the warning itself)
  const handleCloseLevelGapPrompt = () => {
    setShowGapPopover(false);
  };

  const handleAddCvSkill = useCallback(
    (clickedSkill, onSuccess) => {
      // Helper function to find the rightmost element position
      const findRightmostElementPosition = () => {
        const allElements = elements.filter((el) => el.type === "technology");
        if (allElements.length === 0) return { x: 100, y: 100 };

        let rightmostX = 0;
        allElements.forEach((el) => {
          const elementRight = el.position.x + (el.size?.width || 150);
          if (elementRight > rightmostX) {
            rightmostX = elementRight;
          }
        });

        return { x: rightmostX + 150, y: 100 }; // 150px gap from rightmost element
      };

      // Helper function to check if a position would overlap with existing elements
      const wouldOverlap = (newPos, newSize = { width: 150, height: 40 }) => {
        const margin = 50; // Minimum margin between elements
        const newLeft = newPos.x - margin;
        const newRight = newPos.x + newSize.width + margin;
        const newTop = newPos.y - margin;
        const newBottom = newPos.y + newSize.height + margin;

        return elements.some((el) => {
          if (el.type !== "technology") return false;
          const elLeft = el.position.x - margin;
          const elRight = el.position.x + (el.size?.width || 150) + margin;
          const elTop = el.position.y - margin;
          const elBottom = el.position.y + (el.size?.height || 40) + margin;

          return !(
            newLeft > elRight ||
            newRight < elLeft ||
            newTop > elBottom ||
            newBottom < elTop
          );
        });
      };

      // Helper function to find a non-overlapping position
      const findNonOverlappingPosition = (
        preferredPos,
        size = { width: 150, height: 40 }
      ) => {
        let testPos = { ...preferredPos };
        let attempts = 0;
        const maxAttempts = 10;

        while (wouldOverlap(testPos, size) && attempts < maxAttempts) {
          attempts++;
          // Try different positions: right, down, up, left
          if (attempts === 1) testPos = { x: testPos.x + 300, y: testPos.y };
          else if (attempts === 2)
            testPos = { x: testPos.x, y: testPos.y + 200 };
          else if (attempts === 3)
            testPos = { x: testPos.x, y: testPos.y - 200 };
          else if (attempts === 4)
            testPos = { x: testPos.x - 300, y: testPos.y };
          else testPos = { x: testPos.x + 100, y: testPos.y + 100 };
        }

        return testPos;
      };

      // Helper function to find which parent skill a tool belongs to
      const findParentSkillForTool = (toolName) => {
        if (!goalData?.skills) return null;

        for (const [skillName, skillData] of Object.entries(goalData.skills)) {
          if (
            skillData.tools &&
            Array.isArray(skillData.tools) &&
            skillData.tools.includes(toolName)
          ) {
            return { parentSkillName: skillName, parentSkillData: skillData };
          }
        }
        return null;
      };

      // Helper function to calculate optimal position for parent skill and its tools
      const calculateTreeLayoutPosition = (
        parentSkillData,
        preferredParentPosition
      ) => {
        if (
          !parentSkillData?.tools ||
          !Array.isArray(parentSkillData.tools) ||
          parentSkillData.tools.length === 0
        ) {
          return {
            parentPosition: preferredParentPosition,
            toolsLayout: null,
          };
        }

        const toolWidth = 100;
        const toolGap = 50;
        const toolCount = parentSkillData.tools.length;
        const totalWidth = toolCount * toolWidth + (toolCount - 1) * toolGap;
        const startX = preferredParentPosition.x + (150 - totalWidth) / 2; // 150 is parent skill width
        const toolY = preferredParentPosition.y + 100; // 100px below parent

        const toolsLayout = parentSkillData.tools.map((toolName, index) => ({
          name: toolName,
          position: {
            x: startX + index * (toolWidth + toolGap),
            y: toolY,
          },
        }));

        return {
          parentPosition: preferredParentPosition,
          toolsLayout,
        };
      };

      // Helper function to position tools for a skill
      const positionToolsForSkill = (
        parentSkill,
        skillData,
        markClickedToolCompleted = false,
        clickedToolName = null,
        toolsLayout = null
      ) => {
        if (
          !skillData?.tools ||
          !Array.isArray(skillData.tools) ||
          skillData.tools.length === 0
        ) {
          return { tools: [], connectors: [] };
        }

        const tools = [];
        const connectors = [];

        // Use provided layout or calculate default layout
        const layout =
          toolsLayout ||
          skillData.tools.map((toolName, index) => ({
            name: toolName,
            position: {
              x: parentSkill.position.x + index * 120,
              y: parentSkill.position.y + 80,
            },
          }));

        layout.forEach((toolLayout) => {
          const toolName = toolLayout.name;
          const toolId = `${toolName}-${Date.now()}-${Math.random()}`;
          const isClickedTool = clickedToolName === toolName;

          const toolElement = {
            id: toolId,
            type: "technology",
            technology: { name: toolName },
            position: toolLayout.position,
            size: { width: 100, height: 35 },
            isTool: true,
            parentSkillId: parentSkill.id,
            completed: markClickedToolCompleted && isClickedTool,
          };

          tools.push(toolElement);

          // Create connector from parent to tool
          const connector = {
            id: generateUniqueConnectorId(parentSkill.id, toolId, elements),
            type: "connector",
            sourceId: parentSkill.id,
            targetId: toolId,
          };

          connectors.push(connector);
        });

        return { tools, connectors };
      };

      // Helper function to position skills in a linear path
      const positionSkillsInLinearPath = (skillsWithLevels) => {
        const spacing = 350;
        let currentX = 100;

        skillsWithLevels.forEach((skillWithLevel) => {
          skillWithLevel.element.position = {
            x: currentX,
            y: 100,
          };
          currentX += spacing;
        });
      };

      // Helper function to position only new skills without affecting existing ones
      const positionNewSkillsOnly = (newSkills, existingSkills) => {
        if (newSkills.length === 0) return;

        // Find the rightmost existing skill
        let rightmostX = 100;
        existingSkills.forEach((el) => {
          // Add safety check for element structure
          if (el && el.position && typeof el.position.x === "number") {
            const elementRight = el.position.x + (el.size?.width || 150);
            if (elementRight > rightmostX) {
              rightmostX = elementRight;
            }
          }
        });

        // Position new skills starting from the right of existing skills
        const spacing = 350;
        let currentX = rightmostX + spacing;

        newSkills.forEach((skillWithLevel) => {
          skillWithLevel.element.position = {
            x: currentX,
            y: 100,
          };
          currentX += spacing;
        });
      };

      // Helper function to create connectors for a linear path
      const createConnectorsForLinearPath = (skillsWithLevels) => {
        const connectors = [];

        for (let i = 0; i < skillsWithLevels.length - 1; i++) {
          const currentSkill = skillsWithLevels[i];
          const nextSkill = skillsWithLevels[i + 1];

          const connector = {
            id: generateUniqueConnectorId(
              currentSkill.element.id,
              nextSkill.element.id,
              elements
            ),
            type: "connector",
            sourceId: currentSkill.element.id,
            targetId: nextSkill.element.id,
          };

          // Add warning connection type if there's a level gap
          if (nextSkill.level - currentSkill.level > 1) {
            connector.connectionType = "warning";
          }

          connectors.push(connector);
        }

        return connectors;
      };

      // Helper function to remove outdated connectors
      const removeOutdatedConnectors = (skillsWithLevels) => {
        // ✅ FIX: Preserve tool connectors before removing skill connectors
        const toolConnectors = elements.filter(
          (el) =>
            el.type === "connector" &&
            elements.some(
              (source) =>
                source.id === el.sourceId &&
                source.type === "technology" &&
                !source.isTool
            ) &&
            elements.some(
              (target) =>
                target.id === el.targetId &&
                target.type === "technology" &&
                target.isTool
            )
        );

        elements.forEach((element) => {
          if (element.type === "connector") {
            // ✅ FIX: Skip tool connectors - only process skill-to-skill connectors
            const isToolConnector = toolConnectors.some(
              (toolConn) =>
                toolConn.sourceId === element.sourceId &&
                toolConn.targetId === element.targetId
            );

            if (isToolConnector) {
              return;
            }

            const sourceSkill = skillsWithLevels.find(
              (s) => s.element.id === element.sourceId
            );
            const targetSkill = skillsWithLevels.find(
              (s) => s.element.id === element.targetId
            );

            // If either source or target doesn't exist in the new skill list, remove the connector
            if (!sourceSkill || !targetSkill) {
              removeElement(element.id);
              return;
            }

            // If source and target are not consecutive in the linear path, remove the connector
            const sourceIndex = skillsWithLevels.indexOf(sourceSkill);
            const targetIndex = skillsWithLevels.indexOf(targetSkill);

            if (targetIndex !== sourceIndex + 1) {
              removeElement(element.id);
            }
          }
        });
      };

      // Main logic starts here
      const goalData = selectedGoal;
      if (!goalData) {
        return;
      }

      // ✅ NEW: Check for cross-goal CV skill click using comprehensive validation
      const clickedSkillName = clickedSkill.name;

      // Skip validation if we just switched goals from a CV skill warning
      if (justSwitchedToGoalFromCvSkill.current) {
        justSwitchedToGoalFromCvSkill.current = false; // Reset immediately
        // Continue with normal CV skill processing (add the skill)
      } else {
        // Normal validation logic

        // Check if the skill belongs to the current goal (including tools)
        const belongsToCurrentGoal = (() => {
          if (!goalData.skills) return false;

          // Check if it's a top-level skill
          if (goalData.skills[clickedSkillName]) {
            return true;
          }

          // Check if it's a tool within any skill's tools array
          for (const skillName in goalData.skills) {
            const skillData = goalData.skills[skillName];
            if (
              skillData &&
              skillData.tools &&
              Array.isArray(skillData.tools)
            ) {
              // Check for exact match and also log each tool for debugging
              skillData.tools.forEach((tool, index) => {});
              if (skillData.tools.includes(clickedSkillName)) {
                return true;
              }
            }
          }

          return false;
        })();

        // If the skill doesn't belong to the current goal, find which goal it belongs to
        if (!belongsToCurrentGoal) {
          // Find which goal this skill belongs to
          let targetGoal = null;
          for (const goal of dataset) {
            if (!goal.skills) continue;

            // Check if it's a top-level skill in this goal
            if (goal.skills[clickedSkillName]) {
              targetGoal = goal;
              break;
            }

            // Check if it's a tool within any skill's tools array in this goal
            for (const skillName in goal.skills) {
              const skillData = goal.skills[skillName];
              if (
                skillData &&
                skillData.tools &&
                Array.isArray(skillData.tools)
              ) {
                if (skillData.tools.includes(clickedSkillName)) {
                  targetGoal = goal;
                  break;
                }
              }
            }
            if (targetGoal) break;
          }

          if (targetGoal) {
            // Show cross-goal warning for CV skill
            setCrossGoalWarning({
              skillName: clickedSkillName,
              otherGoal: targetGoal.goal,
              possibleGoals: [targetGoal.goal], // Single goal option for CV skills
              isCvSkill: true, // Flag to identify this is a CV skill warning
              cvSkill: clickedSkill, // Store the CV skill data
            });

            // Set flag to prevent EmptyState during goal switch
            setIsSwitchingGoalFromCvSkill(true);
            // Mark user as no longer first-time since they're switching goals
            setIsFirstTimeUser(false);

            if (showSidebar) toggleSidebar();
            setShowGapPopover(true);
            return; // Block add for now
          } else {
            // If skill is not found in any goal, allow it to be added (custom skill)
          }
        }
      } // Close the else block for validation logic

      const skills = goalData.skills;

      // 📌 TOOL-TO-SKILL MAPPING LOGIC
      // Check if the clicked skill is actually a tool that belongs to a parent skill
      const toolMapping = findParentSkillForTool(clickedSkillName);
      const isTool = !!toolMapping;
      const parentSkillName = isTool
        ? toolMapping.parentSkillName
        : clickedSkillName;
      const parentSkillData = isTool
        ? toolMapping.parentSkillData
        : skills[clickedSkillName];

      // ✅ 2. Check for Existing Skill on Canvas
      const existingParentSkill = elements.find(
        (el) =>
          el &&
          el.type === "technology" &&
          !el.isTool &&
          el.technology &&
          el.technology.name === parentSkillName
      );

      if (existingParentSkill) {
        if (isTool) {
          // 🧠 If the Parent Skill is Already on the Canvas (Tool Click)

          // Check if tool already exists
          const existingTool = elements.find(
            (el) =>
              el &&
              el.type === "technology" &&
              el.isTool &&
              el.technology &&
              el.technology.name === clickedSkillName &&
              el.parentSkillId === existingParentSkill.id
          );

          if (existingTool) {
            // Tool already exists, just toggle completion

            toggleCompletion(existingTool.id);
          } else {
            // Add new tool to existing parent skill

            // Check if parent skill has tools that need to be rendered
            const parentSkillDataFromCanvas =
              skills[existingParentSkill.technology.name];
            if (
              parentSkillDataFromCanvas?.tools &&
              Array.isArray(parentSkillDataFromCanvas.tools)
            ) {
              // Check if any tools are already rendered
              const existingTools = elements.filter(
                (el) =>
                  el.type === "technology" &&
                  el.isTool &&
                  el.parentSkillId === existingParentSkill.id
              );

              if (existingTools.length === 0) {
                // No tools rendered yet, render all tools for this parent with tree layout
                // 🧩 IMPROVED LAYOUT: Calculate tree layout for existing parent skill (only for tool clicks)
                let toolsLayout = null;
                if (isTool) {
                  const { parentPosition, calculatedToolsLayout } =
                    calculateTreeLayoutPosition(
                      parentSkillDataFromCanvas,
                      existingParentSkill.position
                    );

                  // Update parent skill position to be centered above its tools
                  existingParentSkill.position = parentPosition;
                  toolsLayout = calculatedToolsLayout;
                }

                const { tools, connectors } = positionToolsForSkill(
                  existingParentSkill,
                  parentSkillDataFromCanvas,
                  true, // Mark clicked tool as completed
                  clickedSkillName,
                  toolsLayout // Use calculated tree layout (null if not tool click)
                );

                // Add all tools and connectors
                tools.forEach((tool) => addElement(tool));
                connectors.forEach((connector) => addElement(connector));
              } else {
                // Some tools already exist, add only the missing tool
                const missingTools = parentSkillDataFromCanvas.tools.filter(
                  (toolName) =>
                    !existingTools.some((et) => et.technology.name === toolName)
                );

                if (missingTools.includes(clickedSkillName)) {
                  // 🧩 IMPROVED LAYOUT: Recalculate tree layout for existing parent skill (only for tool clicks)
                  let toolsLayout = null;
                  if (isTool) {
                    const { parentPosition, calculatedToolsLayout } =
                      calculateTreeLayoutPosition(
                        parentSkillDataFromCanvas,
                        existingParentSkill.position
                      );

                    // Update parent skill position to be centered above its tools
                    existingParentSkill.position = parentPosition;
                    toolsLayout = calculatedToolsLayout;
                  }

                  // Add the missing tool
                  const { tools, connectors } = positionToolsForSkill(
                    existingParentSkill,
                    parentSkillDataFromCanvas,
                    true, // Mark clicked tool as completed
                    clickedSkillName,
                    toolsLayout // Use calculated tree layout (null if not tool click)
                  );

                  // Find and add only the clicked tool
                  const newTool = tools.find(
                    (t) => t.technology.name === clickedSkillName
                  );
                  const newConnector = connectors.find(
                    (c) => c.targetId === newTool.id
                  );

                  if (newTool && newConnector) {
                    addElement(newTool);
                    addElement(newConnector);
                  }
                }
              }
            }
          }

          // ✅ RULE: Do NOT mark parent as completed, Do NOT show next step yet
          // (This is already handled by the current logic - we only mark the tool as completed)
        } else {
          // Handle direct skill click when parent skill exists

          // If skill exists and is completed, do nothing
          if (existingParentSkill.completed) {
            if (onSuccess) onSuccess();
            return;
          }

          // If skill exists and is not completed, mark as completed and reveal next step
          if (!existingParentSkill.completed) {
            toggleCompletion(existingParentSkill.id);

            // Reveal next step (child skill)
            const nextSkillLevel = parentSkillData?.level + 1;
            const nextSkillNames = Object.keys(skills).filter(
              (skillName) => skills[skillName].level === nextSkillLevel
            );

            if (nextSkillNames.length > 0) {
              const nextSkillName = nextSkillNames[0];
              const existingNextSkill = elements.find(
                (el) =>
                  el &&
                  el.type === "technology" &&
                  !el.isTool &&
                  el.technology &&
                  el.technology.name === nextSkillName
              );

              if (!existingNextSkill) {
                // Create next skill
                const nextId = `${nextSkillName}-${Date.now()}-cv-next`;
                const nextPreferredPosition = {
                  x: existingParentSkill.position.x + 350,
                  y: existingParentSkill.position.y,
                };
                const nextFinalPosition = findNonOverlappingPosition(
                  nextPreferredPosition
                );

                const nextElement = {
                  id: nextId,
                  type: "technology",
                  technology: { name: nextSkillName },
                  position: nextFinalPosition,
                  isSkill: true,
                  completed: false,
                  goalData: goalData,
                  skillData: skills[nextSkillName],
                  size: { width: 150, height: 40 },
                };

                // Add next skill
                addElement(nextElement);

                // Create connector from parent to next skill
                const parentToNextConnector = {
                  id: generateUniqueConnectorId(
                    existingParentSkill.id,
                    nextId,
                    elements
                  ),
                  type: "connector",
                  sourceId: existingParentSkill.id,
                  targetId: nextId,
                };
                addElement(parentToNextConnector);

                // Add tools for next skill if it has any
                const nextSkillData = skills[nextSkillName];
                if (
                  nextSkillData?.tools &&
                  Array.isArray(nextSkillData.tools) &&
                  nextSkillData.tools.length > 0
                ) {
                  // 🧩 IMPROVED LAYOUT: Calculate tree layout for next skill
                  const { parentPosition, toolsLayout } =
                    calculateTreeLayoutPosition(
                      nextSkillData,
                      nextElement.position
                    );

                  // Update next skill position to be centered above its tools
                  nextElement.position = parentPosition;

                  const { tools, connectors } = positionToolsForSkill(
                    nextElement,
                    nextSkillData,
                    false,
                    null, // No clicked tool name for next skill
                    toolsLayout // Use calculated tree layout
                  );

                  tools.forEach((tool) => addElement(tool));
                  connectors.forEach((connector) => addElement(connector));
                }
              }
            }
          }
        }

        // Call success callback
        if (onSuccess) onSuccess();
        return;
      }

      // ✅ 3. If Skill Not Found on Canvas

      // C1 = parent skill (mark as completed only if it's a direct skill click)
      const c1SkillName = parentSkillName;
      const c1SkillData = parentSkillData;
      const c1SkillLevel = c1SkillData?.level || 0;

      // 🧠 FIXED LOGIC: Only get C2 if it's NOT a tool click
      let c2SkillName = null;
      let c2SkillData = null;
      let nextSkillLevel = null;
      if (!isTool) {
        // Only get next skill for C1 if it's a direct skill click
        nextSkillLevel = c1SkillLevel + 1;
        const nextSkillNames = Object.keys(skills).filter(
          (skillName) => skills[skillName].level === nextSkillLevel
        );

        if (nextSkillNames.length > 0) {
          c2SkillName = nextSkillNames[0];
          c2SkillData = skills[c2SkillName];
        }
      }

      // S1, S2, S3... = existing skills on canvas, ordered by level (ascending)
      // 🛠️ FIX: Only include skills that belong to the current goal
      const existingSkills = elements
        .filter((el) => {
          // ✅ FIX: Add null checks to prevent runtime errors
          if (!el || el.type !== "technology" || el.isTool) {
            return false;
          }

          // Check if technology property exists and has a name
          if (!el.technology || !el.technology.name) {
            console.warn("Element missing technology property:", el);
            return false;
          }

          const belongsToCurrentGoal = skills && skills[el.technology.name];
          return belongsToCurrentGoal;
        })
        .map((el) => ({
          element: el,
          level: skills[el.technology.name]?.level || 0,
        }))
        .sort((a, b) => a.level - b.level);

      // Check if C2 already exists on canvas (reuse existing C2)
      // 🛠️ FIX: Only check for existing C2 if it belongs to the current goal
      const existingC2Element =
        c2SkillName && skills[c2SkillName]
          ? elements.find(
              (el) =>
                el &&
                el.type === "technology" &&
                !el.isTool &&
                el.technology &&
                el.technology.name === c2SkillName
            )
          : null;

      // Create C1 element
      const c1Id = `${c1SkillName}-${Date.now()}-cv`;
      const c1Element = {
        id: c1Id,
        type: "technology",
        technology: { name: c1SkillName },
        position: { x: 100, y: 100 }, // Will be positioned properly later
        isSkill: true,
        completed: !isTool, // Mark as completed only if it's a direct skill click, not a tool click
        goalData: goalData,
        skillData: c1SkillData,
        size: { width: 150, height: 40 },
      };

      // Create or reuse C2 element (only if it's NOT a tool click)
      let c2Element = null;
      let c2Id = null;
      if (c2SkillName && !isTool) {
        if (existingC2Element) {
          // Reuse existing C2

          c2Element = existingC2Element;
          c2Id = existingC2Element.id;
        } else {
          // Create new C2

          c2Id = `${c2SkillName}-${Date.now()}-cv-next`;
          c2Element = {
            id: c2Id,
            type: "technology",
            technology: { name: c2SkillName },
            position: { x: 100, y: 100 }, // Will be positioned properly later
            isSkill: true,
            completed: false,
            goalData: goalData,
            skillData: c2SkillData,
            size: { width: 150, height: 40 },
          };
        }
      }

      // 🔁 Connection Rules Based on Level Order
      // Create a list of all skills including C1 and C2 (if C2 is new and NOT a tool click)
      const skillsToPosition = [
        ...existingSkills,
        { element: c1Element, level: c1SkillLevel },
      ];

      // Only add C2 to positioning if it's a new element and NOT a tool click
      if (c2Element && !existingC2Element && !isTool) {
        skillsToPosition.push({ element: c2Element, level: nextSkillLevel });
      }

      // Sort by level to maintain linear path
      const allSkillsWithLevels = skillsToPosition.sort(
        (a, b) => a.level - b.level
      );

      // 🛠️ FIXED: Position only new skills without affecting existing ones
      const newSkillsToPosition = [];
      if (
        !existingSkills.find((s) => s.element.technology.name === c1SkillName)
      ) {
        newSkillsToPosition.push({ element: c1Element, level: c1SkillLevel });
      }
      if (c2Element && !existingC2Element && !isTool) {
        newSkillsToPosition.push({ element: c2Element, level: nextSkillLevel });
      }

      if (newSkillsToPosition.length > 0) {
        // Pass only existing skills (not connectors) to positionNewSkillsOnly
        const existingSkillsOnly = existingSkills.map((s) => s.element);
        positionNewSkillsOnly(newSkillsToPosition, existingSkillsOnly);
      }

      // 🧩 IMPROVED LAYOUT: Calculate tree layout for C1 if it has tools
      // 🔁 ONLY Apply This Layout When: A tool is added from the CV skill list and its parent skill is being added for the first time
      let c1TreeLayout = null;
      if (
        isTool &&
        c1SkillData?.tools &&
        Array.isArray(c1SkillData.tools) &&
        c1SkillData.tools.length > 0
      ) {
        const { parentPosition, toolsLayout } = calculateTreeLayoutPosition(
          c1SkillData,
          c1Element.position
        );

        // Update C1 position to be centered above its tools
        c1Element.position = parentPosition;
        c1TreeLayout = toolsLayout;
      }

      // 🛠️ FIXED: Create connectors for single linear path only
      const newConnectors = [];

      // Get all skills in level order (existing + new)
      const allSkillsInLevelOrder = allSkillsWithLevels.sort(
        (a, b) => a.level - b.level
      );

      // 🛠️ FIXED: Remove any outdated connectors that might create forks
      // ✅ FIX: Preserve tool connectors before removing skill connectors
      const toolConnectors = elements.filter(
        (el) =>
          el.type === "connector" &&
          elements.some(
            (source) =>
              source.id === el.sourceId &&
              source.type === "technology" &&
              !source.isTool
          ) &&
          elements.some(
            (target) =>
              target.id === el.targetId &&
              target.type === "technology" &&
              target.isTool
          )
      );

      elements.forEach((element) => {
        if (element.type === "connector") {
          // ✅ FIX: Skip tool connectors - only process skill-to-skill connectors
          const isToolConnector = toolConnectors.some(
            (toolConn) =>
              toolConn.sourceId === element.sourceId &&
              toolConn.targetId === element.targetId
          );

          if (isToolConnector) {
            return;
          }

          const sourceSkill = allSkillsInLevelOrder.find(
            (s) => s.element.id === element.sourceId
          );
          const targetSkill = allSkillsInLevelOrder.find(
            (s) => s.element.id === element.targetId
          );

          // If either source or target doesn't exist in the final skill list, remove the connector
          if (!sourceSkill || !targetSkill) {
            removeElement(element.id);
            return;
          }

          // If source and target are not consecutive in the linear path, remove the connector
          const sourceIndex = allSkillsInLevelOrder.indexOf(sourceSkill);
          const targetIndex = allSkillsInLevelOrder.indexOf(targetSkill);

          if (targetIndex !== sourceIndex + 1) {
            removeElement(element.id);
          }
        }
      });

      // Create connectors for the single linear path
      for (let i = 0; i < allSkillsInLevelOrder.length - 1; i++) {
        const currentSkill = allSkillsInLevelOrder[i];
        const nextSkill = allSkillsInLevelOrder[i + 1];

        // Check if this connector already exists
        const connectorExists = elements.some(
          (conn) =>
            conn.type === "connector" &&
            conn.sourceId === currentSkill.element.id &&
            conn.targetId === nextSkill.element.id
        );

        if (!connectorExists) {
          const connector = {
            id: generateUniqueConnectorId(
              currentSkill.element.id,
              nextSkill.element.id,
              elements
            ),
            type: "connector",
            sourceId: currentSkill.element.id,
            targetId: nextSkill.element.id,
          };

          // Add warning connection type if there's a level gap
          if (nextSkill.level - currentSkill.level > 1) {
            connector.connectionType = "warning";
          }

          newConnectors.push(connector);
        }
      }

      // Prepare elements to add
      const elementsToAdd = [c1Element];
      if (c2Element && !existingC2Element && !isTool) {
        elementsToAdd.push(c2Element);
      }
      elementsToAdd.push(...newConnectors);

      // Add all elements at once
      addMultipleElements(elementsToAdd);

      // Add tools for C1 if it has any (using tree layout)
      if (
        c1SkillData?.tools &&
        Array.isArray(c1SkillData.tools) &&
        c1SkillData.tools.length > 0
      ) {
        const { tools, connectors } = positionToolsForSkill(
          c1Element,
          c1SkillData,
          isTool, // Only mark clicked tool as completed if this was a tool click
          clickedSkillName,
          c1TreeLayout // Use calculated tree layout
        );

        // Add all tools and connectors
        tools.forEach((tool) => addElement(tool));
        connectors.forEach((connector) => addElement(connector));
      }

      // Add tools for C2 if it has any and is new (only if NOT a tool click)
      if (
        c2Element &&
        !existingC2Element &&
        !isTool &&
        c2SkillData?.tools &&
        Array.isArray(c2SkillData.tools) &&
        c2SkillData.tools.length > 0
      ) {
        // 🧩 IMPROVED LAYOUT: Calculate tree layout for C2
        const { parentPosition, toolsLayout } = calculateTreeLayoutPosition(
          c2SkillData,
          c2Element.position
        );

        // Update C2 position to be centered above its tools
        c2Element.position = parentPosition;

        const { tools, connectors } = positionToolsForSkill(
          c2Element,
          c2SkillData,
          false,
          null, // No clicked tool name for C2
          toolsLayout // Use calculated tree layout
        );

        tools.forEach((tool) => addElement(tool));
        connectors.forEach((connector) => addElement(connector));
      }

      // ✅ NEW: Automatically mark CV skill as removed when successfully added to roadmap
      const skillKey = `${clickedSkill.name}-${clickedSkill.goalId || "unknown"}`;
      addRemovedCvSkill(skillKey);

      // Call success callback after successful addition
      if (onSuccess) onSuccess();
    },
    [
      selectedGoal,
      elements,
      addElement,
      addMultipleElements,
      removeElement,
      toggleCompletion,
      addNextStepsForCompletedSkill,
      generateUniqueConnectorId,
      crossGoalWarning,
      setCrossGoalWarning,
      showSidebar,
      toggleSidebar,
      setShowGapPopover,
      addRemovedCvSkill,
    ]
  );

  const handleClearCvSkillsWarning = useCallback(() => {
    setJustSelectedGoalFromEmptyState(false);
  }, []);

  const handleGoalSwitchComplete = useCallback(() => {
    setIsSwitchingGoalFromCvSkill(false);
  }, []);

  const handleSetFirstTimeUser = useCallback((isFirstTime) => {
    setIsFirstTimeUser(isFirstTime);
  }, []);

  const handleSetJustSwitchedToGoalFromCvSkill = useCallback((justSwitched) => {
    justSwitchedToGoalFromCvSkill.current = justSwitched;
  }, []);

  // Handler to add common completed skills
  const handleAddCommonCompletedSkills = useCallback(
    (selectedSkills, triggeringSkillId) => {
      // Find the triggering skill (the skill that caused the goal switch)
      const triggeringSkill = elements
        .filter((el) => el.type === "technology" && !el.isTool && !el.completed)
        .sort((a, b) => {
          const aTime = parseInt(a.id.split("-").pop()) || 0;
          const bTime = parseInt(b.id.split("-").pop()) || 0;
          return bTime - aTime;
        })[0];
      addCommonCompletedSkills(
        selectedSkills,
        triggeringSkill ? triggeringSkill.id : null
      );
      setCommonCompletedSkillsWarning(null);
    },
    [elements, addCommonCompletedSkills]
  );

  // Automatically open LevelGapPrompt and close sidebar when a new gap is detected
  useEffect(() => {
    if (levelGapPrompts.length > 0) {
      setShowGapPopover(true);
      closeSidebar();
    } else if (
      levelGapPrompts.length === 0 &&
      !crossGoalWarning &&
      !commonCompletedSkillsWarning
    ) {
      // Close popover if no warnings are present
      setShowGapPopover(false);
    }
  }, [levelGapPrompts.length, crossGoalWarning, commonCompletedSkillsWarning]);

  // Handle common completed skills detection
  useEffect(() => {
    if (commonCompletedSkills) {
      setCommonCompletedSkillsWarning(commonCompletedSkills);
      setShowGapPopover(true);
      // Do NOT close sidebar here; allow user to open it while prompt is open
    } else {
      // Clear warning when common completed skills are cleared
      setCommonCompletedSkillsWarning(null);
    }
  }, [commonCompletedSkills]);

  // --- Save skills to backend whenever elements, selectedGoal, or roadmaps change ---
  useEffect(() => {
    saveSkillsToBackend();
  }, [elements, selectedGoal, roadmaps]);

  // Mutually exclusive toggling for ProgressBar (A) and KeyboardShortcutsHint (B)
  const handleToggleKeyboardHints = useCallback(() => {
    if (!showKeyboardHints) setShowProgressBar(false); // Show B, hide A
    toggleKeyboardHints();
  }, [showKeyboardHints, setShowProgressBar, toggleKeyboardHints]);

  const handleHideKeyboardHints = useCallback(() => {
    if (showKeyboardHints) toggleKeyboardHints();
  }, [showKeyboardHints, toggleKeyboardHints]);

  // When ProgressBar should be shown, hide KeyboardShortcutsHint
  const handleShowProgressBar = useCallback(() => {
    setShowProgressBar(true);
    handleHideKeyboardHints();
  }, [handleHideKeyboardHints]);

  const isCanvasEmpty = elements.length === 0;

  return (
    <div className="flex-1 bg-gray-50 relative overflow-auto">
      {/* Toolbar with Level Gap Icon */}
      <Toolbar
        levelGapPrompt={levelGapPrompts[0]}
        levelGapCount={levelGapPrompts.length}
        showGapPopover={showGapPopover}
        setShowGapPopover={handleSetShowGapPopover}
        onCloseLevelGapPrompt={handleCloseLevelGapPrompt}
        levelGapPrompts={levelGapPrompts}
        showSidebar={showSidebar}
        toggleSidebar={handleToggleSidebar}
        crossGoalWarning={crossGoalWarning}
        setCrossGoalWarning={setCrossGoalWarning}
        commonCompletedSkillsWarning={commonCompletedSkillsWarning}
        setCommonCompletedSkillsWarning={setCommonCompletedSkillsWarning}
        lastSkillDeletionWarning={lastSkillDeletionWarning}
        setLastSkillDeletionWarning={setLastSkillDeletionWarning}
        onAddCommonCompletedSkills={handleAddCommonCompletedSkills}
        onToggleKeyboardHints={handleToggleKeyboardHints}
        showKeyboardHintsProp={showKeyboardHints}
        pointerToolActive={pointerToolActive}
        togglePointerTool={togglePointerTool}
        handToolActive={handToolActive}
        toggleHandTool={toggleHandTool}
        cvSkills={cvSkills}
        justSelectedGoalFromEmptyState={justSelectedGoalFromEmptyState}
        onAddCvSkill={handleAddCvSkill}
        onClearCvSkillsWarning={handleClearCvSkillsWarning}
        onGoalSwitchComplete={handleGoalSwitchComplete}
        onSetFirstTimeUser={handleSetFirstTimeUser}
        onSetJustSwitchedToGoalFromCvSkill={
          handleSetJustSwitchedToGoalFromCvSkill
        }
      />

      {/* Empty State UI - positioned at root level, above everything */}
      {(() => {
        const shouldShowEmptyState =
          elements.length === 0 &&
          !dragOver &&
          !isSwitchingGoalFromCvSkill &&
          isFirstTimeUser;

        return shouldShowEmptyState ? (
          <EmptyState
            dataset={dataset}
            handleGoalClick={handleGoalClick}
            dragOver={dragOver}
            elements={elements}
          />
        ) : null;
      })()}

      <div
        ref={canvasRef}
        className={`relative w-full h-full min-h-screen canvas-grid-background ${
          dragOver ? "bg-blue-50" : ""
        } ${handToolActive || isSpacebarPressed ? "cursor-grab" : ""} ${isPanning ? "cursor-grabbing" : ""}`}
        style={{
          "--grid-size": `${gridSize}px`,
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Canvas content with zoom and pan transformations */}
        <div
          className="absolute inset-0 origin-top-left"
          style={{
            transform: `translate(${canvas.position.x}px, ${canvas.position.y}px) scale(${canvas.zoom})`,
            transformOrigin: "0 0",
            zIndex: 5,
            pointerEvents: "auto",
          }}
        >
          {/* Render elements */}
          {renderedElements}

          {/* Selection box */}
          {isSelecting && (
            <div
              className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-20 pointer-events-none"
              style={{
                left: Math.min(
                  selectionStart.x,
                  selectionBox?.end.x || selectionStart.x
                ),
                top: Math.min(
                  selectionStart.y,
                  selectionBox?.end.y || selectionStart.y
                ),
                width: Math.abs(
                  (selectionBox?.end.x || selectionStart.x) - selectionStart.x
                ),
                height: Math.abs(
                  (selectionBox?.end.y || selectionStart.y) - selectionStart.y
                ),
              }}
            />
          )}
        </div>

        {/* Drop indicator - positioned outside the transformed container */}
        {dragOver && (
          <div
            className="absolute inset-0 pointer-events-none border-2 border-dashed border-blue-400 rounded-lg"
            style={{ zIndex: 20, background: "none" }}
          />
        )}

        {/* Only show one of ProgressBar (A) or KeyboardShortcutsHint (B) */}
        {showKeyboardHints ? (
          <KeyboardShortcutsHint />
        ) : showProgressBar ? (
          <ProgressBar />
        ) : null}
      </div>
    </div>
  );
}
