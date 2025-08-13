"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OrganizationManagementContent } from "@/components/dashboard/OrganizationManagementContent";

export default function OrganizationManagementPage() {
  return (
    <DashboardLayout title="Organization Insights">
      <OrganizationManagementContent />
    </DashboardLayout>
  );
}