"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Users,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Search,
  Filter,
  TrendingUp,
  User,
  ExternalLink,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import SpinnerLoader from "../interview/Loader/SpinnerLoader";
import { useAuth } from "@/lib/useAuth";

export function OrgApplicationsContent() {
  const {
    userEmail,
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
  } = useAuth();

  const [applicationsData, setApplicationsData] = useState({
    activeJobPosts: [],
    totalActiveJobs: 0,
    totalApplications: 0,
    totalPending: 0,
    totalAccepted: 0,
    totalRejected: 0,
    totalHired: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isInsightDialogOpen, setIsInsightDialogOpen] = useState(false);
  const [downloadingCv, setDownloadingCv] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchApplicationsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const jwt = localStorage.getItem("jwt");
      const headers = {};

      if (jwt) {
        headers["Authorization"] = `Bearer ${jwt}`;
      }

      const response = await fetch(
        `/api/org/applications?org_email=${userEmail}`,
        { headers }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: Failed to fetch applications`
        );
      }

      const data = await response.json();

      if (data.success) {
        setApplicationsData(data);
      } else {
        throw new Error(data.error || "Failed to fetch applications");
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(err.message);
      toast.error("Failed to fetch applications: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    if (userEmail && isAuthenticated) {
      fetchApplicationsData();
    }
  }, [fetchApplicationsData, userEmail, isAuthenticated]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setUpdatingStatus(true);

      const jwt = localStorage.getItem("jwt");
      const headers = { "Content-Type": "application/json" };

      if (jwt) {
        headers["Authorization"] = `Bearer ${jwt}`;
      }

      const response = await fetch("/api/org/applications", {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          applicationId,
          status: newStatus,
          orgEmail: userEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || "Failed to update status"
        );
      }

      const result = await response.json();

      if (result.success) {
        toast.success(`Application ${newStatus} successfully!`);
        await fetchApplicationsData();
      } else {
        throw new Error(result.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status: " + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openInsightDialog = (jobData) => {
    setSelectedJob(jobData);
    setIsInsightDialogOpen(true);
  };

  const downloadCv = async (cvUrl, applicantName, application = null) => {
    try {
      setDownloadingCv(true);

      // Use stored public_id if available, otherwise extract from URL
      let publicId = application?.cvPublicId || null;
      let resourceType = application?.cvResourceType || "raw";
      let type = application?.cvType || "upload";

      if (!publicId && cvUrl && cvUrl.includes("cloudinary.com")) {
        // Extract public_id from Cloudinary URL as fallback
        console.log("CV Download - Extracting public_id from URL:", cvUrl);

        const urlParts = cvUrl.split("/");
        const uploadIndex = urlParts.findIndex((part) => part === "upload");
        if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
          // Skip the version part and get the rest as public_id
          const publicIdParts = urlParts.slice(uploadIndex + 2);
          publicId = publicIdParts.join("/");

          // Remove any transformation parameters from public_id
          if (publicId.includes("/fl_")) {
            publicId = publicId.split("/fl_")[0];
          }

          console.log("CV Download - Extracted public_id:", publicId);
        }
      }

      // Get authenticated download URL from API if we have a public_id
      if (publicId) {
        console.log(
          "CV Download - Attempting download with public_id:",
          publicId
        );
        console.log("CV Download - Original CV URL:", cvUrl);
        console.log("CV Download - Resource type:", resourceType);
        console.log("CV Download - Type:", type);

        // Try different public_id formats if the first attempt fails
        const publicIdVariations = [
          publicId,
          publicId.replace(/^v\d+\//, ""), // Remove version prefix
          publicId.split("/").slice(-2).join("/"), // Try last two parts
        ];

        for (let i = 0; i < publicIdVariations.length; i++) {
          const currentPublicId = publicIdVariations[i];
          console.log(
            `CV Download - Trying public_id variation ${i + 1}:`,
            currentPublicId
          );

          try {
            const response = await fetch(
              `/api/cv-download?public_id=${encodeURIComponent(currentPublicId)}&resource_type=${encodeURIComponent(resourceType)}&type=${encodeURIComponent(type)}&attachment=true&filename=${encodeURIComponent(applicantName + "_CV.pdf")}`
            );

            if (response.ok) {
              const data = await response.json();
              if (data.url) {
                // Test if the URL is accessible before triggering download
                try {
                  const testResponse = await fetch(data.url, {
                    method: "HEAD",
                  });
                  if (testResponse.ok) {
                    // Trigger download
                    const link = document.createElement("a");
                    link.href = data.url;
                    link.download = `${applicantName}_CV.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success(
                      `CV for ${applicantName} downloaded successfully!`
                    );
                    return;
                  } else {
                    console.warn(
                      "CV Download - Generated URL not accessible:",
                      testResponse.status
                    );
                    if (i === publicIdVariations.length - 1) {
                      throw new Error("Generated URL not accessible");
                    }
                    continue; // Try next variation
                  }
                } catch (urlError) {
                  console.error("CV Download - URL test failed:", urlError);
                  if (i === publicIdVariations.length - 1) {
                    throw new Error("Generated URL test failed");
                  }
                  continue; // Try next variation
                }
              } else {
                if (i === publicIdVariations.length - 1) {
                  throw new Error("No URL returned from API");
                }
                continue; // Try next variation
              }
            } else {
              // Handle API error response
              const errorData = await response.json().catch(() => ({}));
              console.error(
                `CV Download API error (variation ${i + 1}):`,
                response.status,
                errorData
              );

              // If this is the last variation, throw the error
              if (i === publicIdVariations.length - 1) {
                if (response.status === 404) {
                  throw new Error(
                    "CV file not found. The file may have been deleted or moved."
                  );
                } else if (response.status === 403) {
                  throw new Error(
                    "Access denied. You don't have permission to download this file."
                  );
                } else if (response.status === 500) {
                  throw new Error("Server error. Please try again later.");
                } else {
                  throw new Error(
                    errorData.error || `Download failed (${response.status})`
                  );
                }
              }
              // Otherwise, continue to next variation
              continue;
            }
          } catch (error) {
            console.error(
              `Failed to get authenticated download URL (variation ${i + 1}):`,
              error
            );
            if (i === publicIdVariations.length - 1) {
              toast.error(`CV download failed: ${error.message}`);
            }
            // Continue to next variation
          }
        }
      }

      // Fallback: try to download directly from the URL
      try {
        const response = await fetch(cvUrl);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${applicantName}_CV.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          toast.success(`CV for ${applicantName} downloaded successfully!`);
        } else {
          throw new Error("Failed to fetch CV");
        }
      } catch (error) {
        console.error("Direct download failed:", error);
        // Final fallback: open in new tab
        window.open(cvUrl, "_blank");
        toast.info(`CV for ${applicantName} opened in new tab`);
      }
    } catch (error) {
      console.error("Error downloading CV:", error);
      toast.error(`Failed to download CV for ${applicantName}`);
    } finally {
      setDownloadingCv(false);
    }
  };

  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "applied":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "interview offer":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "offer":
        return "text-green-600 bg-green-50 border-green-200";
      case "reject":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const filteredJobPosts = applicationsData.activeJobPosts.filter((jobData) => {
    const job = jobData.jobPost;
    const matchesSearch = job.job_title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "has-applications" && jobData.totalApplications > 0) ||
      (statusFilter === "no-applications" && jobData.totalApplications === 0);

    return matchesSearch && matchesStatus;
  });

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
            {authError || "Please log in to access applications."}
          </p>
          <Button
            onClick={() =>
              (window.location.href =
                "/login?redirect=/org/dashboard/applications")
            }
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (loading && applicationsData.activeJobPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <SpinnerLoader size="lg" color="blue" />
        <div className="text-lg text-gray-600">Loading applications...</div>
      </div>
    );
  }

  if (error && applicationsData.activeJobPosts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="mx-3 mt-6 space-y-6 [&_.line-clamp-2]:overflow-hidden [&_.line-clamp-2]:display-webkit-box [&_.line-clamp-2]:-webkit-box-orient-vertical [&_.line-clamp-2]:-webkit-line-clamp-2">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Application Management
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Review and manage job applications for your active positions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchApplicationsData}
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 bg-white/10 backdrop-blur-xl before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/20 before:to-indigo-600/20 before:rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/5 rounded-xl"></div>
          <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-blue-900">
              <div className="p-2 rounded-lg bg-blue-500/10 backdrop-blur-sm">
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              Active Jobs
            </CardTitle>
            <Badge className="text-blue-800 bg-blue-500/20 border-blue-200/50 backdrop-blur-sm">
              {applicationsData.totalActiveJobs}
            </Badge>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-blue-900">
              {applicationsData.totalActiveJobs}
            </div>
            <p className="text-sm font-medium text-blue-700/80">
              Open positions
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-white/10 backdrop-blur-xl before:absolute before:inset-0 before:bg-gradient-to-br before:from-amber-500/20 before:to-orange-600/20 before:rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-600/5 rounded-xl"></div>
          <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-amber-900">
              <div className="p-2 rounded-lg bg-amber-500/10 backdrop-blur-sm">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              Applied
            </CardTitle>
            <Badge className="bg-amber-500/20 text-amber-800 border-amber-200/50 backdrop-blur-sm">
              {applicationsData.totalPending}
            </Badge>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-amber-900">
              {applicationsData.totalPending}
            </div>
            <p className="text-sm font-medium text-amber-700/80">
              New applications
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-white/10 backdrop-blur-xl before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-500/20 before:to-green-600/20 before:rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-600/5 rounded-xl"></div>
          <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
              <div className="p-2 rounded-lg bg-emerald-500/10 backdrop-blur-sm">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              Interview Offers
            </CardTitle>
            <Badge className="bg-emerald-500/20 text-emerald-800 border-emerald-200/50 backdrop-blur-sm">
              {applicationsData.totalAccepted}
            </Badge>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-emerald-900">
              {applicationsData.totalAccepted}
            </div>
            <p className="text-sm font-medium text-emerald-700/80">
              Interview stage
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-white/10 backdrop-blur-xl before:absolute before:inset-0 before:bg-gradient-to-br before:from-violet-500/20 before:to-purple-600/20 before:rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-600/5 rounded-xl"></div>
          <CardHeader className="relative flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-violet-900">
              <div className="p-2 rounded-lg bg-violet-500/10 backdrop-blur-sm">
                <Users className="w-4 h-4 text-violet-600" />
              </div>
              Total Applications
            </CardTitle>
            <Badge className="bg-violet-500/20 text-violet-800 border-violet-200/50 backdrop-blur-sm">
              {applicationsData.totalApplications}
            </Badge>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-violet-900">
              {applicationsData.totalApplications}
            </div>
            <p className="text-sm font-medium text-violet-700/80">
              All applications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modern Filters */}
      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                placeholder="Search job posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 bg-white/40 backdrop-blur-sm border-gray-200/40 focus:bg-white/60 focus:border-indigo-300/50 focus:ring-2 focus:ring-indigo-50 transition-all duration-200"
              />
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 bg-white/40 backdrop-blur-sm border-gray-200/40 focus:bg-white/60 focus:border-indigo-300/50 focus:ring-2 focus:ring-indigo-50 transition-all duration-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white/70 backdrop-blur-xl border-gray-200/40 shadow-lg">
                  <SelectItem value="all">All Jobs</SelectItem>
                  <SelectItem value="has-applications">
                    Has Applications
                  </SelectItem>
                  <SelectItem value="no-applications">
                    No Applications
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Counter */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white/30 backdrop-blur-sm rounded-xl border border-gray-200/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600">
                {filteredJobPosts.length} of{" "}
                {applicationsData.activeJobPosts.length} jobs
              </span>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || statusFilter !== "all") && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-500">
              Active filters:
            </span>
            {searchTerm && (
              <Badge
                variant="secondary"
                className="bg-indigo-25 text-indigo-600 border-indigo-150 hover:bg-indigo-50"
              >
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-2 hover:text-indigo-800"
                >
                  ×
                </button>
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge
                variant="secondary"
                className="bg-purple-25 text-purple-600 border-purple-150 hover:bg-purple-50"
              >
                Status:{" "}
                {statusFilter === "has-applications"
                  ? "Has Applications"
                  : "No Applications"}
                <button
                  onClick={() => setStatusFilter("all")}
                  className="ml-2 hover:text-purple-800"
                >
                  ×
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="text-gray-400 hover:text-gray-600 h-6 px-2"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Job Posts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobPosts.length === 0 ? (
          <div className="col-span-full">
            <Card className="relative overflow-hidden border-0 bg-white/10 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-slate-600/5 rounded-xl"></div>
              <CardContent className="relative flex flex-col items-center justify-center py-16">
                <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-white/20 backdrop-blur-sm">
                  <Briefcase className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  No active job posts found
                </h3>
                <p className="max-w-md mb-6 text-center text-gray-600">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Create job posts to start receiving applications"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button
                    onClick={() =>
                      (window.location.href = "/org/dashboard/job-postings")
                    }
                    className="text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 backdrop-blur-sm"
                  >
                    Create Job Post
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredJobPosts.map((jobData) => (
            <Card
              key={jobData.jobPost.id}
              className="relative overflow-hidden transition-all duration-500 border-0 bg-white/10 backdrop-blur-xl group before:absolute before:inset-0 before:bg-gradient-to-br before:from-indigo-500/10 before:to-purple-600/10 before:rounded-xl before:opacity-0 before:transition-opacity before:duration-500 group-hover:before:opacity-100 flex flex-col h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 rounded-xl"></div>

              {/* Fixed height header to ensure consistent spacing */}
              <CardHeader className="relative pb-4 flex-shrink-0 h-24">
                <div className="flex items-start justify-between h-full">
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-indigo-600 line-clamp-2 leading-tight">
                      {jobData.jobPost.job_title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Badge className="text-xs text-indigo-800 bg-indigo-500/20 border-indigo-200/50 backdrop-blur-sm flex-shrink-0">
                        {jobData.jobPost.job_level}
                      </Badge>
                      <Badge className="text-xs text-purple-800 bg-purple-500/20 border-purple-200/50 backdrop-blur-sm flex-shrink-0">
                        {jobData.jobPost.working_type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm border border-emerald-200/30 flex-shrink-0 ml-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-semibold text-emerald-700">
                      Active
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative flex-1 flex flex-col">
                {/* Application Stats - Fixed position from top */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-4 text-center border rounded-xl bg-blue-500/10 backdrop-blur-sm border-blue-200/30">
                    <div className="text-xl font-bold text-blue-700">
                      {jobData.totalApplications}
                    </div>
                    <div className="text-xs font-medium text-blue-600">
                      Total
                    </div>
                  </div>
                  <div className="p-4 text-center border rounded-xl bg-amber-500/10 backdrop-blur-sm border-amber-200/30">
                    <div className="text-xl font-bold text-amber-700">
                      {jobData.pendingApplications}
                    </div>
                    <div className="text-xs font-medium text-amber-600">
                      Pending
                    </div>
                  </div>
                  <div className="p-4 text-center border rounded-xl bg-emerald-500/10 backdrop-blur-sm border-emerald-200/30">
                    <div className="text-xl font-bold text-emerald-700">
                      {jobData.acceptedApplications}
                    </div>
                    <div className="text-xs font-medium text-emerald-600">
                      Accepted
                    </div>
                  </div>
                  <div className="p-4 text-center border rounded-xl bg-red-500/10 backdrop-blur-sm border-red-200/30">
                    <div className="text-xl font-bold text-red-700">
                      {jobData.rejectedApplications}
                    </div>
                    <div className="text-xs font-medium text-red-600">
                      Rejected
                    </div>
                  </div>
                </div>

                {/* Action Button - Always at bottom */}
                <div className="flex-shrink-0 mt-auto">
                  <Button
                    onClick={() => openInsightDialog(jobData)}
                    className="w-full text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 backdrop-blur-sm"
                    disabled={jobData.totalApplications === 0}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {jobData.totalApplications === 0
                      ? "No Applications"
                      : "View Applications"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Application Insights Dialog */}
      <Dialog open={isInsightDialogOpen} onOpenChange={setIsInsightDialogOpen}>
        <DialogContent className="min-w-[80vw] max-w-4xl max-h-[90vh] overflow-hidden border-0 bg-white/95 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 rounded-xl"></div>
          <DialogHeader className="relative">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
              <div className="p-2 rounded-lg bg-indigo-500/10 backdrop-blur-sm">
                <Briefcase className="w-6 h-6 text-indigo-600" />
              </div>
              {selectedJob?.jobPost.job_title} - Applications
            </DialogTitle>
            <DialogDescription className="font-medium text-gray-600">
              Manage applications for this position. Review candidates and
              update their status.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="all-applications" className="h-full">
              <TabsList className="grid w-full grid-cols-2 border bg-white/50 backdrop-blur-sm border-gray-200/50">
                <TabsTrigger
                  value="all-applications"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-700 data-[state=active]:font-semibold backdrop-blur-sm"
                >
                  All Applications ({selectedJob?.totalApplications})
                </TabsTrigger>
                <TabsTrigger
                  value="interview-stage"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-700 data-[state=active]:font-semibold backdrop-blur-sm"
                >
                  Interview Stage (
                  {
                    selectedJob?.applications.filter(
                      (app) => app.status === "interview offer"
                    ).length
                  }
                  )
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="all-applications"
                className="h-full overflow-y-auto"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between mt-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      All Applications
                    </h3>
                    <Badge className="font-semibold text-indigo-800 bg-indigo-500/20 border-indigo-200/50 backdrop-blur-sm">
                      {
                        selectedJob?.applications.filter(
                          (app) => app.status === "applied"
                        ).length
                      }{" "}
                      candidates
                    </Badge>
                  </div>

                  {selectedJob?.applications.filter(
                    (app) => app.status === "applied"
                  ).length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm">
                        <Users className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-lg font-medium text-gray-600">
                        No applications received yet
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b bg-white/50 backdrop-blur-sm border-gray-200/50">
                            <TableHead className="font-semibold text-gray-900">
                              Candidate
                            </TableHead>
                            <TableHead className="font-semibold text-gray-900">
                              Experience
                            </TableHead>
                            <TableHead className="font-semibold text-gray-900">
                              Applied
                            </TableHead>
                            <TableHead className="font-semibold text-gray-900">
                              Status
                            </TableHead>
                            <TableHead className="font-semibold text-gray-900">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedJob?.applications
                            .filter((app) => app.status === "applied")
                            .map((application) => (
                              <TableRow
                                key={application._id}
                                className="transition-colors duration-200 hover:bg-white/30"
                              >
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-12 h-12 border rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm border-indigo-200/30">
                                      <User className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900">
                                        {application.fullName}
                                      </div>
                                      <div className="text-sm font-medium text-gray-600">
                                        {application.email}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <span className="font-medium">
                                      {application.experienceYears} years
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm text-gray-600">
                                    {formatRelativeTime(application.createdAt)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={getStatusColor(
                                      application.status
                                    )}
                                  >
                                    {application.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        downloadCv(
                                          application.cvUrl,
                                          application.fullName,
                                          application
                                        )
                                      }
                                      disabled={downloadingCv}
                                      className="px-3 transition-all duration-200 h-9 bg-white/50 border-gray-200/50 backdrop-blur-sm hover:bg-white/70 hover:border-indigo-300/50"
                                    >
                                      {downloadingCv ? (
                                        <SpinnerLoader
                                          size="sm"
                                          color="indigo"
                                        />
                                      ) : (
                                        <Download className="w-4 h-4" />
                                      )}
                                    </Button>

                                    {application.status === "applied" && (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleStatusUpdate(
                                              application._id,
                                              "interview offer"
                                            )
                                          }
                                          disabled={updatingStatus}
                                          className="px-3 transition-all duration-200 h-9 bg-blue-500/10 text-blue-700 border-blue-200/50 backdrop-blur-sm hover:bg-blue-500/20 hover:border-blue-300/50"
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                          Accept
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleStatusUpdate(
                                              application._id,
                                              "rejected"
                                            )
                                          }
                                          disabled={updatingStatus}
                                          className="px-3 text-red-700 transition-all duration-200 h-9 bg-red-500/10 border-red-200/50 backdrop-blur-sm hover:bg-red-500/20 hover:border-red-300/50"
                                        >
                                          <XCircle className="w-4 h-4" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="interview-stage"
                className="h-full overflow-y-auto"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between mt-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      Interview Stage
                    </h3>
                    <Badge className="font-semibold bg-emerald-500/20 text-emerald-800 border-emerald-200/50 backdrop-blur-sm">
                      {
                        selectedJob?.applications.filter(
                          (app) => app.status === "interview offer"
                        ).length
                      }{" "}
                      candidates
                    </Badge>
                  </div>

                  {selectedJob?.applications.filter(
                    (app) => app.status === "interview offer"
                  ).length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm">
                        <CheckCircle className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-lg font-medium text-gray-600">
                        No candidates with interview offers yet
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b bg-white/50 backdrop-blur-sm border-gray-200/50">
                            <TableHead className="font-semibold text-gray-900">
                              Candidate
                            </TableHead>
                            <TableHead className="font-semibold text-gray-900">
                              Experience
                            </TableHead>
                            <TableHead className="font-semibold text-gray-900">
                              Interview Offer Date
                            </TableHead>
                            <TableHead className="font-semibold text-gray-900">
                              Final Decision
                            </TableHead>
                            <TableHead className="font-semibold text-gray-900">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedJob?.applications
                            .filter((app) => app.status === "interview offer")
                            .map((application) => (
                              <TableRow
                                key={application._id}
                                className="transition-colors duration-200 hover:bg-white/30"
                              >
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-12 h-12 border rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-sm border-emerald-200/30">
                                      <User className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900">
                                        {application.fullName}
                                      </div>
                                      <div className="text-sm font-medium text-gray-600">
                                        {application.email}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <span className="font-medium">
                                      {application.experienceYears} years
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm text-gray-600">
                                    {formatRelativeTime(
                                      application.updatedAt ||
                                        application.createdAt
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          application._id,
                                          "offer"
                                        )
                                      }
                                      disabled={updatingStatus}
                                      className="px-3 transition-all duration-200 h-9 bg-green-500/10 text-green-700 border-green-200/50 backdrop-blur-sm hover:bg-green-500/20 hover:border-green-300/50"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Hire
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleStatusUpdate(
                                          application._id,
                                          "reject"
                                        )
                                      }
                                      disabled={updatingStatus}
                                      className="px-3 text-red-700 transition-all duration-200 h-9 bg-red-500/10 border-red-200/50 backdrop-blur-sm hover:bg-red-500/20 hover:border-red-300/50"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Reject
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        downloadCv(
                                          application.cvUrl,
                                          application.fullName,
                                          application
                                        )
                                      }
                                      disabled={downloadingCv}
                                      className="px-3 transition-all duration-200 h-9 bg-white/50 border-gray-200/50 backdrop-blur-sm hover:bg-white/70 hover:border-emerald-300/50"
                                    >
                                      {downloadingCv ? (
                                        <SpinnerLoader
                                          size="sm"
                                          color="emerald"
                                        />
                                      ) : (
                                        <Download className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      <Toaster position="top-center" richColors />
    </div>
  );
}
