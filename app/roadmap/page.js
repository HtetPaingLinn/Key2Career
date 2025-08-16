"use client";

import { useState, useEffect } from "react";
import RoadmapCanvas from "../components/RoadmapCanvas";
import Sidebar from "../components/Sidebar";
import Toolbar from "../components/Toolbar";
import DemoGuide from "../components/DemoGuide";
import InfoSidePanel from "../components/InfoSidePanel";
import { RoadmapProvider, useRoadmap } from "../context/RoadmapContext";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/useAuth";

function HomeContent() {
  const [showDemo, setShowDemo] = useState(true);
  const { showSidebar } = useRoadmap();
  const [infoPanelElement, setInfoPanelElement] = useState(null);

  // Handler to open info panel
  const handleShowInfo = (element) => {
    setInfoPanelElement(element);
  };
  // Handler to close info panel
  const handleCloseInfo = () => {
    setInfoPanelElement(null);
  };

  return (
    <div className="flex flex-col w-full h-screen bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        <RoadmapCanvas onShowInfo={handleShowInfo} />
        {/* Show Sidebar only if infoPanelElement is null */}
        {showSidebar && !infoPanelElement && <Sidebar />}
        {/* Show InfoSidePanel if infoPanelElement is set */}
        {infoPanelElement && (
          <InfoSidePanel
            isOpen={!!infoPanelElement}
            onClose={handleCloseInfo}
            element={infoPanelElement}
          />
        )}
      </div>
      {showDemo && <DemoGuide onClose={() => setShowDemo(false)} />}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, userEmail, error } = useAuth();

  useEffect(() => {
    // Only run on client
    if (typeof window !== "undefined" && !isLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if authentication failed
  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <RoadmapProvider>
      <HomeContent />
    </RoadmapProvider>
  );
}
