"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Move,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Info,
} from "lucide-react";
import { useRoadmap } from "../context/RoadmapContext";
import { getCategoryById } from "../data/roadmapData";
import dataset from "../data/dataset.json";
import InfoSidePanel from "./InfoSidePanel";

export default function TechnologyElement({
  element,
  isSelected,
  isFolded,
  onToggleFold,
  onSelect,
  onCompleted,
  onShowInfo,
}) {
  const {
    updateElement,
    removeElement,
    addElement,
    toggleCompletion,
    canvas,
    selectedElements,
    moveSelectedElements,
    cascadeDeleteElements,
    setDragging,
    elements,
    addToSelection,
    removeFromSelection,
    setSelectedElement,
  } = useRoadmap();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef(null);
  const initialPositionRef = useRef(null);
  const [isTextTruncated, setIsTextTruncated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const textRef = useRef(null);
  const [isNewElement, setIsNewElement] = useState(true);
  const animationTimeoutRef = useRef();
  const category = getCategoryById(element.technology.category);
  // Store initial positions for all selected elements when dragging starts
  const selectedElementsInitialPositionsRef = useRef(new Map());
  // const [isInfoOpen, setIsInfoOpen] = useState(false); // Removed local state

  // Check if this skill has child tools
  const hasChildTools = useCallback(() => {
    if (element.isTool) return false;
    return elements.some((el) => el.isTool && el.parentSkillId === element.id);
  }, [element.id, element.isTool, elements]);

  // Get child tools for this skill
  const getChildTools = useCallback(() => {
    if (element.isTool) return [];
    return elements.filter(
      (el) => el.isTool && el.parentSkillId === element.id
    );
  }, [element.id, element.isTool, elements]);

  // Helper: Check if this skill is common in both goals and completed
  const isCommonCompletedSkill = (() => {
    if (element.isTool || !element.completed) return false;
    // Get all goals that contain this skill
    const goalsWithSkill = dataset.filter(
      (goalObj) =>
        goalObj.skills &&
        Object.keys(goalObj.skills).some(
          (skillName) =>
            skillName.toLowerCase() === element.technology.name.toLowerCase()
        )
    );
    return goalsWithSkill.length > 1;
  })();

  // Handle fold/unfold toggle
  const handleFoldToggle = (e) => {
    e.stopPropagation();
    if (onToggleFold) {
      onToggleFold(element.id);
    }
  };

  const handleMouseDown = (e) => {
    if (
      e.target.closest(".resize-handle") ||
      e.target.closest(".delete-btn") ||
      e.target.closest(".completion-btn")
    ) {
      return;
    }

    // Multi-select with Shift+Click
    if (e.shiftKey) {
      if (selectedElements.includes(element.id)) {
        removeFromSelection(element.id);
      } else {
        addToSelection(element.id);
      }
    } else {
      setSelectedElement(element);
    }

    setIsDragging(true);

    // Get the canvas element to calculate proper coordinates
    const canvasElement = e.target.closest(".canvas-grid-background");
    const canvasRect = canvasElement?.getBoundingClientRect();

    if (canvasRect) {
      // Calculate mouse position relative to canvas
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;

      // Transform mouse position to canvas coordinates (accounting for zoom and pan)
      const canvasMouseX = (mouseX - canvas.position.x) / canvas.zoom;
      const canvasMouseY = (mouseY - canvas.position.y) / canvas.zoom;

      // Calculate offset from element position to mouse position in canvas coordinates
      setDragOffset({
        x: canvasMouseX - element.position.x,
        y: canvasMouseY - element.position.y,
      });
    } else {
      // Fallback to original calculation if canvas not found
      const rect = elementRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    // Store initial position for this element
    initialPositionRef.current = { ...element.position };

    // Store initial positions for all selected elements if this is part of a multi-selection
    if (selectedElements.length > 1 && selectedElements.includes(element.id)) {
      selectedElementsInitialPositionsRef.current.clear();
      selectedElements.forEach((selectedId) => {
        const selectedEl = elements.find((el) => el.id === selectedId);
        if (selectedEl) {
          selectedElementsInitialPositionsRef.current.set(selectedId, {
            ...selectedEl.position,
          });
        }
      });
    }

    e.preventDefault();
    e.stopPropagation();
  };

  const updatePosition = useCallback(
    (clientX, clientY) => {
      if (!elementRef.current || !initialPositionRef.current) return;

      // Get the canvas element to calculate proper coordinates
      const canvasElement = elementRef.current.closest(
        ".canvas-grid-background"
      );
      const canvasRect = canvasElement?.getBoundingClientRect();

      if (canvasRect) {
        // Calculate mouse position relative to canvas
        const mouseX = clientX - canvasRect.left;
        const mouseY = clientY - canvasRect.top;

        // Transform mouse position to canvas coordinates (accounting for zoom and pan)
        const canvasMouseX = (mouseX - canvas.position.x) / canvas.zoom;
        const canvasMouseY = (mouseY - canvas.position.y) / canvas.zoom;

        // Calculate new position in canvas coordinates
        const newX = canvasMouseX - dragOffset.x;
        const newY = canvasMouseY - dragOffset.y;

        // Calculate transform relative to initial position
        const deltaX = newX - initialPositionRef.current.x;
        const deltaY = newY - initialPositionRef.current.y;

        // Always use DOM manipulation for smooth dragging
        elementRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // If this element is part of a multi-selection, move all selected elements
        if (
          selectedElements.length > 1 &&
          selectedElements.includes(element.id)
        ) {
          selectedElements.forEach((selectedId) => {
            if (selectedId !== element.id) {
              const selectedElement = document.querySelector(
                `[data-element-id="${selectedId}"]`
              );
              if (selectedElement) {
                // Apply the same delta to all selected elements
                selectedElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
              }
            }
          });
        }

        // If this is a skill with child tools, also move the child tools
        // But only if this skill is not a tool itself (to prevent circular movement)
        if (!element.isTool && hasChildTools()) {
          const childTools = getChildTools();
          childTools.forEach((tool) => {
            const toolElement = document.querySelector(
              `[data-element-id="${tool.id}"]`
            );
            if (toolElement) {
              toolElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            }
          });
        }
      }
    },
    [
      dragOffset,
      canvas.position,
      canvas.zoom,
      element.isTool,
      hasChildTools,
      getChildTools,
      selectedElements,
      element.id,
    ]
  );

  // Touch event handlers for mobile/tablet support
  const handleTouchStart = (e) => {
    if (
      e.target.closest(".resize-handle") ||
      e.target.closest(".delete-btn") ||
      e.target.closest(".completion-btn") ||
      e.target.closest(".fold-btn")
    ) {
      return;
    }

    // Prevent default to avoid scrolling while dragging
    e.preventDefault();
    e.stopPropagation();

    // Get the first touch point
    const touch = e.touches[0];
    if (!touch) return;

    // Multi-select with Shift+Click (not applicable for touch, but keep for consistency)
    setSelectedElement(element);

    setIsDragging(true);

    // Get the canvas element to calculate proper coordinates
    const canvasElement = e.target.closest(".canvas-grid-background");
    const canvasRect = canvasElement?.getBoundingClientRect();

    if (canvasRect) {
      // Calculate touch position relative to canvas
      const touchX = touch.clientX - canvasRect.left;
      const touchY = touch.clientY - canvasRect.top;

      // Transform touch position to canvas coordinates (accounting for zoom and pan)
      const canvasTouchX = (touchX - canvas.position.x) / canvas.zoom;
      const canvasTouchY = (touchY - canvas.position.y) / canvas.zoom;

      // Calculate offset from element position to touch position in canvas coordinates
      setDragOffset({
        x: canvasTouchX - element.position.x,
        y: canvasTouchY - element.position.y,
      });
    } else {
      // Fallback to original calculation if canvas not found
      const rect = elementRef.current.getBoundingClientRect();
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
    }

    // Store initial position for this element
    initialPositionRef.current = { ...element.position };

    // Store initial positions for all selected elements if this is part of a multi-selection
    if (selectedElements.length > 1 && selectedElements.includes(element.id)) {
      selectedElementsInitialPositionsRef.current.clear();
      selectedElements.forEach((selectedId) => {
        const selectedEl = elements.find((el) => el.id === selectedId);
        if (selectedEl) {
          selectedElementsInitialPositionsRef.current.set(selectedId, {
            ...selectedEl.position,
          });
        }
      });
    }
  };

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging) return;

      // Check if we're touching a control button
      if (
        e.target.closest(".resize-handle") ||
        e.target.closest(".delete-btn") ||
        e.target.closest(".completion-btn") ||
        e.target.closest(".fold-btn")
      ) {
        return;
      }

      // Prevent default to avoid scrolling while dragging
      e.preventDefault();

      const touch = e.touches[0];
      if (!touch) return;

      updatePosition(touch.clientX, touch.clientY);
    },
    [isDragging, updatePosition]
  );

  const handleTouchEnd = useCallback(
    (e) => {
      if (!isDragging || !elementRef.current) return;

      // Check if we're touching a control button
      if (
        e.target.closest(".resize-handle") ||
        e.target.closest(".delete-btn") ||
        e.target.closest(".completion-btn") ||
        e.target.closest(".fold-btn")
      ) {
        setIsDragging(false);
        if (typeof setDragging === "function") setDragging(false);
        return;
      }

      // Prevent default to avoid any unwanted behavior
      e.preventDefault();

      setIsDragging(false);
      if (typeof setDragging === "function") setDragging(false);

      // Get final position from transform
      const transform = elementRef.current.style.transform;
      const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);

      if (match && initialPositionRef.current) {
        const deltaX = parseFloat(match[1]);
        const deltaY = parseFloat(match[2]);

        // Reset transform for this element
        elementRef.current.style.transform = "";

        // If this element is part of a multi-selection, move all selected elements
        if (
          selectedElements.length > 1 &&
          selectedElements.includes(element.id)
        ) {
          // Reset transforms for all selected elements
          selectedElements.forEach((selectedId) => {
            const selectedElement = document.querySelector(
              `[data-element-id="${selectedId}"]`
            );
            if (selectedElement) {
              selectedElement.style.transform = "";
            }
          });

          // Update positions for all selected elements based on their initial positions
          selectedElements.forEach((selectedId) => {
            const initialPos =
              selectedElementsInitialPositionsRef.current.get(selectedId);
            if (initialPos) {
              const selectedEl = elements.find((el) => el.id === selectedId);
              if (selectedEl) {
                updateElement({
                  ...selectedEl,
                  position: {
                    x: initialPos.x + deltaX,
                    y: initialPos.y + deltaY,
                  },
                });
              }
            }
          });

          // Clear the stored initial positions
          selectedElementsInitialPositionsRef.current.clear();
        } else {
          // Single element - update just this element
          const finalX = initialPositionRef.current.x + deltaX;
          const finalY = initialPositionRef.current.y + deltaY;

          updateElement({
            ...element,
            position: { x: finalX, y: finalY },
          });

          // If this is a skill with child tools, also update child tool positions
          // But only if this skill is not a tool itself (to prevent circular movement)
          if (!element.isTool && hasChildTools()) {
            const childTools = getChildTools();
            childTools.forEach((tool) => {
              const toolElement = document.querySelector(
                `[data-element-id="${tool.id}"]`
              );
              if (toolElement) {
                // Reset the tool's transform
                toolElement.style.transform = "";

                // Update the tool's position in the state
                updateElement({
                  ...tool,
                  position: {
                    x: tool.position.x + deltaX,
                    y: tool.position.y + deltaY,
                  },
                });
              }
            });
          }
        }
      }
    },
    [
      isDragging,
      element,
      updateElement,
      selectedElements,
      element.id,
      hasChildTools,
      getChildTools,
    ]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      updatePosition(e.clientX, e.clientY);
    },
    [isDragging, updatePosition]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging || !elementRef.current) return;

    setIsDragging(false);
    if (typeof setDragging === "function") setDragging(false);

    // Get final position from transform
    const transform = elementRef.current.style.transform;
    const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);

    if (match && initialPositionRef.current) {
      const deltaX = parseFloat(match[1]);
      const deltaY = parseFloat(match[2]);

      // Reset transform for this element
      elementRef.current.style.transform = "";

      // If this element is part of a multi-selection, move all selected elements
      if (
        selectedElements.length > 1 &&
        selectedElements.includes(element.id)
      ) {
        // Reset transforms for all selected elements
        selectedElements.forEach((selectedId) => {
          const selectedElement = document.querySelector(
            `[data-element-id="${selectedId}"]`
          );
          if (selectedElement) {
            selectedElement.style.transform = "";
          }
        });

        // Update positions for all selected elements based on their initial positions
        selectedElements.forEach((selectedId) => {
          const initialPos =
            selectedElementsInitialPositionsRef.current.get(selectedId);
          if (initialPos) {
            const selectedEl = elements.find((el) => el.id === selectedId);
            if (selectedEl) {
              updateElement({
                ...selectedEl,
                position: {
                  x: initialPos.x + deltaX,
                  y: initialPos.y + deltaY,
                },
              });
            }
          }
        });

        // Clear the stored initial positions
        selectedElementsInitialPositionsRef.current.clear();
      } else {
        // Single element - update just this element
        const finalX = initialPositionRef.current.x + deltaX;
        const finalY = initialPositionRef.current.y + deltaY;

        updateElement({
          ...element,
          position: { x: finalX, y: finalY },
        });

        // If this is a skill with child tools, also update child tool positions
        // But only if this skill is not a tool itself (to prevent circular movement)
        if (!element.isTool && hasChildTools()) {
          const childTools = getChildTools();
          childTools.forEach((tool) => {
            const toolElement = document.querySelector(
              `[data-element-id="${tool.id}"]`
            );
            if (toolElement) {
              // Reset the tool's transform
              toolElement.style.transform = "";

              // Update the tool's position in the state
              updateElement({
                ...tool,
                position: {
                  x: tool.position.x + deltaX,
                  y: tool.position.y + deltaY,
                },
              });
            }
          });
        }
      }
    }
  }, [
    isDragging,
    element,
    updateElement,
    selectedElements,
    element.id,
    hasChildTools,
    getChildTools,
  ]);

  // Add document-level event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove, {
        passive: true,
      });
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  const handleDelete = (e) => {
    e.stopPropagation();
    cascadeDeleteElements(element.technology.name);
  };

  const handleCompletionToggle = (e) => {
    e.stopPropagation();
    const wasCompleted = element.completed;
    toggleCompletion(element.id);

    // If the element was just completed (not uncompleted), trigger the onCompleted callback
    if (!wasCompleted && onCompleted) {
      // Use setTimeout to ensure the state update happens first
      setTimeout(() => {
        onCompleted(element);
      }, 0);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "beginner":
        return "bg-green-500";
      case "intermediate":
        return "bg-yellow-500";
      case "advanced":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getLevelTextColor = (level) => {
    switch (level) {
      case "beginner":
        return "text-green-700";
      case "intermediate":
        return "text-yellow-700";
      case "advanced":
        return "text-red-700";
      default:
        return "text-gray-700";
    }
  };

  useEffect(() => {
    if (textRef.current) {
      setIsTextTruncated(
        textRef.current.scrollWidth > textRef.current.clientWidth
      );
    }
  }, [element.technology.name]);

  useEffect(() => {
    if (isNewElement) {
      animationTimeoutRef.current = setTimeout(() => {
        setIsNewElement(false);
        // Dispatch custom event to notify connectors to update
        window.dispatchEvent(new Event("elementAnimationEnd"));
      }, 400); // Animation duration
      return () => clearTimeout(animationTimeoutRef.current);
    }
  }, [isNewElement]);

  return (
    <>
      <div
        ref={elementRef}
        data-element-id={element.id}
        className={`absolute select-none ${
          isSelected ? "z-20" : "z-10"
        } ${isDragging ? "cursor-grabbing" : "cursor-move"}`}
        style={{
          left: element.position.x,
          top: element.position.y,
          height: element.size.height,
          willChange: isDragging ? "transform" : "auto",
          // Hardware acceleration hints
          backfaceVisibility: "hidden",
          perspective: 1000,
          transformStyle: "preserve-3d",
          // Entrance animation for new elements
          opacity: isNewElement ? 0 : 1,
          transform: isNewElement
            ? "scale(0.8) translateY(20px)"
            : "scale(1) translateY(0px)",
          transition: isNewElement
            ? "opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1)"
            : isDragging
              ? "none"
              : "all 0.2s ease-in-out",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`relative w-full h-full rounded-full border-2 ${
            isSelected
              ? selectedElements.length > 1
                ? "border-purple-500 shadow-lg selected multi-selected"
                : "border-blue-500 shadow-lg selected"
              : element.completed
                ? "border-green-500 shadow-lg bg-green-100"
                : element.isTool
                  ? "border-gray-200 bg-gray-50 hover:border-gray-300"
                  : "border-gray-300 hover:border-gray-400"
          } ${isDragging ? "opacity-75 shadow-xl scale-105" : ""}`}
          style={{
            backgroundColor: !element.completed
              ? element.isTool
                ? "#f9fafb"
                : category?.color + "15"
              : undefined,
            borderColor: isSelected
              ? selectedElements.length > 1
                ? "#8b5cf6"
                : category?.color
              : undefined,
            // Disable transitions during dragging for better performance
            transition: isDragging ? "none" : "all 0.2s ease-in-out",
          }}
        >
          {/* Capsule content */}
          <div className="flex items-center justify-center h-full px-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm flex-shrink-0">{category?.icon}</span>
              <span
                ref={textRef}
                className={`font-medium text-sm capsule-text ${
                  element.completed ? "text-green-800" : "text-gray-800"
                } ${element.isTool ? "text-xs" : ""}`}
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "inline-block",
                  maxWidth: 160,
                  verticalAlign: "middle",
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {element.technology.name}
                {isHovered && isTextTruncated && (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "-2.2em",
                      transform: "translateX(-50%)",
                      background: "rgba(30,41,59,0.95)",
                      color: "white",
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 13,
                      whiteSpace: "normal",
                      zIndex: 100,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    {element.technology.name}
                  </div>
                )}
              </span>
              {element.isTool && (
                <span className="text-xs text-gray-400 flex-shrink-0">🔧</span>
              )}
              {/* Info icon button */}
              <button
                type="button"
                className="ml-1 p-1 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                title="Show info"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onShowInfo) onShowInfo(element);
                }}
                tabIndex={0}
                aria-label={`Show info for ${element.technology.name}`}
              >
                <Info size={16} className="text-blue-500" />
              </button>
            </div>
          </div>

          {/* Level indicator dot */}
          <div
            className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getLevelColor(
              element.technology.level
            )} border-2 border-white shadow-sm level-indicator`}
            title={`${element.technology.level} level`}
          />

          {/* Hidden tools indicator */}
          {!element.isTool && hasChildTools() && isFolded && (
            <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {getChildTools().length}
              </span>
            </div>
          )}

          {/* Selection indicator */}
          {isSelected && (
            <div
              className={`absolute -top-2 -left-2 -right-2 -bottom-2 border-2 rounded-full pointer-events-none ${
                selectedElements.length > 1
                  ? "border-purple-500"
                  : "border-blue-500"
              }`}
            />
          )}

          {/* Multi-selection count indicator */}
          {isSelected && selectedElements.length > 1 && (
            <div className="absolute -top-3 -right-3 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center font-bold pointer-events-none">
              {selectedElements.length}
            </div>
          )}

          {/* Delete button - only show for skills, not tools, and not if common+completed */}
          {isSelected && !element.isTool && !isCommonCompletedSkill && (
            <button
              onClick={handleDelete}
              className="delete-btn absolute -top-2 -left-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
              title="Delete"
            >
              <X size={10} />
            </button>
          )}

          {/* Drag handle */}
          {isSelected && (
            <div className="absolute -bottom-2 -right-2 p-1 bg-white rounded-full shadow-sm border border-gray-200">
              <Move size={10} className="text-gray-400" />
            </div>
          )}

          {/* Completion button - show for both skills and tools, but different logic */}
          {isSelected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (element.isTool) {
                  // For tools, only toggle completion (color), no callback
                  toggleCompletion(element.id);
                } else {
                  // For skills, use the original logic
                  handleCompletionToggle(e);
                }
              }}
              className={`completion-btn absolute -top-2 -right-2 p-1 rounded-full transition-colors shadow-sm ${
                element.completed
                  ? "bg-green-500 text-white hover:bg-green-600 opacity-60 cursor-not-allowed"
                  : "bg-gray-500 text-white hover:bg-gray-600"
              }`}
              title={element.completed ? "Completed" : "Mark as Completed"}
              disabled={element.completed}
            >
              <CheckCircle size={10} />
            </button>
          )}

          {/* Foldable button for skills with child tools */}
          {isSelected && !element.isTool && hasChildTools() && (
            <button
              onClick={handleFoldToggle}
              onMouseDown={(e) => e.stopPropagation()}
              className="fold-btn absolute bottom-2 -left-2 p-1 mb-[1px] ml-[1px] bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              title={isFolded ? "Show tools" : "Hide tools"}
            >
              {isFolded ? (
                <ChevronRight size={10} className="text-gray-600" />
              ) : (
                <ChevronDown size={10} className="text-gray-600" />
              )}
            </button>
          )}
        </div>
      </div>
      {/* Info Side Panel */}
      {/* Removed InfoSidePanel rendering */}
    </>
  );
}
