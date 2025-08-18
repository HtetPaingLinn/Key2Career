"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { NavbarLogo, NavbarButton } from "@/components/ui/resizable-navbar";
import { useRouter } from "next/navigation";

export default function JobTrackerPage() {
  const router = useRouter();
  // Navbar state (align with Job Portal)
  const [dropdown, setDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileKey, setProfileKey] = useState(0);
  const dropdownRef = useRef(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailJob, setDetailJob] = useState(null);

  // Notifications dropdown state and real data (mirror Job Portal)
  const [notifOpen, setNotifOpen] = useState(false);
  const notifDropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [hasAcceptedOffer, setHasAcceptedOffer] = useState(false);

  // Placeholder SVG for organization logos
  const ORG_PLACEHOLDER_SVG =
    "data:image/svg+xml;utf8,\
<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'>\
  <rect fill='%23111827' rx='16' width='80' height='80'/>\
  <g fill='%23ffffff'>\
    <rect x='24' y='26' width='32' height='28' rx='2'/>\
    <rect x='30' y='32' width='6' height='16' rx='1'/>\
    <rect x='44' y='32' width='6' height='16' rx='1'/>\
    <rect x='26' y='56' width='28' height='4' rx='2'/>\
  </g>\
</svg>";

  function parseJwt(token) {
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
  useEffect(() => {
    setMounted(true);
  }, []);
  // Fetch notifications on mount and set up real-time updates
  useEffect(() => {
    if (mounted) {
      fetchNotifications();

      // Set up real-time updates every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);

      return () => clearInterval(interval);
    }
  }, [mounted]);

  // Refresh notifications when opening dropdown
  useEffect(() => {
    if (notifOpen && mounted) fetchNotifications();
  }, [notifOpen, mounted]);

  // On mount: fetch and log this user's job applications from MongoDB
  useEffect(() => {
    if (!mounted) return;

    try {
      const jwt =
        typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
      const u = parseJwt(jwt);
      const email = u?.sub || u?.email; // sub contains email per requirement
      if (!email) {
        console.log("No email found in JWT token");
        return;
      }

      const url = `/api/job-application?email=${encodeURIComponent(String(email).trim().toLowerCase())}`;
      fetch(url, { method: "GET", cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success) {
            // Fetch job details per application and populate stage columns
            const apps = Array.isArray(data.applications)
              ? data.applications
              : [];
            if (apps.length === 0) {
              return;
            }

            const normalizeStatus = (s) => {
              const v = String(s || "").toLowerCase();
              if (
                [
                  "applied",
                  "apply",
                  "submitted",
                  "pending",
                  "applied for",
                  "applied_for",
                ].includes(v)
              )
                return "submitted";
              if (
                [
                  "interview",
                  "screen",
                  "screening",
                  "interviewing",
                  "call for interview",
                ].includes(v)
              )
                return "interview";
              if (["offer", "offered"].includes(v)) return "offer";
              if (["accept", "accepted"].includes(v)) return "accepted";
              if (["reject", "rejected", "declined"].includes(v))
                return "rejected";
              return "submitted";
            };

            const tasks = apps
              .map((app) => ({ app, jobId: app?.jobId }))
              .filter((t) => !!t.jobId);

            const stageBuckets = {
              submitted: [],
              interview: [],
              offer: [],
              accepted: [],
              rejected: [],
            };

            const pick = (obj, keys) =>
              keys.find((k) => obj && obj[k] != null && obj[k] !== "")
                ? obj[keys.find((k) => obj && obj[k] != null && obj[k] !== "")]
                : undefined;

            Promise.allSettled(
              tasks.map(({ app, jobId }, idx) =>
                fetch(
                  `http://localhost:8080/api/jobs/getPost?obj_id=${encodeURIComponent(jobId)}`
                ).then((r) => {
                  if (r.ok) {
                    return r.json().then((job) => {
                      return { app, jobId, job };
                    });
                  } else if (r.status === 404) {
                    // Try to fetch from local jobPosts collection as fallback
                    return fetch(
                      `/api/job-details?jobId=${encodeURIComponent(jobId)}`
                    )
                      .then((localRes) => {
                        if (localRes.ok) {
                          return localRes.json().then((localJobData) => {
                            // Extract the job from the response structure
                            const localJob = localJobData.job || localJobData;
                            return { app, jobId, job: localJob };
                          });
                        } else {
                          return { app, jobId, job: null };
                        }
                      })
                      .catch((localError) => {
                        return { app, jobId, job: null };
                      });
                  } else {
                    return { app, jobId, job: null };
                  }
                })
              )
            )
              .then((results) => {
                results.forEach((res) => {
                  if (res.status !== "fulfilled") return;
                  const { app, jobId, job } = res.value || {};
                  const statusKey = normalizeStatus(
                    app?.status || app?.stage || app?.applicationStatus
                  );

                  const company =
                    pick(job, ["org_name", "company", "companyName"]) ||
                    pick(job?.company || {}, ["name"]) ||
                    pick(job?.org || {}, ["name"]) ||
                    "Unknown Company";
                  const position =
                    pick(job, ["job_title", "position", "title", "role"]) ||
                    "Unknown Role";
                  const appliedDate =
                    app?.createdAt ||
                    app?.appliedDate ||
                    new Date().toISOString().slice(0, 10);
                  const priority = app?.priority || "medium";

                  stageBuckets[statusKey] = [
                    ...stageBuckets[statusKey],
                    {
                      id: `${jobId}-${statusKey}`,
                      company,
                      position,
                      appliedDate,
                      priority,
                      jobId,
                      jobData: job,
                    },
                  ];
                });

                setJobs(stageBuckets);
              })
              .catch((e) => {
                console.warn("Failed to build job tracker columns:", e);
              });
          } else {
            console.warn(
              "Failed to fetch applications:",
              data?.error || "Unknown error"
            );
          }
        })
        .catch((err) => console.error("Error fetching applications:", err));
    } catch (e) {
      // silently ignore
    }
  }, [mounted]);
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdown(false);
      }
    }
    if (dropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdown]);

  // Fetch notifications from MongoDB
  const fetchNotifications = async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
      if (!token) {
        setNotifications([]);
        return;
      }

      const payload = parseJwt(token);
      const email = payload?.sub;
      if (!email) {
        setNotifications([]);
        return;
      }

      setNotificationsLoading(true);
      const res = await fetch(
        `/api/notifications?email=${encodeURIComponent(email)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        console.warn("Failed to fetch notifications");
        return;
      }

      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setHasAcceptedOffer(data.hasAcceptedOffer || false);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Handle notification actions (accept/decline/mark as read)
  const handleNotificationAction = async (notificationId, action) => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
      if (!token) return;

      if (action === "mark-as-read") {
        // For interview notifications, just remove from list
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        return;
      }

      // For offer notifications, update status in MongoDB
      if (action === "accept" || action === "decline") {
        const res = await fetch("/api/notifications", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            applicationId: notificationId,
            action: action,
          }),
        });

        if (res.ok) {
          // Remove the notification from the list
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notificationId)
          );
          console.log(`Application ${action}ed successfully`);

          // If user accepted an offer, refresh notifications to update UI
          if (action === "accept") {
            fetchNotifications();
          }
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.error(`Failed to ${action} application:`, errorData.error);

          // Show error message to user
          if (errorData.error && errorData.error.includes("already accepted")) {
            alert(
              "You have already accepted another job offer. You can only accept one offer at a time."
            );
          }
        }
      }
    } catch (error) {
      console.error("Error handling notification action:", error);
    }
  };

  // Close notifications dropdown on outside click
  useEffect(() => {
    function handleNotifOutside(event) {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target)
      ) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleNotifOutside);
    } else {
      document.removeEventListener("mousedown", handleNotifOutside);
    }
    return () => document.removeEventListener("mousedown", handleNotifOutside);
  }, [notifOpen]);

  let jwt = null;
  let user = null;
  if (typeof window !== "undefined") {
    jwt = localStorage.getItem("jwt");
    if (jwt) user = parseJwt(jwt);
  }
  const handleLogout = () => {
    localStorage.removeItem("jwt");
    setDropdown(false);
    setProfileKey((k) => k + 1);
    router.replace("/login?redirect=/job-portal/job-tracker");
  };

  // Sample job data with different stages
  const [jobs, setJobs] = useState({
    submitted: [],
    interview: [],
    offer: [],
    accepted: [],
    rejected: [],
  });

  // Modal state for quick add
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    company: "",
    position: "",
    priority: "medium",
    stage: "submitted",
  });
  const nextIdRef = useRef(1000);

  // LocalStorage load/persist removed to avoid placeholder/stale data

  const stages = [
    {
      key: "submitted",
      title: "Form Submitted/Pending",
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      key: "interview",
      title: "Call for Interview/Screening",
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
    },
    {
      key: "offer",
      title: "Offer Stage",
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      key: "accepted",
      title: "Accept Offer",
      color: "bg-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      key: "rejected",
      title: "Reject()",
      color: "bg-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
  ];

  // Drag-and-drop removed per request.

  const handleDelete = (stageKey, jobId) => {
    setJobs((prev) => ({
      ...prev,
      [stageKey]: prev[stageKey].filter((j) => j.id !== jobId),
    }));
  };

  const openAddModal = () => setShowAdd(true);
  const closeAddModal = () => setShowAdd(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleAdd = (e) => {
    e?.preventDefault?.();
    if (!form.company.trim() || !form.position.trim()) return;
    const newJob = {
      id: nextIdRef.current++,
      company: form.company.trim(),
      position: form.position.trim(),
      appliedDate: new Date().toISOString().slice(0, 10),
      priority: form.priority,
    };
    setJobs((prev) => ({
      ...prev,
      [form.stage]: [...prev[form.stage], newJob],
    }));
    setForm({
      company: "",
      position: "",
      priority: "medium",
      stage: "submitted",
    });
    setShowAdd(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const badgeForPriority = (p) => (
    <span
      className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${
        p === "high"
          ? "bg-red-50 text-red-700 border-red-200"
          : p === "medium"
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-emerald-50 text-emerald-700 border-emerald-200"
      }`}
    >
      {p}
    </span>
  );

  const initials = (name = "") =>
    name
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const JobCard = ({ job, stage }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -2 }}
      className={`group relative p-3 bg-white rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200/60 transition-all duration-200 ${getPriorityColor(job.priority)}`}
    >
      <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-indigo-500 via-sky-400 to-cyan-400" />
      <div className="flex items-start gap-3">
        <div className="grid place-items-center shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-sky-500 text-white text-[10px] font-semibold shadow-sm">
          {initials(job.company)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-[13px] text-slate-900 truncate">
              {job.company}
            </h4>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5 truncate">
            {job.position}
          </p>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
            <span>Applied: {formatDate(job.appliedDate)}</span>
            <div className="flex gap-1 transition-opacity opacity-0 group-hover:opacity-100">
              <button
                className="px-2 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-[10px] cursor-pointer"
                onClick={() => {
                  if (job?.jobData) {
                    setDetailJob(job.jobData);
                    setDetailOpen(true);
                  }
                }}
                title="View"
              >
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const JobDetailModal = ({ job, open, onClose }) => {
    useEffect(() => {
      const onKey = (e) => {
        if (e.key === "Escape") onClose?.();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);
    const [isFull, setIsFull] = useState(false);
    useEffect(() => {
      if (!open) setIsFull(false);
    }, [open]);
    if (!job) return null;

    const positionsText = `${Number.isFinite(Number(job.required_number)) ? Number(job.required_number) : 0} positions`;

    return (
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 pointer-events-auto">
            <motion.div
              onClick={onClose}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              layout
              className={`absolute inset-0 flex ${isFull ? "items-stretch justify-stretch p-0" : "items-end justify-center px-4 sm:px-6 pt-12 sm:pt-16"}`}
            >
              <motion.div
                layout
                role="dialog"
                aria-modal="true"
                className={`bg-white border border-black/[0.06] shadow-2xl overflow-hidden flex flex-col min-h-0`}
                initial={{ y: "100%", opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  borderTopLeftRadius: isFull ? 0 : 16,
                  borderTopRightRadius: isFull ? 0 : 16,
                }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 240,
                  damping: 28,
                  mass: 0.9,
                }}
                style={{
                  width: isFull ? "100vw" : "min(100%, 64rem)",
                  height: isFull ? "100vh" : "calc(100vh - 6rem)",
                }}
              >
                <motion.div className="p-6 sm:p-8" layout="position">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="overflow-hidden w-14 h-14 sm:w-16 sm:h-16 rounded-xl">
                      <img
                        src={
                          job.org_img ||
                          "https://via.placeholder.com/48?text=JB"
                        }
                        alt={job.org_name || "Organization"}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold text-gray-900 truncate sm:text-2xl">
                          {job.org_name || "Organization"}
                        </h2>
                        <span className="text-gray-300">•</span>
                        <p
                          className="text-sm text-gray-600 break-words sm:text-base"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {job.job_title || job.title || job.role || ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>{job.address}</span>
                        <span>·</span>
                        <span>
                          {job.posted_date
                            ? new Date(job.posted_date).toLocaleDateString()
                            : ""}
                        </span>
                        <span>·</span>
                        <span>{positionsText}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => setIsFull((f) => !f)}
                        aria-label={isFull ? "Exit full screen" : "Full screen"}
                        title={isFull ? "Exit full screen" : "Full screen"}
                        className="p-2 transition-colors rounded-full hover:bg-gray-100 active:bg-gray-200"
                      >
                        {isFull ? (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-gray-600"
                          >
                            <path
                              d="M9 3H5a2 2 0 0 0-2 2v4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M15 21h4a2 2 0 0 0 2-2v-4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M21 9V5a2 2 0 0 0-2-2h-4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M3 15v4a2 2 0 0 0 2 2h4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-gray-600"
                          >
                            <path
                              d="M3 9V5a2 2 0 0 1 2-2h4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M21 15v4a2 2 0 0 1-2 2h-4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M15 3h4a2 2 0 0 1 2 2v4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M9 21H5a2 2 0 0 1-2-2v-4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={onClose}
                        aria-label="Close"
                        title="Close"
                        className="p-2 transition-colors rounded-full hover:bg-gray-100 active:bg-gray-200"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-gray-500"
                        >
                          <path d="M18 6L6 18" />
                          <path d="M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* No Apply/Save buttons in this modal */}
                </motion.div>
                <div className="w-full h-px bg-gray-100" />
                <motion.div
                  layout="position"
                  className="flex-1 min-h-0 p-6 overflow-y-auto sm:p-8"
                  data-hide-scrollbar="true"
                  style={{
                    overflowY: "auto",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  <h3 className="text-2xl sm:text-[28px] font-semibold text-gray-900 mb-10">
                    About the job
                  </h3>
                  {(() => {
                    const arr = Array.isArray(job.responsibilities)
                      ? job.responsibilities
                      : Array.isArray(job.responsibility)
                        ? job.responsibility
                        : typeof job.responsibilities === "string"
                          ? [job.responsibilities]
                          : typeof job.responsibility === "string"
                            ? [job.responsibility]
                            : [];
                    return arr.length > 0 ? (
                      <div className="mb-6">
                        <h4 className="mb-2 font-semibold text-gray-900">
                          Responsibilities
                        </h4>
                        <ul className="pl-6 space-y-1 text-gray-700 list-disc">
                          {arr.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null;
                  })()}

                  {/* Working Type */}
                  {((job.workingType && job.workingType !== "[WorkingType]") ||
                    job.working_type) && (
                    <div className="mb-6">
                      <h4 className="mb-2 font-semibold text-gray-900">
                        Working type
                      </h4>
                      <ul className="pl-6 space-y-1 text-gray-700 list-disc">
                        <li>{job.workingType || job.working_type}</li>
                      </ul>
                    </div>
                  )}

                  {/* Job Level */}
                  {((job.jobLevel && job.jobLevel !== "[JobLevel]") ||
                    job.job_level) && (
                    <div className="mb-6">
                      <h4 className="mb-2 font-semibold text-gray-900">
                        Job level
                      </h4>
                      <ul className="pl-6 space-y-1 text-gray-700 list-disc">
                        <li>{job.jobLevel || job.job_level}</li>
                      </ul>
                    </div>
                  )}

                  {/* Working Hours */}
                  {(job.work_time || job.working_hours) && (
                    <div className="mb-6">
                      <h4 className="mb-2 font-semibold text-gray-900">
                        Working hours
                      </h4>
                      <ul className="pl-6 space-y-1 text-gray-700 list-disc">
                        <li>{job.work_time || job.working_hours}</li>
                      </ul>
                    </div>
                  )}
                  {Array.isArray(job.requirements) &&
                    job.requirements.length > 0 && (
                      <div className="mb-6">
                        <h4 className="mb-2 font-semibold text-gray-900">
                          Requirements
                        </h4>
                        <ul className="pl-6 space-y-1 text-gray-700 list-disc">
                          {job.requirements.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {Array.isArray(job.benefits) && job.benefits.length > 0 && (
                    <div className="mb-6">
                      <h4 className="mb-2 font-semibold text-gray-900">
                        Benefits
                      </h4>
                      <ul className="pl-6 space-y-1 text-gray-700 list-disc">
                        {job.benefits.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Required Skills */}
                  {Array.isArray(job.tech_skill) &&
                    job.tech_skill.length > 0 && (
                      <div className="mb-6">
                        <h4 className="mb-2 font-semibold text-gray-900">
                          Required skills
                        </h4>
                        <ul className="pl-6 space-y-1 text-gray-700 list-disc">
                          {job.tech_skill.map((skill, idx) => (
                            <li key={idx}>{skill}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Qualifications */}
                  {Array.isArray(job.qualification) &&
                    job.qualification.length > 0 && (
                      <div className="mb-6">
                        <h4 className="mb-2 font-semibold text-gray-900">
                          Qualifications
                        </h4>
                        {typeof job.qualification[0] === "string" ? (
                          <ul className="pl-6 space-y-1 text-gray-700 list-disc">
                            {job.qualification.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          job.qualification.map((q, idx) => (
                            <div key={idx} className="mb-3">
                              {Array.isArray(q.education) &&
                                q.education.length > 0 && (
                                  <>
                                    <p className="mb-1 font-medium text-gray-800">
                                      Education
                                    </p>
                                    <ul className="pl-6 space-y-1 text-gray-700 list-disc">
                                      {q.education.map((e, i) => (
                                        <li key={i}>{e}</li>
                                      ))}
                                    </ul>
                                  </>
                                )}
                              {Array.isArray(q.experience) &&
                                q.experience.length > 0 && (
                                  <>
                                    <p className="mt-2 mb-1 font-medium text-gray-800">
                                      Experience
                                    </p>
                                    <ul className="pl-6 space-y-1 text-gray-700 list-disc">
                                      {q.experience.map((e, i) => (
                                        <li key={i}>{e}</li>
                                      ))}
                                    </ul>
                                  </>
                                )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  {job.description && (
                    <div className="mb-6">
                      <h4 className="mb-2 font-semibold text-gray-900">
                        Description
                      </h4>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {job.description}
                      </p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  const StageColumn = ({ stage, stageJobs }) => (
    <div
      className={`flex-1 min-w-[240px] ${stage.bgColor} rounded-2xl p-3 border ${stage.key === "interview" ? "border-black" : `${stage.borderColor}/60`} transition-all duration-200`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`}></div>
          <h3 className="font-semibold text-slate-800 text-[15px] md:text-base">
            {stage.title}
          </h3>
        </div>
        <span className="bg-white px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-600 border border-slate-200/80 shadow-sm">
          {stageJobs.length}
        </span>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent mb-2.5" />

      <div className="space-y-2 min-h-[200px]">
        <AnimatePresence initial={false}>
          {stageJobs.map((job) => (
            <JobCard key={job.id} job={job} stage={stage.key} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  const totalApplications = Object.values(jobs).flat().length;
  const activeApplications =
    jobs.submitted.length + jobs.interview.length + jobs.offer.length;

  return (
    <>
      {/* Fixed navbar (consistent with Job Portal, without center search) */}
      <nav className="fixed top-0 left-0 z-50 flex items-center justify-between w-full px-4 py-4 border-b shadow-sm bg-white/90 backdrop-blur-xl border-slate-200/50 md:px-8">
        <div className="ml-4 md:ml-12">
          <NavbarLogo />
        </div>
        <div className="flex items-center gap-4 mr-4 md:mr-12">
          {mounted && jwt && user ? (
            <div
              className="relative order-first"
              ref={dropdownRef}
              key={profileKey}
            >
              <button
                className="flex items-center justify-center w-10 h-10 text-lg font-bold text-purple-800 bg-purple-200 rounded-full focus:outline-none"
                onClick={() => setDropdown((d) => !d)}
                aria-label="User menu"
              >
                {user.name ? (
                  user.name[0].toUpperCase()
                ) : (
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="8"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </button>
              {dropdown && (
                <div className="absolute right-0 z-50 w-56 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-semibold text-gray-900">
                      {user.name || user.username || user.email}
                    </div>
                  </div>
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => {
                      setDropdown(false);
                      router.push("/settings");
                    }}
                  >
                    Account Settings
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <NavbarButton variant="secondary" href="/login">
                Login
              </NavbarButton>
              <NavbarButton variant="primary" href="/signup">
                Sign up for free
              </NavbarButton>
            </>
          )}
          {/* Notifications bell (mirror Job Portal) */}
          <div className="relative" ref={notifDropdownRef}>
            {hasAcceptedOffer && (
              <div className="absolute z-10 w-3 h-3 bg-green-500 border-2 border-white rounded-full -top-1 -left-1"></div>
            )}
            <button
              className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full border transition-colors ${notifOpen ? "bg-slate-100 border-slate-300" : "bg-white border-slate-200 hover:bg-slate-50"}`}
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notifications"
            >
              {/* bell icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className={`w-5 h-5 ${notifOpen ? "text-indigo-600" : "text-slate-600"}`}
              >
                <path
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.73 21a2 2 0 0 1-3.46 0"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {notifications.length > 0 && (
                <span
                  suppressHydrationWarning
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-semibold"
                >
                  {notifications.length}
                </span>
              )}
            </button>
            {notifOpen && mounted && (
              <div className="absolute right-0 mt-3 w-[520px] max-w-[85vw] bg-white rounded-xl shadow-2xl border border-slate-200 z-50">
                <div className="flex items-center justify-between p-3 border-b border-slate-100">
                  <div className="text-sm font-semibold text-slate-800">
                    Notifications
                  </div>
                  {notifications.length > 0 && (
                    <button
                      className="text-xs text-slate-500 hover:text-slate-700"
                      onClick={() => setNotifications([])}
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {hasAcceptedOffer && (
                  <div className="p-3 border-b border-green-200 bg-green-50">
                    <div className="text-xs font-medium text-green-800">
                      You have accepted a job offer
                    </div>
                    <div className="text-xs text-green-600">
                      You can only accept one job. Other offers can
                      still be declined.
                    </div>
                  </div>
                )}
                <div
                  className="max-h-[360px] overflow-y-auto"
                  data-hide-scrollbar="true"
                >
                  {notificationsLoading ? (
                    <div className="p-6 text-sm text-center text-slate-500">
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-sm text-center text-slate-500">
                      No notifications
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {notifications.map((n) => (
                        <li
                          key={`notification-${n.id}`}
                          className="p-3 transition-colors hover:bg-slate-50/60"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 overflow-hidden rounded-lg bg-slate-100">
                              <img
                                src={n.orgImg || ORG_PLACEHOLDER_SVG}
                                alt={n.orgName}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium truncate text-slate-600">
                                {n.orgName || "[Org]"}
                              </div>
                              <div className="text-sm font-semibold truncate text-slate-900">
                                {n.jobTitle || "[Job Title]"}
                              </div>
                              {n.message && (
                                <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                  {n.message}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {n.type === "interview" && (
                                <button
                                  className="px-2.5 py-1.5 text-xs rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationAction(
                                      n.id,
                                      "mark-as-read"
                                    );
                                  }}
                                >
                                  Mark as read
                                </button>
                              )}
                              {n.type === "offer" && (
                                <>
                                  {n.canAccept ? (
                                    <button
                                      className="px-2.5 py-1.5 text-xs rounded-md bg-green-100 text-green-700 hover:bg-green-200"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleNotificationAction(
                                          n.id,
                                          "accept"
                                        );
                                      }}
                                    >
                                      Accept
                                    </button>
                                  ) : (
                                    <span className="px-2.5 py-1.5 text-xs rounded-md bg-gray-100 text-gray-500">
                                      Already accepted another offer
                                    </span>
                                  )}
                                  <button
                                    className="px-2.5 py-1.5 text-xs rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleNotificationAction(n.id, "decline");
                                    }}
                                  >
                                    Decline
                                  </button>
                                </>
                              )}
                              {n.type === "reject" && (
                                <button
                                  className="px-2.5 py-1.5 text-xs rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationAction(
                                      n.id,
                                      "mark-as-read"
                                    );
                                  }}
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Job Portal button with animated gradient border (to go back) */}
          <div className="hidden md:block rainbow-wrap">
            <Link
              href="/job-portal"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-zinc-700 text-sm font-medium hover:bg-slate-50 active:bg-slate-100 transition relative z-[1]"
            >
              <span>Job Portal</span>
            </Link>
          </div>
        </div>
      </nav>
      <style jsx global>{`
        .rainbow-wrap {
          position: relative;
          border-radius: 9999px;
          padding: 2px;
          isolation: isolate;
        }
        .rainbow-wrap::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: conic-gradient(
            from var(--angle),
            #4f46e5,
            #6366f1,
            #3b82f6,
            #22d3ee,
            #4f46e5
          );
          animation: spin-conic 4s linear infinite;
          z-index: 0;
        }
        .rainbow-wrap::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: conic-gradient(
            from var(--angle),
            #4f46e5cc,
            #6366f1cc,
            #3b82f6cc,
            #22d3eecc,
            #4f46e5cc
          );
          animation: spin-conic 4s linear infinite;
          filter: blur(8px);
          opacity: 0.65;
          z-index: -1;
        }
        @keyframes spin-conic {
          from {
            --angle: 0deg;
          }
          to {
            --angle: 360deg;
          }
        }
      `}</style>

      <main className="min-h-screen text-black bg-white pt-28">
        <div className="w-full px-4 mx-auto sm:px-6 lg:px-12">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Job Application Tracker
              </h1>
              <p className="text-gray-600">
                Track your job applications through each stage of the process
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-2xl border border-black/[0.06]">
                <div className="text-2xl font-bold">{totalApplications}</div>
                <div className="text-indigo-100">Total Applications</div>
              </div>
              <div className="bg-gradient-to-r from-indigo-400 to-indigo-500 text-white p-4 rounded-2xl border border-black/[0.06]">
                <div className="text-2xl font-bold">{activeApplications}</div>
                <div className="text-indigo-100">Active Applications</div>
              </div>
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 rounded-2xl border border-black/[0.06]">
                <div className="text-2xl font-bold">{jobs.accepted.length}</div>
                <div className="text-indigo-100">Offers Accepted</div>
              </div>
              <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white p-4 rounded-2xl border border-black/[0.06]">
                <div className="text-2xl font-bold">{jobs.rejected.length}</div>
                <div className="text-indigo-100">Applications Rejected</div>
              </div>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="flex gap-2 pb-6 overflow-x-auto md:gap-3">
            {stages.map((stage) => (
              <StageColumn
                key={stage.key}
                stage={stage}
                stageJobs={jobs[stage.key]}
              />
            ))}
          </div>

          {/* Job Detail Modal */}
          <JobDetailModal
            job={detailJob}
            open={detailOpen}
            onClose={() => setDetailOpen(false)}
          />

          {/* Add Application Modal */}
          {showAdd && (
            <div className="fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={closeAddModal}
              />
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl border border-black/[0.06] shadow-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Add Application
                    </h3>
                    <button
                      onClick={closeAddModal}
                      className="p-2 rounded hover:bg-gray-100"
                      aria-label="Close"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleAdd} className="grid gap-3">
                    <label className="grid gap-1">
                      <span className="text-sm font-medium text-gray-700">
                        Company
                      </span>
                      <input
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                        placeholder="Acme Inc"
                        required
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-sm font-medium text-gray-700">
                        Position
                      </span>
                      <input
                        name="position"
                        value={form.position}
                        onChange={handleChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                        placeholder="Frontend Engineer"
                        required
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="grid gap-1">
                        <span className="text-sm font-medium text-gray-700">
                          Priority
                        </span>
                        <select
                          name="priority"
                          value={form.priority}
                          onChange={handleChange}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-900"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </label>
                      <label className="grid gap-1">
                        <span className="text-sm font-medium text-gray-700">
                          Stage
                        </span>
                        <select
                          name="stage"
                          value={form.stage}
                          onChange={handleChange}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-900"
                        >
                          {stages.map((s) => (
                            <option key={s.key} value={s.key}>
                              {s.title}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={closeAddModal}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-indigo-700 text-white text-sm font-medium shadow-sm hover:bg-indigo-800 active:bg-indigo-900 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
