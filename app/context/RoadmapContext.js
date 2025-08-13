"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  useState,
} from "react";
import dataset from "../data/dataset.json";

const RoadmapContext = createContext();

const initialState = {
  elements: [],
  suggestions: [],
  canvas: {
    zoom: 1,
    position: { x: 0, y: 0 },
    gridSize: 20,
  },
  selectedElement: null,
  selectedElements: [], // Array of selected element IDs for multi-selection
  isDragging: false,
  dragState: {
    isActive: false,
    draggedElementId: null,
    dragOffset: { x: 0, y: 0 },
    initialPositions: {}, // Store initial positions of all selected elements
  },
  showSuggestions: true,
  showSidebar: true,
  handToolActive: false,
  showKeyboardHints: true, // New state for keyboard hints visibility
  selectionBox: null, // For area selection: { start: {x, y}, end: {x, y} }
  selectedGoal: null,
  previousGoal: null, // NEW: store previous goal
  roadmaps: {}, // NEW: store elements for each goal by goal id
  commonCompletedSkills: null, // NEW: store common completed skills when switching goals
  foldedSkills: new Set(), // NEW: store folded skills state
  removedCvSkills: new Set(), // NEW: store persistently removed CV skills
  // Undo/Redo stacks
  undoStack: [],
  redoStack: [],
};

function roadmapReducer(state, action) {
  // Helper to push to undo stack
  function pushUndo(newState, prevState) {
    return {
      ...newState,
      undoStack: [...state.undoStack, prevState],
      redoStack: [], // Clear redo stack on new action
    };
  }
  // Helper to push to redo stack
  function pushRedo(newState, prevState) {
    return {
      ...newState,
      redoStack: [...state.redoStack, prevState],
    };
  }
  switch (action.type) {
    case "ADD_ELEMENT":
      return pushUndo(
        {
          ...state,
          elements: [...state.elements, action.payload],
        },
        state
      );

    case "ADD_MULTIPLE_ELEMENTS":
      return pushUndo(
        {
          ...state,
          elements: [...state.elements, ...action.payload],
        },
        state
      );

    case "UPDATE_ELEMENT":
      return pushUndo(
        {
          ...state,
          elements: state.elements.map((el) =>
            el.id === action.payload.id ? { ...el, ...action.payload } : el
          ),
        },
        state
      );

    case "REMOVE_ELEMENT": {
      // Find the element to be removed
      const elementToRemove = state.elements.find(
        (el) => el.id === action.payload
      );

      // If it's a skill element (not a tool), also remove its child tools
      let elementsToRemove = [action.payload];
      if (
        elementToRemove &&
        elementToRemove.type === "technology" &&
        !elementToRemove.isTool
      ) {
        // Find all child tools of this skill
        const childTools = state.elements.filter(
          (el) =>
            el.type === "technology" &&
            el.isTool &&
            el.parentSkillId === action.payload
        );
        elementsToRemove.push(...childTools.map((el) => el.id));
      }

      return pushUndo(
        {
          ...state,
          elements: state.elements.filter(
            (el) => !elementsToRemove.includes(el.id)
          ),
        },
        state
      );
    }

    case "TOGGLE_COMPLETION":
      return pushUndo(
        {
          ...state,
          elements: state.elements.map((el) =>
            el.id === action.payload ? { ...el, completed: !el.completed } : el
          ),
        },
        state
      );

    case "SET_SUGGESTIONS":
      return {
        ...state,
        suggestions: action.payload,
      };

    case "UPDATE_CANVAS":
      return pushUndo(
        {
          ...state,
          canvas: { ...state.canvas, ...action.payload },
        },
        state
      );

    case "SET_SELECTED_ELEMENT":
      return {
        ...state,
        selectedElement: action.payload,
        selectedElements: action.payload ? [action.payload.id] : [],
      };

    case "SET_SELECTED_ELEMENTS":
      return {
        ...state,
        selectedElements: action.payload,
        selectedElement:
          action.payload.length === 1
            ? state.elements.find((el) => el.id === action.payload[0])
            : null,
      };

    case "ADD_TO_SELECTION":
      return {
        ...state,
        selectedElements: [...state.selectedElements, action.payload],
        selectedElement: state.elements.find((el) => el.id === action.payload),
      };

    case "REMOVE_FROM_SELECTION":
      return {
        ...state,
        selectedElements: state.selectedElements.filter(
          (id) => id !== action.payload
        ),
        selectedElement:
          state.selectedElements.length === 1 &&
          state.selectedElements[0] === action.payload
            ? null
            : state.selectedElement,
      };

    case "CLEAR_SELECTION":
      return {
        ...state,
        selectedElement: null,
        selectedElements: [],
      };

    case "SET_SELECTION_BOX":
      return {
        ...state,
        selectionBox: action.payload,
      };

    case "MOVE_SELECTED_ELEMENTS":
      return pushUndo(
        {
          ...state,
          elements: state.elements.map((el) => {
            // Move selected elements
            if (state.selectedElements.includes(el.id)) {
              return {
                ...el,
                position: {
                  x: el.position.x + action.payload.deltaX,
                  y: el.position.y + action.payload.deltaY,
                },
              };
            }

            // Also move child tools if their parent skill is being moved
            if (
              el.isTool &&
              el.parentSkillId &&
              state.selectedElements.includes(el.parentSkillId)
            ) {
              return {
                ...el,
                position: {
                  x: el.position.x + action.payload.deltaX,
                  y: el.position.y + action.payload.deltaY,
                },
              };
            }

            return el;
          }),
        },
        state
      );

    case "DELETE_SELECTED_ELEMENTS": {
      const elementsToDelete = action.payload || state.selectedElements;
      return pushUndo(
        {
          ...state,
          elements: state.elements.filter(
            (el) => !elementsToDelete.includes(el.id)
          ),
          selectedElement: null,
          selectedElements: [],
        },
        state
      );
    }

    case "SET_DRAGGING":
      return {
        ...state,
        isDragging: action.payload,
      };

    case "TOGGLE_SUGGESTIONS":
      return {
        ...state,
        showSuggestions: !state.showSuggestions,
      };

    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        showSidebar: !state.showSidebar,
      };

    case "SET_ZOOM":
      return pushUndo(
        {
          ...state,
          canvas: {
            ...state.canvas,
            zoom: Math.max(0.01, Math.min(4, action.payload)), // Clamp between 1% and 400%
          },
        },
        state
      );

    case "TOGGLE_HAND_TOOL":
      return {
        ...state,
        handToolActive: !state.handToolActive,
      };

    case "RESET_VIEW":
      return pushUndo(
        {
          ...state,
          canvas: {
            ...state.canvas,
            zoom: 1,
            position: { x: 0, y: 0 },
          },
        },
        state
      );

    case "START_DRAG":
      return {
        ...state,
        dragState: {
          isActive: true,
          draggedElementId: action.payload.elementId,
          dragOffset: action.payload.dragOffset,
          initialPositions: action.payload.initialPositions,
        },
      };

    case "UPDATE_DRAG":
      return {
        ...state,
        elements: state.elements.map((el) => {
          if (state.selectedElements.includes(el.id)) {
            const initialPos = state.dragState.initialPositions[el.id];
            if (initialPos) {
              return {
                ...el,
                position: {
                  x: initialPos.x + action.payload.deltaX,
                  y: initialPos.y + action.payload.deltaY,
                },
              };
            }
          }
          return el;
        }),
      };

    case "END_DRAG":
      return {
        ...state,
        dragState: {
          isActive: false,
          draggedElementId: null,
          dragOffset: { x: 0, y: 0 },
          initialPositions: {},
        },
      };

    case "TOGGLE_KEYBOARD_HINTS":
      return {
        ...state,
        showKeyboardHints: !state.showKeyboardHints,
      };

    case "CASCADE_DELETE_ELEMENTS": {
      return pushUndo(
        {
          ...state,
          elements: state.elements.filter(
            (el) => !action.payload.elementIds.includes(el.id)
          ),
          selectedElement: null,
          selectedElements: [],
        },
        state
      );
    }

    case "SET_SELECTED_GOAL":
      return {
        ...state,
        selectedGoal: action.payload,
        previousGoal: null,
      };

    case "SWITCH_GOAL": {
      const { newGoal, prevGoal, prevElements } = action.payload;
      // Save current elements under previous goal, load new goal's elements if exist
      const newRoadmaps = { ...state.roadmaps };
      if (prevGoal) {
        newRoadmaps[prevGoal.id] = prevElements;
      }
      let newElements = newRoadmaps[newGoal.id] || [];

      // 🛠️ FIX: STRICT GOAL VALIDATION - Only allow skills that belong to the target goal
      const goalSkillNames = new Set(Object.keys(newGoal.skills || {}));
      const validSkillIds = new Set();

      // First pass: Filter out skills that don't belong to the target goal
      newElements = newElements.filter((el) => {
        if (el.type === "technology") {
          // For skills (not tools)
          if (!el.isTool) {
            // ✅ CRITICAL FIX: Only keep skills that exist in the target goal's skill list
            if (goalSkillNames.has(el.technology.name)) {
              validSkillIds.add(el.id);
              return true;
            }
            // 🚫 Remove skills that don't belong to this goal (e.g., "Intranet" in Frontend roadmap)
            return false;
          }

          // For tools, keep only if their parent skill is valid AND the tool is listed for that skill
          if (el.isTool && el.parentSkillId) {
            // Find the parent skill element
            const parentSkillElement = newElements.find(
              (e) =>
                e.id === el.parentSkillId &&
                e.type === "technology" &&
                !e.isTool
            );

            if (parentSkillElement) {
              const parentSkillName = parentSkillElement.technology.name;
              const parentSkillData = newGoal.skills[parentSkillName];

              // Check if parent skill exists in target goal AND tool is listed for that parent
              if (
                parentSkillData &&
                parentSkillData.tools &&
                Array.isArray(parentSkillData.tools) &&
                parentSkillData.tools.includes(el.technology.name)
              ) {
                return true;
              }
            }

            // 🚫 Remove tools that don't belong to this goal or have invalid parent
            return false;
          }

          // Remove any other technology elements that don't meet criteria
          return false;
        }

        // Keep non-technology elements (e.g., connectors) for now - will be filtered in next pass
        return true;
      });

      // Second pass: Remove connectors that reference removed elements
      const validElementIds = new Set(newElements.map((el) => el.id));
      newElements = newElements.filter((el) => {
        if (el.type === "connector") {
          const isValidConnector =
            validElementIds.has(el.sourceId) &&
            validElementIds.has(el.targetId);
          if (!isValidConnector) {
            // Connector references removed element
          }
          return isValidConnector;
        }
        return true;
      });

      return pushUndo(
        {
          ...state,
          selectedGoal: newGoal,
          previousGoal: prevGoal,
          elements: newElements,
          roadmaps: newRoadmaps,
        },
        state
      );
    }

    case "SET_COMMON_COMPLETED_SKILLS":
      return {
        ...state,
        commonCompletedSkills: action.payload,
      };

    case "UPDATE_ROADMAPS":
      return {
        ...state,
        roadmaps: action.payload,
      };

    case "SET_ELEMENTS":
      return pushUndo(
        {
          ...state,
          elements: action.payload,
        },
        state
      );

    case "LOAD_SAVED_ROADMAP":
      return {
        ...state,
        elements: action.payload.elements || [],
        roadmaps: action.payload.roadmaps || {},
        canvas: action.payload.canvas || state.canvas,
        selectedGoal: action.payload.selectedGoal || null,
        foldedSkills: action.payload.foldedSkills
          ? new Set(action.payload.foldedSkills)
          : new Set(),
        // removedCvSkills is loaded separately from backend, not from localStorage
      };

    case "SET_FOLDED_SKILLS":
      return {
        ...state,
        foldedSkills: new Set(action.payload),
      };

    case "TOGGLE_FOLDED_SKILL":
      return {
        ...state,
        foldedSkills: (() => {
          const newSet = new Set(state.foldedSkills);
          if (newSet.has(action.payload)) {
            newSet.delete(action.payload);
          } else {
            newSet.add(action.payload);
          }
          return newSet;
        })(),
      };

    // Undo/Redo actions
    case "UNDO": {
      if (state.undoStack.length === 0) return state;
      const prevState = state.undoStack[state.undoStack.length - 1];
      return {
        ...prevState,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [
          ...state.redoStack,
          { ...state, undoStack: undefined, redoStack: undefined },
        ],
      };
    }
    case "REDO": {
      if (state.redoStack.length === 0) return state;
      const nextState = state.redoStack[state.redoStack.length - 1];
      return {
        ...nextState,
        undoStack: [
          ...state.undoStack,
          { ...state, undoStack: undefined, redoStack: undefined },
        ],
        redoStack: state.redoStack.slice(0, -1),
      };
    }

    case "ADD_REMOVED_CV_SKILL":
      return {
        ...state,
        removedCvSkills: new Set([...state.removedCvSkills, action.payload]),
      };

    case "CLEAR_REMOVED_CV_SKILLS":
      return {
        ...state,
        removedCvSkills: new Set(),
      };

    case "LOAD_REMOVED_CV_SKILLS":
      return {
        ...state,
        removedCvSkills: new Set(action.payload),
      };

    default:
      return state;
  }
}

