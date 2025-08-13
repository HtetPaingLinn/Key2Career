"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to organization management as the default dashboard view
    router.replace("/admin/dashboard/org-mgmt");
  }, [router]);

  return null; // This page will redirect, so no need to render anything
}
