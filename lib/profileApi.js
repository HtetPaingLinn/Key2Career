const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Helper function to get JWT token
const getJWTToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("jwt");
  }
  return null;
};

// Helper function to create headers with authentication
const createAuthHeaders = (contentType = "application/json") => {
  const headers = {
    "Content-Type": contentType,
  };

  const jwt = getJWTToken();
  if (jwt) {
    headers["Authorization"] = `Bearer ${jwt}`;
  }

  return headers;
};

// Helper function to parse response (handles both JSON and text)
const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  } else {
    const text = await response.text();
    return { message: text, success: true };
  }
};

// Get profile data
export const getProfileData = async (email) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/common/profileData?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: createAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await parseResponse(response);
  } catch (error) {
    console.error("Error fetching profile data:", error);
    throw error;
  }
};

// Update name
export const updateName = async (nameData) => {
  try {
    const requestBody = {
      email: nameData.email,
      new_name: nameData.name,
    };

    console.log("Updating name with:", requestBody);

    const response = await fetch(`${API_BASE_URL}/api/common/updateName`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Name update error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return await parseResponse(response);
  } catch (error) {
    console.error("Error updating name:", error);
    throw error;
  }
};

// Update bio/about
export const updateBio = async (bioData) => {
  try {
    const requestBody = {
      email: bioData.email,
      new_about: bioData.about,
    };

    console.log("Updating bio with:", requestBody);

    const response = await fetch(`${API_BASE_URL}/api/common/updateBio`, {
      method: "POST",
      headers: createAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Bio update error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return await parseResponse(response);
  } catch (error) {
    console.error("Error updating bio:", error);
    throw error;
  }
};

// Update profile image
export const updateProfileImage = async (imageData) => {
  try {
    const formData = new FormData();
    formData.append("email", imageData.email);
    formData.append("new_image", imageData.image);

    console.log("Updating profile image for email:", imageData.email);

    // For multipart requests, don't set Content-Type manually
    // Let the browser set it automatically with the correct boundary
    const headers = {};
    const jwt = getJWTToken();
    if (jwt) {
      headers["Authorization"] = `Bearer ${jwt}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/common/updatePfImage`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Profile image update error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return await parseResponse(response);
  } catch (error) {
    console.error("Error updating profile image:", error);
    throw error;
  }
};

// Update profile data (name, bio, image, email)
export const updateProfileData = async (profileData) => {
  try {
    const formData = new FormData();

    // Add all profile data to formData
    Object.keys(profileData).forEach((key) => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        formData.append(key, profileData[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/common/updatePfData`, {
      method: "POST",
      headers: createAuthHeaders("multipart/form-data"),
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Profile data update error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return await parseResponse(response);
  } catch (error) {
    console.error("Error updating profile data:", error);
    throw error;
  }
};
