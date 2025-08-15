"use client";

import { OrgSidebar } from "@/components/org-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function OrgDashboardLayout({
  children,
  title = "Organization Dashboard",
}) {
  return (
    // TODO: When implementing org authentication, wrap with ProtectedRoute
    // Example: <ProtectedRoute>
    <div className="min-h-screen bg-white org-dashboard">
      <SidebarProvider>
        <OrgSidebar />
        <SidebarInset className="bg-white">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-white border-b border-gray-200">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1 text-gray-700" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4 bg-gray-300"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink
                      href="/org/dashboard"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Organization Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-gray-900">
                      {title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-col flex-1 gap-4 p-4 pt-0 bg-gray-50">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
    // TODO: Close ProtectedRoute when implementing org authentication
    // Example: </ProtectedRoute>
  );
}
