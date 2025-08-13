"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { parseJWT, isTokenExpired } from './jwtUtils';

export const useAdminAuth = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    console.log('useAdminAuth.ts - checkAuth called');
    setIsLoading(true);
    setError(null);

    try {
      // Get JWT token from localStorage
      const jwt = localStorage.getItem('jwt');
      console.log('useAdminAuth.ts - Retrieved JWT from localStorage:', jwt);
      
      if (!jwt) {
        console.log('useAdminAuth.ts - No JWT token found');
        setError('No authentication token found. Please log in.');
        setIsAuthenticated(false);
        setUserEmail(null);
        setUserRole(null);
        return;
      }

      // Check if token is expired
      console.log('useAdminAuth.ts - Checking if token is expired');
      if (isTokenExpired(jwt)) {
        console.log('useAdminAuth.ts - Token is expired');
        localStorage.removeItem('jwt');
        setError('Authentication token has expired. Please log in again.');
        setIsAuthenticated(false);
        setUserEmail(null);
        setUserRole(null);
        return;
      }

      // Parse JWT token
      console.log('useAdminAuth.ts - About to parse JWT token');
      const tokenData = parseJWT(jwt);
      console.log('useAdminAuth.ts - JWT Token:', jwt);
      console.log('useAdminAuth.ts - Parsed token data:', tokenData);
      
      if (!tokenData || !tokenData.email) {
        console.log('useAdminAuth.ts - Invalid token data or missing email');
        setError('Invalid authentication token. Please log in again.');
        setIsAuthenticated(false);
        setUserEmail(null);
        setUserRole(null);
        return;
      }

      // Set authenticated state
      console.log('useAdminAuth.ts - Setting authenticated state');
      setIsAuthenticated(true);
      setUserEmail(tokenData.email);
      setUserRole(tokenData.role);
      console.log('useAdminAuth.ts - Set user role to:', tokenData.role, 'Type:', typeof tokenData.role);

    } catch (error) {
      console.error('useAdminAuth.ts - Authentication check error:', error);
      setError('Authentication failed. Please log in again.');
      setIsAuthenticated(false);
      setUserEmail(null);
      setUserRole(null);
    } finally {
      console.log('useAdminAuth.ts - Setting isLoading to false');
      setIsLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('jwt');
    setIsAuthenticated(false);
    setUserEmail(null);
    setUserRole(null);
    setError(null);
    router.push('/admin/login');
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    userEmail,
    userRole,
    isLoading,
    error,
    isAuthenticated,
    checkAuth,
    logout
  };
};

