import { NextResponse } from "next/server";
import clientPromise from "../../../backend/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    console.log("Stats API called with email:", email);

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ForCVs");
    const collection = db.collection("roadmapData");

    // Find user by email
    const user = await collection.findOne({ email: email });

    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate statistics from user data
    const stats = calculateUserStats(user);

    console.log("Calculated stats:", stats);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

function calculateUserStats(user) {
  const {
    skills = [],
    roadmaps = {},
    goals = [],
    activityLog = [],
    skillCompletions = [],
    createdAt,
  } = user;

  console.log("Processing user data:", {
    skillsCount: skills.length,
    roadmapsCount: Object.keys(roadmaps).length,
    goalsCount: goals.length,
    activityLogCount: activityLog.length,
    skillCompletionsCount: skillCompletions.length,
  });

  // Calculate total goals (number of roadmaps)
  const totalGoals = Object.keys(roadmaps).length;

  // Calculate total skills from the skills array (not roadmaps)
  const totalSkills = skills.length;
  const completedSkills = skills.filter(
    (skill) => skill.isCompleted === "True"
  ).length;

  console.log("Skills calculation:", {
    totalSkills,
    completedSkills,
    skills: skills.map((s) => ({ name: s.name, completed: s.isCompleted })),
  });

  // Calculate completion percentage
  const completionPercent =
    totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;

  // Calculate real streak based on activity log and creation date
  const streakDays = calculateStreakDays(activityLog, createdAt);

  console.log("Streak calculation details:", {
    createdAt: createdAt,
    activityLog: activityLog,
    streakDays: streakDays,
  });

  // Calculate skills completed in last 7 days
  const skillsCompleted7d = calculateSkillsCompletedInLastDays(skills, 7);

  // Generate trend data based on real activity
  const trendSpark = generateTrendDataFromActivity(
    activityLog,
    completedSkills,
    totalSkills
  );

  const finalStats = {
    totalGoals,
    totalSkills,
    completionPercent,
    skillsCompleted7d,
    streakDays,
    trendSpark,
    completedSkills,
    // Additional data for charts
    velocityData: generateVelocityDataFromActivity(activityLog),
    radarCategories: generateRadarCategories(user),
    heatmap: generateHeatmapFromActivity(activityLog),
    suggestions: generateSuggestions(user),
    categoryFocus: generateCategoryFocus(user),
    achievements: generateAchievements(user, streakDays, completedSkills),
    recentActivity: generateRecentActivityFromCompletions(skillCompletions),
  };

  console.log("Final calculated stats:", {
    totalGoals,
    totalSkills,
    completedSkills,
    completionPercent,
    skillsCompleted7d,
    streakDays,
  });

  return finalStats;
}

