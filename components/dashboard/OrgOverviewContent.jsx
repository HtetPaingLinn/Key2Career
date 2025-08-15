"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ChartAreaGradient } from "@/components/ui/chart-area-gradient";
import { ChartPieLabel } from "@/components/ui/chart-pie-label-custom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Users,
  Clock,
  Building2,
  TrendingUp,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// TODO: When implementing org authentication, replace with actual org data fetching
// Example: const orgId = getCurrentOrgId(); // Get from auth context
const MOCK_ORG_EMAIL = "delamain@org.net"; // Temporary mock data - using actual org email for testing

export function OrgOverviewContent() {
  const [data, setData] = useState({
    totalJobPosts: 0,
    activeJobPosts: 0,
    pendingApplications: 0,
    organizationMembers: 0,
    recentJobPosts: [],
    applicationStats: {
      total: 0,
      pending: 0,
      reviewed: 0,
      hired: 0,
    },
    monthlyTrends: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrgData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.time("Org Overview Data Fetch");

      // Get JWT token from localStorage
      const jwt = localStorage.getItem("jwt");
      const headers = {};

      if (jwt) {
        headers["Authorization"] = `Bearer ${jwt}`;
        console.log("JWT token found and added to headers");
      } else {
        console.warn("No JWT token found in localStorage");
      }

      // Fetch data from the new API endpoint
      const response = await fetch(
        `/api/org/overview?org_email=${MOCK_ORG_EMAIL}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch organization data");
      }

      const overviewData = await response.json();
      console.timeEnd("Org Overview Data Fetch");
      setData(overviewData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching organization data:", err);
      setError(err.message || "Failed to fetch organization data");
      setLoading(false);
    }
  }, []);

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(
    () => [
      {
        category: "Active Job Posts",
        count: data.activeJobPosts,
        fill: "var(--chart-1)",
      },
      {
        category: "Pending Applications",
        count: data.pendingApplications,
        fill: "var(--chart-2)",
      },
      {
        category: "Organization Members",
        count: data.organizationMembers,
        fill: "var(--chart-3)",
      },
    ],
    [data.activeJobPosts, data.pendingApplications, data.organizationMembers]
  );

  const chartConfig = useMemo(
    () => ({
      visitors: {
        label: "Organization Metrics",
      },
      Active_Job_Posts: {
        label: "Active Job Posts",
        color: "var(--chart-1)",
      },
      Pending_Applications: {
        label: "Pending Applications",
        color: "var(--chart-2)",
      },
      Organization_Members: {
        label: "Organization Members",
        color: "var(--chart-3)",
      },
    }),
    []
  );

  useEffect(() => {
    fetchOrgData();
  }, [fetchOrgData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading organization data...</div>
      </div>
    );
  }

  if (error) {
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

  return (
    <div className="mx-3 mt-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* First row */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Briefcase className="w-4 h-4" />
              Total Job Posts
            </CardTitle>
            <Badge variant="secondary">{data.totalJobPosts}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalJobPosts}</div>
            <p className="text-xs text-muted-foreground">
              All time job postings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Active Job Posts
            </CardTitle>
            <Badge variant="outline">{data.activeJobPosts}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeJobPosts}</div>
            <p className="text-xs text-muted-foreground">
              Currently open positions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4" />
              Pending Applications
            </CardTitle>
            <Badge variant="destructive">{data.pendingApplications}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">
              Applications awaiting review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4" />
              Organization Members
            </CardTitle>
            <Badge variant="default">{data.organizationMembers}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.organizationMembers}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-[1fr_2fr] px-0.5">
        <ChartPieLabel
          chartData={chartData}
          chartConfig={chartConfig}
          className="w-full min-w-0"
          title="Organization Activity Overview"
          description="Current metrics distribution"
          footerPrimaryText={`Total activities: ${chartData.reduce((acc, item) => acc + (item.count || 0), 0)}`}
          footerSecondaryText="Showing organization activity metrics"
        />
        <ChartAreaGradient
          className="w-full min-w-0"
          title="Job Posting Trends"
          description="Monthly job posting activity"
          footerPrimaryText="Growth vs previous period"
          footerSecondaryText="Jan - Jun 2024"
        />
      </div>

      {/* Recent Job Posts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5" />
              Recent Job Posts
            </CardTitle>
            <CardDescription>
              Latest job postings by your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentJobPosts && data.recentJobPosts.length > 0 ? (
                data.recentJobPosts.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{job.job_title}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {job.job_level}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {job.working_type}
                        </Badge>
                        <Badge
                          variant={
                            job.status === "active" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Posted</p>
                      <p className="text-xs font-medium">
                        {formatDate(job.posted_date)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center p-6 text-center">
                  <div className="space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No job posts yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Create your first job posting to get started
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Application Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              Application Statistics
            </CardTitle>
            <CardDescription>
              Overview of application processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Applications</span>
                <span className="font-semibold">
                  {data.applicationStats?.total || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending Review</span>
                <span className="font-semibold text-yellow-600">
                  {data.applicationStats?.pending || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Reviewed</span>
                <span className="font-semibold text-blue-600">
                  {data.applicationStats?.reviewed || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Hired</span>
                <span className="font-semibold text-green-600">
                  {data.applicationStats?.hired || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
