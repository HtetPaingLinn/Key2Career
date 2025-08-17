"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Briefcase,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Mail,
  Phone,
  Tags,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import SpinnerLoader from "../interview/Loader/SpinnerLoader";
import { useAuth } from "@/lib/useAuth";

export function OrgJobPostingsContent() {
  const {
    userEmail,
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
  } = useAuth();
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    job_title: "",
    job_level: "",
    working_type: "",
    tag: [],
    work_time: "",
    address: "",
    cv_email: "",
    contact_ph_number: "",
    responsibility: "",
    qualification: "",
    salary_mmk: "",
    required_number: 1,
    tech_skill: [],
    due_date: "",
  });
  const [tempTag, setTempTag] = useState("");
  const [tempTechSkill, setTempTechSkill] = useState("");
  const [completedSections, setCompletedSections] = useState(new Set());

  // Progress tracking functions
  const validateSection = (sectionId) => {
    switch (sectionId) {
      case "basic":
        return (
          formData.job_title.trim() &&
          formData.job_level &&
          formData.working_type &&
          formData.required_number > 0
        );
      case "details":
        return formData.work_time.trim() && formData.address.trim();
      case "compensation":
        return formData.salary_mmk.trim();
      case "contact":
        return formData.cv_email.trim() && formData.contact_ph_number.trim();
      case "skills":
        return formData.tech_skill.length > 0 && formData.tag.length > 0;
      case "description":
        return formData.responsibility.trim() && formData.qualification.trim();
      default:
        return false;
    }
  };

  const updateProgress = React.useCallback(() => {
    const sections = [
      "basic",
      "details",
      "compensation",
      "contact",
      "skills",
      "description",
    ];
    const newCompletedSections = new Set();

    sections.forEach((sectionId) => {
      if (validateSection(sectionId)) {
        newCompletedSections.add(sectionId);
      }
    });

    setCompletedSections(newCompletedSections);
  }, [formData]);

  // Update progress whenever formData changes
  React.useEffect(() => {
    updateProgress();
  }, [formData, updateProgress]);

  const fetchJobPosts = React.useCallback(
    async (isBackgroundRefresh = false) => {
      try {
        if (!isBackgroundRefresh) {
          setLoading(true);
        }
        setError(null);

        // Get JWT token from localStorage
        const jwt = localStorage.getItem("jwt");
        const headers = { "Content-Type": "application/json" };

        if (jwt) {
          headers["Authorization"] = `Bearer ${jwt}`;
        } else {
          console.warn("No JWT token found in localStorage");
          console.log(
            "Available localStorage keys:",
            Object.keys(localStorage)
          );
        }

        const response = await fetch(
          `http://localhost:8080/api/org/postedJobs?org_email=${userEmail}`,
          { headers }
        ).catch((networkError) => {
          console.error("Network error details:", networkError);
          throw new Error(
            "Network error: Unable to connect to the server. Please check your connection and try again."
          );
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Response error data:", errorData);
          throw new Error(
            errorData.message ||
              `HTTP ${response.status}: Failed to fetch job posts`
          );
        }

        const data = await response.json();

        setJobPosts(data);
        setLastFetchTime(Date.now());
      } catch (err) {
        console.error("Error fetching job posts:", err);
        if (!isBackgroundRefresh) {
          setError(err.message);
          toast.error("Failed to fetch job posts: " + err.message, {
            duration: 5000,
            className:
              "text-base px-4 py-3 bg-red-100 text-red-800 border-red-200",
          });
        }
      } finally {
        if (!isBackgroundRefresh) {
          setLoading(false);
        }
      }
    },
    [userEmail]
  );

  useEffect(() => {
    if (userEmail && isAuthenticated) {
      fetchJobPosts(false); // Initial load, not background refresh
    }
  }, [fetchJobPosts, userEmail, isAuthenticated]);

  const handleCreateJob = async () => {
    try {
      setLoading(true);

      // Validate required fields
      const requiredFields = {
        job_title: "Job Title",
        job_level: "Job Level",
        working_type: "Work Type",
        work_time: "Work Schedule",
        address: "Location",
        cv_email: "Email",
        contact_ph_number: "Phone",
        responsibility: "Key Responsibilities",
        qualification: "Required Qualifications",
        salary_mmk: "Salary",
        due_date: "Due Date",
      };

      const missingFields = [];
      for (const [field, label] of Object.entries(requiredFields)) {
        if (
          !formData[field] ||
          (Array.isArray(formData[field]) && formData[field].length === 0)
        ) {
          missingFields.push(label);
        }
      }

      if (missingFields.length > 0) {
        throw new Error(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
      }

      if (formData.tech_skill.length === 0) {
        throw new Error("Please add at least one technical skill");
      }

      if (formData.tag.length === 0) {
        throw new Error("Please add at least one job tag");
      }

      // Format the due date to match the backend expected format
      const dueDate = new Date(formData.due_date);
      dueDate.setHours(23, 59, 59, 999); // Set to end of day

      const jobData = {
        org_email: userEmail,
        org_img: "https://example.com/images/logo.png", // You can update this with actual org image
        job_title: formData.job_title,
        job_level: formData.job_level,
        working_type: formData.working_type,
        tag: formData.tag,
        work_time: formData.work_time,
        address: formData.address,
        cv_email: formData.cv_email,
        contact_ph_number: formData.contact_ph_number,
        responsibility: formData.responsibility,
        qualification: formData.qualification,
        salary_mmk: formData.salary_mmk,
        required_number: formData.required_number,
        tech_skill: formData.tech_skill,
        due_date: dueDate.toISOString(),
      };

      // Get JWT token from localStorage
      const jwt = localStorage.getItem("jwt");
      const headers = { "Content-Type": "application/json" };

      if (jwt) {
        headers["Authorization"] = `Bearer ${jwt}`;
      }

      const response = await fetch("http://localhost:8080/api/org/postJob", {
        method: "POST",
        headers,
        body: JSON.stringify(jobData),
      }).catch((networkError) => {
        throw new Error(
          "Network error: Unable to connect to the server. Please check your connection and try again."
        );
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create job post");
      }

      // Handle both JSON and text responses
      let result;
      const responseText = await response.text();

      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        // If it's not JSON, treat it as a success message
        result = { success: true, message: responseText };
      }

      toast.success("Job post created successfully!", {
        duration: 3000,
        className: "text-base px-4 py-3",
      });

      await fetchJobPosts(false); // Refresh after creation, not background
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error creating job post:", err);
      setError(err.message);
      toast.error(err.message, {
        duration: 5000,
        className: "text-base px-4 py-3 bg-red-100 text-red-800 border-red-200",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      job_title: "",
      job_level: "",
      working_type: "",
      tag: [],
      work_time: "",
      address: "",
      cv_email: "",
      contact_ph_number: "",
      responsibility: "",
      qualification: "",
      salary_mmk: "",
      required_number: 1,
      tech_skill: [],
      due_date: "",
    });
    setTempTag("");
    setTempTechSkill("");
  };

  const addTag = () => {
    if (tempTag.trim() && !formData.tag.includes(tempTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tag: [...prev.tag, tempTag.trim()],
      }));
      setTempTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tag: prev.tag.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addTechSkill = () => {
    if (
      tempTechSkill.trim() &&
      !formData.tech_skill.includes(tempTechSkill.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        tech_skill: [...prev.tech_skill, tempTechSkill.trim()],
      }));
      setTempTechSkill("");
    }
  };

  const removeTechSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tech_skill: prev.tech_skill.filter((skill) => skill !== skillToRemove),
    }));
  };

  // Delete job post function
  const handleDeleteJob = async (jobId) => {
    try {
      setIsDeleting(true);

      // Get JWT token from localStorage
      const jwt = localStorage.getItem("jwt");
      const headers = { "Content-Type": "application/json" };

      if (jwt) {
        headers["Authorization"] = `Bearer ${jwt}`;
        console.log("JWT token found and added to headers");
        console.log("JWT token length:", jwt.length);
        console.log("JWT token preview:", jwt.substring(0, 20) + "...");
      } else {
        console.warn("No JWT token found in localStorage");
        console.log("Available localStorage keys:", Object.keys(localStorage));
      }

      // Use our Next.js API route which handles both job post and application deletion
      const deleteUrl = `/api/org/deletePost?jobPost_obj_id=${jobId}`;

      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        // Try to get the response as JSON first, fallback to text if that fails
        let errorData = {};
        let responseText = "";

        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.log("Failed to parse error response as JSON, trying as text");
          try {
            responseText = await response.text();
            console.log("Error response text:", responseText);
          } catch (textError) {
            console.log("Failed to read error response as text");
          }
        }

        console.error("Delete response error data:", errorData);
        console.error("Delete response text:", responseText);
        console.error("Delete response status:", response.status);

        // A 404 means the job was not found - this is an error, not success
        if (response.status === 404) {
          console.log("Job not found - this is an error, not success");
          toast.error(
            "Job post not found. It may have been already deleted or the ID is invalid.",
            {
              duration: 5000,
              className:
                "text-base px-4 py-3 bg-red-100 text-red-800 border-red-200",
            }
          );
          return;
        }

        throw new Error(
          errorData.message ||
            errorData.error ||
            responseText ||
            `Failed to delete job post (HTTP ${response.status})`
        );
      }

      // Handle both JSON and text responses
      let result;
      const responseText = await response.text();

      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        // If it's not JSON, treat it as a success message
        result = { success: true, message: responseText };
      }

      toast.success("Job post deleted successfully!", {
        duration: 3000,
        className:
          "text-base px-4 py-3 bg-green-100 text-green-800 border-green-200",
      });

      // Close the delete dialog first
      setIsDeleteDialogOpen(false);
      setJobToDelete(null);

      // Optimistically remove the job from the current list
      setJobPosts((prevJobs) =>
        prevJobs.filter((job) => {
          // Handle different possible ID formats
          const jobIdStr = jobId?.toString();
          const jobIdFromData = job._id?.toString() || job.id?.toString();
          return jobIdFromData !== jobIdStr;
        })
      );

      // Refresh the job posts list in the background to ensure data consistency
      setTimeout(async () => {
        try {
          await fetchJobPosts(true); // Pass true for background refresh
        } catch (refreshError) {
          console.error(
            "Error refreshing job posts after deletion:",
            refreshError
          );
          // Don't show error toast for background refresh failure
          // The optimistic update already removed the job from the UI
          // If the refresh fails, the optimistic update will remain, which is fine
          // since the deletion was successful on the backend
        }
      }, 500); // Reduced delay since we're doing optimistic update
    } catch (err) {
      console.error("Error deleting job post:", err);
      toast.error("Failed to delete job post: " + err.message, {
        duration: 5000,
        className: "text-base px-4 py-3 bg-red-100 text-red-800 border-red-200",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (job) => {
    setJobToDelete(job);
    setIsDeleteDialogOpen(true);
  };

  // Check authentication
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <SpinnerLoader size="lg" color="blue" />
        <div className="text-lg text-gray-600">Loading authentication...</div>
      </div>
    );
  }

  if (authError || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-center text-red-600">
          <h3 className="mb-2 text-lg font-semibold">
            Authentication Required
          </h3>
          <p className="mb-4 text-sm">
            {authError || "Please log in to access job postings."}
          </p>
          <Button
            onClick={() =>
              (window.location.href = "/login?redirect=/dashboard/org-mgmt")
            }
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (loading && jobPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <SpinnerLoader size="lg" color="blue" />
        <div className="text-lg text-gray-600">Loading job posts...</div>
      </div>
    );
  }

  if (error && jobPosts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isJobExpired = (dueDate) => new Date(dueDate) <= new Date();

  return (
    <div className="mx-3 mt-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Job Postings
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Create and manage your organization's job opportunities
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="default"
              className="flex items-center gap-3 px-8 py-4 text-sm font-semibold text-white transition-all duration-300 transform bg-indigo-600 rounded-lg shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create New Job Post
            </Button>
          </DialogTrigger>
          <DialogContent className="min-w-[95vw] max-w-4xl max-h-[95vh] bg-white border-0 shadow-2xl p-0 overflow-hidden rounded-3xl">
            <DialogTitle className="sr-only">
              Create New Job Posting
            </DialogTitle>
            <div className="flex flex-col lg:flex-row h-full max-h-[95vh]">
              {/* Left Sidebar - Progress Steps */}
              <div className="hidden lg:block w-80 bg-gradient-to-br from-slate-200 via-white to-blue-200/50 border-r border-slate-200/60 p-8 overflow-y-auto max-h-[95vh] backdrop-blur-sm">
                <div className="flex flex-col justify-center my-auto space-y-3">
                  {[
                    {
                      id: "basic",
                      title: "Basic Info",
                      active: true,
                    },
                    {
                      id: "details",
                      title: "Work Details",
                      active: false,
                    },
                    {
                      id: "compensation",
                      title: "Compensation",
                      active: false,
                    },
                    {
                      id: "contact",
                      title: "Contact Info",
                      active: false,
                    },
                    {
                      id: "skills",
                      title: "Skills & Tags",
                      active: false,
                    },
                    {
                      id: "description",
                      title: "Description",
                      active: false,
                    },
                  ].map((step, index) => {
                    const isCompleted = completedSections.has(step.id);
                    return (
                      <div
                        key={step.id}
                        className={`flex items-center gap-4 px-4 py-2.5 border-gray-800 rounded-2xl bg-white/60 backdrop-blur-sm border transition-all duration-500 hover:scale-105 ${
                          isCompleted
                            ? "border-indigo-200/60 bg-indigo-50/80 shadow-lg shadow-indigo-100/50"
                            : "border-slate-200/40 hover:border-slate-300/60 hover:bg-white/80"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-xl text-sm font-semibold transition-all duration-500 ${
                            isCompleted
                              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200/50 scale-110"
                              : "bg-slate-100 text-slate-600 border border-slate-200/60"
                          }`}
                        >
                          {isCompleted ? (
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div
                            className={`text-sm font-medium transition-colors duration-300 ${
                              isCompleted ? "text-indigo-800" : "text-slate-700"
                            }`}
                          >
                            {step.title}
                          </div>
                          {isCompleted && (
                            <div className="mt-1 text-xs font-medium text-indigo-600">
                              ✓ Completed
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Content Area */}
              <div className="w-full lg:flex-1 overflow-y-auto relative max-h-[95vh]">
                <div className="relative p-6 pb-20 lg:px-12 lg:py-16">
                  {/* Header */}
                  <div className="mb-8">
                    <h1 className="mb-3 text-2xl font-semibold text-slate-800 lg:text-3xl">
                      Job Posting Details
                    </h1>
                    <p className="text-base leading-relaxed text-slate-600">
                      Create an attractive job posting that will stand out to
                      candidates
                    </p>
                  </div>

                  {/* Form Sections */}
                  <div className="-mb-8 space-y-6">
                    {/* Basic Information */}
                    <div
                      className={`bg-white/80 backdrop-blur-sm border rounded-2xl p-6 lg:p-8 shadow-sm transition-all duration-500 ${
                        completedSections.has("basic")
                          ? "border-indigo-200/60 shadow-lg shadow-indigo-100/30"
                          : "border-slate-200/60"
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
                          <Briefcase className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">
                            Basic Information
                          </h3>
                          <p className="text-sm text-slate-600">
                            Essential job details
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <Label
                            htmlFor="job_title"
                            className="block mb-3 text-sm font-medium text-slate-700"
                          >
                            Job Title <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="job_title"
                            required
                            value={formData.job_title}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                job_title: e.target.value,
                              }))
                            }
                            placeholder="e.g., Senior Software Engineer"
                            className="h-12 text-slate-800 border-slate-200 rounded-xl focus:border-indigo-300 focus:ring-indigo-200"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="job_level"
                            className="block mb-2 text-sm font-medium text-gray-700"
                          >
                            Job Level <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            required
                            value={formData.job_level}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                job_level: value,
                              }))
                            }
                          >
                            <SelectTrigger className="h-12 bg-white text-slate-800 border-slate-200 rounded-xl focus:border-indigo-300 focus:ring-indigo-200">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Entry">Entry Level</SelectItem>
                              <SelectItem value="Mid">Mid Level</SelectItem>
                              <SelectItem value="Senior">
                                Senior Level
                              </SelectItem>
                              <SelectItem value="Lead">Lead</SelectItem>
                              <SelectItem value="Manager">Manager</SelectItem>
                              <SelectItem value="Director">Director</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label
                            htmlFor="working_type"
                            className="block mb-2 text-sm font-medium text-gray-700"
                          >
                            Work Type <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            required
                            value={formData.working_type}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                working_type: value,
                              }))
                            }
                          >
                            <SelectTrigger className="h-12 bg-white text-slate-800 border-slate-200 rounded-xl focus:border-indigo-300 focus:ring-indigo-200">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Full-time">
                                Full-time
                              </SelectItem>
                              <SelectItem value="Part-time">
                                Part-time
                              </SelectItem>
                              <SelectItem value="Contract">Contract</SelectItem>
                              <SelectItem value="Internship">
                                Internship
                              </SelectItem>
                              <SelectItem value="Freelance">
                                Freelance
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label
                            htmlFor="required_number"
                            className="block mb-2 text-sm font-medium text-gray-700"
                          >
                            Positions <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="required_number"
                            required
                            type="number"
                            min="1"
                            value={formData.required_number}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                required_number: parseInt(e.target.value) || 1,
                              }))
                            }
                            className="h-12 text-slate-800 border-slate-200 rounded-xl focus:border-indigo-300 focus:ring-indigo-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Work Details */}
                    <div
                      className={`bg-white border rounded-xl p-3 lg:p-6 shadow-sm transition-all duration-300 ${
                        completedSections.has("details")
                          ? "border-green-200 shadow-md"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-4 lg:gap-3 lg:mb-6">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg lg:w-10 lg:h-10">
                          <Clock className="w-4 h-4 text-green-600 lg:w-5 lg:h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 lg:text-lg">
                            Work Details
                          </h3>
                          <p className="text-xs text-gray-600 lg:text-sm">
                            Schedule and location
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4">
                        <div>
                          <Label
                            htmlFor="work_time"
                            className="block mb-2 text-sm font-medium text-gray-700"
                          >
                            Work Schedule{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="work_time"
                            required
                            value={formData.work_time}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                work_time: e.target.value,
                              }))
                            }
                            placeholder="9 AM - 6 PM, Mon-Fri"
                            className="text-gray-800 border-gray-300 h-11"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="address"
                            className="block mb-2 text-sm font-medium text-gray-700"
                          >
                            Location <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="address"
                            required
                            value={formData.address}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                address: e.target.value,
                              }))
                            }
                            placeholder="Yangon, Myanmar"
                            className="text-gray-800 border-gray-300 h-11"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Compensation */}
                    <div
                      className={`bg-white border rounded-xl p-3 lg:p-6 shadow-sm transition-all duration-300 ${
                        completedSections.has("compensation")
                          ? "border-green-200 shadow-md"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-4 lg:gap-3 lg:mb-6">
                        <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg lg:w-10 lg:h-10">
                          <DollarSign className="w-4 h-4 text-yellow-600 lg:w-5 lg:h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 lg:text-lg">
                            Compensation
                          </h3>
                          <p className="text-xs text-gray-600 lg:text-sm">
                            Salary and benefits
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label
                          htmlFor="salary_mmk"
                          className="block mb-2 text-sm font-medium text-gray-700"
                        >
                          Salary Range (MMK){" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="salary_mmk"
                          required
                          value={formData.salary_mmk}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              salary_mmk: e.target.value,
                            }))
                          }
                          placeholder="800,000 - 1,200,000 MMK"
                          className="text-gray-800 border-gray-300 h-11"
                        />
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div
                      className={`bg-white border rounded-xl p-3 lg:p-6 shadow-sm transition-all duration-300 ${
                        completedSections.has("contact")
                          ? "border-green-200 shadow-md"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-4 lg:gap-3 lg:mb-6">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg lg:w-10 lg:h-10">
                          <Mail className="w-4 h-4 text-purple-600 lg:w-5 lg:h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 lg:text-lg">
                            Contact Information
                          </h3>
                          <p className="text-xs text-gray-600 lg:text-sm">
                            How candidates can reach you
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4">
                        <div>
                          <Label
                            htmlFor="cv_email"
                            className="block mb-2 text-sm font-medium text-gray-700"
                          >
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="cv_email"
                            required
                            type="email"
                            value={formData.cv_email}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                cv_email: e.target.value,
                              }))
                            }
                            placeholder="hr@company.com"
                            className="text-gray-800 border-gray-300 h-11"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="contact_ph_number"
                            className="block mb-2 text-sm font-medium text-gray-700"
                          >
                            Phone <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="contact_ph_number"
                            required
                            value={formData.contact_ph_number}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                contact_ph_number: e.target.value,
                              }))
                            }
                            placeholder="+95 9 123 456 789"
                            className="text-gray-800 border-gray-300 h-11"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Skills & Tags */}
                    <div
                      className={`bg-white border rounded-xl p-3 lg:p-6 shadow-sm transition-all duration-300 ${
                        completedSections.has("skills")
                          ? "border-green-200 shadow-md"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-4 lg:gap-3 lg:mb-6">
                        <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg lg:w-10 lg:h-10">
                          <Tags className="w-4 h-4 text-indigo-600 lg:w-5 lg:h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 lg:text-lg">
                            Skills & Tags
                          </h3>
                          <p className="text-xs text-gray-600 lg:text-sm">
                            Technical skills and job tags
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="block mb-2 text-sm font-medium text-gray-700">
                            Technical Skills{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              required
                              value={tempTechSkill}
                              onChange={(e) => setTempTechSkill(e.target.value)}
                              placeholder="React, Python, AWS..."
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), addTechSkill())
                              }
                              className="flex-1 border-gray-300 h-11"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addTechSkill}
                              className="px-4 text-indigo-700 border-indigo-200 h-11 bg-indigo-50 hover:bg-indigo-100"
                            >
                              Add
                            </Button>
                          </div>
                          {formData.tech_skill.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {formData.tech_skill.map((skill, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-indigo-800 bg-indigo-100 border-indigo-200 cursor-pointer hover:bg-indigo-200"
                                  onClick={() => removeTechSkill(skill)}
                                >
                                  {skill} ×
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label className="block mb-2 text-sm font-medium text-gray-700">
                            Job Tags <span className="text-red-500">*</span>
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              required
                              value={tempTag}
                              onChange={(e) => setTempTag(e.target.value)}
                              placeholder="Remote, Benefits, Growth..."
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), addTag())
                              }
                              className="flex-1 border-gray-300 h-11"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addTag}
                              className="px-4 text-indigo-700 border-indigo-200 h-11 bg-indigo-50 hover:bg-indigo-100"
                            >
                              Add
                            </Button>
                          </div>
                          {formData.tag.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {formData.tag.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-gray-800 bg-gray-100 cursor-pointer hover:bg-gray-200"
                                  onClick={() => removeTag(tag)}
                                >
                                  {tag} ×
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Job Description */}
                    <div
                      className={`bg-white border rounded-xl p-3 lg:p-6 shadow-sm transition-all duration-300 ${
                        completedSections.has("description")
                          ? "border-green-200 shadow-md"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-4 lg:gap-3 lg:mb-6">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg lg:w-10 lg:h-10 bg-emerald-100">
                          <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 lg:text-lg">
                            Job Description
                          </h3>
                          <p className="text-xs text-gray-600 lg:text-sm">
                            Responsibilities and requirements
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label
                            htmlFor="responsibility"
                            className="block mb-2 text-sm font-medium text-gray-700"
                          >
                            Key Responsibilities{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="responsibility"
                            required
                            value={formData.responsibility}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                responsibility: e.target.value,
                              }))
                            }
                            placeholder="Describe the key responsibilities for this role..."
                            rows={3}
                            className="text-gray-900 bg-white border-gray-300"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="qualification"
                            className="block mb-2 text-sm font-medium text-gray-700"
                          >
                            Required Qualifications{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="qualification"
                            required
                            value={formData.qualification}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                qualification: e.target.value,
                              }))
                            }
                            placeholder="Describe the required qualifications for this role..."
                            rows={3}
                            className="text-gray-900 bg-white border-gray-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Application Deadline */}
                    <div className="p-3 bg-white border border-gray-200 shadow-sm rounded-xl lg:p-6">
                      <div className="flex items-center gap-2 mb-4 lg:gap-3 lg:mb-6">
                        <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg lg:w-10 lg:h-10">
                          <Calendar className="w-4 h-4 text-red-600 lg:w-5 lg:h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 lg:text-lg">
                            Application Deadline
                          </h3>
                          <p className="text-xs text-gray-600 lg:text-sm">
                            When applications close
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label
                          htmlFor="due_date"
                          className="block mb-2 text-sm font-medium text-gray-700"
                        >
                          Due Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="due_date"
                          required
                          type="date"
                          value={formData.due_date}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              due_date: e.target.value,
                            }))
                          }
                          className="text-gray-800 border-gray-300 h-11"
                        />
                      </div>
                    </div>

                    <div className="px-6 pt-8 bg-white/80 backdrop-blur-sm rounded-2xl lg:px-8">
                      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-6">
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(false)}
                          className="px-8 py-3 text-white transition-all duration-300 border-slate-200 hover:bg-slate-50 rounded-xl"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateJob}
                          disabled={loading}
                          className="px-10 py-3 text-white transition-all duration-300 transform shadow-lg rounded-xl bg-primary hover:shadow-xl hover:scale-105"
                        >
                          {loading ? (
                            <div className="flex items-center gap-2">
                              <SpinnerLoader size="sm" color="white" />
                              Creating...
                            </div>
                          ) : (
                            "Create Job Post"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Job Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Job Posts</CardTitle>
          <CardDescription className="text-sm">
            Manage your organization's job postings
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">
                    Job Title
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Level</TableHead>
                  <TableHead className="text-xs sm:text-sm">Type</TableHead>
                  <TableHead className="text-xs sm:text-sm">Salary</TableHead>
                  <TableHead className="text-xs sm:text-sm">Due Date</TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
                          <Briefcase className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="text-center">
                          <h3 className="mb-2 text-lg font-medium text-gray-900">
                            No job posts yet
                          </h3>
                          <p className="mb-4 text-gray-600">
                            Create your first job posting to start attracting
                            candidates
                          </p>
                          <Button
                            onClick={() => setIsCreateDialogOpen(true)}
                            className="flex items-center gap-2 px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                          >
                            <Plus className="w-4 h-4" />
                            Create Job Post
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  jobPosts.map((job, index) => (
                    <TableRow key={job._id || `job-${index}`}>
                      <TableCell className="text-xs font-medium sm:text-sm">
                        {job.job_title || "Untitled"}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {job.jobLevel ||
                          job.job_level ||
                          job.level ||
                          "Not specified"}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {job.workingType ||
                          job.working_type ||
                          job.work_type ||
                          job.type ||
                          "Not specified"}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {job.salary_mmk || job.salary || "Not specified"}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {job.due_date
                          ? formatDate(job.due_date)
                          : "Not specified"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            isJobExpired(job.due_date)
                              ? "destructive"
                              : "default"
                          }
                          className="text-xs"
                        >
                          {isJobExpired(job.due_date) ? "Expired" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 sm:h-9 sm:w-9"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 sm:h-9 sm:w-9 hover:bg-red-50 hover:text-red-600"
                            onClick={() => openDeleteDialog(job)}
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-lg font-semibold">Delete Job Post</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete "{jobToDelete?.job_title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setJobToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                handleDeleteJob(jobToDelete?._id || jobToDelete?.id)
              }
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <SpinnerLoader size="sm" color="white" />
                  Deleting...
                </div>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      <Toaster position="top-center" richColors />
    </div>
  );
}
