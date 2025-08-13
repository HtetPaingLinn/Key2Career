"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400"] });
import {
  Flame,
  Target,
  CalendarDays,
  CheckCircle2,
  LineChart as LineChartIcon,
  Wand2,
  BrainCircuit,
  BarChart3,
  Rocket,
  ArrowLeft,
  Loader2,
} from "lucide-react";

function Card({ className = "", children }) {
  return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>;
}

function StatCard({ icon: Icon, title, value, children }) {
  return (
    <Card className="flex flex-col gap-3 min-h-32">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm opacity-80">
          <Icon size={18} className="text-sky-400" />
          <span>{title}</span>
        </div>
        <LineChartIcon size={16} className="opacity-60" />
      </div>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
      <div className="h-[32px]">{children}</div>
    </Card>
  );
}

function Sparkline({ data, color = "#22c55e" }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ProgressDonut({ percent }) {
  const chartData = [
    { name: "complete", value: percent },
    { name: "rest", value: 100 - percent },
  ];
  return (
    <div className="relative h-40 w-40">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="80%"
          outerRadius="100%"
          data={chartData}
          startAngle={90}
          endAngle={-270}
        >
          <defs>
            <linearGradient id="donutGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <RadialBar
            dataKey="value"
            cornerRadius={6}
            fill="url(#donutGradient)"
            background
            clockWise
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center text-center">
        <div>
          <div className="text-md font-semibold">{percent}%</div>
          <div className="text-xs opacity-70">complete</div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {subtitle ? <p className="text-sm opacity-70">{subtitle}</p> : null}
      </div>
      {right}
    </div>
  );
}

export default function StatsPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  const loadingSteps = [
    "Authenticating user...",
    "Loading career data...",
    "Analyzing progress...",
    "Generating insights...",
    "Preparing visualizations...",
    "Ready!",
  ];

  useEffect(() => {
    // Only run on client
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("userEmail");
      if (!email) {
        router.replace("/enter-email");
        return;
      }

      // Fetch user data from API
      const fetchUserData = async () => {
        try {
          setLoadingStep(1);
          const response = await fetch(
            `/api/stats?email=${encodeURIComponent(email)}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }

          const data = await response.json();
          setUserData(data);
          setLoadingStep(5);
          setTimeout(() => setChecking(false), 500);
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError(err.message);
          setLoadingStep(5);
          setTimeout(() => setChecking(false), 500);
        }
      };

      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 50);

      // Update loading step based on progress
      const stepInterval = setInterval(() => {
        setLoadingStep((prev) => {
          const progress = loadingProgress;
          if (progress < 20) return 0;
          if (progress < 40) return 1;
          if (progress < 60) return 2;
          if (progress < 80) return 3;
          if (progress < 100) return 4;
          return 5;
        });
      }, 100);

      // Start fetching data after initial loading
      setTimeout(() => {
        fetchUserData();
      }, 1000);

      return () => {
        clearInterval(progressInterval);
        clearInterval(stepInterval);
      };
    }
  }, [router, loadingProgress]);

  if (checking) {
    return (
      <div className={`relative min-h-[100dvh] ${montserrat.className}`}>
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(35rem_35rem_at_20%_10%,rgba(99,102,241,0.25),transparent_40%),radial-gradient(45rem_45rem_at_80%_20%,rgba(16,185,129,0.25),transparent_40%),linear-gradient(120deg,rgba(59,130,246,0.1),transparent)]" />
        </div>

        <div className="flex items-center justify-center min-h-[100dvh]">
          <div className="glass rounded-xl p-6 flex flex-col items-center gap-5 max-w-sm w-full mx-4 min-h-[320px] justify-center">
            {/* Professional header */}
            <div className="text-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                Career Roadmap Analytics
              </h2>
            </div>

            {/* Compact progress indicator */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-700 font-medium">
                      Processing Data
                    </span>
                    <span className="text-sky-600 font-semibold">
                      {loadingProgress}%
                    </span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>

            {/* Current step with motivational message */}
            <div className="text-center space-y-2 min-h-[60px] flex flex-col justify-center">
              <div className="text-sm font-medium text-sky-600">
                {loadingSteps[loadingStep]}
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                {loadingStep < 5
                  ? "Analyzing your career trajectory and identifying growth opportunities..."
                  : "Your personalized roadmap is ready"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if data fetching failed
  if (error) {
    return (
      <div className={`relative min-h-[100dvh] ${montserrat.className}`}>
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(35rem_35rem_at_20%_10%,rgba(99,102,241,0.15),transparent_40%),radial-gradient(45rem_45rem_at_80%_20%,rgba(16,185,129,0.15),transparent_40%),linear-gradient(120deg,rgba(255,255,255,0.05),transparent)]" />
        </div>

        <div className="flex items-center justify-center min-h-[100dvh]">
          <div className="glass rounded-xl p-6 flex flex-col items-center gap-5 max-w-sm w-full mx-4 min-h-[200px] justify-center">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Error Loading Data
              </h2>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-400"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use real data or fallback to defaults
  const summary = userData
    ? {
        totalGoals: userData.totalGoals || 0,
        totalSkills: userData.totalSkills || 0,
        completionPercent: userData.completionPercent || 0,
        skillsCompleted7d: userData.skillsCompleted7d || 0,
        streakDays: userData.streakDays || 0,
      }
    : {
        totalGoals: 0,
        totalSkills: 0,
        completionPercent: 0,
        skillsCompleted7d: 0,
        streakDays: 0,
      };

  const trendSpark = userData?.trendSpark || [
    { d: 1, v: 0 },
    { d: 2, v: 0 },
    { d: 3, v: 0 },
    { d: 4, v: 0 },
    { d: 5, v: 0 },
    { d: 6, v: 0 },
    { d: 7, v: 0 },
  ];

  const velocityData = userData?.velocityData || [];
  const radarCategories = userData?.radarCategories || [];
  const suggestions = userData?.suggestions || [];
  const categoryFocus = userData?.categoryFocus || [];
  const heatmap = userData?.heatmap || [];
  const achievements = userData?.achievements || [];
  const recentActivity = userData?.recentActivity || [];

  // Calculate goal performance from user data
  const goalPerformance = userData
    ? {
        name: "Career Goals",
        percent: userData.completionPercent || 0,
        skillsProgress: userData.completedSkills || 0,
        skillsTarget: userData.totalSkills || 0,
        status:
          userData.completionPercent >= 70
            ? "Excellent"
            : userData.completionPercent >= 40
              ? "Good"
              : "Needs Work",
        tag: "Technical",
        targetDate: "2024-12-31",
      }
    : {
        name: "Career Goals",
        percent: 0,
        skillsProgress: 0,
        skillsTarget: 0,
        status: "No Data",
        tag: "Technical",
        targetDate: "2024-12-31",
      };

  const handleBackToRoadmap = () => {
    router.push("/roadmap");
  };

  const gradientMap = {
    Completed:
      "bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600",
    "In Progress":
      "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500",
    Blocked: "bg-gradient-to-r from-rose-400 via-pink-500 to-red-500",
  };

  // Derived activity insights from the heatmap data
  const levelToValue = [0, 1, 2, 3];
  const totalActivity = heatmap.reduce(
    (sum, cell) => sum + levelToValue[cell.level],
    0
  );
  const averagePerDay = (totalActivity / heatmap.length).toFixed(1);

  const heatmapWeeks = 26;
  const weeklyScores = Array.from({ length: heatmapWeeks }, () => 0);
  for (const cell of heatmap) {
    weeklyScores[cell.week] += levelToValue[cell.level];
  }
  const bestWeekScore = Math.max(...weeklyScores);

  const totalsByDay = Array(7).fill(0);
  for (const cell of heatmap) {
    totalsByDay[cell.day] += levelToValue[cell.level];
  }
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const mostActiveDayIdx = totalsByDay.indexOf(Math.max(...totalsByDay));

  let currentStreakDays = 0;
  for (let i = heatmap.length - 1; i >= 0; i -= 1) {
    if (levelToValue[heatmap[i].level] > 0) currentStreakDays += 1;
    else break;
  }
  return (
    <div className={`relative min-h-[100dvh] ${montserrat.className}`}>
              {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(35rem_35rem_at_20%_10%,rgba(99,102,241,0.25),transparent_40%),radial-gradient(45rem_45rem_at_80%_20%,rgba(16,185,129,0.25),transparent_40%),linear-gradient(120deg,rgba(59,130,246,0.1),transparent)]" />
        </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToRoadmap}
              className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Back to Roadmap"
            >
              <ArrowLeft size={16} />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h1 className="text-xl font-semibold">
              Interactive Career Roadmap • Statistics
            </h1>
            <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400 ring-1 ring-inset ring-sky-500/20">
              AI‑Powered
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="glass rounded-full p-1">
              <div className="flex items-center gap-1">
                {["7D", "30D", "90D", "All"].map((label, idx) => (
                  <button
                    key={label}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${idx === 0 ? "bg-white/20" : "hover:bg-white/10"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button className="glass rounded-full px-3 py-2 text-sm">
              Export
            </button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            icon={Target}
            title="Total Goals"
            value={summary.totalGoals}
          >
            <Sparkline data={trendSpark} color="#38bdf8" />
          </StatCard>
          <StatCard
            icon={CheckCircle2}
            title="Total Skills"
            value={summary.totalSkills}
          >
            <Sparkline data={trendSpark} color="#22c55e" />
          </StatCard>
          <StatCard
            icon={BarChart3}
            title="Overall Completion"
            value={`${summary.completionPercent}%`}
          >
            <Sparkline data={trendSpark} color="#a78bfa" />
          </StatCard>
          <StatCard
            icon={CalendarDays}
            title="Skills Completed"
            value={summary.skillsCompleted7d}
          >
            <Sparkline data={trendSpark} color="#f59e0b" />
          </StatCard>
          <StatCard
            icon={Flame}
            title="Current Streak"
            value={`${summary.streakDays} days`}
          >
            <Sparkline data={trendSpark} color="#fb7185" />
          </StatCard>
        </div>

        {/* Breakdown + Goal performance */}
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <SectionHeader title="Completion Breakdown" />
            <div className="space-y-3">
              {[
                {
                  label: "Completed",
                  color: "bg-emerald-500",
                  value: userData?.completedSkills || 0,
                  total: userData?.totalSkills || 0,
                },
                {
                  label: "In Progress",
                  color: "bg-amber-500",
                  value: userData
                    ? userData.totalSkills - userData.completedSkills
                    : 0,
                  total: userData?.totalSkills || 0,
                },
                {
                  label: "Blocked",
                  color: "bg-rose-500",
                  value: 0, // No blocked skills in current data structure
                  total: userData?.totalSkills || 0,
                },
              ].map((b) => (
                <div key={b.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="opacity-80">{b.label}</span>
                    <span className="opacity-60">
                      {b.value} / {b.total} (
                      {Math.round((b.value / b.total) * 100)}%)
                    </span>
                  </div>
                  <div className="relative h-3 w-full overflow-hidden rounded-full glass-rail">
                    <div
                      className={`h-full rounded-full ${
                        b.label === "Completed"
                          ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                          : b.label === "In Progress"
                            ? "bg-gradient-to-r from-amber-400 to-amber-600"
                            : "bg-gradient-to-r from-rose-400 to-rose-600"
                      }`}
                      style={{ width: `${(b.value / b.total) * 100}%` }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.3),rgba(255,255,255,0.1))]" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionHeader title="Goal Performance" />
            <div className="flex items-center gap-4">
              <ProgressDonut percent={goalPerformance.percent} />
              <div className="min-w-0 w-full">
                <div className="flex w-full items-center gap-2 text-xs opacity-80 flex-wrap sm:flex-nowrap">
                  <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/20 leading-none">
                    {goalPerformance.tag}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 ring-1 ring-inset ring-amber-500/20 leading-none">
                    {goalPerformance.status}
                  </span>
                  <button className="ml-auto inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/15 hover:bg-white/20">
                    Details
                  </button>
                </div>
                <h4 className="mt-1 text-lg font-semibold leading-tight">
                  {goalPerformance.name}
                </h4>
                <div className="mt-2 text-sm opacity-90">
                  <div className="mb-1 flex items-center justify-between">
                    <span>Skills Progress</span>
                    <span>
                      {goalPerformance.skillsProgress}/
                      {goalPerformance.skillsTarget}
                    </span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full glass-rail">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400"
                      style={{
                        width: `${(goalPerformance.skillsProgress / goalPerformance.skillsTarget) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 text-xs opacity-70">
                    Target: {goalPerformance.targetDate}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Middle charts */}
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <SectionHeader title="Category Strengths" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarCategories} outerRadius={90}>
                  <PolarGrid stroke="rgba(0,0,0,0.15)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#1f2937", fontSize: 12, fontWeight: 500 }}
                  />
                  <Radar
                    name="You"
                    dataKey="A"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <SectionHeader
              title="Progress Velocity"
              right={<span className="text-xs opacity-70">30‑day trend</span>}
            />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={velocityData}>
                  <defs>
                    <linearGradient
                      id="velocityFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5} />
                      <stop
                        offset="95%"
                        stopColor="#22c55e"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.1)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255,255,255,0.95)",
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: 12,
                      color: "#1f2937",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    labelStyle={{ color: "#1f2937", fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    fill="url(#velocityFill)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Activity + Suggestions */}
        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3 items-start">
          <Card className="xl:col-span-2">
            <SectionHeader title="Activity Heatmap" subtitle="Last 6 months" />
            <div
              className="grid grid-cols-[repeat(26,1fr)] gap-1 overflow-auto pr-2"
              style={{ gridAutoRows: 12 }}
            >
              {heatmap.map((cell, idx) => (
                <div
                  key={idx}
                  className={`h-3 w-3 rounded-sm ${
                    [
                      "bg-emerald-900/20",
                      "bg-emerald-600/40",
                      "bg-emerald-500/70",
                      "bg-emerald-400",
                    ][cell.level]
                  }`}
                  title={`Day ${cell.day + 1}, Week ${cell.week + 1}`}
                  style={{ gridColumn: cell.week + 1, gridRow: cell.day + 1 }}
                />
              ))}
            </div>
            {/* Legend and insights to utilize vertical space */}
            <div className="mt-3 flex items-center gap-2 text-xs opacity-70">
              <span>Less</span>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-sm bg-emerald-900/20" />
                <span className="h-3 w-3 rounded-sm bg-emerald-600/40" />
                <span className="h-3 w-3 rounded-sm bg-emerald-500/70" />
                <span className="h-3 w-3 rounded-sm bg-emerald-400" />
              </div>
              <span>More</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <div className="glass rounded-lg p-2">
                <div className="opacity-70">Current Streak</div>
                <div className="mt-0.5 text-sm font-semibold">
                  {currentStreakDays} days
                </div>
              </div>
              <div className="glass rounded-lg p-2">
                <div className="opacity-70">Best Week</div>
                <div className="mt-0.5 text-sm font-semibold">
                  {bestWeekScore} pts
                </div>
              </div>
              <div className="glass rounded-lg p-2">
                <div className="opacity-70">Avg / Day</div>
                <div className="mt-0.5 text-sm font-semibold">
                  {averagePerDay}
                </div>
              </div>
              <div className="glass rounded-lg p-2">
                <div className="opacity-70">Most Active</div>
                <div className="mt-0.5 text-sm font-semibold">
                  {dayNames[mostActiveDayIdx]}
                </div>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="mt-4">
              <div className="mb-3 text-sm font-medium opacity-90">
                Recent Activity
              </div>
              <div className="space-y-2">
                {recentActivity.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5 transition-colors"
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        activity.type === "learning"
                          ? "bg-blue-500/20 text-blue-300"
                          : activity.type === "skill"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : activity.type === "project"
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {activity.type === "learning"
                        ? "📚"
                        : activity.type === "skill"
                          ? "⚡"
                          : activity.type === "project"
                            ? "💼"
                            : "🏆"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">
                        {activity.action}{" "}
                        <span className="opacity-70">{activity.item}</span>
                      </div>
                      <div className="text-xs opacity-60">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <SectionHeader
              title="Smart Suggestions"
              right={
                <span className="flex items-center gap-1 text-xs text-sky-300">
                  <Wand2 size={14} /> AI‑Powered
                </span>
              }
            />
            <div className="space-y-3">
              {suggestions.map((s) => (
                <div key={s.title} className="glass rounded-xl p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="truncate text-sm font-medium">
                          {s.title}
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <div className="text-xs text-emerald-300">
                            Confidence {s.confidence}%
                          </div>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs opacity-80 flex-nowrap whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-white/80 ring-1 ring-inset ring-white/15 leading-none">
                          {s.tag}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-300 ring-1 ring-inset ring-emerald-500/20 leading-none">
                          {s.impact}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-300 ring-1 ring-inset ring-amber-500/20 leading-none">
                          {s.effort}
                        </span>
                      </div>
                      <div className="mt-3 text-xs opacity-70 line-clamp-2">
                        {s.subtitle}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 glass rounded-xl p-3 text-sm">
              <div className="font-medium">Category Focus</div>
              <div className="mt-2 space-y-2">
                {categoryFocus.map((c) => (
                  <div
                    key={c.label}
                    className="flex items-center justify-between"
                  >
                    <span>{c.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${
                        c.status === "Strong"
                          ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20"
                          : c.status === "Growing"
                            ? "bg-sky-500/10 text-sky-300 ring-sky-500/20"
                            : c.status === "Emerging"
                              ? "bg-indigo-500/10 text-indigo-300 ring-indigo-500/20"
                              : "bg-amber-500/10 text-amber-300 ring-amber-500/20"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Achievements + Motivation */}
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <SectionHeader title="Achievements" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {achievements.map((a, idx) => (
                <div
                  key={idx}
                  className="glass flex items-center gap-3 rounded-xl p-3"
                >
                  <div className="glass rounded-xl p-2">
                    {a.icon === "Target" && (
                      <Target size={20} className="text-sky-300" />
                    )}
                    {a.icon === "CheckCircle2" && (
                      <CheckCircle2 size={20} className="text-sky-300" />
                    )}
                    {a.icon === "Flame" && (
                      <Flame size={20} className="text-sky-300" />
                    )}
                    {a.icon === "Rocket" && (
                      <Rocket size={20} className="text-sky-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {a.label}
                    </div>
                    <div className="text-xs opacity-70">{a.meta}</div>
                  </div>
                  <div className="ml-auto text-xs opacity-60">{a.date}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <Flame className="text-amber-400" />
              <div className="text-3xl font-semibold">
                {summary.streakDays} Days
              </div>
              <div className="text-sm opacity-80">Learning Streak</div>
              <div className="mt-2 text-xs text-amber-200">Keep it up! +5</div>
            </div>
          </Card>
        </div>

        <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-purple-500/10 via-rose-500/10 to-orange-400/10 p-18 text-center sm:flex-row sm:text-left">
          <div className="max-w-3xl">
            <div className="text-lg font-semibold">
              "You're making incredible progress! Keep building those
              skills—every step forward is a step closer to your dream career."
            </div>
            <div className="text-sm opacity-80">
              You've completed{" "}
              <span className="font-semibold">
                {summary.skillsCompleted7d} skills
              </span>{" "}
              this week. That's{" "}
              <span className="font-semibold">
                {summary.completionPercent}%
              </span>{" "}
              of your total progress!
            </div>
          </div>
          <button className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-400">
            View Personalized Plan
          </button>
        </div>
      </div>
    </div>
  );
}
