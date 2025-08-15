"use client";

import { OrgDashboardLayout } from "@/components/dashboard/OrgDashboardLayout";
import { OrgPlaceholderContent } from "@/components/dashboard/OrgPlaceholderContent";

export default function OrgSettingsPage() {
  return (
    <OrgDashboardLayout title="Organization Settings">
      <OrgPlaceholderContent
        title="Organization Settings"
        description="Configure organization preferences, manage team permissions, set up integrations, and customize dashboard settings."
      />
    </OrgDashboardLayout>
  );
}
