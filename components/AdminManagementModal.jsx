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

  // Validation helpers (inherited from signup)
  function checkPasswordStrength(pwd) {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/;
    return strong.test(pwd);
  }

  function validateEmail(val) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(val).toLowerCase());
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Client-side validation (align with signup)
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!checkPasswordStrength(password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }
    setLoading(true);
    try {
      const requestData = {
        name: trimmedName,
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
          // Mirror signup behavior for duplicate email hint
          if (data.message && String(data.message).toLowerCase().includes("email")) {
            setError("Email already exists. Please use a different email.");
          } else {
            setError(data.message || `Error ${res.status}: ${res.statusText}`);
          }
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
              {email && !validateEmail(email) && (
                <div className="text-xs text-red-500">Enter a valid email address.</div>
              )}
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
              {password && !checkPasswordStrength(password) && (
                <div className="text-xs text-red-500">
                  Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full !text-white"
                disabled={
                  loading ||
                  !name.trim() ||
                  !email ||
                  !password ||
                  !validateEmail(email) ||
                  !checkPasswordStrength(password)
                }
              >
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
