"use client";

import { useState } from "react";
import { DataTable } from "@/@/components/data-table";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminManagementModal } from "@/components/AdminManagementModal";

// Sample data for the admin table
const adminData = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Super Admin",
    createdAt: "2024-03-20",
    status: "Active"
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Admin",
    createdAt: "2024-03-18",
    status: "Active"
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "Admin",
    createdAt: "2024-03-15",
    status: "Inactive"
  }
];

const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
  {
    accessorKey: "status",
    header: "Status",
  }
];

export function AdminManagementContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const requestData = {
        name: name,
        email: email,
        password: password
      };
      
      // Get the JWT token from localStorage
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError("You must be logged in to perform this action");
        return;
      }

      const res = await fetch("http://localhost:8080/api/admin/addAdmin", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      });

      if (res.status === 403) {
        setError("Access denied. Please make sure you have the necessary permissions.");
        return;
      }

      if (res.ok) {
        // Try to get the response as text first
        const responseText = await res.text();
        let message;
        
        try {
          // Try to parse as JSON in case it's JSON
          const data = JSON.parse(responseText);
          message = data.message || "Admin account created successfully!";
        } catch {
          // If it's not JSON, use the text directly
          message = responseText;
        }
        
        setSuccess(message);
        // Clear form fields
        setName("");
        setEmail("");
        setPassword("");
        
        // Close modal after 3 seconds
        setTimeout(() => {
          setIsDialogOpen(false);
          // Clear success message when modal closes
          setSuccess("");
        }, 1500);
        // You might want to refresh the admin list here
      } else {
        // For error responses, try to parse as JSON first
        const responseText = await res.text();
        try {
          const data = JSON.parse(responseText);
          setError(data.message || `Error ${res.status}: ${res.statusText}`);
        } catch {
          setError(responseText || `Error ${res.status}: ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error('Error during admin creation:', err);
      if (err instanceof Error) {
        setError(`Network error: ${err.message}`);
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <AdminManagementModal />
    </div>
  );
}
