"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const API_BASE = "http://localhost:8080/api/common";

// Password validation copied from user signup form
function checkPasswordStrength(password) {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/;
  return strong.test(password);
}

const getEmailFromJWT = (jwt) => {
  if (!jwt) return "";
  try {
    const payload = JSON.parse(
      atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload.email || payload.sub || "";
  } catch {
    return "";
  }
};

function AdminAccountSettings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [originalProfilePicUrl, setOriginalProfilePicUrl] = useState("");
  const [about, setAbout] = useState("");
  const [originalAbout, setOriginalAbout] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }

  const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;

  // Derived validation for inline feedback
  const newPasswordInvalid = newPassword && !checkPasswordStrength(newPassword);

  const fetchUserData = async (jwtToken) => {
    setLoading(true);
    setError("");
    setSuccess("");
    const userEmail = getEmailFromJWT(jwtToken);
    if (!userEmail) {
      setError("No email found in JWT");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE}/profileData?email=${encodeURIComponent(userEmail)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Profile data fetch error:", res.status, errorText);
        throw new Error(`Failed to fetch profile data: ${res.status} ${errorText}`);
      }
      const data = await res.json();
      setName(data.name || "");
      setEmail(data.email || "");
      setProfilePicUrl(data.image_url || "");
      setOriginalName(data.name || "");
      setOriginalProfilePicUrl(data.image_url || "");
      const aboutValue = data.about || data.description || data.bio || "";
      setAbout(aboutValue);
      setOriginalAbout(aboutValue);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jwt) fetchUserData(jwt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwt]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const userEmail = getEmailFromJWT(jwt);
    if (!userEmail) {
      setError("No email found in JWT");
      setLoading(false);
      return;
    }
    let hasChange = false;

    // Update name
    if (name !== originalName) {
      try {
        const res = await fetch(`${API_BASE}/updateName`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            email: userEmail,
            new_name: name,
          }),
        });
        if (!res.ok) {
          let errorMsg = "Failed to update name";
          try {
            const errorData = await res.json();
            errorMsg = errorData.message || JSON.stringify(errorData);
          } catch (e) {
            try {
              errorMsg = await res.text();
            } catch {}
          }
          setError(errorMsg);
          setLoading(false);
          return;
        }
        setSuccess("Name updated successfully.");
        hasChange = true;
      } catch (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    }

    // Update image
    if (profilePic) {
      try {
        const formData = new FormData();
        formData.append("email", userEmail);
        formData.append("new_image", profilePic);
        const res = await fetch(`${API_BASE}/updatePfImage`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
          body: formData,
        });
        if (!res.ok) {
          let errorMsg = "Failed to update profile image";
          try {
            const errorData = await res.json();
            errorMsg = errorData.message || JSON.stringify(errorData);
          } catch (e) {
            try {
              errorMsg = await res.text();
            } catch {}
          }
          setError(errorMsg);
          setLoading(false);
          return;
        }
        setSuccess((s) => s + " Profile image updated successfully.");
        setProfilePic(null);
        hasChange = true;
      } catch (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    }

    // Update about (stored as description in backend)
    if (about !== originalAbout) {
      try {
        const res = await fetch(`${API_BASE}/updateDescription`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            email: userEmail,
            new_description: about,
          }),
        });
        if (!res.ok) {
          let errorMsg = "Failed to update about";
          try {
            const errorData = await res.json();
            errorMsg = errorData.message || JSON.stringify(errorData);
          } catch (e) {
            try {
              errorMsg = await res.text();
            } catch {}
          }
          setError(errorMsg);
          setLoading(false);
          return;
        }
        setSuccess((s) => s + " About updated successfully.");
        hasChange = true;
      } catch (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    }

    // Update password
    if (currentPassword && newPassword) {
      // Validate new password using the same rules as user signup
      if (!checkPasswordStrength(newPassword)) {
        setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/updatePassword`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            email: userEmail,
            old_password: currentPassword,
            new_password: newPassword,
          }),
        });
        if (!res.ok) {
          let errorMsg = "Failed to update password";
          try {
            const errorData = await res.json();
            errorMsg = errorData.message || JSON.stringify(errorData);
          } catch (e) {
            try {
              errorMsg = await res.text();
            } catch {}
          }
          setError(errorMsg);
          setLoading(false);
          return;
        }
        setSuccess((s) => s + " Password updated successfully.");
        // Show green tinted toaster on successful password change
        setToast({ type: 'success', message: 'Password updated successfully.' });
        setTimeout(() => setToast(null), 3000);
        setCurrentPassword("");
        setNewPassword("");
        hasChange = true;
      } catch (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    }

    if (!hasChange) {
      setError("No changes to save.");
      setLoading(false);
      return;
    }

    await fetchUserData(jwt);
    setLoading(false);
  };

  return (
    <>
    <div className="w-full flex flex-col gap-4">
      <div className="w-full bg-white rounded-2xl border shadow p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profilePic ? URL.createObjectURL(profilePic) : profilePicUrl || "/hero1.png"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="text-lg font-semibold">{name || "Admin"}</div>
            <div className="text-sm text-muted-foreground">{email}</div>
          </div>
          <label className="inline-block px-3 py-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 text-sm">
            Upload new picture
            <input
              type="file"
              accept="image/png, image/jpeg"
              className="hidden"
              onChange={(e) => setProfilePic(e.target.files[0])}
            />
          </label>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSave}>
          {error && <div className="mb-2 text-red-600 font-medium">{error}</div>}
          {success && <div className="mb-2 text-green-600 font-medium">{success}</div>}
          {loading && <div className="mb-2 text-blue-600 font-medium">Loading...</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold mb-1">Name</div>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <div className="font-semibold mb-1">Email address</div>
              <input
                type="email"
                className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed hover:cursor-not-allowed"
                value={email}
                disabled
              />
            </div>
            <div className="md:col-span-2">
              <div className="font-semibold mb-1">About</div>
              <textarea
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell us about yourself"
                rows={4}
              />
            </div>
            <div className="md:col-span-2">
              <div className="font-semibold mb-1">Password</div>
              <div className="flex gap-4 flex-col sm:flex-row">
                <div className="flex-1">
                  <input
                    type="password"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="password"
                    aria-invalid={newPasswordInvalid ? 'true' : 'false'}
                    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${newPasswordInvalid ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-200'}`}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                  />
                  {newPasswordInvalid && (
                    <div className="text-sm text-red-600 mt-1">
                      Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={() => fetchUserData(jwt)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-8 py-2 rounded !text-white ${newPasswordInvalid ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-700 hover:bg-indigo-800'}`}
              disabled={loading || newPasswordInvalid}
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
    {toast && (
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg border text-center ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
        <div className="font-semibold">{toast.type === 'success' ? 'Success' : 'Notice'}</div>
        <div className="text-sm">{toast.message}</div>
      </div>
    )}
    </>
  );
}

export default function Page() {
  return (
    <DashboardLayout title="Account">
      <AdminAccountSettings />
    </DashboardLayout>
  );
}
