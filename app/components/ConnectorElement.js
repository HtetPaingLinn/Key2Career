"use client";

import { useRoadmap } from "../context/RoadmapContext";
import { useEffect, useState, useMemo, useRef } from "react";

// Helper: Find intersection of a line from center to center with a capsule (rounded rectangle) edge
function getCapsuleEdgePoint(center, target, size, gap = 8) {
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  const w = size.width / 2;
  const h = size.height / 2;

  if (dx === 0 && dy === 0) return { x: center.x, y: center.y };

  const threshold = 0.01;

  if (Math.abs(dx) > Math.abs(dy) * 2) {
    // Mostly horizontal
    return {
      x: center.x + (dx > 0 ? w + gap : -w - gap),
      y: center.y,
    };
  } else if (Math.abs(dy) > Math.abs(dx) * 2) {
    // Mostly vertical
    return {
      x: center.x,
      y: center.y + (dy > 0 ? h + gap : -h - gap),
    };
  } else {
    // Diagonal: use ellipse formula as fallback
    const angle = Math.atan2(dy, dx);
    const rx = w;
    const ry = h;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const denom = Math.sqrt((cos * cos) / (rx * rx) + (sin * sin) / (ry * ry));
    let r = 1 / denom;

    // Apply gap — negative gap pulls inside the edge
    r += gap;

    // Prevent overshooting inside the element
    r = Math.max(r, 0);

    return {
      x: center.x + r * cos,
      y: center.y + r * sin,
    };
  }
}

