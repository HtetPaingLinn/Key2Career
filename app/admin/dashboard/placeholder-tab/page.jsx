"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PlaceholderTabContent } from "@/components/dashboard/PlaceholderTabContent";

export default function PlaceholderTabPage() {
  return (
    <DashboardLayout title="Placeholder Tab">
      <PlaceholderTabContent />
    </DashboardLayout>
  );
}