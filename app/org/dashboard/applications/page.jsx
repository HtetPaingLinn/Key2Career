"use client";

import { OrgDashboardLayout } from "@/components/dashboard/OrgDashboardLayout";
import { OrgPlaceholderContent } from "@/components/dashboard/OrgPlaceholderContent";

export default function OrgApplicationsPage() {
  return (
    <OrgDashboardLayout title="Application Management">
      <OrgPlaceholderContent
        title="Application Management"
        description="Manage job applications, review candidates, and track hiring progress. This feature will allow organizations to view and manage all incoming applications."
      />
    </OrgDashboardLayout>
  );
}
