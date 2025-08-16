"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CVValidationContent } from "@/components/dashboard/CVValidationContent";

export default function CVValidationPage() {
  return (
    <DashboardLayout title="CV Validation Management">
      <CVValidationContent />
    </DashboardLayout>
  );
}
