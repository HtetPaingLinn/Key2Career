"use client";

import { OrgDashboardLayout } from "@/components/dashboard/OrgDashboardLayout";
import { OrgProjectsContent } from "@/components/dashboard/OrgProjectsContent";

export default function OrgProjectsPage() {
  return (
    <OrgDashboardLayout title="Project Management">
      <OrgProjectsContent />
    </OrgDashboardLayout>
  );
}
