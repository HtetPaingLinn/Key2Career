import { OrgDashboardLayout } from "@/components/dashboard/OrgDashboardLayout";
import { OrgJobPostingsContent } from "@/components/dashboard/OrgJobPostingsContent";

export default function JobPostingsPage() {
  return (
    <OrgDashboardLayout title="Job Postings">
      <OrgJobPostingsContent />
    </OrgDashboardLayout>
  );
}
