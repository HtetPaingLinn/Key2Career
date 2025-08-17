"use client";

import { OrgDashboardLayout } from "@/components/dashboard/OrgDashboardLayout";
import { OrgApplicationsContent } from "@/components/dashboard/OrgApplicationsContent";

export default function OrgApplicationsPage() {
  return (
    <OrgDashboardLayout title="Application Management">
      <OrgApplicationsContent />
    </OrgDashboardLayout>
  );
}
