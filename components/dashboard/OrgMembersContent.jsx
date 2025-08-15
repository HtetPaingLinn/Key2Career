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

// TODO: When implementing org authentication, replace with actual member data fetching
const MOCK_MEMBERS = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Developer",
    status: "Active",
    joinDate: "2024-01-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Designer",
    status: "Active",
    joinDate: "2024-02-20",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "Manager",
    status: "Inactive",
    joinDate: "2024-03-10",
  },
  {
    id: 4,
    name: "Alice Brown",
    email: "alice@example.com",
    role: "Developer",
    status: "Active",
    joinDate: "2024-01-30",
  },
  {
    id: 5,
    name: "Charlie Wilson",
    email: "charlie@example.com",
    role: "Analyst",
    status: "Pending",
    joinDate: "2024-04-05",
  },
];

export function OrgMembersContent() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: When implementing org authentication, add proper API calls
        // Example: const response = await fetch(`/api/org/${orgId}/members`, {
        //   headers: { Authorization: `Bearer ${orgJwt}` }
        // });

        // Mock data for now
        setTimeout(() => {
          setMembers(MOCK_MEMBERS);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error fetching members:", err);
        setError(err.message || "Failed to fetch members");
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading members...</div>
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

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusCounts = members.reduce((acc, member) => {
    acc[member.status] = (acc[member.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = [
    {
      status: "Active",
      count: statusCounts.Active || 0,
      fill: "var(--chart-1)",
    },
    {
      status: "Inactive",
      count: statusCounts.Inactive || 0,
      fill: "var(--chart-2)",
    },
    {
      status: "Pending",
      count: statusCounts.Pending || 0,
      fill: "var(--chart-3)",
    },
  ];

  const chartConfig = {
    visitors: {
      label: "Members",
    },
    Active: {
      label: "Active",
      color: "var(--chart-1)",
    },
    Inactive: {
      label: "Inactive",
      color: "var(--chart-2)",
    },
    Pending: {
      label: "Pending",
      color: "var(--chart-3)",
    },
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Active":
        return "default";
      case "Inactive":
        return "secondary";
      case "Pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Badge variant="secondary">{members.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">
              Organization members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Active Members
            </CardTitle>
            <Badge variant="default">{statusCounts.Active || 0}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.Active || 0}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Badge variant="outline">{statusCounts.Pending || 0}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusCounts.Pending || 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Badge variant="secondary">{statusCounts.Inactive || 0}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusCounts.Inactive || 0}
            </div>
            <p className="text-xs text-muted-foreground">Inactive members</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-[1fr_2fr] px-4 lg:px-6">
        <ChartPieLabel
          chartData={chartData}
          chartConfig={chartConfig}
          className="w-full min-w-0"
          title="Member Status Distribution"
          description="Current member status overview"
          footerPrimaryText={`Total members: ${members.length}`}
          footerSecondaryText="Showing status distribution of members"
        />
        <ChartAreaGradient
          className="w-full min-w-0"
          title="Member Growth"
          description="Monthly member activity"
          footerPrimaryText="Growth vs previous period"
          footerSecondaryText="Jan - Jun 2024"
        />
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Members</CardTitle>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline">Add Member</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(member.status)}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.joinDate}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Edit
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
