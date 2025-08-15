"use client";

import { OrgDashboardLayout } from "@/components/dashboard/OrgDashboardLayout";
import { OrgPlaceholderContent } from "@/components/dashboard/OrgPlaceholderContent";

export default function OrgAnalyticsPage() {
  return (
    <OrgDashboardLayout title="Analytics & Reports">
      <OrgPlaceholderContent
        title="Analytics & Reports"
        description="Comprehensive analytics and reporting tools for organization performance, member activity, project metrics, and business insights."
      />
    </OrgDashboardLayout>
  );
}
