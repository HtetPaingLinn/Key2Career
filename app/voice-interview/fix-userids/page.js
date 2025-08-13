"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fixUserInterviewIds } from "@/lib/actions/voice-general.action";
import { useAuth } from "@/lib/useAuth";

export default function FixUserIdsPage() {
  const { userEmail, isAuthenticated } = useAuth();
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFixUserIds = async () => {
    if (!isAuthenticated) {
      setResult({ success: false, error: "Not authenticated" });
      return;
    }

    setIsFixing(true);
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) {
        setResult({ success: false, error: "No JWT token found" });
        return;
      }

      const fixResult = await fixUserInterviewIds(jwt);
      setResult(fixResult);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setIsFixing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Fix User IDs</h1>
        <p>Please log in to use this feature.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Fix Interview User IDs</h1>
      <p className="mb-4">
        This tool will fix any interviews that have incorrect userIds by matching them with your Firebase user document ID.
      </p>
      <p className="mb-6 text-gray-600">
        Current logged-in email: <strong>{userEmail}</strong>
      </p>

      <Button 
        onClick={handleFixUserIds} 
        disabled={isFixing}
        className="mb-4"
      >
        {isFixing ? "Fixing..." : "Fix My Interview User IDs"}
      </Button>

      {result && (
        <div className={`p-4 rounded-lg ${result.success ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'}`}>
          {result.success ? (
            <div>
              <h3 className="font-bold text-green-800">Success!</h3>
              <p className="text-green-700">
                {result.updatedCount > 0 
                  ? `Updated ${result.updatedCount} interviews with correct user ID.`
                  : "No interviews needed updating - they were already correct!"
                }
              </p>
            </div>
          ) : (
            <div>
              <h3 className="font-bold text-red-800">Error</h3>
              <p className="text-red-700">{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}