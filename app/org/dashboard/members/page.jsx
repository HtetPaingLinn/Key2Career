"use client";

import { OrgDashboardLayout } from "@/components/dashboard/OrgDashboardLayout";
import { OrgMembersContent } from "@/components/dashboard/OrgMembersContent";

export default function OrgMembersPage() {
  return (
    <OrgDashboardLayout title="Member Management">
      <OrgMembersContent />
    </OrgDashboardLayout>
  );
}
