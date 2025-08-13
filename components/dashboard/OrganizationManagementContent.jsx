"use client";

import { useEffect, useState } from "react";
import { OrganizationTable } from "@/components/organization-table";
import { ChartAreaGradient } from "@/components/ui/chart-area-gradient";
import { ChartPieLabel } from "@/components/ui/chart-pie-label-custom";

function normalizeStatus(status) {
  if (!status) return "unknown";
  const s = String(status).trim().toLowerCase();
  if (s.includes("ban")) return "banned";
  if (s === "verified" || s.includes("verify")) return "verified";
  if (
    s === "waiting for approvement" ||
    s === "waiting for approval" ||
    s.includes("wait") ||
    s.includes("pending") ||
    s.includes("approv")
  ) {
    return "waiting_for_approval";
  }
  return s;
}

export function OrganizationManagementContent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        setError(null);

        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8080/api/admin/orgs", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const organizations = await response.json();

        const organizationsWithIds = organizations.map((org, index) => ({
          ...org,
          id: index + 1,
        }));

        setData(organizationsWithIds);
      } catch (err) {
        console.error("Error fetching organizations:", err);
        setError(err.message || "Failed to fetch organizations");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading organizations...</div>
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

  const counts = data.reduce((acc, org) => {
    const norm = normalizeStatus(org.status);
    acc[norm] = (acc[norm] || 0) + 1;
    return acc;
  }, {});

  const chartData = [
    { status: "waiting_for_approval", count: counts.waiting_for_approval || 0, fill: "var(--color-waiting_for_approval)" },
    { status: "verified", count: counts.verified || 0, fill: "var(--color-verified)" },
    { status: "banned", count: counts.banned || 0, fill: "var(--color-banned)" },
  ];

  const chartConfig = {
    visitors: {
      label: "Organizations",
    },
    waiting_for_approval: {
      label: "Waiting for Approval",
      color: "var(--chart-1)",
    },
    verified: {
      label: "Verified",
      color: "var(--chart-2)",
    },
    banned: {
      label: "Banned",
      color: "var(--chart-3)",
    },
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-[1fr_2fr] px-4 lg:px-6">
        <ChartPieLabel
          chartData={chartData}
          chartConfig={chartConfig}
          className="w-full min-w-0"
          title="Organization Status Distribution"
          description="Current status overview"
          footerPrimaryText={`Total organizations: ${chartData.reduce((acc, item) => acc + (item.count || 0), 0)}`}
          footerSecondaryText="Showing status distribution of organizations"
        />
        <ChartAreaGradient
          className="w-full min-w-0"
          title="Organizations over time"
          description="Monthly activity"
          footerPrimaryText="Trend vs previous period"
          footerSecondaryText="Jan - Jun 2024"
        />
      </div>
      <OrganizationTable initialData={data} />
    </div>
  );
}
