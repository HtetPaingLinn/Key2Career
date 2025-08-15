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
      title: "Member Management",
      url: "/org/dashboard/members",
      icon: Users,
      isSimpleButton: true,
    },
    {
      title: "Analytics & Reports",
      url: "/org/dashboard/analytics",
      icon: BarChart3,
      isSimpleButton: true,
    },
    {
      title: "Organization Settings",
      url: "/org/dashboard/settings",
      icon: Settings2,
      isSimpleButton: true,
    },
  ],
  projects: [
    {
      name: "Website Redesign",
      url: "#",
      icon: Frame,
    },
    {
      name: "Mobile App Development",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Database Migration",
      url: "#",
      icon: Map,
    },
  ],
};

export function OrgSidebar({ ...props }) {
  const [orgData, setOrgData] = useState({
    name: "",
    email: "",
    avatar: "",
  });

  useEffect(() => {
    // TODO: When implementing org authentication, fetch actual org data
    // For now, use mock data
    setOrgData({
      name: "Tech Solutions Inc",
      email: "admin@techsolutions.com",
      avatar: "",
    });
  }, []);

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
              <span className="text-xs text-gray-600 truncate">
                {orgData.name || "Organization"}
              </span>
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
        <NavProjects projects={sidebarData.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={orgData} />
      </SidebarFooter>
    </Sidebar>
  );
}