export function RoadmapProvider({ children }) {
  const [state, dispatch] = useReducer(roadmapReducer, initialState);
  const updateTimeoutRef = useRef(null);
  const [shouldRewireConnectors, setShouldRewireConnectors] = useState(false);
  const [lastSkillDeletionWarning, setLastSkillDeletionWarning] =
    useState(null);

  // Load saved roadmap data from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const savedRoadmaps = localStorage.getItem("roadmaps");
        const savedCanvas = localStorage.getItem("canvas");
        const savedSelectedGoal = localStorage.getItem("selectedGoal");
        const savedFoldedSkills = localStorage.getItem("foldedSkills");

        // Check if we have any saved data
        if (
          savedRoadmaps ||
          savedCanvas ||
          savedSelectedGoal ||
          savedFoldedSkills
        ) {
          const roadmaps = savedRoadmaps ? JSON.parse(savedRoadmaps) : {};
          const canvas = savedCanvas ? JSON.parse(savedCanvas) : state.canvas;
          const selectedGoal = savedSelectedGoal
            ? JSON.parse(savedSelectedGoal)
            : null;
          const foldedSkills = savedFoldedSkills
            ? JSON.parse(savedFoldedSkills)
            : [];

          // 🛠️ BUG FIX: Sync completion status when loading from localStorage
          const syncedRoadmaps = syncCompletionStatusAcrossRoadmaps(roadmaps);

          // Load elements for the selected goal if it exists
          const elements =
            selectedGoal && syncedRoadmaps[selectedGoal.id]
              ? syncedRoadmaps[selectedGoal.id]
              : [];

          // Dispatch all saved data at once
          dispatch({
            type: "LOAD_SAVED_ROADMAP",
            payload: {
              elements,
              roadmaps: syncedRoadmaps, // Use synced roadmaps
              canvas,
              selectedGoal,
              foldedSkills,
            },
          });

          // Save synced data back to localStorage
          localStorage.setItem("roadmaps", JSON.stringify(syncedRoadmaps));
        }

        // Load removedCvSkills from backend
        loadRemovedCvSkillsFromBackend();
      }
    } catch (error) {
      console.error("Error loading saved roadmap data:", error);
    }
  }, []);

  // Add a new useEffect to handle backend data loading and ensure no default goal for new users
  useEffect(() => {
    const handleBackendDataLoad = async () => {
      try {
        if (typeof window !== "undefined") {
          const email = localStorage.getItem("userEmail");
          if (!email) return;

          const response = await fetch("/api/roadmap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          if (response.ok) {
            const data = await response.json();

            // If the user is new (no roadmaps, no selectedGoal), ensure we don't set any default goal
            if (!data.roadmaps || Object.keys(data.roadmaps).length === 0) {
              // Clear any existing localStorage data for new users
              localStorage.removeItem("roadmaps");
              localStorage.removeItem("selectedGoal");
              localStorage.removeItem("canvas");
              localStorage.removeItem("foldedSkills");

              // Ensure selectedGoal is null for new users
              if (state.selectedGoal !== null) {
                dispatch({
                  type: "SET_SELECTED_GOAL",
                  payload: null,
                });
              }
            } else {
              // 🛠️ BUG FIX: Sync completion status when loading data from backend
              const syncedRoadmaps = syncCompletionStatusAcrossRoadmaps(
                data.roadmaps
              );

              // Update the roadmaps state with synced data
              dispatch({ type: "UPDATE_ROADMAPS", payload: syncedRoadmaps });

              // Save synced data back to localStorage
              localStorage.setItem("roadmaps", JSON.stringify(syncedRoadmaps));
            }
          }
        }
      } catch (error) {
        console.error("Error handling backend data load:", error);
      }
    };

    // Call this after the initial load
    const timer = setTimeout(handleBackendDataLoad, 100);
    return () => clearTimeout(timer);
  }, []); // Empty dependency array to run only once on mount

  // Auto-hide keyboard hints after 20 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.showKeyboardHints) {
        dispatch({ type: "TOGGLE_KEYBOARD_HINTS" });
      }
    }, 20000); // 20 seconds

    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  // Helper to sync current roadmap with elements
  function syncCurrentRoadmapWithElements(
    elements,
    selectedGoal,
    roadmaps,
    dispatch
  ) {
    if (!selectedGoal) return;

    // ✅ VALIDATION: Ensure elements only contain skills that belong to the selected goal
    const goalSkillNames = new Set(Object.keys(selectedGoal.skills || {}));
    const validElements = elements.filter((el) => {
      if (el.type === "technology" && !el.isTool) {
        const isValid = goalSkillNames.has(el.technology.name);
        if (!isValid) {
        }
        return isValid;
      }
      return true; // Keep tools and connectors for now
    });

    const updatedRoadmaps = { ...roadmaps, [selectedGoal.id]: validElements };
    dispatch({ type: "UPDATE_ROADMAPS", payload: updatedRoadmaps });

    // Also save to localStorage for immediate access
    if (typeof window !== "undefined") {
      localStorage.setItem("roadmaps", JSON.stringify(updatedRoadmaps));
    }
  }

  const addElement = (element) => {
    // Prevent adding an element with a duplicate ID
    if (state.elements.some((el) => el.id === element.id)) return;
    const newElements = [...state.elements, element];
    dispatch({ type: "ADD_ELEMENT", payload: element });
    syncCurrentRoadmapWithElements(
      newElements,
      state.selectedGoal,
      state.roadmaps,
      dispatch
    );
    saveSkillsToBackend(newElements);
  };

  const addMultipleElements = (elementsToAdd) => {
    // Filter out elements with duplicate IDs (especially connectors)
    const existingIds = new Set(state.elements.map((el) => el.id));
    // --- NEW: Filter out duplicate connectors by sourceId/targetId ---
    const existingConnectors = new Set(
      state.elements
        .filter((el) => el.type === "connector")
        .map((el) => `${el.sourceId}|${el.targetId}`)
    );
    const batchConnectors = new Set();
    const filtered = elementsToAdd.filter((el) => {
      if (existingIds.has(el.id)) return false;
      if (el.type === "connector") {
        const key = `${el.sourceId}|${el.targetId}`;
        if (existingConnectors.has(key) || batchConnectors.has(key))
          return false;
        batchConnectors.add(key);
      }
      return true;
    });
    if (filtered.length > 0) {
      const newElements = [...state.elements, ...filtered];
      dispatch({ type: "ADD_MULTIPLE_ELEMENTS", payload: filtered });
      syncCurrentRoadmapWithElements(
        newElements,
        state.selectedGoal,
        state.roadmaps,
        dispatch
      );
      saveSkillsToBackend(newElements);
    }
  };

  const updateElement = (element) => {
    // Clear any pending timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // For dragging operations, debounce the updates to improve performance
    if (state.isDragging) {
      updateTimeoutRef.current = setTimeout(() => {
        const newElements = state.elements.map((el) =>
          el.id === element.id ? { ...el, ...element } : el
        );
        dispatch({ type: "UPDATE_ELEMENT", payload: element });
        syncCurrentRoadmapWithElements(
          newElements,
          state.selectedGoal,
          state.roadmaps,
          dispatch
        );
        saveSkillsToBackend(newElements);
      }, 16); // ~60fps
    } else {
      const newElements = state.elements.map((el) =>
        el.id === element.id ? { ...el, ...element } : el
      );
      dispatch({ type: "UPDATE_ELEMENT", payload: element });
      syncCurrentRoadmapWithElements(
        newElements,
        state.selectedGoal,
        state.roadmaps,
        dispatch
      );
      saveSkillsToBackend(newElements);
    }
  };

  const removeElement = (elementId) => {
    // Get the element to be removed
    const elementToRemove = state.elements.find((el) => el.id === elementId);

    // If it's a skill element (not a tool), check if it's the last one
    if (
      elementToRemove &&
      elementToRemove.type === "technology" &&
      !elementToRemove.isTool
    ) {
      const remainingSkillElements = state.elements.filter(
        (el) => el.id !== elementId && el.type === "technology" && !el.isTool
      );

      // Prevent deletion if it would leave no skills on the canvas
      if (remainingSkillElements.length === 0) {
        setLastSkillDeletionWarning(
          "At least one skill must be retained. Please add another before deleting."
        );
        return; // Don't delete - would leave no skills
      }
    }
    const newElements = state.elements.filter((el) => el.id !== elementId);
    dispatch({ type: "REMOVE_ELEMENT", payload: elementId });
    syncCurrentRoadmapWithElements(
      newElements,
      state.selectedGoal,
      state.roadmaps,
      dispatch
    );
    saveSkillsToBackend(newElements);
  };

  const toggleCompletion = (elementId) => {
    const element = state.elements.find((el) => el.id === elementId);
    if (!element || element.type !== "technology") return;

    const wasCompleted = element.completed;
    const skillName = element.technology.name;
    const isCompleting = !wasCompleted; // true if we're completing the skill

    // --- Create the new state for elements after toggling completion ---
    let newElements = state.elements.map((el) =>
      el.id === elementId ? { ...el, completed: !el.completed } : el
    );

    // 🛠️ BUG FIX: Sync shared skill completion across all roadmaps
    if (isCompleting && !element.isTool) {
      // Only sync when completing a skill (not a tool) and not when uncompleting
      const updatedRoadmaps = { ...state.roadmaps };
      let hasUpdates = false;

      // Find all other roadmaps that contain the same skill
      Object.entries(updatedRoadmaps).forEach(([goalId, roadmapElements]) => {
        if (goalId !== state.selectedGoal.id) {
          // Look for the same skill in this roadmap
          const matchingSkill = roadmapElements.find(
            (el) =>
              el.type === "technology" &&
              !el.isTool &&
              el.technology.name === skillName
          );

          if (matchingSkill && !matchingSkill.completed) {
            // Mark the skill as completed in this roadmap
            const updatedRoadmapElements = roadmapElements.map((el) =>
              el.id === matchingSkill.id ? { ...el, completed: true } : el
            );
            updatedRoadmaps[goalId] = updatedRoadmapElements;
            hasUpdates = true;
          }
        }
      });

      // Update the roadmaps state if we made changes
      if (hasUpdates) {
        dispatch({ type: "UPDATE_ROADMAPS", payload: updatedRoadmaps });

        // Also save to localStorage for immediate access
        if (typeof window !== "undefined") {
          localStorage.setItem("roadmaps", JSON.stringify(updatedRoadmaps));
        }
      }
    }

    // Toggle completion for the current element
    dispatch({ type: "TOGGLE_COMPLETION", payload: elementId });

    // --- Pass the updated elements and completed skill info to the backend save function ---
    const completedSkill = isCompleting
      ? {
          id: elementId,
          name: skillName,
        }
      : null;
    saveSkillsToBackend(newElements, completedSkill);
  };

  const setSuggestions = (suggestions) => {
    dispatch({ type: "SET_SUGGESTIONS", payload: suggestions });
  };

  const updateCanvas = (updates) => {
    dispatch({ type: "UPDATE_CANVAS", payload: updates });

    // Also save to localStorage for immediate access
    if (typeof window !== "undefined") {
      const currentCanvas = JSON.parse(localStorage.getItem("canvas") || "{}");
      const updatedCanvas = { ...currentCanvas, ...updates };
      localStorage.setItem("canvas", JSON.stringify(updatedCanvas));
    }
  };

  const setSelectedElement = (element) => {
    dispatch({ type: "SET_SELECTED_ELEMENT", payload: element });
  };

  const setSelectedElements = (elementIds) => {
    dispatch({ type: "SET_SELECTED_ELEMENTS", payload: elementIds });
  };

  const addToSelection = (elementId) => {
    dispatch({ type: "ADD_TO_SELECTION", payload: elementId });
  };

  const removeFromSelection = (elementId) => {
    dispatch({ type: "REMOVE_FROM_SELECTION", payload: elementId });
  };

  const clearSelection = () => {
    dispatch({ type: "CLEAR_SELECTION" });
  };

  const setSelectionBox = (selectionBox) => {
    dispatch({ type: "SET_SELECTION_BOX", payload: selectionBox });
  };

  const moveSelectedElements = (deltaX, deltaY) => {
    dispatch({ type: "MOVE_SELECTED_ELEMENTS", payload: { deltaX, deltaY } });
  };

  const deleteSelectedElements = () => {
    // Get all skill elements (not tools) that are selected for deletion
    const selectedSkillElements = state.elements.filter(
      (el) =>
        state.selectedElements.includes(el.id) &&
        el.type === "technology" &&
        !el.isTool
    );

    // Get all skill elements (not tools) that are not selected for deletion
    const remainingSkillElements = state.elements.filter(
      (el) =>
        !state.selectedElements.includes(el.id) &&
        el.type === "technology" &&
        !el.isTool
    );

    // Prevent deletion if it would leave no skills on the canvas
    if (
      remainingSkillElements.length === 0 &&
      selectedSkillElements.length > 0
    ) {
      setLastSkillDeletionWarning(
        "At least one skill must be retained. Please add another before deleting."
      );
      return; // Don't delete - would leave no skills
    }

    // Find all child tools of selected skills that need to be deleted
    const childToolsToDelete = state.elements.filter(
      (el) =>
        el.type === "technology" &&
        el.isTool &&
        selectedSkillElements.some((skill) => skill.id === el.parentSkillId)
    );

    // Add child tools to the deletion list
    const allElementsToDelete = [
      ...state.selectedElements,
      ...childToolsToDelete.map((el) => el.id),
    ];

    const newElements = state.elements.filter(
      (el) => !allElementsToDelete.includes(el.id)
    );
    dispatch({
      type: "DELETE_SELECTED_ELEMENTS",
      payload: allElementsToDelete,
    });
    syncCurrentRoadmapWithElements(
      newElements,
      state.selectedGoal,
      state.roadmaps,
      dispatch
    );
    saveSkillsToBackend(newElements);
  };

  const setDragging = (isDragging) => {
    dispatch({ type: "SET_DRAGGING", payload: isDragging });
  };

  const toggleSuggestions = () => {
    dispatch({ type: "TOGGLE_SUGGESTIONS" });
  };

  const toggleSidebar = () => {
    dispatch({ type: "TOGGLE_SIDEBAR" });
  };

  const setZoom = (zoom) => {
    dispatch({ type: "SET_ZOOM", payload: zoom });
  };

  const toggleHandTool = () => {
    dispatch({ type: "TOGGLE_HAND_TOOL" });
  };

  const resetView = () => {
    dispatch({ type: "RESET_VIEW" });
  };

  const startDrag = (elementId, dragOffset, initialPositions) => {
    dispatch({
      type: "START_DRAG",
      payload: { elementId, dragOffset, initialPositions },
    });
  };

  const updateDrag = (deltaX, deltaY) => {
    dispatch({
      type: "UPDATE_DRAG",
      payload: { deltaX, deltaY },
    });
  };

  const endDrag = () => {
    dispatch({ type: "END_DRAG" });
  };

  const toggleKeyboardHints = () => {
    dispatch({ type: "TOGGLE_KEYBOARD_HINTS" });
  };

  const cascadeDeleteElements = (technologyName) => {
    // Find the goal that contains this technology
    const goalData = dataset.find((goal) => {
      const skills = goal.skills;
      return Object.keys(skills).some((skillKey) => {
        const skillData = skills[skillKey];

        // Check if the skill name matches directly
        if (skillKey.toLowerCase() === technologyName.toLowerCase()) {
          return true;
        }

        // Check if the skill is in the tools array
        if (skillData.tools && skillData.tools.length > 0) {
          return skillData.tools.some(
            (tool) => tool.toLowerCase() === technologyName.toLowerCase()
          );
        }

        return false;
      });
    });

    if (!goalData) {
      // If not found in dataset, just delete the single element
      const currentElement = state.elements.find(
        (el) =>
          el.type === "technology" && el.technology.name === technologyName
      );
      if (currentElement) {
        dispatch({ type: "REMOVE_ELEMENT", payload: currentElement.id });
      }
      return;
    }

    // Find the current skill and get its level
    const skills = goalData.skills;
    let currentSkillLevel = null;

    // Find the skill that contains this technology
    for (const [skillKey, skillData] of Object.entries(skills)) {
      if (skillKey.toLowerCase() === technologyName.toLowerCase()) {
        currentSkillLevel = skillData.level;
        break;
      }

      if (skillData.tools && skillData.tools.length > 0) {
        if (
          skillData.tools.some(
            (tool) => tool.toLowerCase() === technologyName.toLowerCase()
          )
        ) {
          currentSkillLevel = skillData.level;
          break;
        }
      }
    }

    if (currentSkillLevel === null) {
      // If skill not found, just delete the single element
      const currentElement = state.elements.find(
        (el) =>
          el.type === "technology" && el.technology.name === technologyName
      );
      if (currentElement) {
        dispatch({ type: "REMOVE_ELEMENT", payload: currentElement.id });
      }
      return;
    }

    // Find all elements that have a higher skill level
    const elementsToDelete = state.elements.filter((element) => {
      if (element.type !== "technology") return false;

      // If this is a tool, check if its parent skill should be deleted
      if (element.isTool && element.parentSkillId) {
        const parentSkill = state.elements.find(
          (el) => el.id === element.parentSkillId
        );
        if (parentSkill) {
          // Check if parent skill should be deleted
          for (const [skillKey, skillData] of Object.entries(skills)) {
            if (
              skillKey.toLowerCase() ===
              parentSkill.technology.name.toLowerCase()
            ) {
              return skillData.level > currentSkillLevel;
            }

            if (skillData.tools && skillData.tools.length > 0) {
              if (
                skillData.tools.some(
                  (tool) =>
                    tool.toLowerCase() ===
                    parentSkill.technology.name.toLowerCase()
                )
              ) {
                return skillData.level > currentSkillLevel;
              }
            }
          }
        }
        return false;
      }

      // For skill elements, check their level directly
      for (const [skillKey, skillData] of Object.entries(skills)) {
        if (skillKey.toLowerCase() === element.technology.name.toLowerCase()) {
          return skillData.level > currentSkillLevel;
        }

        if (skillData.tools && skillData.tools.length > 0) {
          if (
            skillData.tools.some(
              (tool) =>
                tool.toLowerCase() === element.technology.name.toLowerCase()
            )
          ) {
            return skillData.level > currentSkillLevel;
          }
        }
      }

      return false;
    });

    // Get the IDs of elements to delete
    let elementIdsToDelete = elementsToDelete.map((el) => el.id);

    // Also include the current element
    const currentElement = state.elements.find(
      (el) => el.type === "technology" && el.technology.name === technologyName
    );
    if (currentElement) {
      elementIdsToDelete.push(currentElement.id);

      // If the current element is a skill, also delete its tools
      if (currentElement.type === "technology" && !currentElement.isTool) {
        const toolElements = state.elements.filter(
          (el) => el.isTool && el.parentSkillId === currentElement.id
        );
        elementIdsToDelete.push(...toolElements.map((el) => el.id));
      }
    }

    // Check if deletion would leave no skills on the canvas
    const skillElementsToDelete = state.elements.filter(
      (el) =>
        elementIdsToDelete.includes(el.id) &&
        el.type === "technology" &&
        !el.isTool
    );

    const remainingSkillElements = state.elements.filter(
      (el) =>
        !elementIdsToDelete.includes(el.id) &&
        el.type === "technology" &&
        !el.isTool
    );

    // Prevent deletion if it would leave no skills on the canvas
    if (
      remainingSkillElements.length === 0 &&
      skillElementsToDelete.length > 0
    ) {
      setLastSkillDeletionWarning(
        "At least one skill must be retained. Please add another before deleting."
      );
      return; // Don't delete - would leave no skills
    }

    // Also include connectors that connect to any of the deleted elements
    const connectorsToDelete = state.elements.filter(
      (element) =>
        element.type === "connector" &&
        (elementIdsToDelete.includes(element.sourceId) ||
          elementIdsToDelete.includes(element.targetId))
    );
    elementIdsToDelete.push(...connectorsToDelete.map((el) => el.id));

    // Find completed elements that have spawned children being deleted
    // These are elements that are completed and have goalData (meaning they can spawn children)
    const completedElementsWithChildren = state.elements.filter(
      (element) =>
        element.type === "technology" &&
        element.completed &&
        element.goalData &&
        !element.isTool
    );

    // Check which completed elements have their spawned children being deleted
    const elementsToReset = completedElementsWithChildren.filter(
      (completedElement) => {
        // Get the next skill level for this completed element
        const skills = completedElement.goalData.skills;
        const currentSkill = skills[completedElement.technology.name];
        if (!currentSkill) return false;

        const nextSkillLevel = currentSkill.level + 1;
        const nextSkillNames = Object.keys(skills).filter(
          (skillName) => skills[skillName].level === nextSkillLevel
        );

        // Check if any of the next skills are being deleted
        const hasChildrenBeingDeleted = nextSkillNames.some((skillName) => {
          return elementIdsToDelete.some((deletedId) => {
            const deletedElement = state.elements.find(
              (el) => el.id === deletedId
            );
            return (
              deletedElement &&
              deletedElement.type === "technology" &&
              deletedElement.technology &&
              deletedElement.technology.name.toLowerCase() ===
                skillName.toLowerCase()
            );
          });
        });

        return hasChildrenBeingDeleted;
      }
    );

    // Create actions for both deletion and completion reset
    const actions = [];

    // Add deletion action
    actions.push({
      type: "CASCADE_DELETE_ELEMENTS",
      payload: { elementIds: elementIdsToDelete },
    });

    // Add completion reset actions for elements that had their children deleted
    elementsToReset.forEach((element) => {
      actions.push({ type: "TOGGLE_COMPLETION", payload: element.id });
    });

    // Dispatch all actions
    actions.forEach((action) => dispatch(action));

    // Update roadmaps state after cascade deletion
    const newElements = state.elements.filter(
      (el) => !elementIdsToDelete.includes(el.id)
    );
    syncCurrentRoadmapWithElements(
      newElements,
      state.selectedGoal,
      state.roadmaps,
      dispatch
    );

    // Save to backend after cascade deletion
    saveSkillsToBackend(newElements);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const setSelectedGoal = (goalObj) => {
    dispatch({ type: "SET_SELECTED_GOAL", payload: goalObj });

    // Also save to localStorage for immediate access
    if (typeof window !== "undefined" && goalObj) {
      localStorage.setItem("selectedGoal", JSON.stringify(goalObj));
    }
  };

  const setFoldedSkills = (foldedSkills) => {
    dispatch({ type: "SET_FOLDED_SKILLS", payload: Array.from(foldedSkills) });

    // Also save to localStorage for immediate access
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "foldedSkills",
        JSON.stringify(Array.from(foldedSkills))
      );
    }
  };

  const toggleFoldedSkill = (skillId) => {
    dispatch({ type: "TOGGLE_FOLDED_SKILL", payload: skillId });

    // Also save to localStorage for immediate access
    if (typeof window !== "undefined") {
      const currentFoldedSkills = new Set(
        JSON.parse(localStorage.getItem("foldedSkills") || "[]")
      );
      if (currentFoldedSkills.has(skillId)) {
        currentFoldedSkills.delete(skillId);
      } else {
        currentFoldedSkills.add(skillId);
      }
      localStorage.setItem(
        "foldedSkills",
        JSON.stringify(Array.from(currentFoldedSkills))
      );
    }
  };

  // Helper function to detect common completed skills between roadmaps
  const detectCommonCompletedSkills = (prevElements, newGoal) => {
    if (!prevElements || prevElements.length === 0) return null;

    // Get all completed skills from previous roadmap
    const completedSkills = prevElements
      .filter((el) => el.type === "technology" && el.completed && !el.isTool)
      .map((el) => ({
        name: el.technology.name,
        level: el.skillData?.level || 1,
        goalData: el.goalData,
        position: el.position,
        size: el.size,
      }));

    if (completedSkills.length === 0) return null;

    // Check which completed skills exist in the new goal
    const newGoalSkills = newGoal.skills || {};
    const commonSkills = completedSkills.filter((skill) => {
      return Object.keys(newGoalSkills).some(
        (skillName) => skillName.toLowerCase() === skill.name.toLowerCase()
      );
    });

    if (commonSkills.length === 0) return null;

    // IMPORTANT: Check if the new goal already has these skills in its roadmap
    // If the new goal's roadmap already contains these skills, don't prompt to add them
    const newGoalRoadmapElements = state.roadmaps[newGoal.id] || [];
    const existingSkillNames = new Set(
      newGoalRoadmapElements
        .filter((el) => el.type === "technology" && !el.isTool)
        .map((el) => el.technology.name.toLowerCase())
    );

    // Filter out skills that already exist in the new goal's roadmap
    const skillsNotInNewRoadmap = commonSkills.filter(
      (skill) => !existingSkillNames.has(skill.name.toLowerCase())
    );

    if (skillsNotInNewRoadmap.length === 0) return null;

    // Find the highest level among common skills
    const highestLevel = Math.max(
      ...skillsNotInNewRoadmap.map((skill) => skill.level)
    );
    const highestLevelSkills = skillsNotInNewRoadmap.filter(
      (skill) => skill.level === highestLevel
    );

    return {
      skills: skillsNotInNewRoadmap,
      highestLevelSkills,
      highestLevel,
    };
  };

  // Helper function to detect cross-roadmap completed skills
  const detectCrossRoadmapCompletedSkills = useCallback(
    (currentElements, currentGoal) => {
      if (!currentGoal) return null;

      // Get all completed skills from other roadmaps
      const otherRoadmapCompletedSkills = [];

      Object.entries(state.roadmaps).forEach(([goalId, elements]) => {
        if (goalId !== currentGoal.id) {
          const completedSkills = elements
            .filter(
              (el) => el.type === "technology" && el.completed && !el.isTool
            )
            .map((el) => ({
              name: el.technology.name,
              level: el.skillData?.level || 1,
              goalData: el.goalData,
              sourceGoal: goalId,
              position: el.position,
              size: el.size,
            }));

          otherRoadmapCompletedSkills.push(...completedSkills);
        }
      });

      if (otherRoadmapCompletedSkills.length === 0) return null;

      // Check which completed skills from other roadmaps exist in the current goal
      const currentGoalSkills = currentGoal.skills || {};
      const skillsInCurrentGoal = otherRoadmapCompletedSkills.filter(
        (skill) => {
          return Object.keys(currentGoalSkills).some(
            (skillName) => skillName.toLowerCase() === skill.name.toLowerCase()
          );
        }
      );

      // Filter out skills that are already in the current roadmap
      const existingSkillNames = new Set(
        (currentElements || [])
          .filter((el) => el.type === "technology" && !el.isTool)
          .map((el) => el.technology.name.toLowerCase())
      );

      const skillsNotInCurrentRoadmap = skillsInCurrentGoal.filter(
        (skill) => !existingSkillNames.has(skill.name.toLowerCase())
      );

      if (skillsNotInCurrentRoadmap.length === 0) return null;

      return {
        skills: skillsNotInCurrentRoadmap,
        sourceGoal: skillsNotInCurrentRoadmap[0].sourceGoal,
      };
    },
    [state.roadmaps]
  );

  // Switch between goals, saving/loading roadmaps
  // skillName parameter indicates if this switch was triggered by adding a skill from a different goal
  // If skillName is provided, we check for common completed skills to prompt user
  // If skillName is not provided (manual goal switch), we don't check for common completed skills
  const switchGoal = (goalObj, skillName, isFromCvSkill = false) => {
    // Save current elements under current goal
    const prevGoal = state.selectedGoal;
    const prevElements = state.elements;

    // Prevent switching to the same goal
    if (!goalObj || (prevGoal && goalObj.id === prevGoal.id)) return;

    // Only detect common completed skills if this is a goal switch triggered by adding a skill from different goal
    // (i.e., when skillName is provided)
    let commonSkills = null;
    if (skillName) {
      commonSkills = detectCommonCompletedSkills(prevElements, goalObj);
    }

    dispatch({
      type: "SWITCH_GOAL",
      payload: {
        newGoal: goalObj,
        prevGoal: prevGoal,
        prevElements: prevElements,
      },
    });

    // Clear any existing warnings when switching goals
    dispatch({ type: "SET_COMMON_COMPLETED_SKILLS", payload: null });

    // Set common completed skills if any found (only when switching due to skill from different goal)
    if (commonSkills) {
      dispatch({ type: "SET_COMMON_COMPLETED_SKILLS", payload: commonSkills });
    } else {
      // Clear any existing common completed skills if none detected
      dispatch({ type: "SET_COMMON_COMPLETED_SKILLS", payload: null });
    }

    // NOTE: We don't check for cross-roadmap completed skills when switching goals
    // to avoid showing both warnings. Cross-roadmap detection will happen via the useEffect
    // that watches for changes in elements and selectedGoal.

    // After switching, add the triggering skill if provided
    if (skillName) {
      setTimeout(() => {
        // ✅ FIX: Use the properly filtered elements from the target roadmap, not the potentially contaminated state
        const targetRoadmapElements = state.roadmaps[goalObj.id] || [];
        const currentElements = targetRoadmapElements;

        // ✅ NEW: Context-aware logic for tool vs skill handling
        // Helper function to find parent skill for a tool
        const findParentSkillForTool = (toolName) => {
          if (!goalObj?.skills) return null;

          for (const [skillName, skillData] of Object.entries(goalObj.skills)) {
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

        // Check if the clicked item is a tool or a skill
        const toolMapping = findParentSkillForTool(skillName);
        const isTool = !!toolMapping;
        const parentSkillName = isTool
          ? toolMapping.parentSkillName
          : skillName;
        const parentSkillData = isTool
          ? toolMapping.parentSkillData
          : goalObj.skills[skillName];

        // Check if parent skill already exists on canvas
        const existingParentSkill = currentElements.find(
          (el) =>
            el.type === "technology" &&
            !el.isTool &&
            el.technology.name === parentSkillName
        );

        if (existingParentSkill) {
          if (isTool) {
            // 🧠 If the Parent Skill is Already on the Canvas (Tool Click)

            // Check if tool already exists
            const existingTool = currentElements.find(
              (el) =>
                el.type === "technology" &&
                el.isTool &&
                el.technology.name === skillName &&
                el.parentSkillId === existingParentSkill.id
            );

            if (existingTool) {
              // Tool already exists, just mark it as completed

              dispatch({ type: "TOGGLE_COMPLETION", payload: existingTool.id });
            } else {
              // Add new tool to existing parent skill

              // Check if parent skill has tools that need to be rendered
              if (
                parentSkillData?.tools &&
                Array.isArray(parentSkillData.tools) &&
                parentSkillData.tools.length > 0
              ) {
                // Check if any tools are already rendered
                const existingTools = currentElements.filter(
                  (el) =>
                    el.type === "technology" &&
                    el.isTool &&
                    el.parentSkillId === existingParentSkill.id
                );

                if (existingTools.length === 0) {
                  // No tools rendered yet, render all tools for this parent
                  const toolWidth = 100;
                  const toolGap = 50;
                  const toolCount = parentSkillData.tools.length;
                  const totalWidth =
                    toolCount * toolWidth + (toolCount - 1) * toolGap;
                  const startX =
                    existingParentSkill.position.x +
                    (existingParentSkill.size.width - totalWidth) / 2;
                  const toolY =
                    existingParentSkill.position.y +
                    existingParentSkill.size.height +
                    60;

                  const toolElements = [];
                  const toolConnectors = [];

                  parentSkillData.tools.forEach((toolName, toolIndex) => {
                    const toolId = `${toolName}-${Date.now()}-${toolIndex}`;
                    const isClickedTool = toolName === skillName;

                    const toolElement = {
                      id: toolId,
                      type: "technology",
                      technology: { name: toolName },
                      position: {
                        x: startX + toolIndex * (toolWidth + toolGap),
                        y: toolY,
                      },
                      size: { width: toolWidth, height: 35 },
                      completed: isFromCvSkill && isClickedTool, // Mark clicked tool as completed only if it's a CV skill click
                      isTool: true,
                      parentSkillId: existingParentSkill.id,
                    };
                    toolElements.push(toolElement);
                    toolConnectors.push({
                      id: generateUniqueConnectorId(
                        existingParentSkill.id,
                        toolId,
                        currentElements
                      ),
                      type: "connector",
                      sourceId: existingParentSkill.id,
                      targetId: toolId,
                    });
                  });

                  addMultipleElements([...toolElements, ...toolConnectors]);
                } else {
                  // Some tools already exist, add only the missing tool
                  const missingTools = parentSkillData.tools.filter(
                    (toolName) =>
                      !existingTools.some(
                        (et) => et.technology.name === toolName
                      )
                  );

                  if (missingTools.includes(skillName)) {
                    // Add the missing tool
                    const toolWidth = 100;
                    const toolGap = 50;
                    const toolIndex = parentSkillData.tools.indexOf(skillName);
                    const totalWidth =
                      parentSkillData.tools.length * toolWidth +
                      (parentSkillData.tools.length - 1) * toolGap;
                    const startX =
                      existingParentSkill.position.x +
                      (existingParentSkill.size.width - totalWidth) / 2;
                    const toolY =
                      existingParentSkill.position.y +
                      existingParentSkill.size.height +
                      60;

                    const toolId = `${skillName}-${Date.now()}-${toolIndex}`;
                    const toolElement = {
                      id: toolId,
                      type: "technology",
                      technology: { name: skillName },
                      position: {
                        x: startX + toolIndex * (toolWidth + toolGap),
                        y: toolY,
                      },
                      size: { width: toolWidth, height: 35 },
                      completed: isFromCvSkill, // Mark clicked tool as completed only if it's a CV skill click
                      isTool: true,
                      parentSkillId: existingParentSkill.id,
                    };

                    const connector = {
                      id: generateUniqueConnectorId(
                        existingParentSkill.id,
                        toolId,
                        currentElements
                      ),
                      type: "connector",
                      sourceId: existingParentSkill.id,
                      targetId: toolId,
                    };

                    addMultipleElements([toolElement, connector]);
                  }
                }
              }

              // ✅ RULE: Do NOT mark parent as completed, Do NOT show next step yet
              // (This is already handled by the current logic - we only mark the tool as completed)
            }
          } else {
            // Handle direct skill click when parent skill exists

            // If skill exists and is completed, do nothing
            if (existingParentSkill.completed) {
              return;
            }

            // If skill exists and is not completed, mark as completed and reveal next step (only for CV skills)
            if (!existingParentSkill.completed && isFromCvSkill) {
              dispatch({
                type: "TOGGLE_COMPLETION",
                payload: existingParentSkill.id,
              });

              // Reveal next step (child skill) - only for CV skills
              if (isFromCvSkill) {
                const nextSkillLevel = parentSkillData?.level + 1;
                const nextSkillNames = Object.keys(goalObj.skills).filter(
                  (skillName) =>
                    goalObj.skills[skillName].level === nextSkillLevel
                );

                if (nextSkillNames.length > 0) {
                  const nextSkillName = nextSkillNames[0];
                  const existingNextSkill = currentElements.find(
                    (el) =>
                      el.type === "technology" &&
                      !el.isTool &&
                      el.technology.name === nextSkillName
                  );

                  if (!existingNextSkill) {
                    // Create next skill
                    const nextId = `${nextSkillName}-${Date.now()}-next`;
                    const nextElement = {
                      id: nextId,
                      type: "technology",
                      technology: { name: nextSkillName },
                      position: {
                        x: existingParentSkill.position.x + 350,
                        y: existingParentSkill.position.y,
                      },
                      isSkill: true,
                      completed: false,
                      goalData: goalObj,
                      skillData: goalObj.skills[nextSkillName],
                      size: { width: 150, height: 40 },
                    };

                    // Add next skill
                    addElement(nextElement);

                    // Create connector from parent to next skill
                    const parentToNextConnector = {
                      id: generateUniqueConnectorId(
                        existingParentSkill.id,
                        nextId,
                        currentElements
                      ),
                      type: "connector",
                      sourceId: existingParentSkill.id,
                      targetId: nextId,
                    };
                    addElement(parentToNextConnector);

                    // Add tools for next skill if it has any
                    const nextSkillData = goalObj.skills[nextSkillName];
                    if (
                      nextSkillData?.tools &&
                      Array.isArray(nextSkillData.tools) &&
                      nextSkillData.tools.length > 0
                    ) {
                      const toolWidth = 100;
                      const toolGap = 50;
                      const toolCount = nextSkillData.tools.length;
                      const totalWidth =
                        toolCount * toolWidth + (toolCount - 1) * toolGap;
                      const startX =
                        nextElement.position.x +
                        (nextElement.size.width - totalWidth) / 2;
                      const toolY =
                        nextElement.position.y + nextElement.size.height + 60;

                      const toolElements = [];
                      const toolConnectors = [];

                      nextSkillData.tools.forEach((toolName, toolIndex) => {
                        const toolId = `${toolName}-${Date.now()}-${toolIndex}`;
                        const toolElement = {
                          id: toolId,
                          type: "technology",
                          technology: { name: toolName },
                          position: {
                            x: startX + toolIndex * (toolWidth + toolGap),
                            y: toolY,
                          },
                          size: { width: toolWidth, height: 35 },
                          completed: false,
                          isTool: true,
                          parentSkillId: nextId,
                        };
                        toolElements.push(toolElement);
                        toolConnectors.push({
                          id: generateUniqueConnectorId(
                            nextId,
                            toolId,
                            currentElements
                          ),
                          type: "connector",
                          sourceId: nextId,
                          targetId: toolId,
                        });
                      });

                      addMultipleElements([...toolElements, ...toolConnectors]);
                    }
                  }
                }
              }
            }
          }
        } else {
          // ✅ 3. If Skill Not Found on Canvas

          // C1 = parent skill (mark as completed only if it's a direct skill click)
          const c1SkillName = parentSkillName;
          const c1SkillData = parentSkillData;
          const c1SkillLevel = c1SkillData?.level || 0;

          // 🧠 FIXED LOGIC: Only get C2 if it's NOT a tool click AND it's a CV skill
          let c2SkillName = null;
          let c2SkillData = null;
          if (!isTool && isFromCvSkill) {
            // Only get next skill for C1 if it's a direct skill click from CV skills
            const nextSkillLevel = c1SkillLevel + 1;
            const nextSkillNames = Object.keys(goalObj.skills).filter(
              (skillName) => goalObj.skills[skillName].level === nextSkillLevel
            );

            if (nextSkillNames.length > 0) {
              c2SkillName = nextSkillNames[0];
              c2SkillData = goalObj.skills[c2SkillName];
            }
          }

          // S1, S2, S3... = existing skills on canvas, ordered by level (ascending)
          // 🛠️ FIX: Preserve existing skills on target roadmap when switching due to CV skill mismatch

          // ✅ FIX: Use the properly filtered currentElements (which are already validated against the target goal)
          const hasExistingTargetRoadmap = currentElements.length > 0;

          let existingSkills;
          if (hasExistingTargetRoadmap) {
            // ✅ FIX: currentElements are already filtered to only contain valid skills for this goal
            existingSkills = currentElements
              .filter((el) => {
                const isTechnology = el.type === "technology";
                const isNotTool = !el.isTool;

                // ✅ All skills in currentElements are already validated to belong to this goal
                return isTechnology && isNotTool;
              })
              .map((el) => {
                const level = goalObj.skills[el.technology.name]?.level || 0;

                return {
                  element: el,
                  level: level,
                };
              })
              .sort((a, b) => a.level - b.level);
          } else {
            // Start with clean slate only if target roadmap is empty
            existingSkills = [];
          }

          // Check if C2 already exists on canvas (reuse existing C2)
          // 🛠️ FIX: Check for existing C2 in preserved skills from target roadmap
          const existingC2Element = c2SkillName
            ? existingSkills.find(
                (s) => s.element.technology.name === c2SkillName
              )?.element || null
            : null;

          // ✅ VALIDATION: Ensure C1 skill belongs to the target goal
          if (!goalObj.skills[c1SkillName]) {
            console.error(
              `CRITICAL ERROR: Skill "${c1SkillName}" does not exist in ${goalObj.goal} goal!`
            );
            return;
          }

          // Create C1 element
          const c1Id = `${c1SkillName}-${Date.now()}-switch`;
          const c1Element = {
            id: c1Id,
            type: "technology",
            technology: { name: c1SkillName },
            position: { x: 100, y: 100 }, // Will be positioned properly later
            isSkill: true,
            completed: isFromCvSkill && !isTool, // Mark as completed only if it's a CV skill click (not a tool click)
            goalData: goalObj,
            skillData: c1SkillData,
            size: { width: 150, height: 40 },
          };

          // Create or reuse C2 element (only if it's NOT a tool click AND it's a CV skill)
          let c2Element = null;
          let c2Id = null;
          if (c2SkillName && !isTool && isFromCvSkill) {
            // ✅ VALIDATION: Ensure C2 skill belongs to the target goal
            if (!goalObj.skills[c2SkillName]) {
              console.error(
                `CRITICAL ERROR: C2 Skill "${c2SkillName}" does not exist in ${goalObj.goal} goal!`
              );
              return;
            }

            if (existingC2Element) {
              // Reuse existing C2

              c2Element = existingC2Element;
              c2Id = existingC2Element.id;
            } else {
              // Create new C2

              c2Id = `${c2SkillName}-${Date.now()}-switch-next`;
              c2Element = {
                id: c2Id,
                type: "technology",
                technology: { name: c2SkillName },
                position: { x: 100, y: 100 }, // Will be positioned properly later
                isSkill: true,
                completed: false,
                goalData: goalObj,
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

          // Only add C2 to positioning if it's a new element and NOT a tool click AND it's a CV skill
          if (c2Element && !existingC2Element && !isTool && isFromCvSkill) {
            skillsToPosition.push({
              element: c2Element,
              level: c2SkillData.level,
            });
          }

          // Sort by level to maintain linear path
          const allSkillsWithLevels = skillsToPosition.sort(
            (a, b) => a.level - b.level
          );

          // 🛠️ FIXED: Position only new skills without affecting existing ones
          const newSkillsToPosition = [];
          if (
            !existingSkills.find(
              (s) => s.element.technology.name === c1SkillName
            )
          ) {
            newSkillsToPosition.push({
              element: c1Element,
              level: c1SkillLevel,
            });
          }
          if (c2Element && !existingC2Element && !isTool && isFromCvSkill) {
            newSkillsToPosition.push({
              element: c2Element,
              level: c2SkillData.level,
            });
          }

          if (newSkillsToPosition.length > 0) {
            // Position new skills relative to existing skills
            const spacing = 350;

            if (hasExistingTargetRoadmap) {
              // Find the rightmost existing skill to position new skills after it
              let rightmostX = 100;
              existingSkills.forEach((skillWithLevel) => {
                const elementRight =
                  skillWithLevel.element.position.x +
                  (skillWithLevel.element.size?.width || 150);
                if (elementRight > rightmostX) {
                  rightmostX = elementRight;
                }
              });

              // Position new skills starting from the right of existing skills
              let currentX = rightmostX + spacing;
              newSkillsToPosition.forEach((skillWithLevel) => {
                skillWithLevel.element.position = {
                  x: currentX,
                  y: 100,
                };
                currentX += spacing;
              });
            } else {
              // Position new skills in level order for clean slate
              newSkillsToPosition.sort((a, b) => a.level - b.level);
              newSkillsToPosition.forEach((skillWithLevel, index) => {
                skillWithLevel.element.position = {
                  x: 100 + index * spacing,
                  y: 100,
                };
              });
            }
          }

          // 🛠️ FIXED: Create connectors for single linear path only
          const newConnectors = [];

          // Get all skills in level order (existing + new skills)
          const allSkillsInLevelOrder = allSkillsWithLevels.sort(
            (a, b) => a.level - b.level
          );

          // ✅ FIX: Build the final elements array using properly filtered currentElements
          // Start with preserved existing skills from target roadmap (already filtered)
          const finalElements = hasExistingTargetRoadmap
            ? currentElements.filter((element) => element.type !== "connector")
            : [];

          // Preserve existing connectors if there's an existing target roadmap (already filtered)
          const existingConnectors = hasExistingTargetRoadmap
            ? currentElements.filter((element) => element.type === "connector")
            : [];

          // ✅ FIX: Preserve tool connectors specifically
          const toolConnectors = existingConnectors.filter((conn) => {
            const sourceEl = currentElements.find(
              (el) => el.id === conn.sourceId
            );
            const targetEl = currentElements.find(
              (el) => el.id === conn.targetId
            );
            return (
              sourceEl &&
              targetEl &&
              sourceEl.type === "technology" &&
              !sourceEl.isTool &&
              targetEl.type === "technology" &&
              targetEl.isTool
            );
          });

          // Create new connectors for the complete linear path in level order
          for (let i = 0; i < allSkillsInLevelOrder.length - 1; i++) {
            const currentSkill = allSkillsInLevelOrder[i];
            const nextSkill = allSkillsInLevelOrder[i + 1];

            // Check if this connector already exists
            const connectorExists = existingConnectors.some(
              (conn) =>
                conn.sourceId === currentSkill.element.id &&
                conn.targetId === nextSkill.element.id
            );

            if (!connectorExists) {
              const connector = {
                id: generateUniqueConnectorId(
                  currentSkill.element.id,
                  nextSkill.element.id,
                  finalElements
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
            } else {
              // Connector already exists
            }
          }

          // Add new skills and connectors to final elements array
          finalElements.push(c1Element);
          if (c2Element && !existingC2Element && !isTool && isFromCvSkill) {
            finalElements.push(c2Element);
          }

          // Add existing connectors and new connectors
          if (hasExistingTargetRoadmap) {
            // ✅ FIX: Preserve tool connectors and add other existing connectors
            finalElements.push(...toolConnectors);

            // Add other existing connectors (non-tool connectors)
            const otherConnectors = existingConnectors.filter(
              (conn) =>
                !toolConnectors.some(
                  (toolConn) =>
                    toolConn.sourceId === conn.sourceId &&
                    toolConn.targetId === conn.targetId
                )
            );
            finalElements.push(...otherConnectors);
          }
          finalElements.push(...newConnectors);

          // Add tools for C1 if it has any
          if (
            c1SkillData?.tools &&
            Array.isArray(c1SkillData.tools) &&
            c1SkillData.tools.length > 0
          ) {
            const toolWidth = 100;
            const toolGap = 50;
            const toolCount = c1SkillData.tools.length;
            const totalWidth =
              toolCount * toolWidth + (toolCount - 1) * toolGap;
            const startX =
              c1Element.position.x + (c1Element.size.width - totalWidth) / 2;
            const toolY = c1Element.position.y + c1Element.size.height + 60;

            const toolElements = [];
            const toolConnectors = [];

            c1SkillData.tools.forEach((toolName, toolIndex) => {
              // ✅ VALIDATION: Ensure tool belongs to the target goal
              if (!c1SkillData.tools.includes(toolName)) {
                console.error(
                  `CRITICAL ERROR: Tool "${toolName}" does not exist in ${c1SkillName} for ${goalObj.goal} goal!`
                );
                return;
              }

              const toolId = `${toolName}-${Date.now()}-${toolIndex}`;
              const isClickedTool = toolName === skillName;

              const toolElement = {
                id: toolId,
                type: "technology",
                technology: { name: toolName },
                position: {
                  x: startX + toolIndex * (toolWidth + toolGap),
                  y: toolY,
                },
                size: { width: toolWidth, height: 35 },
                completed: isFromCvSkill && isClickedTool, // Only mark clicked tool as completed if this was a CV skill tool click
                isTool: true,
                parentSkillId: c1Element.id,
              };
              toolElements.push(toolElement);
              toolConnectors.push({
                id: generateUniqueConnectorId(
                  c1Element.id,
                  toolId,
                  finalElements
                ),
                type: "connector",
                sourceId: c1Element.id,
                targetId: toolId,
              });
            });

            // Add tools and tool connectors to final elements array
            finalElements.push(...toolElements, ...toolConnectors);
          }

          // Add tools for C2 if it has any and is new (only if NOT a tool click AND it's a CV skill)
          if (
            c2Element &&
            !existingC2Element &&
            !isTool &&
            isFromCvSkill &&
            c2SkillData?.tools &&
            Array.isArray(c2SkillData.tools) &&
            c2SkillData.tools.length > 0
          ) {
            const toolWidth = 100;
            const toolGap = 50;
            const toolCount = c2SkillData.tools.length;
            const totalWidth =
              toolCount * toolWidth + (toolCount - 1) * toolGap;
            const startX =
              c2Element.position.x + (c2Element.size.width - totalWidth) / 2;
            const toolY = c2Element.position.y + c2Element.size.height + 60;

            const toolElements = [];
            const toolConnectors = [];

            c2SkillData.tools.forEach((toolName, toolIndex) => {
              // ✅ VALIDATION: Ensure tool belongs to the target goal
              if (!c2SkillData.tools.includes(toolName)) {
                console.error(
                  `CRITICAL ERROR: Tool "${toolName}" does not exist in ${c2SkillName} for ${goalObj.goal} goal!`
                );
                return;
              }

              const toolId = `${toolName}-${Date.now()}-${toolIndex}`;
              const toolElement = {
                id: toolId,
                type: "technology",
                technology: { name: toolName },
                position: {
                  x: startX + toolIndex * (toolWidth + toolGap),
                  y: toolY,
                },
                size: { width: toolWidth, height: 35 },
                completed: false, // No clicked tool name for C2
                isTool: true,
                parentSkillId: c2Element.id,
              };
              toolElements.push(toolElement);
              toolConnectors.push({
                id: generateUniqueConnectorId(
                  c2Element.id,
                  toolId,
                  finalElements
                ),
                type: "connector",
                sourceId: c2Element.id,
                targetId: toolId,
              });
            });

            // Add tools and tool connectors to final elements array
            finalElements.push(...toolElements, ...toolConnectors);
          }

          // ✅ FINAL VALIDATION: Ensure all skills in final elements belong to the target goal
          const goalSkillNames = new Set(Object.keys(goalObj.skills || {}));
          const invalidSkills = finalElements.filter((el) => {
            if (el.type === "technology" && !el.isTool) {
              return !goalSkillNames.has(el.technology.name);
            }
            return false;
          });

          if (invalidSkills.length > 0) {
            console.error(
              `CRITICAL ERROR: Found invalid skills in final elements for ${goalObj.goal}:`,
              invalidSkills.map((el) => el.technology.name)
            );
            return;
          }

          // 🛠️ FIXED: Single atomic dispatch to update all elements after all additions

          dispatch({ type: "SET_ELEMENTS", payload: finalElements });
        }
      }, 0);
    }
  };

  // Accepts an array of selected skills (from the prompt)
  const addCommonCompletedSkills = (selectedSkills, triggeringSkillId) => {
    if (
      !state.commonCompletedSkills ||
      !selectedSkills ||
      selectedSkills.length === 0
    )
      return;

    // Helper: Get level for a skill in the current goal
    const getLevel = (skillName) =>
      state.selectedGoal?.skills?.[skillName]?.level;

    // Gather all existing skills (not tools) on the canvas
    const existingSkills = state.elements.filter(
      (el) => el.type === "technology" && !el.isTool
    );
    // Add each selected skill (as completed) if not already present
    const elementsToAdd = [];
    const newCompletedSkillElements = [];
    const pendingConnectorIds = [];
    selectedSkills.forEach((carriedSkill, idx) => {
      const carriedSkillName = carriedSkill.name;
      const existingSkill = existingSkills.find(
        (el) => el.technology.name === carriedSkillName
      );
      if (existingSkill) {
        if (!existingSkill.completed) {
          // Mark as completed
          dispatch({ type: "TOGGLE_COMPLETION", payload: existingSkill.id });
          // Add next step for this skill
          setTimeout(() => {
            addNextStepsForCompletedSkill({
              ...existingSkill,
              completed: true,
            });
          }, 0);
        }
        // If already completed, do nothing (or optionally show next step again)
        return;
      }
      const cId = `${carriedSkillName}-${Date.now()}-carried-${idx}`;
      const cElement = {
        id: cId,
        type: "technology",
        technology: { name: carriedSkillName },
        position: carriedSkill.position || {
          x: 200 + idx * 40,
          y: 100 + idx * 40,
        },
        isSkill: true,
        completed: true,
        goalData: state.selectedGoal,
        skillData: state.selectedGoal?.skills?.[carriedSkillName],
        size: carriedSkill.size || { width: 150, height: 40 },
      };
      // Add tools for this skill if any
      const skillData = state.selectedGoal?.skills?.[carriedSkillName];
      let toolElements = [];
      let toolConnectors = [];
      if (
        skillData &&
        skillData.tools &&
        Array.isArray(skillData.tools) &&
        skillData.tools.length > 0
      ) {
        const toolWidth = 100;
        const toolGap = 50; // Increased from 30 to 50 for better spacing between tools
        const toolCount = skillData.tools.length;
        const totalWidth = toolCount * toolWidth + (toolCount - 1) * toolGap;
        const startX =
          cElement.position.x + (cElement.size.width - totalWidth) / 2;
        const toolY = cElement.position.y + cElement.size.height + 60; // Increased from 40 to 60 for better separation from parent

        // --- Find the original roadmap for this carried skill ---
        let originalRoadmap = null;
        if (
          carriedSkill.goalData &&
          carriedSkill.goalData.id &&
          state.roadmaps[carriedSkill.goalData.id]
        ) {
          originalRoadmap = state.roadmaps[carriedSkill.goalData.id];
        }
        skillData.tools.forEach((toolName, toolIndex) => {
          const toolId = `${toolName}-${Date.now()}-carried-${idx}-${toolIndex}`;
          // Default: not completed
          let toolCompleted = false;
          // If originalRoadmap exists, check if this tool was completed in the original roadmap
          if (originalRoadmap) {
            const originalTool = originalRoadmap.find(
              (el) =>
                el.type === "technology" &&
                el.technology.name === toolName &&
                el.isTool &&
                el.parentSkillId &&
                el.parentSkillId !== undefined
            );
            if (originalTool && originalTool.completed) {
              toolCompleted = true;
            }
          }
          const toolElement = {
            id: toolId,
            type: "technology",
            technology: { name: toolName },
            position: {
              x: startX + toolIndex * (toolWidth + toolGap),
              y: toolY,
            },
            size: { width: toolWidth, height: 35 },
            completed: toolCompleted,
            isTool: true,
            parentSkillId: cId,
          };
          toolElements.push(toolElement);
          const alreadyExists =
            state.elements.some(
              (el) =>
                el.type === "connector" &&
                el.sourceId === cId &&
                el.targetId === toolId
            ) ||
            toolConnectors.some(
              (el) => el.sourceId === cId && el.targetId === toolId
            );
          if (!alreadyExists) {
            const connectorId = generateUniqueConnectorId(
              cId,
              toolId,
              state.elements,
              pendingConnectorIds
            );
            pendingConnectorIds.push(connectorId);
            toolConnectors.push({
              id: connectorId,
              type: "connector",
              sourceId: cId,
              targetId: toolId,
            });
          }
        });
      }
      elementsToAdd.push(cElement, ...toolElements, ...toolConnectors);
      newCompletedSkillElements.push({ ...cElement });
      // --- Add next step for this skill immediately ---
      setTimeout(() => {
        addNextStepsForCompletedSkill({ ...cElement });
      }, 0);
    });
    if (elementsToAdd.length > 0) {
      addMultipleElements(elementsToAdd);
      setShouldRewireConnectors(true); // Ensure connectors are rewired after adding skills
    }

    // --- NEW: After adding, ensure only nearest higher-level skill connections (no forks/branches) ---
    setTimeout(() => {
      // Get all skills (not tools) on the canvas after addition
      const allSkills = [
        ...state.elements.filter(
          (el) => el.type === "technology" && !el.isTool
        ),
        ...elementsToAdd.filter((el) => el.type === "technology" && !el.isTool),
      ];
      // Remove duplicates by name (keep latest by id)
      const skillMap = new Map();
      allSkills.forEach((el) => skillMap.set(el.technology.name, el));
      const uniqueSkills = Array.from(skillMap.values());
      // Sort by level (regardless of gaps)
      uniqueSkills.sort(
        (a, b) =>
          (getLevel(a.technology.name) || 0) -
          (getLevel(b.technology.name) || 0)
      );

      // ✅ FIX: Preserve tool connectors before removing skill connectors
      const toolConnectors = state.elements.filter(
        (el) =>
          el.type === "connector" &&
          state.elements.some(
            (source) =>
              source.id === el.sourceId &&
              source.type === "technology" &&
              !source.isTool
          ) &&
          state.elements.some(
            (target) =>
              target.id === el.targetId &&
              target.type === "technology" &&
              target.isTool
          )
      );

      // Remove ALL connectors between these skills (to avoid forks/branches/skips)
      // ✅ FIX: Only remove skill-to-skill connectors, preserve tool connectors
      const connectorsToRemove = state.elements.filter(
        (el) =>
          el.type === "connector" &&
          uniqueSkills.some((s) => s.id === el.sourceId) &&
          uniqueSkills.some((s) => s.id === el.targetId) &&
          // ✅ FIX: Don't remove tool connectors
          !toolConnectors.some(
            (toolConn) =>
              toolConn.sourceId === el.sourceId &&
              toolConn.targetId === el.targetId
          )
      );
      connectorsToRemove.forEach((conn) => removeElement(conn.id));

      // For each skill, connect only to the nearest higher-level skill (if any)
      for (let i = 0; i < uniqueSkills.length - 1; ++i) {
        const fromSkill = uniqueSkills[i];
        let minLevelDiff = Infinity;
        let toSkill = null;
        const fromLevel = getLevel(fromSkill.technology.name);
        for (let j = i + 1; j < uniqueSkills.length; ++j) {
          const candidate = uniqueSkills[j];
          const candidateLevel = getLevel(candidate.technology.name);
          if (
            candidateLevel > fromLevel &&
            candidateLevel - fromLevel < minLevelDiff
          ) {
            minLevelDiff = candidateLevel - fromLevel;
            toSkill = candidate;
          }
        }
        if (toSkill) {
          let connectionType = undefined;
          if (minLevelDiff !== 1) connectionType = "warning";
          addElement({
            id: generateUniqueConnectorId(
              fromSkill.id,
              toSkill.id,
              state.elements
            ),
            type: "connector",
            sourceId: fromSkill.id,
            targetId: toSkill.id,
            ...(connectionType ? { connectionType } : {}),
          });
        }
      }

      // ✅ FIX: Re-add any tool connectors that might have been accidentally removed
      toolConnectors.forEach((toolConnector) => {
        const connectorStillExists = state.elements.some(
          (el) =>
            el.type === "connector" &&
            el.sourceId === toolConnector.sourceId &&
            el.targetId === toolConnector.targetId
        );

        if (!connectorStillExists) {
          addElement({
            id: generateUniqueConnectorId(
              toolConnector.sourceId,
              toolConnector.targetId,
              state.elements
            ),
            type: "connector",
            sourceId: toolConnector.sourceId,
            targetId: toolConnector.targetId,
          });
        }
      });
    }, 0);

    dispatch({ type: "SET_COMMON_COMPLETED_SKILLS", payload: null });
  };

  useEffect(() => {
    // Remove any connector where the source skill's level >= target skill's level (backward connectors)
    // ✅ FIX: Preserve tool connectors - only remove skill-to-skill backward connectors
    const getNumericLevel = (skillName) => {
      for (const goalObj of dataset) {
        if (goalObj.skills && goalObj.skills[skillName]) {
          return goalObj.skills[skillName].level;
        }
      }
      return undefined;
    };
    state.elements.forEach((el) => {
      if (el.type === "connector") {
        const source = state.elements.find(
          (e) => e.id === el.sourceId && e.type === "technology"
        );
        const target = state.elements.find(
          (e) => e.id === el.targetId && e.type === "technology"
        );

        // ✅ FIX: Skip tool connectors - only process skill-to-skill connectors
        if (
          source &&
          target &&
          source.isTool === false &&
          target.isTool === true
        ) {
          // This is a tool connector, preserve it
          return;
        }

        if (source && target) {
          const sourceLevel = getNumericLevel(source.technology.name);
          const targetLevel = getNumericLevel(target.technology.name);
          if (
            typeof sourceLevel === "number" &&
            typeof targetLevel === "number" &&
            sourceLevel >= targetLevel
          ) {
            removeElement(el.id);
          }
        }
      }
    });
  }, [state.elements]);

  // 🛠️ NEW: Clean up redundant connections that skip intermediate skills
  useEffect(() => {
    if (!state.selectedGoal) return;

    const getNumericLevel = (skillName) => {
      return state.selectedGoal.skills?.[skillName]?.level;
    };

    // Get all skill elements (not tools) sorted by level
    const skillElements = state.elements
      .filter((el) => el.type === "technology" && !el.isTool)
      .map((el) => ({
        element: el,
        level: getNumericLevel(el.technology.name) || 0,
      }))
      .sort((a, b) => a.level - b.level);

    // Find and remove redundant connections that skip intermediate skills
    state.elements.forEach((connector) => {
      if (connector.type !== "connector") return;

      const source = state.elements.find(
        (e) =>
          e.id === connector.sourceId && e.type === "technology" && !e.isTool
      );
      const target = state.elements.find(
        (e) =>
          e.id === connector.targetId && e.type === "technology" && !e.isTool
      );

      // Skip if either source or target is not a skill
      if (!source || !target) return;

      const sourceLevel = getNumericLevel(source.technology.name);
      const targetLevel = getNumericLevel(target.technology.name);

      // Skip if we can't determine levels
      if (typeof sourceLevel !== "number" || typeof targetLevel !== "number")
        return;

      // Skip if this is not a forward connection
      if (sourceLevel >= targetLevel) return;

      // Check if there are any intermediate skills between source and target
      const intermediateSkills = skillElements.filter(
        (skill) => skill.level > sourceLevel && skill.level < targetLevel
      );

      // If there are intermediate skills, this connection is redundant
      if (intermediateSkills.length > 0) {
        removeElement(connector.id);
      }
    });
  }, [state.elements, state.selectedGoal]);

  // Watch for changes in elements and selectedGoal to trigger cross-roadmap detection
  useEffect(() => {
    if (state.selectedGoal && state.elements.length > 0) {
      // Only check for cross-roadmap completed skills if we have elements and no common completed skills warning
      // This prevents showing both warnings when switching goals
      if (!state.commonCompletedSkills) {
        const crossRoadmapSkills = detectCrossRoadmapCompletedSkills(
          state.elements,
          state.selectedGoal
        );
        if (crossRoadmapSkills) {
          dispatch({
            type: "SET_COMMON_COMPLETED_SKILLS",
            payload: crossRoadmapSkills,
          });
        } else {
          // Clear any existing cross-roadmap completed skills if none detected
          dispatch({ type: "SET_COMMON_COMPLETED_SKILLS", payload: null });
        }
      }
    }
  }, [
    state.elements,
    state.selectedGoal,
    detectCrossRoadmapCompletedSkills,
    state.commonCompletedSkills,
  ]);

  // 🛠️ BUG FIX: Sync completion status when switching between roadmaps
  useEffect(() => {
    if (state.selectedGoal && state.elements.length > 0) {
      // Check if any skills in the current roadmap should be marked as completed
      // based on completion status in other roadmaps
      const updatedElements = state.elements.map((el) => {
        if (el.type === "technology" && !el.isTool && !el.completed) {
          const skillName = el.technology.name;

          // Check if this skill is completed in any other roadmap
          const isCompletedInOtherRoadmap = Object.entries(state.roadmaps).some(
            ([goalId, roadmapElements]) => {
              if (goalId === state.selectedGoal.id) return false; // Skip current roadmap

              return roadmapElements.some(
                (roadmapEl) =>
                  roadmapEl.type === "technology" &&
                  !roadmapEl.isTool &&
                  roadmapEl.technology.name === skillName &&
                  roadmapEl.completed
              );
            }
          );

          if (isCompletedInOtherRoadmap) {
            return { ...el, completed: true };
          }
        }
        return el;
      });

      // Check if any elements were updated
      const hasUpdates = updatedElements.some(
        (el, index) => el.completed !== state.elements[index]?.completed
      );

      if (hasUpdates) {
        dispatch({ type: "SET_ELEMENTS", payload: updatedElements });

        // Update the current roadmap in the roadmaps state
        const updatedRoadmaps = {
          ...state.roadmaps,
          [state.selectedGoal.id]: updatedElements,
        };
        dispatch({ type: "UPDATE_ROADMAPS", payload: updatedRoadmaps });

        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("roadmaps", JSON.stringify(updatedRoadmaps));
        }

        // 🛠️ BUG FIX: Automatically unlock next skills for newly completed skills
        updatedElements.forEach((el) => {
          if (el.type === "technology" && !el.isTool && el.completed) {
            // Check if this skill was just completed (wasn't completed before)
            const wasCompletedBefore = state.elements.find(
              (prevEl) => prevEl.id === el.id
            )?.completed;

            if (!wasCompletedBefore) {
              // This skill was just completed, unlock its next steps
              setTimeout(() => {
                addNextStepsForCompletedSkill(el);
              }, 100);
            }
          }
        });
      }
    }
  }, [state.selectedGoal, state.roadmaps]);

  // Helper: Add next steps for a completed skill
  const addNextStepsForCompletedSkill = (completedSkillElement) => {
    if (
      !completedSkillElement ||
      !completedSkillElement.technology?.name ||
      !completedSkillElement.goalData
    )
      return;
    const goalData = completedSkillElement.goalData;
    const skills = goalData.skills;
    const currentSkillName = completedSkillElement.technology.name;
    const currentSkill = skills[currentSkillName];
    if (!currentSkill) return;
    const currentSkillValue = currentSkill.level;
    const nextSkillValue = currentSkillValue + 1;
    const nextSkillNames = Object.keys(skills).filter(
      (skillName) => skills[skillName].level === nextSkillValue
    );
    if (nextSkillNames.length === 0) return;
    const existingNames = new Set(
      state.elements
        .filter((el) => el.type === "technology")
        .map((el) => el.technology.name)
    );
    const newElements = [];
    const connectors = [];
    const pendingConnectorIds = [];
    nextSkillNames.forEach((skillName, skillIndex) => {
      if (existingNames.has(skillName)) {
        // If already exists, just connect if connector does not exist
        const existingEl = state.elements.find(
          (el) => el.technology.name === skillName && el.type === "technology"
        );
        if (existingEl) {
          const connectorExists = state.elements.some(
            (conn) =>
              conn.type === "connector" &&
              conn.sourceId === completedSkillElement.id &&
              conn.targetId === existingEl.id
          );
          if (!connectorExists) {
            const alreadyExists =
              state.elements.some(
                (el) =>
                  el.type === "connector" &&
                  el.sourceId === completedSkillElement.id &&
                  el.targetId === existingEl.id
              ) ||
              connectors.some(
                (el) =>
                  el.sourceId === completedSkillElement.id &&
                  el.targetId === existingEl.id
              );
            if (!alreadyExists) {
              const connectorId = generateUniqueConnectorId(
                completedSkillElement.id,
                existingEl.id,
                state.elements,
                pendingConnectorIds
              );
              pendingConnectorIds.push(connectorId);
              connectors.push({
                id: connectorId,
                type: "connector",
                sourceId: completedSkillElement.id,
                targetId: existingEl.id,
              });
            }
          }
        }
        return;
      }

      const skillData = skills[skillName];
      const skillId = `${skillName}-${Date.now()}-${skillIndex}`;
      const skillElement = {
        id: skillId,
        type: "technology",
        technology: { name: skillName },
        position: {
          x: completedSkillElement.position.x + 220 + skillIndex * 40,
          y: completedSkillElement.position.y + skillIndex * 80,
        },
        isSkill: true,
        completed: false,
        goalData: goalData,
        skillData: skillData,
        size: { width: 150, height: 40 },
      };
      newElements.push(skillElement);
      const connectorId = generateUniqueConnectorId(
        completedSkillElement.id,
        skillId,
        state.elements,
        pendingConnectorIds
      );
      pendingConnectorIds.push(connectorId);
      connectors.push({
        id: connectorId,
        type: "connector",
        sourceId: completedSkillElement.id,
        targetId: skillId,
      });

      // --- NEW: Connect C2 to only the immediate next higher-level skill (like S1), not all higher-level skills ---
      const c2Level = skillData.level;
      // Find all higher-level skills
      const higherSkills = state.elements
        .filter(
          (existingEl) =>
            existingEl.type === "technology" &&
            !existingEl.isTool &&
            existingEl.technology &&
            existingEl.technology.name &&
            skills[existingEl.technology.name] &&
            skills[existingEl.technology.name].level > c2Level
        )
        .sort(
          (a, b) =>
            skills[a.technology.name].level - skills[b.technology.name].level
        );
      if (higherSkills.length > 0) {
        const nextSkill = higherSkills[0];
        // Check if connector already exists
        const connectorExists = state.elements.some(
          (conn) =>
            conn.type === "connector" &&
            conn.sourceId === skillId &&
            conn.targetId === nextSkill.id
        );
        if (!connectorExists) {
          let connectionType = undefined;
          if (skills[nextSkill.technology.name].level - c2Level > 1)
            connectionType = "warning";
          const connId = generateUniqueConnectorId(
            skillId,
            nextSkill.id,
            state.elements,
            pendingConnectorIds
          );
          pendingConnectorIds.push(connId);
          connectors.push({
            id: connId,
            type: "connector",
            sourceId: skillId,
            targetId: nextSkill.id,
            ...(connectionType ? { connectionType } : {}),
          });
        }
      }
      // Add tools if any
      if (
        skillData &&
        skillData.tools &&
        Array.isArray(skillData.tools) &&
        skillData.tools.length > 0
      ) {
        const toolWidth = 100;
        const toolGap = 50; // Increased from 30 to 50 for better spacing between tools
        const toolCount = skillData.tools.length;
        const totalWidth = toolCount * toolWidth + (toolCount - 1) * toolGap;
        const startX =
          skillElement.position.x + (skillElement.size.width - totalWidth) / 2;
        const toolY = skillElement.position.y + skillElement.size.height + 60; // Increased from 40 to 60 for better separation from parent

        skillData.tools.forEach((toolName, toolIndex) => {
          const toolId = `${toolName}-${Date.now()}-${skillIndex}-${toolIndex}`;
          const toolElement = {
            id: toolId,
            type: "technology",
            technology: { name: toolName },
            position: {
              x: startX + toolIndex * (toolWidth + toolGap),
              y: toolY,
            },
            size: { width: toolWidth, height: 35 },
            completed: false,
            isTool: true,
            parentSkillId: skillId,
          };
          newElements.push(toolElement);
          const connId = generateUniqueConnectorId(
            skillId,
            toolId,
            state.elements,
            pendingConnectorIds
          );
          pendingConnectorIds.push(connId);
          connectors.push({
            id: connId,
            type: "connector",
            sourceId: skillId,
            targetId: toolId,
          });
        });
      }
    });
    if (newElements.length > 0 || connectors.length > 0) {
      addMultipleElements([...newElements, ...connectors]);
      setShouldRewireConnectors(true); // Ensure connectors are rewired after adding next steps

      // --- NEW: Remove direct connector from C1 to S1 if C2->S1 was just added ---
      // Use setTimeout to ensure state has been updated before removing connectors
      setTimeout(() => {
        nextSkillNames.forEach((skillName, skillIndex) => {
          const skillData = skills[skillName];
          const skillId = newElements.find(
            (el) => el.technology && el.technology.name === skillName
          )?.id;
          if (!skillId) return;
          const c2Level = skillData.level;

          // Check if we added any C2->S1 connectors for this C2
          const c2ToS1ConnectorsAdded = connectors.filter(
            (conn) => conn.sourceId === skillId && conn.type === "connector"
          );

          // For each C2->S1 connector that was added, remove the corresponding C1->S1 connector
          c2ToS1ConnectorsAdded.forEach((c2ToS1Connector) => {
            const targetEl = state.elements.find(
              (el) => el.id === c2ToS1Connector.targetId
            );
            if (
              targetEl &&
              targetEl.type === "technology" &&
              !targetEl.isTool &&
              targetEl.technology &&
              targetEl.technology.name &&
              skills[targetEl.technology.name] &&
              skills[targetEl.technology.name].level > c2Level
            ) {
              // Check if C1->S1 connector exists and remove it
              const c1ToS1Connector = state.elements.find(
                (el) =>
                  el.type === "connector" &&
                  el.sourceId === completedSkillElement.id &&
                  el.targetId === targetEl.id
              );
              if (c1ToS1Connector) {
                removeElement(c1ToS1Connector.id);
              }
            }
          });
        });
      }, 0);
    }
  };

  // Helper: Add next steps for a completed skill in a specific roadmap
  const addNextStepsForCompletedSkillInRoadmap = (
    completedSkillElement,
    goalData,
    roadmapElements
  ) => {
    if (
      !completedSkillElement ||
      !completedSkillElement.technology?.name ||
      !goalData
    )
      return;
    const skills = goalData.skills;
    const currentSkillName = completedSkillElement.technology.name;
    const currentSkill = skills[currentSkillName];
    if (!currentSkill) return;
    const currentSkillValue = currentSkill.level;
    const nextSkillValue = currentSkillValue + 1;
    const nextSkillNames = Object.keys(skills).filter(
      (skillName) => skills[skillName].level === nextSkillValue
    );
    if (nextSkillNames.length === 0) return;

    const existingNames = new Set(
      roadmapElements
        .filter((el) => el.type === "technology")
        .map((el) => el.technology.name)
    );
    const newElements = [];
    const connectors = [];
    const pendingConnectorIds = [];
    nextSkillNames.forEach((skillName, skillIndex) => {
      if (existingNames.has(skillName)) {
        // If already exists, just connect
        const existingEl = roadmapElements.find(
          (el) =>
            el.type === "technology" &&
            el.technology &&
            el.technology.name === skillName
        );
        if (existingEl) {
          const connectorId = generateUniqueConnectorId(
            completedSkillElement.id,
            existingEl.id,
            state.elements,
            pendingConnectorIds
          );
          pendingConnectorIds.push(connectorId);
          connectors.push({
            id: connectorId,
            type: "connector",
            sourceId: completedSkillElement.id,
            targetId: existingEl.id,
          });
        }
        return;
      }

      const skillData = skills[skillName];
      const skillId = `${skillName}-${Date.now()}-${skillIndex}`;
      const skillElement = {
        id: skillId,
        type: "technology",
        technology: { name: skillName },
        position: {
          x: completedSkillElement.position.x + 220 + skillIndex * 40,
          y: completedSkillElement.position.y + skillIndex * 80,
        },
        isSkill: true,
        completed: false,
        goalData: goalData,
        skillData: skillData,
        size: { width: 150, height: 40 },
      };
      newElements.push(skillElement);
      const alreadyExists =
        roadmapElements.some(
          (el) =>
            el.type === "connector" &&
            el.sourceId === completedSkillElement.id &&
            el.targetId === skillId
        ) ||
        connectors.some(
          (el) =>
            el.sourceId === completedSkillElement.id && el.targetId === skillId
        );
      if (!alreadyExists) {
        const connectorId = generateUniqueConnectorId(
          completedSkillElement.id,
          skillId,
          state.elements,
          pendingConnectorIds
        );
        pendingConnectorIds.push(connectorId);
        connectors.push({
          id: connectorId,
          type: "connector",
          sourceId: completedSkillElement.id,
          targetId: skillId,
        });
      }

      // --- NEW: Connect C2 to only the immediate next higher-level skill (like S1), not all higher-level skills ---
      const c2Level = skillData.level;
      // Find all higher-level skills
      const higherSkills = state.elements
        .filter(
          (existingEl) =>
            existingEl.type === "technology" &&
            !existingEl.isTool &&
            existingEl.technology &&
            existingEl.technology.name &&
            skills[existingEl.technology.name] &&
            skills[existingEl.technology.name].level > c2Level
        )
        .sort(
          (a, b) =>
            skills[a.technology.name].level - skills[b.technology.name].level
        );
      if (higherSkills.length > 0) {
        const nextSkill = higherSkills[0];
        // Check if connector already exists
        const connectorExists = roadmapElements.some(
          (conn) =>
            conn.type === "connector" &&
            conn.sourceId === skillId &&
            conn.targetId === nextSkill.id
        );
        if (!connectorExists) {
          let connectionType = undefined;
          if (skills[nextSkill.technology.name].level - c2Level > 1)
            connectionType = "warning";
          const connId = generateUniqueConnectorId(
            skillId,
            nextSkill.id,
            state.elements,
            pendingConnectorIds
          );
          pendingConnectorIds.push(connId);
          connectors.push({
            id: connId,
            type: "connector",
            sourceId: skillId,
            targetId: nextSkill.id,
            ...(connectionType ? { connectionType } : {}),
          });
        }
      }
      // Add tools if any
      if (
        skillData &&
        skillData.tools &&
        Array.isArray(skillData.tools) &&
        skillData.tools.length > 0
      ) {
        const toolWidth = 100;
        const toolGap = 50; // Increased from 30 to 50 for better spacing between tools
        const toolCount = skillData.tools.length;
        const totalWidth = toolCount * toolWidth + (toolCount - 1) * toolGap;
        const startX =
          skillElement.position.x + (skillElement.size.width - totalWidth) / 2;
        const toolY = skillElement.position.y + skillElement.size.height + 60; // Increased from 40 to 60 for better separation from parent

        skillData.tools.forEach((toolName, toolIndex) => {
          const toolId = `${toolName}-${Date.now()}-${skillIndex}-${toolIndex}`;
          const toolElement = {
            id: toolId,
            type: "technology",
            technology: { name: toolName },
            position: {
              x: startX + toolIndex * (toolWidth + toolGap),
              y: toolY,
            },
            size: { width: toolWidth, height: 35 },
            completed: false,
            isTool: true,
            parentSkillId: skillId,
          };
          newElements.push(toolElement);
          const connId = generateUniqueConnectorId(
            skillId,
            toolId,
            state.elements,
            pendingConnectorIds
          );
          pendingConnectorIds.push(connId);
          connectors.push({
            id: connId,
            type: "connector",
            sourceId: skillId,
            targetId: toolId,
          });
        });
      }
    });

    // Update the roadmap with new elements
    if (newElements.length > 0 || connectors.length > 0) {
      const updatedRoadmapElements = [
        ...roadmapElements,
        ...newElements,
        ...connectors,
      ];
      // --- NEW: Remove direct connector from C1 to S1 if C2->S1 was just added ---
      // For each new next step (C2), check if we just added a connector from C2 to S1, and if so, remove C1->S1
      nextSkillNames.forEach((skillName, skillIndex) => {
        const skillData = skills[skillName];
        const skillId = newElements.find(
          (el) => el.technology && el.technology.name === skillName
        )?.id;
        if (!skillId) return;
        const c2Level = skillData.level;
        roadmapElements.forEach((existingEl) => {
          if (
            existingEl.type === "technology" &&
            !existingEl.isTool &&
            existingEl.technology &&
            existingEl.technology.name &&
            skills[existingEl.technology.name] &&
            skills[existingEl.technology.name].level > c2Level
          ) {
            // If a connector from C2 to S1 was just added, remove C1->S1 if it exists
            const c2ToS1Id = generateUniqueConnectorId(
              skillId,
              existingEl.id,
              state.elements
            );
            const c1ToS1Id = generateUniqueConnectorId(
              completedSkillElement.id,
              existingEl.id,
              state.elements
            );
            // Remove from updatedRoadmapElements if present
            const idx = updatedRoadmapElements.findIndex(
              (el) => el.id === c1ToS1Id && el.type === "connector"
            );
            if (idx !== -1) {
              updatedRoadmapElements.splice(idx, 1);
            }
          }
        });
      });
      const updatedRoadmaps = { ...state.roadmaps };
      updatedRoadmaps[goalData.id] = updatedRoadmapElements;
      dispatch({ type: "UPDATE_ROADMAPS", payload: updatedRoadmaps });
    }
  };

  // Helper to generate a unique connector ID
  // 🛠️ BUG FIX: Helper function to sync completion status across all roadmaps
  function syncCompletionStatusAcrossRoadmaps(roadmaps) {
    const syncedRoadmaps = { ...roadmaps };

    // First pass: collect all completed skills across all roadmaps
    const completedSkills = new Set();
    Object.entries(syncedRoadmaps).forEach(([goalId, elements]) => {
      elements
        .filter((el) => el.type === "technology" && !el.isTool && el.completed)
        .forEach((skillEl) => {
          completedSkills.add(skillEl.technology.name);
        });
    });

    // Second pass: mark all matching skills as completed in all roadmaps
    Object.entries(syncedRoadmaps).forEach(([goalId, elements]) => {
      const updatedElements = elements.map((el) => {
        if (
          el.type === "technology" &&
          !el.isTool &&
          completedSkills.has(el.technology.name) &&
          !el.completed
        ) {
          return { ...el, completed: true };
        }
        return el;
      });
      syncedRoadmaps[goalId] = updatedElements;
    });

    return syncedRoadmaps;
  }

  function generateUniqueConnectorId(
    sourceId,
    targetId,
    elements,
    extraIds = []
  ) {
    // Use a more robust base ID that includes a unique timestamp and random component
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    let baseId = `connector-${sourceId}-${targetId}-${timestamp}-${random}`;
    let connectorId = baseId;
    let i = 0;

    // Check both elements and extraIds (for batch adds)
    while (
      elements.some((el) => el.id === connectorId) ||
      (Array.isArray(extraIds) && extraIds.includes(connectorId))
    ) {
      connectorId = `${baseId}-${i}`;
      i++;
    }
    return connectorId;
  }

  // Helper: Rewire connectors after adding new skills (removes obsolete and adds correct ones)
  function rewireConnectorsAfterSkillAddition(
    goalData,
    elements,
    addElement,
    removeElement
  ) {
    // Only process technology elements (skills, not tools)
    const skillElements = elements.filter(
      (el) => el.type === "technology" && !el.isTool
    );

    // ✅ FIX: Preserve all tool connections before rebuilding skill connections
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

    // Helper: get numeric level from goalData for a skill name
    const getNumericLevel = (skillName) => goalData?.skills?.[skillName]?.level;

    // For each skill, connect to the lowest higher-level skill not already connected
    skillElements.forEach((skillEl) => {
      const skillLevel = getNumericLevel(skillEl.technology.name);
      if (typeof skillLevel !== "number") return;
      // Find all higher-level skills
      const higherSkills = skillElements
        .map((el) => ({ el, lvl: getNumericLevel(el.technology.name) }))
        .filter((obj) => typeof obj.lvl === "number" && obj.lvl > skillLevel)
        .sort((a, b) => a.lvl - b.lvl);
      if (higherSkills.length > 0) {
        const nextEl = higherSkills[0].el;
        const nextLvl = higherSkills[0].lvl;
        // Ensure a connector exists
        const connectorExists = elements.some(
          (conn) =>
            conn.type === "connector" &&
            conn.sourceId === skillEl.id &&
            conn.targetId === nextEl.id
        );
        if (!connectorExists) {
          let connectionType = undefined;
          if (nextLvl - skillLevel !== 1) {
            connectionType = "warning";
          }
          addElement({
            id: generateUniqueConnectorId(
              skillEl.id,
              nextEl.id,
              state.elements
            ),
            type: "connector",
            sourceId: skillEl.id,
            targetId: nextEl.id,
            ...(connectionType ? { connectionType } : {}),
          });
        }
      }
    });

    // Remove obsolete connectors: any connector that skips a level (i.e., source and target are not lowest consecutive, and there is an intermediate skill)
    // ✅ FIX: Only remove skill-to-skill connectors, preserve tool connectors
    elements.forEach((conn) => {
      if (conn.type !== "connector") return;

      const sourceEl = skillElements.find((el) => el.id === conn.sourceId);
      const targetEl = skillElements.find((el) => el.id === conn.targetId);

      // ✅ FIX: Skip tool connectors - only process skill-to-skill connectors
      if (!sourceEl || !targetEl) return;

      const sourceLevel = getNumericLevel(sourceEl.technology.name);
      const targetLevel = getNumericLevel(targetEl.technology.name);
      if (typeof sourceLevel !== "number" || typeof targetLevel !== "number")
        return;
      if (sourceLevel >= targetLevel) return; // Only care about forward connectors
      // Find the lowest higher-level skill for this source
      const higherSkills = skillElements
        .map((el) => ({ el, lvl: getNumericLevel(el.technology.name) }))
        .filter((obj) => typeof obj.lvl === "number" && obj.lvl > sourceLevel)
        .sort((a, b) => a.lvl - b.lvl);
      if (higherSkills.length > 0 && higherSkills[0].el.id !== targetEl.id) {
        // This connector is not to the lowest higher-level skill, so remove it

        removeElement(conn.id);
      }
    });

    // ✅ FIX: Re-add any tool connectors that might have been accidentally removed
    toolConnectors.forEach((toolConnector) => {
      const connectorStillExists = elements.some(
        (el) =>
          el.type === "connector" &&
          el.sourceId === toolConnector.sourceId &&
          el.targetId === toolConnector.targetId
      );

      if (!connectorStillExists) {
        addElement({
          id: generateUniqueConnectorId(
            toolConnector.sourceId,
            toolConnector.targetId,
            state.elements
          ),
          type: "connector",
          sourceId: toolConnector.sourceId,
          targetId: toolConnector.targetId,
        });
      }
    });
  }

  // useEffect to rewire connectors after elements update, only when flag is set
  useEffect(() => {
    if (shouldRewireConnectors && state.selectedGoal) {
      rewireConnectorsAfterSkillAddition(
        state.selectedGoal,
        state.elements,
        addElement,
        removeElement
      );
      setShouldRewireConnectors(false);
    }
  }, [shouldRewireConnectors, state.selectedGoal, state.elements]);

  // Undo/Redo handlers
  const undo = () => dispatch({ type: "UNDO" });
  const redo = () => dispatch({ type: "REDO" });

  // CV Skills management
  const addRemovedCvSkill = (skillKey) => {
    dispatch({ type: "ADD_REMOVED_CV_SKILL", payload: skillKey });
  };

  const clearRemovedCvSkills = () => {
    dispatch({ type: "CLEAR_REMOVED_CV_SKILLS" });
  };

  // Load removedCvSkills from backend
  const loadRemovedCvSkillsFromBackend = async () => {
    try {
      const email =
        typeof window !== "undefined"
          ? localStorage.getItem("userEmail")
          : null;
      if (!email) return;

      const response = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.removedCvSkills && Array.isArray(data.removedCvSkills)) {
          // Update the removedCvSkills state with data from backend
          const removedCvSkillsSet = new Set(data.removedCvSkills);

          dispatch({
            type: "LOAD_REMOVED_CV_SKILLS",
            payload: Array.from(removedCvSkillsSet),
          });
        } else {
        }
      } else {
        console.error(
          "Failed to load roadmap data from backend:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error loading removedCvSkills from backend:", error);
    }
  };

  // --- Add this function to save skills to backend ---
  async function saveSkillsToBackend(updatedElements, completedSkill = null) {
    if (!state.selectedGoal) return; // Add this guard clause
    try {
      const email =
        typeof window !== "undefined"
          ? localStorage.getItem("userEmail")
          : null;
      if (!email) return;

      // Use the provided updatedElements if available, otherwise use from state
      const elementsToSave = updatedElements || state.elements;

      // Create an updated roadmaps object with the new elements
      const updatedRoadmaps = {
        ...state.roadmaps,
        [state.selectedGoal.id]: elementsToSave,
      };

      // 🛠️ BUG FIX: Sync completion status across all roadmaps before saving
      const syncedRoadmaps =
        syncCompletionStatusAcrossRoadmaps(updatedRoadmaps);

      // Gather all skills from the synced roadmaps object
      let allSkills = [];
      Object.entries(syncedRoadmaps).forEach(([goalId, elements]) => {
        const goalObj = dataset.find((g) => g.id === parseInt(goalId));
        elements
          .filter((el) => el.type === "technology" && !el.isTool)
          .forEach((skillEl) => {
            const childTools = elements.filter(
              (el) => el.isTool && el.parentSkillId === skillEl.id
            );
            const completedTools = childTools
              .filter((t) => t.completed)
              .map((t) => t.technology.name);
            allSkills.push({
              name: skillEl.technology.name,
              isCompleted: skillEl.completed ? "True" : "False",
              goal: skillEl.goalData?.goal || goalObj?.goal || "",
              ...(completedTools.length > 0 ? { completedTools } : {}),
            });
          });
      });

      // Deduplicate skills
      const skillMap = new Map();
      allSkills.forEach((skill) => {
        const normName = (skill.name || "").trim().toLowerCase();
        let normGoal = (skill.goal || "").trim().toLowerCase();
        if (!normGoal && skill.goalId) {
          normGoal = String(skill.goalId);
        }
        if (!normGoal) {
          normGoal = `unknown-goal-for-${normName}`;
        }
        const key = `${normName}|${normGoal}`;
        if (!skillMap.has(key)) {
          skillMap.set(key, skill);
        } else {
          const existing = skillMap.get(key);
          if (existing.isCompleted !== "True" && skill.isCompleted === "True") {
            skillMap.set(key, skill);
          }
        }
      });
      const dedupedSkills = Array.from(skillMap.values());

      // Save complete roadmap data
      await fetch("/api/roadmap", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          skills: dedupedSkills,
          roadmaps: syncedRoadmaps, // Use the synced roadmaps object
          canvas: state.canvas,
          selectedGoal: state.selectedGoal,
          foldedSkills: Array.from(state.foldedSkills),
          removedCvSkills: Array.from(state.removedCvSkills),
          completedSkill, // Include completed skill info for streak tracking
        }),
      });

      // Also save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("roadmaps", JSON.stringify(syncedRoadmaps));
        localStorage.setItem("canvas", JSON.stringify(state.canvas));
        if (state.selectedGoal) {
          localStorage.setItem(
            "selectedGoal",
            JSON.stringify(state.selectedGoal)
          );
        }
        localStorage.setItem(
          "foldedSkills",
          JSON.stringify(Array.from(state.foldedSkills))
        );
      }
    } catch (err) {
      console.error("Failed to save skills to backend:", err);
    }
  }

  const value = {
    ...state,
    addElement,
    addMultipleElements,
    updateElement,
    removeElement,
    toggleCompletion,
    setSuggestions,
    updateCanvas,
    setSelectedElement,
    setSelectedElements,
    addToSelection,
    removeFromSelection,
    clearSelection,
    setSelectionBox,
    moveSelectedElements,
    deleteSelectedElements,
    setDragging,
    toggleSuggestions,
    toggleSidebar,
    setZoom,
    toggleHandTool,
    resetView,
    startDrag,
    updateDrag,
    endDrag,
    toggleKeyboardHints,
    cascadeDeleteElements,
    completedTechnologies: state.elements
      .filter((el) => el.type === "technology" && el.completed)
      .map((el) => el.technology.name),
    setSelectedGoal,
    previousGoal: state.previousGoal,
    roadmaps: state.roadmaps,
    switchGoal,
    addCommonCompletedSkills,
    commonCompletedSkills: state.commonCompletedSkills,
    lastSkillDeletionWarning,
    setLastSkillDeletionWarning,
    undo,
    redo,
    saveSkillsToBackend,
    setFoldedSkills,
    toggleFoldedSkill,
    generateUniqueConnectorId,
    addNextStepsForCompletedSkill,
    addRemovedCvSkill,
    clearRemovedCvSkills,
    loadRemovedCvSkillsFromBackend,
  };

  return (
    <RoadmapContext.Provider value={value}>{children}</RoadmapContext.Provider>
  );
}

export function useRoadmap() {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error("useRoadmap must be used within a RoadmapProvider");
  }
  return context;
}
