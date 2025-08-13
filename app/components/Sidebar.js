/* -------------------------------------------------------------------------- */
/*  Sidebar – always‑visible version with improved search ranking (JS)        */
/* -------------------------------------------------------------------------- */

"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Plus, CheckCircle, Search } from "lucide-react";
import { useRoadmap } from "../context/RoadmapContext";
import { roadmapData } from "../data/roadmapData";
import dataset from "../data/dataset.json";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400"] });

export default function Sidebar() {
  const {
    elements,
    addElement,
    setSuggestions,
    showSuggestions,
    showSidebar,
    completedTechnologies,
    addMultipleElements,
    removeElement,
  } = useRoadmap();

  // New state for type and goal
  const [selectedType, setSelectedType] = useState("skills"); // "skills" or "tools"
  const [selectedGoal, setSelectedGoal] = useState(
    roadmapData.categories.skills[0]?.goal || ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  // Get goals for the selected type
  const goals = roadmapData.categories[selectedType].map((g) => g.goal);

  // Get items for the selected goal and type (refactored for global search)
  const items = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      // No search: show items from selected goal only
      const goalObj = roadmapData.categories[selectedType].find(
        (g) => g.goal === selectedGoal
      );
      if (!goalObj) return [];
      // Attach parentGoal for consistency
      return goalObj.items.map((item) => ({
        ...item,
        parentGoal: selectedGoal,
      }));
    }
    // Search: aggregate all items from all goals under selected type
    let allItems = [];
    roadmapData.categories[selectedType].forEach((goalObj) => {
      if (goalObj.items && Array.isArray(goalObj.items)) {
        allItems.push(
          ...goalObj.items.map((item) => ({
            ...item,
            parentGoal: goalObj.goal,
          }))
        );
      }
    });
    // Filter by search query and deduplicate by name
    const seen = new Set();
    return allItems
      .filter((item) => item.name.toLowerCase().includes(q))
      .filter((item) => {
        const itemName = item.name.toLowerCase();
        if (seen.has(itemName)) {
          return false; // Skip this duplicate
        }
        seen.add(itemName);
        return true;
      });
  }, [selectedType, selectedGoal, searchQuery]);

  // Focus search when goal/type changes
  useEffect(() => {
    const id = setTimeout(() => searchInputRef.current?.focus(), 120);
    return () => clearTimeout(id);
  }, [selectedGoal, selectedType]);

  // Build a set of all child tool names from dataset.json
  const childToolSet = useMemo(() => {
    const set = new Set();
    dataset.forEach((goalObj) => {
      Object.values(goalObj.skills).forEach((skill) => {
        if (skill.tools && Array.isArray(skill.tools)) {
          skill.tools.forEach((tool) => set.add(tool));
        }
      });
    });
    return set;
  }, []);

  // --- Disable drag when canvas is empty ---
  const isCanvasEmpty = elements.length === 0;

  // Add element logic (for skills/tools, just use name as id)
  const handleAddElement = (item) => {
    // If adding a tool, keep the old logic
    if (selectedType === "tools") {
      const newElement = {
        id: `${item.name}-${Date.now()}`,
        type: "tool",
        technology: item,
        position: { x: 100, y: 100 },
        size: { width: 120, height: 40 },
        completed: false,
        isTool: true,
      };
      addElement(newElement);
      return;
    }

    // --- Skill logic: match RoadmapCanvas drag-and-drop ---
    // Find all existing skills on the canvas
    const skillsOnCanvas = elements.filter(
      (el) =>
        el.type === "skill" && !el.isTool && el.technology && el.technology.name
    );

    // Helper: get numeric level from dataset.json for a skill name
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

    // Helper: get numeric level from dataset.json for a skill name
    const getNumericLevel = (skillName) => {
      for (const goalObj of dataset) {
        if (goalObj.skills && goalObj.skills[skillName]) {
          return goalObj.skills[skillName].level;
        }
      }
      return undefined;
    };

    // Always get the current goal's skillData from dataset (not from sidebar/roadmapData)
    const currentGoalObj = dataset.find((g) => g.goal === selectedGoal);
    const currentSkillData =
      currentGoalObj &&
      currentGoalObj.skills &&
      currentGoalObj.skills[item.name]
        ? currentGoalObj.skills[item.name]
        : null;

    // Add the new skill element
    const newElement = {
      id: `${item.name}-${Date.now()}`,
      type: "skill",
      technology: item,
      position: { x: 100, y: 100 },
      size: { width: 120, height: 40 },
      completed: false,
      isTool: false,
      // Attach goalData and skillData for completion logic
      goalData: currentGoalObj || null,
      skillData: currentSkillData,
    };

    // --- Add children tools if any ---
    let toolElements = [];
    let toolConnectors = [];
    if (
      currentSkillData &&
      currentSkillData.tools &&
      Array.isArray(currentSkillData.tools)
    ) {
      // Place tools in a circle around the skill
      const toolCount = currentSkillData.tools.length;
      const toolRadius = 120;
      currentSkillData.tools.forEach((toolName, toolIndex) => {
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
        const angle = (toolIndex * 2 * Math.PI) / toolCount;
        const offsetX = Math.cos(angle) * toolRadius;
        const offsetY = Math.sin(angle) * toolRadius;
        const toolElement = {
          id: `${toolTech.id}-${Date.now()}-${toolIndex}`,
          type: "technology",
          technology: toolTech,
          position: { x: 100 + offsetX, y: 100 + offsetY },
          size: { width: 100, height: 35 },
          completed: false,
          isTool: true,
          parentSkillId: newElement.id,
        };
        toolElements.push(toolElement);
        toolConnectors.push({
          id: `connector-${newElement.id}-${toolElement.id}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
          type: "connector",
          sourceId: newElement.id,
          targetId: toolElement.id,
        });
      });
    }

    // --- NEW: Enhanced connection logic to prevent redundant connections ---
    // Get the new skill's level
    let newSkillLevel = getNumericLevel(item.name);
    if (newSkillLevel === undefined) {
      newSkillLevel = levelToNumber(item.level);
    }

    // Build array of {el, level} for all skills on canvas
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
      if (skillLevels[i].level < newSkillLevel) predecessor = skillLevels[i];
      if (skillLevels[i].level > newSkillLevel && !successor)
        successor = skillLevels[i];
    }

    // Remove direct connector between predecessor and successor if it exists
    let elementsToAdd = [newElement, ...toolElements, ...toolConnectors];
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

    // Add connectors based on predecessor and successor
    if (predecessor) {
      let connectionType = undefined;
      if (Math.abs(newSkillLevel - predecessor.level) !== 1) {
        connectionType = "warning";
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
      }
      elementsToAdd.push({
        id: `connector-${newElement.id}-${successor.el.id}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        type: "connector",
        sourceId: newElement.id,
        targetId: successor.el.id,
        ...(connectionType ? { connectionType } : {}),
      });
    }

    // Add all elements at once
    if (elementsToAdd.length > 1) {
      if (typeof addMultipleElements === "function") {
        addMultipleElements(elementsToAdd);
      } else {
        elementsToAdd.forEach((el) => addElement(el));
      }
    } else {
      addElement(newElement);
    }
  };

  // Determine if a technology is added to the canvas (for any goal)
  const isAdded = (name) =>
    elements.some(
      (el) =>
        el.type === "skill" ||
        (el.type === "technology" && el.technology.name === name)
    ) ||
    (completedTechnologies && completedTechnologies.includes(name));

  // Determine if a technology is completed in the canvas (for any goal)
  const isCompleted = (name) =>
    completedTechnologies && completedTechnologies.includes(name);

  // Emoji/logo mapping for skills and tools
  const emojiMap = {
    // Skills
    Internet: "🌐",
    HTML: "🌐",
    CSS: "🎨",
    JavaScript: "⚡",
    Git: "📝",
    "VCS Hosting": "🔗",
    "Package Manager": "📦",
    TailwindCSS: "💨",
    "Pick a Framework": "🧩",
    "CSS Preprocessors": "🧵",
    "Linters & Formatters": "🧹",
    "Module Bundlers": "📦",
    Vitest: "🔬",
    "Authentication Strategies": "🔒",
    "Web Security Basics": "🛡️",
    Typescript: "📘",
    SSR: "🔄",
    "API Design": "🔗",
    GraphQL: "🔍",
    "Mobile Apps": "📱",
    Intranet: "🏢",
    "Core Languages": "💻",
    "Advanced Languages": "💻",
    "JS & Python Frameworks": "🐍",
    "Java & PHP Frameworks": "☕",
    Databases: "🗄️",
    Authentication: "🔑",
    Caching: "🗃️",
    "Web Security": "🛡️",
    Testing: "🧪",
    "Architectural Patterns": "🏗️",
    Architecture: "🏛️",
    Containerization: "📦",
    Kafka: "🦒",
    ElasticSearch: "🔎",
    Apache: "🦅",
    WebSockets: "🔌",
    "NoSQL Databases": "📚",
    // Tools
    Github: "🐙",
    GitLab: "🦊",
    BitBucket: "🪣",
    npm: "📦",
    pnpm: "📦",
    yarn: "🧶",
    Prettier: "🎨",
    ESLint: "🧹",
    Vite: "⚡",
    ESBuild: "🏗️",
    REST: "🔗",
    JWT: "🔑",
    OAuth: "🔐",
    "Basic Authentication": "🔑",
    "Token Authentication": "🔑",
    CORS: "🌍",
    HTTPS: "🔒",
    MD5: "🔢",
    SHA: "🔢",
    Docker: "🐳",
    Kubernetes: "☸️",
    AWS: "☁️",
    CI: "🔁",
    "CI/CD": "🔁",
    Redis: "🔴",
    PostgreSQL: "🐘",
    MySQL: "🐬",
    MariaDB: "🐬",
    SQLite: "💾",
    Oracle: "🦉",
    Firebase: "🔥",
    Cassandra: "🌿",
    ElasticSearch: "🔎",
    React: "⚛️",
    "Vue.js": "✌️",
    Angular: "🅰️",
    Svelte: "🧡",
    SolidJS: "🪨",
    NextJS: "▶️",
    Astro: "✨",
    Flutter: "🦋",
    "React Native": "📱",
    // Data Analyst
    "Excel & Spreadsheets": "📊",
    "Statistics & Probability": "📈",
    SQL: "🗄️",
    "Data Visualization": "📊",
    Python: "🐍",
    R: "📘",
    "Data Cleaning": "🧹",
    "Business Intelligence": "💼",
    Reporting: "📝",
    "Data Storytelling": "📖",
    "A/B Testing": "🔬",
    "Predictive Analytics": "🔮",
    "Version Control": "📝",
    "Big Data Basics": "🗃️",
    // Data Analyst Tools
    Tableau: "📊",
    "Power BI": "⚡",
    Looker: "👀",
    Hadoop: "🐘",
    Spark: "✨",
    // Data Scientist
    "Math Fundamentals": "📐",
    "Programming Languages": "💻",
    "Data Manipulation": "🧬",
    "Data Visualization": "📊",
    "Data Management": "🗄️",
    "Data Sanitization": "🧹",
    "ML Basics": "🤖",
    "Model Evaluation": "📏",
    "Supervised Learning": "🧑‍🏫",
    "Unsupervised Learning": "🧩",
    NLP: "🗣️",
    "Deep Learning": "🧠",
    "Big Data": "🗃️",
    Deployment: "🚀",
    Storytelling: "📖",
    // Data Scientist Tools
    Algebra: "➗",
    Calculus: "∫",
    Statistics: "📈",
    Python: "🐍",
    R: "📘",
    Pandas: "🐼",
    NumPy: "🔢",
    dplyr: "🛠️",
    Matplotlib: "📉",
    Seaborn: "🌊",
    Plotly: "📈",
    SQL: "🗄️",
    MongoDB: "🍃",
    OpenRefine: "🧽",
    "Scikit-learn": "🔬",
    "Cross Validation": "✅",
    GridSearch: "🔎",
    "ROC-AUC": "📊",
    "Linear Regression": "📈",
    "Decision Trees": "🌳",
    "Random Forest": "🌲",
    "K-Means": "🎯",
    PCA: "📉",
    "Hierarchical Clustering": "🗂️",
    NLTK: "📚",
    spaCy: "🧠",
    TensorFlow: "🔶",
    Keras: "🧬",
    PyTorch: "🔥",
    Hadoop: "🐘",
    Spark: "✨",
    Flask: "🍶",
    FastAPI: "⚡",
    Docker: "🐳",
    Git: "📝",
    GitHub: "🐙",
    PowerPoint: "📊",
    Dash: "📊",
    Streamlit: "💻",
    // ... add more as needed
  };
  const getEmoji = (item) => {
    return emojiMap[item.name] || (selectedType === "skills" ? "💡" : "🛠️");
  };

  // Drag and drop: send a full technology object
  const handleDragStart = (e, item) => {
    // Try to find a matching technology in roadmapData.technologies
    const tech = roadmapData.technologies?.find(
      (t) => t.name.toLowerCase() === item.name.toLowerCase()
    ) || {
      id: item.name.toLowerCase().replace(/\s+/g, "-"),
      name: item.name,
      category: selectedType,
      level:
        typeof item.level === "number"
          ? item.level === 1
            ? "beginner"
            : item.level === 2
              ? "intermediate"
              : "advanced"
          : item.level || "beginner",
      prerequisites: [],
      nextSteps: [],
      description: `${selectedType === "skills" ? "Skill" : "Tool"}: ${item.name}`,
      popularity: 50,
    };
    e.dataTransfer.setData("application/json", JSON.stringify(tech));
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
  };

  // Touch-based drag and drop for mobile/tablet
  const handleTouchStart = (e, item) => {
    // Only handle single touch for dragging
    if (e.touches.length !== 1) return;

    // Prevent default to avoid scrolling
    e.preventDefault();
    e.stopPropagation();

    // Try to find a matching technology in roadmapData.technologies
    const tech = roadmapData.technologies?.find(
      (t) => t.name.toLowerCase() === item.name.toLowerCase()
    ) || {
      id: item.name.toLowerCase().replace(/\s+/g, "-"),
      name: item.name,
      category: selectedType,
      level:
        typeof item.level === "number"
          ? item.level === 1
            ? "beginner"
            : item.level === 2
              ? "intermediate"
              : "advanced"
          : item.level || "beginner",
      prerequisites: [],
      nextSteps: [],
      description: `${selectedType === "skills" ? "Skill" : "Tool"}: ${item.name}`,
      popularity: 50,
    };

    // Store the technology data in a custom event that can be accessed globally
    window.sidebarDragData = {
      technology: tech,
      touchStartTime: Date.now(),
      touchStartPos: { x: e.touches[0].clientX, y: e.touches[0].clientY },
    };

    // Add visual feedback
    e.currentTarget.style.opacity = "0.7";
    e.currentTarget.style.transform = "scale(0.95)";
  };

  const handleTouchMove = (e) => {
    // This will be handled by the canvas
  };

  const handleTouchEnd = (e) => {
    // Remove visual feedback
    const target = e.currentTarget;
    if (target) {
      target.style.opacity = "";
      target.style.transform = "";
    }

    // Clear the drag data after a short delay to allow the canvas to process it
    setTimeout(() => {
      window.sidebarDragData = null;
    }, 100);
  };

  // Split items into completed and not completed for the current goal/type
  const completedItems = items.filter((item) => isCompleted(item.name));
  const incompleteItems = items.filter((item) => !isCompleted(item.name));

  return (
    <aside
      className={`fixed right-0 top-0 z-40 h-screen w-[330px] max-w-full border-l border-gray-200 bg-white shadow-md transition-transform duration-300 ease-in-out flex flex-col ${
        showSidebar ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ paddingTop: "60px" }}
    >
      {/* Header with toggle button */}
      <header
        className={`${montserrat.className} border-b border-gray-200 p-4 bg-white flex-shrink-0 flex items-center justify-between`}
      >
        <h2 className="text-lg font-bold capitalize text-gray-800">
          {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
        </h2>
        <button
          onClick={() => {
            const newType = selectedType === "skills" ? "tools" : "skills";
            setSelectedType(newType);
            setSelectedGoal(roadmapData.categories[newType][0]?.goal || "");
          }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium capitalize bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200"
        >
          <span className="text-xs">
            {selectedType === "skills" ? "🛠️" : "💡"}
          </span>
          {selectedType === "skills" ? "Tools" : "Skills"}
        </button>
      </header>

      {/* Goal selector */}
      <nav
        className="flex gap-2 px-4 pt-2 pb-2 text-sm bg-white overflow-x-auto select-none flex-nowrap flex-shrink-0
    [scrollbar-width:thin] [scrollbar-color:#d1d5db_#f9fafb]
    [&::-webkit-scrollbar]:h-0.5
    [&::-webkit-scrollbar]:rounded-full
    [&::-webkit-scrollbar]:bg-gray-50
    [&::-webkit-scrollbar-thumb]:bg-gray-300
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:hover:bg-gray-400"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {goals.map((goal) => (
          <button
            key={goal}
            onClick={() => setSelectedGoal(goal)}
            className={`rounded px-3 py-1.5 font-medium capitalize hover:bg-gray-50 whitespace-nowrap ${
              selectedGoal === goal
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600"
            }`}
          >
            {goal}
          </button>
        ))}
      </nav>

      {/* Search bar */}
      <div className="relative mb-4 px-4 bg-white pt-4 flex-shrink-0">
        <Search
          size={16}
          className="absolute left-7 top-8 -translate-y-1/2 text-gray-400"
        />
        <input
          ref={searchInputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${selectedType}…`}
          className="w-full rounded-lg border text-sm border-gray-300 focus:border-gray-400 text-gray-800 py-1.5 pl-8 pr-10 focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setSearchQuery("");
              searchInputRef.current?.focus();
            }}
            className="absolute right-7 top-8 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded focus:outline-none"
            tabIndex={0}
          >
            {/* Simple X icon (SVG) */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 6L14 14M14 6L6 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 pt-0 pb-14">
        {/* Completed section */}
        {completedItems.length > 0 && (
          <div className="mb-6">
            <div className="text-green-700 mb-2 text-sm pl-1">Completed</div>
            <div className="grid grid-cols-2 gap-3 mb-2">
              {completedItems.map((item, idx) => (
                <div
                  key={item.name + "-completed-" + idx}
                  className={`group relative rounded-lg border-2 p-3 transition-all duration-200 select-none border-green-400 bg-green-100 text-green-800 opacity-100 cursor-not-allowed pointer-events-none`}
                >
                  <div className="mb-2 flex items-center justify-center text-2xl">
                    {getEmoji(item)}
                  </div>
                  <h3 className="truncate text-center text-sm font-medium text-green-800">
                    {item.name}
                  </h3>
                  {selectedType === "tools" && item.parentSkill && (
                    <span className="block text-xs text-gray-400 text-center mt-1">
                      {item.parentSkill}
                    </span>
                  )}
                  <CheckCircle
                    size={14}
                    className="absolute left-1 top-1 text-green-600"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Separator line if both completed and incomplete items exist */}
        {completedItems.length > 0 && incompleteItems.length > 0 && (
          <div className="w-full border-t border-gray-200 my-4" />
        )}
        {/* Incomplete section (as before) */}
        <div className="grid grid-cols-2 gap-3">
          {incompleteItems.map((item, idx) => {
            const added = isAdded(item.name);
            const isChildTool =
              selectedType === "tools" && childToolSet.has(item.name);
            const completed = false; // already filtered out
            // Disable drag if canvas is empty
            const dragDisabled = isCanvasEmpty || isChildTool || added;
            return (
              <div
                key={item.name + idx}
                draggable={!dragDisabled}
                onDragStart={
                  dragDisabled ? undefined : (e) => handleDragStart(e, item)
                }
                onTouchStart={
                  dragDisabled ? undefined : (e) => handleTouchStart(e, item)
                }
                onTouchMove={
                  dragDisabled ? undefined : (e) => handleTouchMove(e)
                }
                onTouchEnd={dragDisabled ? undefined : (e) => handleTouchEnd(e)}
                className={`group relative rounded-lg border-2 p-3 transition-all duration-200 select-none sidebar-item
                  ${
                    added
                      ? "border-green-200 bg-green-50 opacity-60 cursor-not-allowed pointer-events-none"
                      : isChildTool
                        ? "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed pointer-events-none"
                        : dragDisabled
                          ? "border-gray-200 bg-white opacity-60 cursor-not-allowed pointer-events-none"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md cursor-pointer"
                  }
                `}
              >
                <div className="mb-2 flex items-center justify-center text-2xl">
                  {getEmoji(item)}
                </div>
                <h3 className="truncate text-center text-sm font-medium text-gray-800">
                  {item.name}
                </h3>
                {selectedType === "tools" && item.parentSkill && (
                  <span className="block text-xs text-gray-400 text-center mt-1">
                    {item.parentSkill}
                  </span>
                )}
                {added && (
                  <CheckCircle
                    size={14}
                    className="absolute left-1 top-1 text-green-500"
                  />
                )}
                <Plus
                  size={12}
                  className="absolute bottom-1 right-1 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>
            );
          })}
        </div>
        {items.length === 0 && (
          <p className="py-8 text-center text-gray-500">
            No {selectedType} found for “{searchQuery}”
          </p>
        )}
      </div>
    </aside>
  );
}
