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
  TrendingUp,
  User,
  ExternalLink,
  Calendar,
  Gift,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import SpinnerLoader from "../interview/Loader/SpinnerLoader";
import { useAuth } from "@/lib/useAuth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [loadingButtons, setLoadingButtons] = useState({});
  const [activeTab, setActiveTab] = useState("applications");

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
        console.log("Applications data received:", data);
        if (data.activeJobPosts && data.activeJobPosts.length > 0) {
          console.log("First job post structure:", data.activeJobPosts[0]);
        }
        setApplicationsData(data);
      } else {
        throw new Error(data.error || "Failed to fetch applications");
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(err.message);
      toast.error("Failed to load applications", {
        description: err.message || "Please refresh the page to try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    if (userEmail && isAuthenticated) {
      fetchApplicationsData();
    }
  }, [userEmail, isAuthenticated]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    const buttonKey = `${applicationId}-${newStatus}`;

    try {
      setLoadingButtons((prev) => ({ ...prev, [buttonKey]: true }));

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
        const statusMessages = {
          interview: "Interview offer sent successfully!",
          offer: "Job offer sent successfully!",
          accept: "Application accepted successfully!",
          reject: "Application rejected successfully!",
        };
        toast.success(
          statusMessages[newStatus] || `Application ${newStatus} successfully!`,
          {
            description:
              "The candidate has been notified of the status change.",
          }
        );
        await fetchApplicationsData();
        // Close the dialog after successful update
        setIsInsightDialogOpen(false);
        setSelectedJob(null);
      } else {
        throw new Error(result.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update application status", {
        description: err.message || "Please try again later.",
      });
    } finally {
      setLoadingButtons((prev) => ({ ...prev, [buttonKey]: false }));
    }
  };

  const openInsightDialog = (jobData) => {
    setSelectedJob(jobData);
    setIsInsightDialogOpen(true);
  };

  const downloadCv = async (cvUrl, applicantName, application = null) => {
    const downloadKey = `download-${application?._id || "unknown"}`;

    try {
      setLoadingButtons((prev) => ({ ...prev, [downloadKey]: true }));

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
                // Open the PDF in a new tab for viewing
                window.open(data.url, "_blank", "noopener,noreferrer");
                toast.success(`Opening CV in a new tab...`, {
                  description: `Now viewing ${applicantName}'s CV.`,
                });
                return;
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
        toast.info(`CV opened in new tab`, {
          description: `${applicantName}'s CV has been opened in a new browser tab.`,
        });
      }
    } catch (error) {
      console.error("Error downloading CV:", error);
      toast.error(`Failed to download CV`, {
        description: `Unable to download ${applicantName}'s CV. Please try again later.`,
      });
    } finally {
      setLoadingButtons((prev) => ({ ...prev, [downloadKey]: false }));
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
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "interview":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "offer":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "accept":
        return "text-green-600 bg-green-50 border-green-200";
      case "reject":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Briefcase className="w-4 h-4" />
              Active Jobs
            </CardTitle>
            <Badge variant="secondary">
              {applicationsData.totalActiveJobs}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applicationsData.totalActiveJobs}
            </div>
            <p className="text-xs text-muted-foreground">Open positions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4" />
              Applied
            </CardTitle>
            <Badge variant="destructive">{applicationsData.totalPending}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applicationsData.totalPending}
            </div>
            <p className="text-xs text-muted-foreground">New applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Interview Offers
            </CardTitle>
            <Badge variant="default">{applicationsData.totalAccepted}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applicationsData.totalAccepted}
            </div>
            <p className="text-xs text-muted-foreground">Interview stage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4" />
              Total Applications
            </CardTitle>
            <Badge variant="outline">
              {applicationsData.totalApplications}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applicationsData.totalApplications}
            </div>
            <p className="text-xs text-muted-foreground">All applications</p>
          </CardContent>
        </Card>
      </div>

      {/* Job Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Active Job Posts
          </CardTitle>
          <CardDescription>
            Overview of all active job postings and their application statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applicationsData.activeJobPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-muted">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                No active job posts found
              </h3>
              <p className="max-w-md mb-4 text-sm text-center text-muted-foreground">
                Create job posts to start receiving applications
              </p>
              <Button
                onClick={() =>
                  (window.location.href = "/org/dashboard/job-postings")
                }
                variant="default"
              >
                Create Job Post
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Applied</TableHead>
                    <TableHead className="text-center">Interview</TableHead>
                    <TableHead className="text-center">Offer</TableHead>
                    <TableHead className="text-center">Accepted</TableHead>
                    <TableHead className="text-center">Rejected</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicationsData.activeJobPosts.map((jobData) => (
                    <TableRow key={jobData.jobPost.id}>
                      <TableCell className="font-medium">
                        {jobData.jobPost.job_title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {jobData.jobPost.jobLevel ||
                            jobData.jobPost.job_level ||
                            jobData.jobPost.level ||
                            "Not specified"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {jobData.jobPost.workingType ||
                            jobData.jobPost.working_type ||
                            jobData.jobPost.work_type ||
                            jobData.jobPost.type ||
                            "Not specified"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-semibold">
                          <span
                            className={
                              (jobData.applications?.filter(
                                (app) => app.status === "applied"
                              ).length || 0) > 0
                                ? "bg-yellow-300 px-2 py-1 rounded"
                                : ""
                            }
                          >
                            {jobData.applications?.filter(
                              (app) => app.status === "applied"
                            ).length || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-semibold">
                          <span
                            className={
                              (jobData.applications?.filter(
                                (app) => app.status === "interview"
                              ).length || 0) > 0
                                ? "bg-yellow-300 px-2 py-1 rounded"
                                : ""
                            }
                          >
                            {jobData.applications?.filter(
                              (app) => app.status === "interview"
                            ).length || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-semibold">
                          <span
                            className={
                              (jobData.applications?.filter(
                                (app) => app.status === "offer"
                              ).length || 0) > 0
                                ? "bg-yellow-300 px-2 py-1 rounded"
                                : ""
                            }
                          >
                            {jobData.applications?.filter(
                              (app) => app.status === "offer"
                            ).length || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-semibold">
                          <span
                            className={
                              (jobData.applications?.filter(
                                (app) => app.status === "accept"
                              ).length || 0) > 0
                                ? "bg-yellow-300 px-2 py-1 rounded"
                                : ""
                            }
                          >
                            {jobData.applications?.filter(
                              (app) => app.status === "accept"
                            ).length || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-semibold">
                          <span
                            className={
                              (jobData.applications?.filter(
                                (app) => app.status === "reject"
                              ).length || 0) > 0
                                ? "bg-yellow-300 px-2 py-1 rounded"
                                : ""
                            }
                          >
                            {jobData.applications?.filter(
                              (app) => app.status === "reject"
                            ).length || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          onClick={() => openInsightDialog(jobData)}
                          variant="outline"
                          size="sm"
                          disabled={jobData.totalApplications === 0}
                          className="w-24"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {jobData.totalApplications === 0 ? "No Apps" : "View"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Insights Dialog */}
      <Dialog
        open={isInsightDialogOpen}
        onOpenChange={(open) => {
          setIsInsightDialogOpen(open);
          if (!open) {
            setSelectedJob(null);
          }
        }}
      >
        <DialogContent className="min-w-[80vw] max-w-4xl h-[80vh] overflow-hidden border-0 bg-white backdrop-blur-xl flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-600/5 rounded-xl"></div>
          <DialogHeader className="relative">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
              <div className="p-2 rounded-lg bg-slate-500/10 backdrop-blur-sm">
                <Briefcase className="w-6 h-6 text-slate-600" />
              </div>
              {selectedJob?.jobPost.job_title} - Applications
            </DialogTitle>
            <DialogDescription className="font-medium text-gray-600">
              Manage applications for this position. Review candidates and
              update their status.
            </DialogDescription>
          </DialogHeader>

          {/* Sticky Tab Bar */}
          <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur-xl">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full h-12 grid-cols-4">
                <TabsTrigger
                  value="applications"
                  className="flex items-center gap-2"
                >
                  Applications
                  <Badge variant="secondary" className="text-xs">
                    {selectedJob?.applications.filter(
                      (app) => app.status === "applied"
                    ).length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="interview-offered"
                  className="flex items-center gap-2"
                >
                  Interview Offered
                  <Badge variant="secondary" className="text-xs">
                    {selectedJob?.applications.filter(
                      (app) => app.status === "interview"
                    ).length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="offered"
                  className="flex items-center gap-2"
                >
                  Offered
                  <Badge variant="secondary" className="text-xs">
                    {selectedJob?.applications.filter(
                      (app) => app.status === "offer"
                    ).length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="accepted"
                  className="flex items-center gap-2"
                >
                  Accepted
                  <Badge variant="secondary" className="text-xs">
                    {selectedJob?.applications.filter(
                      (app) => app.status === "accept"
                    ).length || 0}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 min-h-0 px-4 py-1 overflow-y-auto">
            {activeTab === "applications" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mt-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    Applications
                  </h3>
                  <Badge className="font-semibold text-blue-800 bg-blue-500/20 border-blue-200/50 backdrop-blur-sm">
                    {selectedJob?.applications?.filter(
                      (app) => app.status === "applied"
                    ).length || 0}{" "}
                    candidates
                  </Badge>
                </div>

                {selectedJob?.applications?.filter(
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
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm">
                            Candidate
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Experience
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Applied
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Status
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedJob?.applications
                          ?.filter((app) => app.status === "applied")
                          .map((application) => (
                            <TableRow key={application._id}>
                              <TableCell className="text-xs sm:text-sm">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                                    <User className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {application.fullName}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {application.email}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">
                                <span className="font-medium">
                                  {application.experienceYears} years
                                </span>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">
                                {formatRelativeTime(application.createdAt)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getStatusColor(application.status)}
                                >
                                  {application.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            downloadCv(
                                              application.cvUrl,
                                              application.fullName,
                                              application
                                            )
                                          }
                                          disabled={
                                            loadingButtons[
                                              `download-${application._id}`
                                            ]
                                          }
                                          className="w-8 h-8 p-0 sm:h-9 sm:w-9"
                                        >
                                          {loadingButtons[
                                            `download-${application._id}`
                                          ] ? (
                                            <SpinnerLoader
                                              size="sm"
                                              color="blue"
                                            />
                                          ) : (
                                            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Download CV</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleStatusUpdate(
                                              application._id,
                                              "interview"
                                            )
                                          }
                                          disabled={
                                            loadingButtons[
                                              `${application._id}-interview`
                                            ]
                                          }
                                          className="w-8 h-8 p-0 text-orange-600 sm:h-9 sm:w-9 hover:text-orange-700 hover:bg-orange-50"
                                        >
                                          {loadingButtons[
                                            `${application._id}-interview`
                                          ] ? (
                                            <SpinnerLoader
                                              size="sm"
                                              color="orange"
                                            />
                                          ) : (
                                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Send Interview Offer</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleStatusUpdate(
                                              application._id,
                                              "reject"
                                            )
                                          }
                                          disabled={
                                            loadingButtons[
                                              `${application._id}-reject`
                                            ]
                                          }
                                          className="w-8 h-8 p-0 text-red-600 sm:h-9 sm:w-9 hover:text-red-700 hover:bg-red-50"
                                        >
                                          {loadingButtons[
                                            `${application._id}-reject`
                                          ] ? (
                                            <SpinnerLoader
                                              size="sm"
                                              color="red"
                                            />
                                          ) : (
                                            <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Reject Application</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "interview-offered" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mt-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Interview Offered
                  </h3>
                  <Badge className="font-semibold text-orange-800 bg-orange-500/20 border-orange-200/50 backdrop-blur-sm">
                    {
                      selectedJob?.applications.filter(
                        (app) => app.status === "interview"
                      ).length
                    }{" "}
                    candidates
                  </Badge>
                </div>

                {selectedJob?.applications.filter(
                  (app) => app.status === "interview"
                ).length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm">
                      <Calendar className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-lg font-medium text-gray-600">
                      No interview offers sent yet
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm">
                            Candidate
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Experience
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Interview Date
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Status
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedJob?.applications
                          .filter((app) => app.status === "interview")
                          .map((application) => (
                            <TableRow key={application._id}>
                              <TableCell className="text-xs sm:text-sm">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                                    <User className="w-5 h-5 text-orange-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {application.fullName}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {application.email}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">
                                <span className="font-medium">
                                  {application.experienceYears} years
                                </span>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">
                                {formatRelativeTime(
                                  application.updatedAt || application.createdAt
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getStatusColor(application.status)}
                                >
                                  {application.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            downloadCv(
                                              application.cvUrl,
                                              application.fullName,
                                              application
                                            )
                                          }
                                          disabled={
                                            loadingButtons[
                                              `download-${application._id}`
                                            ]
                                          }
                                          className="w-8 h-8 p-0 sm:h-9 sm:w-9"
                                        >
                                          {loadingButtons[
                                            `download-${application._id}`
                                          ] ? (
                                            <SpinnerLoader
                                              size="sm"
                                              color="orange"
                                            />
                                          ) : (
                                            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Download CV</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleStatusUpdate(
                                              application._id,
                                              "offer"
                                            )
                                          }
                                          disabled={
                                            loadingButtons[
                                              `${application._id}-offer`
                                            ]
                                          }
                                          className="w-8 h-8 p-0 text-purple-600 sm:h-9 sm:w-9 hover:text-purple-700 hover:bg-purple-50"
                                        >
                                          {loadingButtons[
                                            `${application._id}-offer`
                                          ] ? (
                                            <SpinnerLoader
                                              size="sm"
                                              color="purple"
                                            />
                                          ) : (
                                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Send Job Offer</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleStatusUpdate(
                                              application._id,
                                              "reject"
                                            )
                                          }
                                          disabled={
                                            loadingButtons[
                                              `${application._id}-reject`
                                            ]
                                          }
                                          className="w-8 h-8 p-0 text-red-600 sm:h-9 sm:w-9 hover:text-red-700 hover:bg-red-50"
                                        >
                                          {loadingButtons[
                                            `${application._id}-reject`
                                          ] ? (
                                            <SpinnerLoader
                                              size="sm"
                                              color="red"
                                            />
                                          ) : (
                                            <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Reject Application</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "offered" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mt-4">
                  <h3 className="text-xl font-bold text-gray-900">Offered</h3>
                  <Badge className="font-semibold text-purple-800 bg-purple-500/20 border-purple-200/50 backdrop-blur-sm">
                    {
                      selectedJob?.applications.filter(
                        (app) => app.status === "offer"
                      ).length
                    }{" "}
                    candidates
                  </Badge>
                </div>

                {selectedJob?.applications.filter(
                  (app) => app.status === "offer"
                ).length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm">
                      <Gift className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-lg font-medium text-gray-600">
                      No offers sent yet
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm">
                            Candidate
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Experience
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Offer Date
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Status
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedJob?.applications
                          .filter((app) => app.status === "offer")
                          .map((application) => (
                            <TableRow key={application._id}>
                              <TableCell className="text-xs sm:text-sm">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                                    <User className="w-5 h-5 text-purple-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {application.fullName}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {application.email}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">
                                <span className="font-medium">
                                  {application.experienceYears} years
                                </span>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">
                                {formatRelativeTime(
                                  application.updatedAt || application.createdAt
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getStatusColor(application.status)}
                                >
                                  {application.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            downloadCv(
                                              application.cvUrl,
                                              application.fullName,
                                              application
                                            )
                                          }
                                          disabled={
                                            loadingButtons[
                                              `download-${application._id}`
                                            ]
                                          }
                                          className="w-8 h-8 p-0 sm:h-9 sm:w-9"
                                        >
                                          {loadingButtons[
                                            `download-${application._id}`
                                          ] ? (
                                            <SpinnerLoader
                                              size="sm"
                                              color="purple"
                                            />
                                          ) : (
                                            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Download CV</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleStatusUpdate(
                                              application._id,
                                              "accept"
                                            )
                                          }
                                          disabled={
                                            loadingButtons[
                                              `${application._id}-accept`
                                            ]
                                          }
                                          className="w-8 h-8 p-0 text-green-600 sm:h-9 sm:w-9 hover:text-green-700 hover:bg-green-50"
                                        >
                                          {loadingButtons[
                                            `${application._id}-accept`
                                          ] ? (
                                            <SpinnerLoader
                                              size="sm"
                                              color="green"
                                            />
                                          ) : (
                                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Accept Application</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleStatusUpdate(
                                              application._id,
                                              "reject"
                                            )
                                          }
                                          disabled={
                                            loadingButtons[
                                              `${application._id}-reject`
                                            ]
                                          }
                                          className="w-8 h-8 p-0 text-red-600 sm:h-9 sm:w-9 hover:text-red-700 hover:bg-red-50"
                                        >
                                          {loadingButtons[
                                            `${application._id}-reject`
                                          ] ? (
                                            <SpinnerLoader
                                              size="sm"
                                              color="red"
                                            />
                                          ) : (
                                            <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Reject Application</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "accepted" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mt-4">
                  <h3 className="text-xl font-bold text-gray-900">Accepted</h3>
                  <Badge className="font-semibold text-green-800 bg-green-500/20 border-green-200/50 backdrop-blur-sm">
                    {
                      selectedJob?.applications.filter(
                        (app) => app.status === "accept"
                      ).length
                    }{" "}
                    candidates
                  </Badge>
                </div>

                {selectedJob?.applications.filter(
                  (app) => app.status === "accept"
                ).length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm">
                      <CheckCircle className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-lg font-medium text-gray-600">
                      No accepted candidates yet
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm">
                            Candidate
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Experience
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Accepted Date
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Status
                          </TableHead>
                          <TableHead className="text-xs sm:text-sm">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedJob?.applications
                          .filter((app) => app.status === "accept")
                          .map((application) => (
                            <TableRow key={application._id}>
                              <TableCell className="text-xs sm:text-sm">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                                    <User className="w-5 h-5 text-green-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {application.fullName}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {application.email}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">
                                <span className="font-medium">
                                  {application.experienceYears} years
                                </span>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm">
                                {formatRelativeTime(
                                  application.updatedAt || application.createdAt
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getStatusColor(application.status)}
                                >
                                  {application.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            downloadCv(
                                              application.cvUrl,
                                              application.fullName,
                                              application
                                            )
                                          }
                                          disabled={
                                            loadingButtons[
                                              `download-${application._id}`
                                            ]
                                          }
                                          className="w-8 h-8 p-0 sm:h-9 sm:w-9"
                                        >
                                          {loadingButtons[
                                            `download-${application._id}`
                                          ] ? (
                                            <SpinnerLoader
                                              size="sm"
                                              color="green"
                                            />
                                          ) : (
                                            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Download CV</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      <Toaster position="top-center" richColors />
    </div>
  );
}
