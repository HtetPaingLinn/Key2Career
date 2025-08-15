"use client";

import { OrgDashboardLayout } from "@/components/dashboard/OrgDashboardLayout";
import { OrgOverviewContent } from "@/components/dashboard/OrgOverviewContent";

export default function OrgOverviewPage() {
  return (
    <OrgDashboardLayout title="Organization Overview">
      <OrgOverviewContent />
    </OrgDashboardLayout>
  );
}
