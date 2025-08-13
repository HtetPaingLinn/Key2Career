"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const API_BASE = "http://localhost:8080/api/common";

const getEmailFromJWT = (jwt) => {
  if (!jwt) return "";
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.email || payload.sub || "";
  } catch {
    return "";
  }
};

const AccountPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [originalProfilePicUrl, setOriginalProfilePicUrl] = useState("");
  const [bio, setBio] = useState("");
  const [description, setDescription] = useState("");
  const [originalBio, setOriginalBio] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // Get JWT from localStorage
  const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;

  // Fetch user data
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
      const res = await fetch(`${API_BASE}/profileData?email=${encodeURIComponent(userEmail)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`,
        },
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Profile data fetch error:', res.status, errorText);
        throw new Error(`Failed to fetch profile data: ${res.status} ${errorText}`);
      }
      const data = await res.json();
      setName(data.name || "");
      setEmail(data.email || "");
      setProfilePicUrl(data.image_url || "");
      setOriginalName(data.name || "");
      setOriginalProfilePicUrl(data.image_url || "");
      setBio(data.bio || "");
      setDescription(data.description || "");
      setOriginalBio(data.bio || "");
      setOriginalDescription(data.description || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jwt) fetchUserData(jwt);
    // eslint-disable-next-line
  }, [jwt]);

  // Handle profile update
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
    // Update name if changed
    if (name !== originalName) {
      try {
        const res = await fetch(`${API_BASE}/updateName`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`,
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
    // Update image if changed
    if (profilePic) {
      try {
        const formData = new FormData();
        formData.append("email", userEmail);
        formData.append("new_image", profilePic);
        const res = await fetch(`${API_BASE}/updatePfImage`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${jwt}`,
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
    // Update bio if changed
    if (bio !== originalBio) {
      try {
        const res = await fetch(`${API_BASE}/updateBio`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            email: userEmail,
            new_bio: bio,
          }),
        });
        if (!res.ok) {
          let errorMsg = "Failed to update bio";
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
        setSuccess((s) => s + " Bio updated successfully.");
        hasChange = true;
      } catch (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    }
    // Update description if changed
    if (description !== originalDescription) {
      try {
        const res = await fetch(`${API_BASE}/updateDescription`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            email: userEmail,
            new_description: description,
          }),
        });
        if (!res.ok) {
          let errorMsg = "Failed to update description";
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
        setSuccess((s) => s + " Description updated successfully.");
        hasChange = true;
      } catch (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    }
    // Update password if both fields are filled
    if (currentPassword && newPassword) {
      try {
        const res = await fetch(`${API_BASE}/updatePassword`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`,
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
    // Refetch updated data
    await fetchUserData(jwt);
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center py-8 px-2">
      {/* Header with back button and logo */}
      <div className="w-full max-w-4xl flex items-center gap-4 mb-8 px-2">
        <button
          onClick={() => router.push("/")}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Back to main page"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <Image src="/mainlogo.png" alt="Logo" width={40} height={40} className="rounded" />
        <span className="text-2xl font-bold tracking-tight ml-2">Key2Career</span>
        <span className="flex-1" />
        <h2 className="text-xl font-bold text-gray-700">Account Settings</h2>
      </div>
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 flex flex-col md:flex-row gap-10 md:gap-16">
        {/* Left column: Profile image and name */}
        <div className="flex flex-col items-center md:items-start md:w-1/3 gap-4">
          <img
            src={profilePic ? URL.createObjectURL(profilePic) : (profilePicUrl || "/hero1.png")}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border mb-2"
          />
          <label className="inline-block px-4 py-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition text-sm">
            Upload new picture
            <input
              type="file"
              accept="image/png, image/jpeg"
              className="hidden"
              onChange={e => setProfilePic(e.target.files[0])}
            />
          </label>
          <button type="button" className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition text-sm" onClick={() => { setProfilePic(null); setProfilePicUrl(""); }}>Delete</button>
          <div className="mt-4 text-center md:text-left">
            <div className="text-xl font-bold">{name}</div>
            <div className="text-gray-500 text-sm">{email}</div>
          </div>
        </div>
        {/* Right column: Editable fields */}
        <form className="flex-1 flex flex-col gap-6" onSubmit={handleSave}>
          {error && <div className="mb-2 text-red-600 font-medium">{error}</div>}
          {success && <div className="mb-2 text-green-600 font-medium">{success}</div>}
          {loading && <div className="mb-2 text-blue-600 font-medium">Loading...</div>}
          <div>
            <div className="font-semibold mb-1">Name</div>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <div className="font-semibold mb-1">Email address</div>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-100"
              value={email}
              disabled
            />
          </div>
          <div>
            <div className="font-semibold mb-1">Bio</div>
            <textarea
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Short bio about yourself"
              rows={2}
            />
          </div>
          <div>
            <div className="font-semibold mb-1">Description</div>
            <textarea
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe yourself or your goals"
              rows={3}
            />
          </div>
          <div>
            <div className="font-semibold mb-1">Password</div>
            <div className="flex gap-4 flex-col sm:flex-row">
              <input
                type="password"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Current password"
              />
              <input
                type="password"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition font-semibold" onClick={() => fetchUserData(jwt)} disabled={loading}>Cancel</button>
            <button type="submit" className="px-8 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold text-lg" disabled={loading}>Save changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountPage; 