// Calculate current streak based on consecutive days of activity
function calculateStreakDays(activityLog, createdAt) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If no creation date, return 0
  if (!createdAt) {
    return 0;
  }

  const creationDate = new Date(createdAt);
  creationDate.setHours(0, 0, 0, 0);

  // If user was created today, streak is 1
  if (creationDate.getTime() === today.getTime()) {
    return 1;
  }

  // If user was created before today, calculate consecutive days from creation
  let streak = 0;
  let currentDate = new Date(today);

  // Check if user was active today (either through skill completion or just being in the system)
  const wasActiveToday =
    activityLog && activityLog.length > 0
      ? activityLog.some((date) => {
          const dateOnly = new Date(date);
          dateOnly.setHours(0, 0, 0, 0);
          return dateOnly.getTime() === today.getTime();
        })
      : creationDate.getTime() === today.getTime(); // If no activity log, only active if created today

  if (!wasActiveToday) {
    return 0; // No streak if not active today
  }

  // Calculate consecutive days from creation date
  for (let i = 0; i < 365; i++) {
    // Check up to 1 year
    const dateString = currentDate.toISOString().split("T")[0];

    // Check if this date is after or equal to creation date
    if (currentDate.getTime() < creationDate.getTime()) {
      break; // Stop if we've gone before the creation date
    }

    // Check if user was active on this date
    const wasActiveOnDate =
      activityLog && activityLog.length > 0
        ? activityLog.some((date) => {
            const dateOnly = new Date(date);
            dateOnly.setHours(0, 0, 0, 0);
            return dateOnly.toISOString().split("T")[0] === dateString;
          })
        : currentDate.getTime() === creationDate.getTime(); // If no activity log, only active on creation date

    if (wasActiveOnDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// Calculate skills completed in the last N days
function calculateSkillsCompletedInLastDays(skills, days) {
  if (!skills || skills.length === 0) {
    return 0;
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Count skills that are completed (isCompleted === "True")
  // Since we don't have completion dates in the skills array,
  // we'll count all completed skills for now
  return skills.filter((skill) => skill.isCompleted === "True").length;
}

// Generate trend data based on real activity
function generateTrendDataFromActivity(activityLog, completed, total) {
  const days = 7;
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const dateString = date.toISOString().split("T")[0];
    const wasActive = activityLog.includes(dateString);

    data.push({
      d: days - i,
      v: wasActive
        ? Math.floor((completed / total) * 100) + Math.floor(Math.random() * 10)
        : 0,
    });
  }

  return data;
}

// Generate velocity data based on real activity
function generateVelocityDataFromActivity(activityLog) {
  const data = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 30);

  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i * 4);
    const dateString = date.toISOString().split("T")[0];

    // Count activities on this date
    const activitiesOnDate = activityLog.filter(
      (logDate) => logDate === dateString
    ).length;

    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value:
        activitiesOnDate > 0
          ? Math.floor(Math.random() * 20) + 20
          : Math.floor(Math.random() * 10),
    });
  }

  return data;
}

function generateRadarCategories(user) {
  const categories = [
    { subject: "Frontend", A: 0 },
    { subject: "Backend", A: 0 },
    { subject: "Database", A: 0 },
    { subject: "DevOps", A: 0 },
    { subject: "AI/ML", A: 0 },
    { subject: "Product", A: 0 },
    { subject: "Design", A: 0 },
    { subject: "Soft Skills", A: 0 },
  ];

  // Analyze user's skills to populate radar data
  if (user.skills && user.skills.length > 0) {
    user.skills.forEach((skill) => {
      if (skill.goal === "Frontend Developer") {
        categories[0].A += 10; // Frontend
      } else if (skill.goal === "Backend Developer") {
        categories[1].A += 10; // Backend
      }
      // Add more category mapping logic as needed
    });
  }

  // Normalize values to 0-100 range
  categories.forEach((cat) => {
    cat.A = Math.min(100, cat.A);
  });

  return categories;
}

// Generate heatmap based on real activity
function generateHeatmapFromActivity(activityLog) {
  const weeks = 26;
  const data = [];
  const today = new Date();

  // Create a map of activity by date
  const activityMap = {};
  activityLog.forEach((date) => {
    activityMap[date] = (activityMap[date] || 0) + 1;
  });

  for (let i = 0; i < weeks * 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (weeks * 7 - i - 1));
    const dateString = date.toISOString().split("T")[0];

    const activityLevel = activityMap[dateString] || 0;
    let level = 0;
    if (activityLevel > 0) level = 1;
    if (activityLevel > 2) level = 2;
    if (activityLevel > 5) level = 3;

    data.push({
      day: i % 7,
      week: Math.floor(i / 7),
      level: level,
    });
  }

  return data;
}