export default function ConnectorElement({
  element,
  elements,
  onOpenLevelGapPrompt,
}) {
  const { removeElement, isDragging } = useRoadmap();
  const [updateCounter, setUpdateCounter] = useState(0);
  const [shouldRender, setShouldRender] = useState(true);
  const [isNewConnector, setIsNewConnector] = useState(true);
  const animationTimeoutRef = useRef();

  // Find the source and target elements
  const sourceElement = elements.find((el) => el.id === element.sourceId);
  const targetElement = elements.find((el) => el.id === element.targetId);

  // Listen for elementAnimationEnd to force update
  useEffect(() => {
    const handler = () => setUpdateCounter((c) => c + 1);
    window.addEventListener("elementAnimationEnd", handler);
    return () => window.removeEventListener("elementAnimationEnd", handler);
  }, []);

  // Use useEffect to clean up orphaned connectors
  useEffect(() => {
    if (!sourceElement || !targetElement) {
      // Remove connector if source or target doesn't exist
      removeElement(element.id);
    }
  }, [sourceElement, targetElement, element.id, removeElement]);

  // Force re-renders during dragging
  useEffect(() => {
    let animationId;
    const updateConnector = () => {
      if (isDragging) {
        // Check if either source or target is being dragged
        const sourceNode = document.querySelector(
          `[data-element-id="${element.sourceId}"]`
        );
        const targetNode = document.querySelector(
          `[data-element-id="${element.targetId}"]`
        );
        const sourceTransform = sourceNode?.style.transform;
        const targetTransform = targetNode?.style.transform;
        if (sourceTransform || targetTransform) {
          setUpdateCounter((prev) => prev + 1);
        }
      }
      // Continue animation frame loop only if dragging
      if (isDragging) {
        animationId = requestAnimationFrame(updateConnector);
      }
    };
    if (isDragging) {
      animationId = requestAnimationFrame(updateConnector);
    }
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isDragging, element.sourceId, element.targetId]);

  useEffect(() => {
    if (isNewConnector) {
      animationTimeoutRef.current = setTimeout(() => {
        setIsNewConnector(false);
      }, 400); // Animation duration
      return () => clearTimeout(animationTimeoutRef.current);
    }
  }, [isNewConnector]);

  // Helper function to get real-time position and size including transform
  const getRealTimePositionAndSize = (element) => {
    // Always get the latest DOM size
    const elementNode = document.querySelector(
      `[data-element-id="${element.id}"]`
    );
    let realSize = { ...element.size };
    if (elementNode) {
      realSize = {
        width: elementNode.offsetWidth,
        height: elementNode.offsetHeight,
      };
      const transform = elementNode.style.transform;
      const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
      if (match) {
        const deltaX = parseFloat(match[1]);
        const deltaY = parseFloat(match[2]);
        return {
          x: element.position.x + realSize.width / 2 + deltaX,
          y: element.position.y + realSize.height / 2 + deltaY,
          size: realSize,
        };
      }
      // No transform
      return {
        x: element.position.x + realSize.width / 2,
        y: element.position.y + realSize.height / 2,
        size: realSize,
      };
    }
    // Fallback
    return {
      x: element.position.x + realSize.width / 2,
      y: element.position.y + realSize.height / 2,
      size: realSize,
    };
  };

  // Calculate centers and sizes with real-time positions using useMemo for optimization
  const { sourceCenter, targetCenter, sourceSize, targetSize } = useMemo(() => {
    if (!sourceElement || !targetElement) {
      return {
        sourceCenter: { x: 0, y: 0 },
        targetCenter: { x: 0, y: 0 },
        sourceSize: { width: 0, height: 0 },
        targetSize: { width: 0, height: 0 },
      };
    }
    const src = getRealTimePositionAndSize(sourceElement);
    const tgt = getRealTimePositionAndSize(targetElement);
    return {
      sourceCenter: { x: src.x, y: src.y },
      targetCenter: { x: tgt.x, y: tgt.y },
      sourceSize: src.size,
      targetSize: tgt.size,
    };
  }, [sourceElement, targetElement, updateCounter]);

  // Do not render connector if either endpoint is still animating in
  if (
    !sourceElement ||
    !targetElement ||
    sourceElement.isNewElement ||
    targetElement.isNewElement
  ) {
    return null;
  }

  // Calculate edge points (with gap)
  const startGap = 6;
  const endGap = 12;
  const startPoint = getCapsuleEdgePoint(
    sourceCenter,
    targetCenter,
    sourceSize,
    startGap
  );
  const endPoint = getCapsuleEdgePoint(
    targetCenter,
    sourceCenter,
    targetSize,
    endGap
  );

  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const lineLength = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  // Determine connector color based on completion and type
  let connectorColor;
  if (element.connectionType === "warning") {
    connectorColor = "#ef4444"; // Tailwind red-500
  } else if (sourceElement.isTool || targetElement.isTool) {
    // Connector between skill and tool: only green if the tool is completed
    const toolElement = sourceElement.isTool ? sourceElement : targetElement;
    connectorColor = toolElement.completed ? "#22c55e" : "#6B7280";
  } else {
    // Skill-to-skill: green if either is completed
    connectorColor =
      sourceElement.completed || targetElement.completed
        ? "#22c55e"
        : "#6B7280";
  }

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: startPoint.x,
        top: startPoint.y,
        width: lineLength,
        height: 1.5,
        transformOrigin: "0 50%",
        transform: `rotate(${angle}deg) scaleX(${isNewConnector ? 0 : 1})`,
        zIndex: 1,
        opacity: isNewConnector ? 0 : 1,
        transition: isNewConnector
          ? "opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1)"
          : "all 0.2s ease-in-out",
      }}
    >
      {/* Main line with gradient */}
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `repeating-linear-gradient(90deg, ${connectorColor} 0px, ${connectorColor} 6px, transparent 6px, transparent 12px)`,
          boxShadow: "0 0 6px rgba(107, 114, 128, 0.15)",
        }}
      />

      {/* Chevron Arrow head (">" style) */}
      <svg
        className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2"
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        style={{ pointerEvents: "none" }}
      >
        <polyline
          points="2,2 7,5 2,8"
          fill="none"
          stroke={connectorColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Connection type indicator */}
      {element.connectionType && (
        <div
          className={`absolute text-center top-1/2 left-1/2 px-2 py-1 rounded-full border text-xs font-medium pointer-events-auto transition-all duration-200
            ${
              element.connectionType === "warning"
                ? "bg-red-50 border-red-300 text-red-600 hover:bg-red-100 hover:border-red-500 hover:shadow-lg hover:scale-105 cursor-pointer"
                : "bg-white border-blue-200 text-blue-600"
            }
          `}
          style={{
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: "0.25em",
            // Counter-rotate to keep horizontal
            transform: `translate(-50%, -50%) rotate(${-angle}deg)`,
          }}
          onClick={
            element.connectionType === "warning" && onOpenLevelGapPrompt
              ? (e) => {
                  e.stopPropagation();
                  onOpenLevelGapPrompt();
                }
              : undefined
          }
        >
          {element.connectionType === "warning" && (
            <span style={{ fontSize: "1.1em", marginRight: 2 }}>⚠️</span>
          )}
          {element.connectionType === "warning"
            ? "Level Gap"
            : element.connectionType}
        </div>
      )}
    </div>
  );
}
