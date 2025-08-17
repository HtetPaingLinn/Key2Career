"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Settings,
  Phone,
  HelpCircle,
  Download,
  Save,
  X,
  Check,
  Upload,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";

// Function to fetch organization profile data from backend
const fetchOrgProfileData = async (email) => {
  try {
    // Get JWT token from localStorage
    const jwt = localStorage.getItem("jwt");
    const headers = {
      "Content-Type": "application/json",
    };

    if (jwt) {
      headers["Authorization"] = `Bearer ${jwt}`;
    }

    const response = await fetch(
      `/api/org/profile?org_email=${encodeURIComponent(email)}`,
      { headers }
    );

    if (response.status === 404) {
      // Organization data not found - return empty data instead of throwing error
      console.log("Organization data not found for email:", email);
      return {
        name: "",
        bio: "",
        description: "",
        image_url: null,
      };
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error("Error fetching organization profile data:", error);
    // Return empty data on any error to prevent component from breaking
    return {
      name: "",
      bio: "",
      description: "",
      image_url: null,
    };
  }
};

export function OrgPlaceholderContent() {
  const { userEmail, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    profileImage: null,
  });
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Load profile data when userEmail is available
  useEffect(() => {
    if (userEmail && !authLoading) {
      loadProfileData();
    }
  }, [userEmail, authLoading]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setSuccessMessage("");
      setErrorMessage("");
      console.log("Loading organization profile data for email:", userEmail);
      const data = await fetchOrgProfileData(userEmail);
      console.log("Fetched organization data:", data);

      // Always set data (even if empty) to ensure form fields are initialized
      const currentName = data?.name || "";
      const currentBio = data?.bio || data?.about || data?.description || "";
      const currentImage = data?.image_url || null;

      console.log("Setting organization profile data:", {
        name: currentName,
        bio: currentBio,
        image: currentImage,
      });

      setProfileData({
        name: currentName,
        bio: currentBio,
        profileImage: currentImage,
      });

      // Set form data to show current values in inputs
      setFormData({
        name: currentName,
        bio: currentBio,
      });

      console.log("Form data set to:", {
        name: currentName,
        bio: currentBio,
      });

      // Set image preview if exists
      if (currentImage) {
        setImagePreview(currentImage);
      }
    } catch (error) {
      console.error("Error loading organization profile data:", error);
      // Set empty data on error to prevent component from breaking
      setProfileData({
        name: "",
        bio: "",
        profileImage: null,
      });
      setFormData({
        name: "",
        bio: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      setProfileData((prev) => ({
        ...prev,
        profileImage: file,
      }));
    }
  };

  const handleSave = async () => {
    if (!userEmail) {
      console.error("No user email available");
      setErrorMessage("Please log in to save organization profile");
      return;
    }

    // Validate that at least one field has been changed
    const hasChanges =
      formData.name !== profileData.name ||
      formData.bio !== profileData.bio ||
      profileData.profileImage instanceof File;

    if (!hasChanges) {
      setErrorMessage(
        "No changes detected. Please make changes before saving."
      );
      return;
    }

    try {
      setSaving(true);
      setSuccessMessage("");
      setErrorMessage("");

      console.log("Profile data to save:", {
        name: formData.name,
        bio: formData.bio,
        image:
          profileData.profileImage instanceof File
            ? profileData.profileImage.name
            : "No new image",
      });

      // Get JWT token from localStorage
      const jwt = localStorage.getItem("jwt");
      const headers = {};

      if (jwt) {
        headers["Authorization"] = `Bearer ${jwt}`;
      }

      // Create FormData for multipart request
      const formDataToSend = new FormData();
      formDataToSend.append("email", userEmail);
      formDataToSend.append("name", formData.name || "");
      formDataToSend.append("about", formData.bio || "");

      // Handle image upload
      if (profileData.profileImage instanceof File) {
        // New image file uploaded
        formDataToSend.append("image", profileData.profileImage);
      }

      console.log("Sending FormData to backend:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      // Save organization profile data
      const response = await fetch("/api/org/profile", {
        method: "POST",
        headers,
        body: formDataToSend,
      });

      let result;
      try {
        result = await response.json();
      } catch (error) {
        // If response is not JSON, try to get text
        const errorText = await response.text();
        console.error("Non-JSON response:", errorText);
        throw new Error(`Server error: ${errorText}`);
      }

      console.log("Save result:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to save organization profile");
      }

      // Handle success response
      if (result.success) {
        if (result.warnings && result.warnings.length > 0) {
          // Partial success with warnings
          const warningMessages = result.warnings
            .map((w) => `${w.field}: ${w.error}`)
            .join(", ");
          setSuccessMessage(
            `Profile updated with warnings: ${warningMessages}`
          );
        } else {
          // Full success
          setSuccessMessage("Organization profile updated successfully!");
        }
        setErrorMessage("");

        // Reload profile data to get updated values
        await loadProfileData();
      } else {
        throw new Error(result.error || "Failed to save organization profile");
      }
    } catch (error) {
      console.error("Error saving organization profile:", error);

      // Provide more specific error messages
      let errorMessage = "Failed to save organization profile";

      if (error.message.includes("Server error:")) {
        errorMessage = error.message.replace("Server error: ", "");
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message.includes("No fields to update")) {
        errorMessage =
          "No changes detected. Please make changes before saving.";
      } else {
        errorMessage = error.message;
      }

      setErrorMessage(errorMessage);
      setSuccessMessage("");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current profile data
    setFormData({
      name: profileData.name,
      bio: profileData.bio,
    });
    setImagePreview(profileData.profileImage);
    setProfileData((prev) => ({
      ...prev,
      profileImage: null,
    }));

    // Clear any messages
    setSuccessMessage("");
    setErrorMessage("");
  };

  // Show loading state while auth is loading or profile data is loading
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64 mx-3 mt-6">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">
            {authLoading
              ? "Loading authentication..."
              : "Loading organization data..."}
          </p>
        </div>
      </div>
    );
  }

  // Show error if no user email
  if (!userEmail) {
    return (
      <div className="flex items-center justify-center h-64 mx-3 mt-6">
        <div className="text-center">
          <p className="text-red-600">
            Please log in to access organization settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-3 mt-6 space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 border border-green-200 rounded-lg bg-green-50">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Organization Settings
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Manage your organization profile and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Support
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            Help
          </Button>
        </div>
      </div>

      {/* Profile Details Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Organization Details
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                You can change your organization details here seamlessly.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-gray-900">
                  Organization Name
                </Label>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                This is the name that will be displayed for your organization
              </p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  className="pl-10"
                  placeholder="Enter organization name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
                <User className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio Description Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Organization Description</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tell others about your organization and its mission
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Textarea
              className="resize-none"
              rows={4}
              placeholder="Write something about your organization..."
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              maxLength={300}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">
                {formData.bio.length}/300
              </span>
              <div className="w-4 h-4 text-gray-400">
                <Settings className="w-4 h-4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Picture Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Organization Logo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload an organization logo to personalize your account
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <div
                className="p-8 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600">
                  <span className="text-blue-600 cursor-pointer">
                    Click here
                  </span>{" "}
                  to upload your organization logo or drag.
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Supported Format: JPG, PNG (10mb each)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div className="relative">
              <div className="w-24 h-24 overflow-hidden bg-gray-200 rounded-full">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Organization Logo"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-400 to-blue-600">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              {profileData.profileImage && (
                <div className="absolute -top-1 -left-1 bg-white border border-gray-300 rounded px-1 py-0.5">
                  <span className="text-xs text-gray-600">
                    {profileData.profileImage instanceof File
                      ? profileData.profileImage.name
                          .split(".")
                          .pop()
                          .toUpperCase()
                      : "IMG"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleCancel}
          disabled={saving}
        >
          <X className="w-4 h-4" />
          Cancel
        </Button>
        <Button
          className="flex items-center gap-2"
          onClick={handleSave}
          disabled={saving}
        >
          <Check className="w-4 h-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
