"use client";

import { useEffect, useState } from "react";
import { ChartAreaGradient } from "@/components/ui/chart-area-gradient";
import { ChartPieLabel } from "@/components/ui/chart-pie-label-custom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// TODO: When implementing org authentication, replace with actual project data fetching
const MOCK_PROJECTS = [
  {
    id: 1,
    name: "Website Redesign",
    status: "In Progress",
    priority: "High",
    teamSize: 5,
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    progress: 65,
  },
  {
    id: 2,
    name: "Mobile App Development",
    status: "Planning",
    priority: "Medium",
    teamSize: 8,
    startDate: "2024-03-01",
    endDate: "2024-12-31",
    progress: 15,
  },
  {
    id: 3,
    name: "Database Migration",
    status: "Completed",
    priority: "High",
    teamSize: 3,
    startDate: "2024-02-01",
    endDate: "2024-04-15",
    progress: 100,
  },
  {
    id: 4,
    name: "Security Audit",
    status: "In Progress",
    priority: "Critical",
    teamSize: 2,
    startDate: "2024-03-15",
    endDate: "2024-05-30",
    progress: 40,
  },
  {
    id: 5,
    name: "API Integration",
    status: "On Hold",
    priority: "Low",
    teamSize: 4,
    startDate: "2024-04-01",
    endDate: "2024-07-31",
    progress: 25,
  },
];

export function OrgProjectsContent() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: When implementing org authentication, add proper API calls
        // Example: const response = await fetch(`/api/org/${orgId}/projects`, {
        //   headers: { Authorization: `Bearer ${orgJwt}` }
        // });

        // Mock data for now
        setTimeout(() => {
          setProjects(MOCK_PROJECTS);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err.message || "Failed to fetch projects");
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.priority.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusCounts = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {});

  const priorityCounts = projects.reduce((acc, project) => {
    acc[project.priority] = (acc[project.priority] || 0) + 1;
    return acc;
  }, {});

  const chartData = [
    {
      status: "In Progress",
      count: statusCounts["In Progress"] || 0,
      fill: "var(--chart-1)",
    },
    {
      status: "Completed",
      count: statusCounts["Completed"] || 0,
      fill: "var(--chart-2)",
    },
    {
      status: "Planning",
      count: statusCounts["Planning"] || 0,
      fill: "var(--chart-3)",
    },
    {
      status: "On Hold",
      count: statusCounts["On Hold"] || 0,
      fill: "var(--chart-4)",
    },
  ];

  const chartConfig = {
    visitors: {
      label: "Projects",
    },
    In_Progress: {
      label: "In Progress",
      color: "var(--chart-1)",
    },
    Completed: {
      label: "Completed",
      color: "var(--chart-2)",
    },
    Planning: {
      label: "Planning",
      color: "var(--chart-3)",
    },
    On_Hold: {
      label: "On Hold",
      color: "var(--chart-4)",
    },
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "In Progress":
        return "default";
      case "Completed":
        return "secondary";
      case "Planning":
        return "outline";
      case "On Hold":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case "Critical":
        return "destructive";
      case "High":
        return "default";
      case "Medium":
        return "outline";
      case "Low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 60) return "text-blue-600";
    if (progress >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <Badge variant="secondary">{projects.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Badge variant="default">{statusCounts["In Progress"] || 0}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusCounts["In Progress"] || 0}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Badge variant="secondary">{statusCounts["Completed"] || 0}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusCounts["Completed"] || 0}
            </div>
            <p className="text-xs text-muted-foreground">Finished projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Badge variant="destructive">
              {priorityCounts["High"] || 0 + priorityCounts["Critical"] || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {priorityCounts["High"] || 0 + priorityCounts["Critical"] || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              High priority projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-[1fr_2fr] px-4 lg:px-6">
        <ChartPieLabel
          chartData={chartData}
          chartConfig={chartConfig}
          className="w-full min-w-0"
          title="Project Status Distribution"
          description="Current project status overview"
          footerPrimaryText={`Total projects: ${projects.length}`}
          footerSecondaryText="Showing status distribution of projects"
        />
        <ChartAreaGradient
          className="w-full min-w-0"
          title="Project Progress"
          description="Monthly project completion"
          footerPrimaryText="Progress vs timeline"
          footerSecondaryText="Jan - Jun 2024"
        />
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Projects</CardTitle>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline">Create Project</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Team Size</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityBadgeVariant(project.priority)}>
                      {project.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{project.teamSize} members</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(project.progress).replace("text-", "bg-")}`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span
                        className={`text-sm ${getProgressColor(project.progress)}`}
                      >
                        {project.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{project.startDate}</div>
                      <div className="text-muted-foreground">
                        to {project.endDate}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
