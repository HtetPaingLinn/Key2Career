import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

export const useUserSync = (currentPage) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const router = useRouter();

  const syncUserDataToMongoDB = async () => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      // Get JWT token
      const jwt = localStorage.getItem('jwt');
      if (!jwt) {
        console.log('No JWT token found, skipping sync');
        return;
      }

      // Get user email from JWT
      const userEmail = getEmailFromJWT(jwt);
      console.log('JWT token found, email extracted:', userEmail);
      if (!userEmail) {
        console.log('No email found in JWT, skipping sync');
        return;
      }

      // Fetch user data from backend
      console.log('Fetching user data from:', `${API_BASE}/profileData?email=${encodeURIComponent(userEmail)}`);
      const res = await fetch(`${API_BASE}/profileData?email=${encodeURIComponent(userEmail)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
      });

      console.log('Backend response status:', res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Failed to fetch user data from backend: ${res.status} ${errorText}`);
      }

      const userData = await res.json();
      console.log('User data received from backend:', userData);
      
      // Prepare data for MongoDB sync
      const mongoUserData = {
        name: userData.name || '',
        email: userData.email || userEmail,
        bio: userData.bio || '',
        description: userData.description || '',
        imageUrl: userData.image_url || '',
        currentPage: currentPage,
        lastSync: new Date().toISOString()
      };
      console.log('Prepared MongoDB data:', mongoUserData);

      // Call API route to sync with MongoDB
      console.log('Calling sync API with data:', mongoUserData);
      
      const syncRes = await fetch('/api/sync-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mongoUserData),
      });

      console.log('Sync API response status:', syncRes.status);
      console.log('Sync API response headers:', syncRes.headers);

      if (!syncRes.ok) {
        const errorText = await syncRes.text();
        console.error('Sync API error response:', errorText);
        throw new Error(`Failed to sync user data to MongoDB: ${syncRes.status} ${errorText}`);
      }

      const responseText = await syncRes.text();
      console.log('Sync API response text:', responseText);
      
      let syncResult;
      try {
        syncResult = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('Invalid JSON response from sync API');
      }
      
      console.log('Parsed sync result:', syncResult);
      
      if (syncResult.success) {
        console.log('User data successfully synced to MongoDB');
      } else {
        throw new Error(syncResult.error || 'Sync failed');
      }

    } catch (error) {
      console.error('Error syncing user data:', error);
      setSyncError(error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Only sync if user is logged in and on a resume-related page
    const jwt = localStorage.getItem('jwt');
    if (jwt && currentPage) {
      syncUserDataToMongoDB();
    }
  }, [currentPage]);

  return { isSyncing, syncError, syncUserDataToMongoDB };
}; 