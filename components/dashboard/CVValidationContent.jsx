"use client";

import { useEffect, useState } from "react";
import { CVValidationTable } from "@/components/cv-validation-table";
import { ChartAreaGradient } from "@/components/ui/chart-area-gradient";
import { ChartPieLabel } from "@/components/ui/chart-pie-label-custom";

function normalizeStatus(status) {
  if (!status) return "no_request";
  const s = String(status).trim().toLowerCase();
  if (s === "approved") return "approved";
  if (s === "rejected") return "rejected";
  if (s === "pending") return "pending";
  return "no_request";
}

export function CVValidationContent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCVValidationRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/admin/cv-validation-requests", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const cvRequests = await response.json();

        const cvRequestsWithIds = cvRequests.map((cv, index) => ({
          ...cv,
          id: index + 1,
        }));

        setData(cvRequestsWithIds);
      } catch (err) {
        console.error("Error fetching CV validation requests:", err);
        setError(err.message || "Failed to fetch CV validation requests");
      } finally {
        setLoading(false);
      }
    };

    fetchCVValidationRequests();
  }, []);

  const handleStatusUpdate = (email, newStatus) => {
    setData(prevData => 
      prevData.map(cv => 
        cv.email === email 
          ? { ...cv, validationStatus: newStatus, validationApprovedAt: newStatus === 'approved' ? new Date() : null }
          : cv
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading CV validation requests...</div>
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

  const counts = data.reduce((acc, cv) => {
    const norm = normalizeStatus(cv.validationStatus);
    acc[norm] = (acc[norm] || 0) + 1;
    return acc;
  }, {});

  const chartData = [
    { status: "pending", count: counts.pending || 0, fill: "var(--color-pending)" },
    { status: "approved", count: counts.approved || 0, fill: "var(--color-approved)" },
    { status: "rejected", count: counts.rejected || 0, fill: "var(--color-rejected)" },
    { status: "no_request", count: counts.no_request || 0, fill: "var(--color-no_request)" },
  ];

  const chartConfig = {
    visitors: {
      label: "CV Requests",
    },
    pending: {
      label: "Pending",
      color: "var(--chart-1)",
    },
    approved: {
      label: "Approved",
      color: "var(--chart-2)",
    },
    rejected: {
      label: "Rejected",
      color: "var(--chart-3)",
    },
    no_request: {
      label: "No Request",
      color: "var(--chart-4)",
    },
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-[1fr_2fr] px-4 lg:px-6">
        <ChartPieLabel
          chartData={chartData}
          chartConfig={chartConfig}
          className="w-full min-w-0"
          title="CV Validation Status Distribution"
          description="Current validation status overview"
          footerPrimaryText={`Total CVs: ${chartData.reduce((acc, item) => acc + (item.count || 0), 0)}`}
          footerSecondaryText="Showing validation status distribution"
        />
        <ChartAreaGradient
          className="w-full min-w-0"
          title="CV Validation Requests over time"
          description="Monthly validation activity"
          footerPrimaryText="Trend vs previous period"
          footerSecondaryText="Jan - Jun 2024"
        />
      </div>
      <CVValidationTable initialData={data} onStatusUpdate={handleStatusUpdate} />
    </div>
  );
}
