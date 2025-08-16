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
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { AdminManagementModal } from "@/components/AdminManagementModal";

const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Admin Management",
      icon: LayoutDashboard,
      isSimpleButton: true,
      // Remove url so it doesn't navigate
    },
    {
      title: "Organizations",
      url: "/admin/dashboard/org-mgmt",
      icon: LayoutDashboard,
      isSimpleButton: true,
    },
    {
      title: "CV Validation",
      url: "/admin/dashboard/cv-validation",
      icon: LayoutDashboard,
      isSimpleButton: true,
    },
    {
      title: "Placeholder Tab",
      url: "/admin/dashboard/placeholder-tab",
      icon: LayoutDashboard,
      isSimpleButton: true,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }) {
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    avatar: "",
  });
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Get the email from localStorage or wherever you store it after login
        const adminEmail = localStorage.getItem("adminEmail");
        const jwt = localStorage.getItem("jwt");
        if (!adminEmail || !jwt) return;

        const response = await fetch(
          `http://localhost:8080/api/common/profileData?email=${adminEmail}`,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch admin data");

        const data = await response.json();
        console.log("Fetched admin data:", data);
        setAdminData({
          name: data.name || "",
          email: adminEmail,
          avatar: data.profileImage || "", // Adjust based on your API response structure
        });
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    fetchAdminData();
  }, []);

  // Custom NavMain rendering to handle Admin Management modal
  const customNavMain = (
    <SidebarGroup>
      <SidebarGroupLabel>Tools</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem key="Admin Management">
          <SidebarMenuButton
            tooltip="Admin Management"
            onClick={() => setAdminModalOpen(true)}
            className="bg-primary text-white hover:bg-primary/90 hover:text-white focus-visible:ring-2 focus-visible:ring-secondary cursor-pointer"
          >
            <Plus />
            <span>Admin Management</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {data.navMain.slice(1).map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild tooltip={item.title}>
              <a href={item.url}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <div className="flex flex-col gap-2 p-4 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Command className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Welcome back</span>
                <span className="truncate text-xs text-muted-foreground">
                  {adminData.name || "Admin"}
                </span>
              </div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {customNavMain}
          <NavProjects projects={data.projects} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={adminData} />
        </SidebarFooter>
      </Sidebar>
      <AdminManagementModal
        open={adminModalOpen}
        onOpenChange={setAdminModalOpen}
      />
    </>
  );
}
