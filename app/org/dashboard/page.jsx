"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrgDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to organization overview as the default dashboard view
    // TODO: When implementing org login, add authentication check here
    // Example: if (!isOrgLoggedIn) router.replace("/org/login");
    router.replace("/org/dashboard/overview");
  }, [router]);

  return null; // This page will redirect, so no need to render anything
}
