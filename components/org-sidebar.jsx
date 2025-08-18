"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  LayoutDashboard,
  Plus,
  Users,
  Briefcase,
  FileText,
  BarChart3,
  Building2,
  Code,
  Database,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";

const sidebarData = {
  teams: [
    {
      name: "Tech Solutions Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Innovation Labs",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Digital Dynamics",
      logo: Command,
      plan: "Premium",
    },
  ],
  navMain: [
    {
      title: "Overview",
      url: "/org/dashboard/overview",
      icon: LayoutDashboard,
      isSimpleButton: true,
    },
    {
      title: "Job Postings",
      url: "/org/dashboard/job-postings",
      icon: Briefcase,
      isSimpleButton: true,
    },
    {
      title: "Applications",
      url: "/org/dashboard/applications",
      icon: FileText,
      isSimpleButton: true,
    },
    {
      title: "Organization Settings",
      url: "/org/dashboard/settings",
      icon: Settings2,
      isSimpleButton: true,
    },
  ],
  recentJobs: [
    {
      name: "Senior Frontend Developer",
      url: "/org/dashboard/applications",
      icon: Code,
    },
    {
      name: "Backend Engineer",
      url: "/org/dashboard/applications",
      icon: Database,
    },
    {
      name: "Product Manager",
      url: "/org/dashboard/applications",
      icon: Building2,
    },
  ],
};

export function OrgSidebar({ ...props }) {
  const { userEmail, isAuthenticated, isLoading } = useAuth();
  const [orgData, setOrgData] = useState({
    name: "",
    email: "",
    avatar: "",
  });

  useEffect(() => {
    if (isAuthenticated && userEmail) {
      // Extract organization name from email domain or use email as fallback
      const orgName =
        userEmail.split("@")[1]?.split(".")[0] || userEmail.split("@")[0];
      const formattedOrgName =
        orgName.charAt(0).toUpperCase() +
        orgName.slice(1).replace(/[^a-zA-Z]/g, " ");

      setOrgData({
        name: formattedOrgName,
        email: userEmail,
        avatar: "",
      });
    } else if (!isLoading) {
      // If not authenticated and not loading, set default values
      setOrgData({
        name: "Organization",
        email: "",
        avatar: "",
      });
    }
  }, [userEmail, isAuthenticated, isLoading]);

  return (
    <Sidebar
      collapsible="icon"
      className="bg-white org-sidebar-with-border"
      style={{
        "--sidebar-border": "#1f2937",
      }}
      {...props}
    >
      <SidebarHeader>
        <div className="flex flex-col gap-2 p-4 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center text-white rounded-lg bg-primary aspect-square size-8">
              <Command className="size-4" />
            </div>
            <div className="grid flex-1 text-sm leading-tight text-left">
              <span className="font-semibold text-gray-900 truncate">
                Welcome back
              </span>
              {orgData.email && (
                <span className="text-xs text-gray-500 truncate">
                  {orgData.email}
                </span>
              )}
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700">
            Organization Tools
          </SidebarGroupLabel>
          <SidebarMenu>
            {sidebarData.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a
                    href={item.url}
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  >
                    {item.icon && <item.icon className="size-4" />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <NavProjects projects={sidebarData.recentJobs} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={orgData} />
      </SidebarFooter>
    </Sidebar>
  );
}