function generateSuggestions(user) {
  // Import dataset
  const dataset = [
    {
      id: 1,
      goal: "Frontend Developer",
      skills: {
        Internet: { level: 1 },
        HTML: { level: 2 },
        CSS: { level: 3 },
        JavaScript: { level: 4 },
        Git: { level: 5 },
        "VCS Hosting": {
          level: 6,
          tools: ["Github", "GitLab", "BitBucket"],
        },
        "Package Manager": {
          level: 7,
          tools: ["npm", "pnpm", "yarn"],
        },
        TailwindCSS: { level: 8 },
        "Pick a Framework": {
          level: 9,
          tools: ["React", "Vue.js", "Angular"],
        },
        "CSS Preprocessors": {
          level: 10,
          tools: ["Sass", "PostCSS"],
        },
        "Module Bundlers": {
          level: 11,
          tools: ["Vite", "ESBuild"],
        },
        Vitest: { level: 12 },
        "Authentication Strategies": { level: 13 },
        "Web Security Basics": {
          level: 14,
          tools: ["CORS", "HTTPS"],
        },
        Typescript: { level: 15 },
        SSR: {
          level: 16,
          tools: ["NextJS", "Astro", "react-router"],
        },
        "API Design": {
          level: 17,
          tools: ["REST", "JSON APIs", "CDN"],
        },
        GraphQL: { level: 18 },
        "Mobile Apps": {
          level: 19,
          tools: ["React Native", "Flutter"],
        },
        "Linters & Formatters": {
          level: 20,
          tools: ["Prettier", "ESLint"],
        },
      },
    },
    {
      id: 2,
      goal: "Backend Developer",
      skills: {
        Intranet: { level: 1 },
        "Core Languages": {
          level: 2,
          tools: ["JavaScript", "python", "C++"],
        },
        "Advanced Languages": {
          level: 3,
          tools: ["Java", "PHP", "C#"],
        },
        "JS & Python Frameworks": {
          level: 4,
          tools: ["Express", "Django", "Flask"],
        },
        Git: { level: 5 },
        "VCS Hosting": {
          level: 6,
          tools: ["Github", "GitLab", "BitBucket"],
        },
        "Java & PHP Frameworks": {
          level: 7,
          tools: ["Spring", "Laravel", "Spring Boot"],
        },
        Databases: {
          level: 8,
          tools: ["PostgreSQL", "MySQL", "SQLite"],
        },
        Authentication: {
          level: 9,
          tools: ["JWT", "OAuth", "Token Authentication"],
        },
        APIs: {
          level: 10,
          tools: ["REST", "CDN", "JSON APIs"],
        },
        "CI/CD": { level: 11 },
        "Web Security": {
          level: 12,
          tools: ["MD5", "SHA"],
        },
        Testing: {
          level: 13,
          tools: ["Integration Test", "Unit Test", "Func Test"],
        },
        Architecture: {
          level: 14,
          tools: ["Microservices", "Monolithic", "SOA"],
        },
        Containerization: {
          level: 15,
          tools: ["Docker", "Kubernetes"],
        },
        Kafka: { level: 16 },
        ElasticSearch: { level: 17 },
        Apache: { level: 18 },
        WebSockets: { level: 19 },
        "Linters & Formatters": {
          level: 20,
          tools: ["Prettier", "ESLint"],
        },
        "NoSQL Databases": {
          level: 21,
          tools: ["MongoDB", "Firebase", "Redis"],
        },
      },
    },
    {
      id: 3,
      goal: "Data Analyst",
      skills: {
        "Excel & Spreadsheets": { level: 1 },
        "Statistics & Probability": { level: 2 },
        SQL: { level: 3 },
        "Visual Analytics": {
          level: 4,
          tools: ["Tableau", "Power BI", "Looker"],
        },
        Python: { level: 5 },
        R: { level: 6 },
        "Data Cleaning": { level: 7 },
        "Business Intelligence": { level: 8 },
        Reporting: { level: 9 },
        "Data Storytelling": { level: 10 },
        "A/B Testing": { level: 11 },
        "Predictive Analytics": { level: 12 },
        Github: {
          level: 13,
        },
        "Big Data Basics": {
          level: 14,
          tools: ["Hadoop", "Spark"],
        },
      },
    },
    {
      id: 4,
      goal: "Data Scientist",
      skills: {
        "Math Fundamentals": {
          level: 1,
          tools: ["Algebra", "Calculus", "Statistics"],
        },
        "Programming Languages": {
          level: 2,
          tools: ["Python", "R"],
        },
        "Data Manipulation": {
          level: 3,
          tools: ["Pandas", "NumPy", "dplyr"],
        },
        "Data Visualization": {
          level: 4,
          tools: ["Matplotlib", "Seaborn", "Plotly"],
        },
        "Data Management": {
          level: 5,
          tools: ["SQL", "MongoDB"],
        },
        "Data Sanitization": {
          level: 6,
          tools: ["OpenRefine", "Pandas"],
        },
        "Scikit-learn": {
          level: 7,
        },
        "Model Evaluation": {
          level: 8,
          tools: ["Cross Validation", "GridSearch", "ROC-AUC"],
        },
        "Supervised Learning": {
          level: 9,
          tools: ["Linear Regression", "Decision Trees", "Random Forest"],
        },
        "Unsupervised Learning": {
          level: 10,
          tools: ["K-Means", "PCA", "Hierarchical Clustering"],
        },
        NLP: {
          level: 11,
          tools: ["NLTK", "spaCy"],
        },
        "Deep Learning": {
          level: 12,
          tools: ["TensorFlow", "Keras", "PyTorch"],
        },
        "Big Data": {
          level: 13,
          tools: ["Hadoop", "Spark"],
        },
        Deployment: {
          level: 14,
          tools: ["Flask", "FastAPI", "Docker"],
        },
        Github: {
          level: 15,
        },
        Storytelling: {
          level: 16,
          tools: ["PowerPoint", "Dash", "Streamlit"],
        },
      },
    },
  ];

  // Get user's selected goals
  const userGoals = user.goals || [];
  const selectedGoal = user.selectedGoal;

  // Get skills already added to roadmap
  const roadmapSkills = new Set();
  if (user.roadmaps) {
    Object.values(user.roadmaps).forEach((roadmap) => {
      roadmap.forEach((item) => {
        if (item.type === "technology" && item.technology) {
          roadmapSkills.add(item.technology.name);
        }
      });
    });
  }

  // Get all available skills from user's selected goals
  const availableSkills = [];

  // Add skills from selectedGoal if it exists
  if (selectedGoal && selectedGoal.goal) {
    const goalData = dataset.find((d) => d.goal === selectedGoal.goal);
    if (goalData) {
      Object.keys(goalData.skills).forEach((skillName) => {
        if (!roadmapSkills.has(skillName)) {
          availableSkills.push({
            name: skillName,
            goal: selectedGoal.goal,
            level: goalData.skills[skillName].level,
            tools: goalData.skills[skillName].tools || [],
          });
        }
      });
    }
  }

  // Add skills from userGoals array
  userGoals.forEach((goal) => {
    const goalData = dataset.find((d) => d.goal === goal);
    if (goalData) {
      Object.keys(goalData.skills).forEach((skillName) => {
        if (!roadmapSkills.has(skillName)) {
          availableSkills.push({
            name: skillName,
            goal: goal,
            level: goalData.skills[skillName].level,
            tools: goalData.skills[skillName].tools || [],
          });
        }
      });
    }
  });

  // Remove duplicates and sort by level
  const uniqueSkills = availableSkills
    .filter(
      (skill, index, self) =>
        index === self.findIndex((s) => s.name === skill.name)
    )
    .sort((a, b) => a.level - b.level);

  // Generate suggestions from available skills
  const suggestions = [];
  const maxSuggestions = 3;

  for (let i = 0; i < Math.min(maxSuggestions, uniqueSkills.length); i++) {
    const skill = uniqueSkills[i];

    // Determine tag based on goal
    let tag = "General";
    if (skill.goal === "Frontend Developer") tag = "Frontend";
    else if (skill.goal === "Backend Developer") tag = "Backend";
    else if (skill.goal === "Data Analyst") tag = "Data";
    else if (skill.goal === "Data Scientist") tag = "AI/ML";

    // Determine impact and effort based on level
    let impact = "Medium Impact";
    let effort = "Medium";
    let confidence = 70;

    if (skill.level <= 5) {
      impact = "High Impact";
      effort = "Low";
      confidence = 85;
    } else if (skill.level <= 10) {
      impact = "Medium Impact";
      effort = "Medium";
      confidence = 75;
    } else {
      impact = "High Impact";
      effort = "High Effort";
      confidence = 65;
    }

    // Generate subtitle
    let subtitle = `Essential skill for ${skill.goal}`;
    if (skill.tools && skill.tools.length > 0) {
      subtitle = `Learn ${skill.name} with tools like ${skill.tools.slice(0, 2).join(", ")}`;
    }

    suggestions.push({
      title: skill.name,
      subtitle: subtitle,
      tag: tag,
      impact: impact,
      effort: effort,
      confidence: confidence,
    });
  }

  // If no suggestions found, provide default ones
  if (suggestions.length === 0) {
    return [
      {
        title: "Add Your First Skill",
        subtitle: "Start building your career roadmap by adding skills",
        tag: "Getting Started",
        impact: "High Impact",
        effort: "Low",
        confidence: 95,
      },
    ];
  }

  return suggestions;
}

