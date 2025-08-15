import { useState } from "react";
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
import { Button } from "@/components/ui/button";

export function AdminManagementModal({ open, onOpenChange, triggerButton }) {
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
        password: password,
      };
      const token = localStorage.getItem("jwt");
      if (!token) {
        setError("You must be logged in to perform this action");
        return;
      }
      const res = await fetch("http://localhost:8080/api/admin/addAdmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      });
      if (res.status === 403) {
        setError(
          "Access denied. Please make sure you have the necessary permissions."
        );
        return;
      }
      if (res.ok) {
        const responseText = await res.text();
        let message;
        try {
          const data = JSON.parse(responseText);
          message = data.message || "Admin account created successfully!";
        } catch {
          message = responseText;
        }
        setSuccess(message);
        setName("");
        setEmail("");
        setPassword("");
        setTimeout(() => {
          setIsDialogOpen(false);
          setSuccess("");
        }, 1500);
      } else {
        const responseText = await res.text();
        try {
          const data = JSON.parse(responseText);
          setError(data.message || `Error ${res.status}: ${res.statusText}`);
        } catch {
          setError(responseText || `Error ${res.status}: ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error("Error during admin creation:", err);
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
    <Dialog
      open={open ?? isDialogOpen}
      onOpenChange={onOpenChange ?? setIsDialogOpen}
    >
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Admin</DialogTitle>
          <DialogDescription>
            Create a new admin account by filling in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Admin Account"}
              </Button>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            {success && (
              <div className="text-green-500 text-sm text-center">
                {success}
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
