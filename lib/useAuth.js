import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const getEmailFromJWT = (jwt) => {
  if (!jwt) return null;
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.email || payload.sub || null;
  } catch {
    return null;
  }
};

const isTokenExpired = (jwt) => {
  if (!jwt) return true;
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true;
  }
};

export const useAuth = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [cvData, setCvData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const fetchCVData = useCallback(async (email) => {
    if (!email) return null;
    try {
      const response = await fetch(`/api/cv/get?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          return result.data;
        }
      }
    } catch (error) {
      console.error('Error fetching CV data:', error);
    }
    return null;
  }, []);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get JWT token from localStorage
      const jwt = localStorage.getItem('jwt');
      
      if (!jwt) {
        setError('No authentication token found. Please log in.');
        setIsAuthenticated(false);
        setUserEmail(null);
        setCvData(null);
        return;
      }

      // Check if token is expired
      if (isTokenExpired(jwt)) {
        localStorage.removeItem('jwt');
        setError('Authentication token has expired. Please log in again.');
        setIsAuthenticated(false);
        setUserEmail(null);
        setCvData(null);
        return;
      }

      // Extract email from JWT
      const email = getEmailFromJWT(jwt);
      if (!email) {
        setError('Invalid authentication token. Please log in again.');
        setIsAuthenticated(false);
        setUserEmail(null);
        setCvData(null);
        return;
      }

      // Set authenticated state
      setIsAuthenticated(true);
      setUserEmail(email);

      // Fetch CV data
      const data = await fetchCVData(email);
      setCvData(data);

    } catch (error) {
      console.error('Authentication check error:', error);
      setError('Authentication failed. Please log in again.');
      setIsAuthenticated(false);
      setUserEmail(null);
      setCvData(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCVData]);

  const logout = () => {
    localStorage.removeItem('jwt');
    setIsAuthenticated(false);
    setUserEmail(null);
    setCvData(null);
    setError(null);
    router.push('/login');
  };

  const redirectToLogin = () => {
    router.push('/login');
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    userEmail,
    cvData,
    isLoading,
    error,
    isAuthenticated,
    checkAuth,
    logout,
    redirectToLogin,
    fetchCVData
  };
};