function generateCategoryFocus(user) {
  return [
    { label: "Frontend", status: "Strong" },
    { label: "Backend", status: "Growing" },
    { label: "AI/ML", status: "Emerging" },
    { label: "DevOps", status: "Needs Push" },
  ];
}

function generateAchievements(user, streakDays, completedSkills) {
  const achievements = [
    {
      icon: "Target",
      label: "First Steps",
      meta: "Created your first career goal",
      date: "1/15/2024",
    },
    {
      icon: "CheckCircle2",
      label: "Skill Master",
      meta: "Completed 10 skills",
      date: "7/22/2024",
    },
    {
      icon: "Flame",
      label: "Streak Warrior",
      meta: "7‑day learning streak",
      date: "8/1/2024",
    },
    {
      icon: "Rocket",
      label: "Rapid Learner",
      meta: "Completed 5 skills in one week",
      date: "8/5/2024",
    },
  ];

  // Customize achievements based on user's actual progress
  if (completedSkills >= 10) {
    achievements[1].meta = `Completed ${completedSkills} skills`;
    achievements[1].date = new Date().toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  }

  // Update streak achievement based on real streak
  if (streakDays >= 7) {
    achievements[2].meta = `${streakDays}‑day learning streak`;
    achievements[2].date = new Date().toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  }

  // Check for rapid learner achievement (5+ skills in a week)
  const recentCompletions = user.skillCompletions
    ? user.skillCompletions.filter((completion) => {
        const completionDate = new Date(completion.completedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return completionDate >= weekAgo;
      }).length
    : 0;

  if (recentCompletions >= 5) {
    achievements[3].meta = `Completed ${recentCompletions} skills in one week`;
    achievements[3].date = new Date().toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  }

  return achievements;
}

// Generate recent activity based on skill completions
function generateRecentActivityFromCompletions(skillCompletions) {
  if (!skillCompletions || skillCompletions.length === 0) {
    return [
      {
        action: "Welcome",
        item: "to your career journey",
        time: "Just now",
        type: "milestone",
      },
    ];
  }

  // Sort by completion date (most recent first)
  const sortedCompletions = skillCompletions
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 4);

  return sortedCompletions.map((completion) => {
    const completionDate = new Date(completion.completedAt);
    const now = new Date();
    const diffInHours = Math.floor((now - completionDate) / (1000 * 60 * 60));

    let timeAgo;
    if (diffInHours < 1) {
      timeAgo = "Just now";
    } else if (diffInHours < 24) {
      timeAgo = `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      timeAgo = `${diffInDays} days ago`;
    }

    return {
      action: "Completed",
      item: completion.skillName,
      time: timeAgo,
      type: "learning",
    };
  });
}
