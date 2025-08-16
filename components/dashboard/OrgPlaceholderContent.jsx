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
import {
  getProfileData,
  updateName,
  updateBio,
  updateProfileImage,
} from "@/lib/api/profileApi";
import { useAuth } from "@/lib/useAuth";

export function OrgPlaceholderContent() {
  const { userEmail, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
      const data = await getProfileData(userEmail);

      // Set profile data with current values from backend
      const currentName = data.name || "";
      const currentBio = data.bio || data.about || "";
      const currentImage = data.profileImage || null;

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

      // Set image preview if exists
      if (currentImage) {
        setImagePreview(currentImage);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
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
      return;
    }

    try {
      setSaving(true);

      // Update name if changed
      if (formData.name !== profileData.name) {
        await updateName({
          email: userEmail,
          name: formData.name,
        });
      }

      // Update bio if changed
      if (formData.bio !== profileData.bio) {
        await updateBio({
          email: userEmail,
          about: formData.bio,
        });
      }

      // Update profile image if changed
      if (
        profileData.profileImage &&
        profileData.profileImage instanceof File
      ) {
        await updateProfileImage({
          email: userEmail,
          image: profileData.profileImage,
        });
      }

      // Reload profile data to get updated values
      await loadProfileData();
    } catch (error) {
      console.error("Error saving profile:", error);
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
  };

  // Show loading state while auth is loading or profile data is loading
  if (authLoading || loading) {
    return (
      <div className="mx-3 mt-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">
            {authLoading
              ? "Loading authentication..."
              : "Loading profile data..."}
          </p>
        </div>
      </div>
    );
  }

  // Show error if no user email
  if (!userEmail) {
    return (
      <div className="mx-3 mt-6 flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">
            Please log in to access profile settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-3 mt-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Profile Settings
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Manage your profile and preferences
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
                Profile Details
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                You can change your profile details here seamlessly.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-gray-900">
                  Display Name
                </Label>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                This is the name that will be displayed on your profile
              </p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  className="pl-10"
                  placeholder="Enter your name"
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
          <CardTitle className="text-lg">Bio Description</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tell others about yourself and your experience
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Textarea
              className="resize-none"
              rows={4}
              placeholder="Write something about yourself..."
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
          <CardTitle className="text-lg">Profile Picture</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload a profile picture to personalize your account
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <div
                className="p-8 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600">
                  <span className="text-blue-600 cursor-pointer">
                    Click here
                  </span>{" "}
                  to upload your file or drag.
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
                    alt="Profile"
                    className="w-full h-full object-cover"
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
