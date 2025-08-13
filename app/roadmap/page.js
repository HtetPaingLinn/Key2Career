'use client';

import { useState, useEffect } from 'react';
import RoadmapCanvas from '../components/RoadmapCanvas';
import Sidebar from '../components/Sidebar';
import Toolbar from '../components/Toolbar';
import DemoGuide from '../components/DemoGuide';
import InfoSidePanel from '../components/InfoSidePanel';
import { RoadmapProvider, useRoadmap } from '../context/RoadmapContext';
import { useRouter } from 'next/navigation';

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
    <div className="h-screen w-full flex flex-col bg-gray-50">
      <div className="flex-1 flex overflow-hidden">
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
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Only run on client
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('userEmail');
      if (!email) {
        router.replace('/enter-email');
      }
      setChecking(false);
    }
  }, [router]);

  if (checking) return null; // or a loading spinner

  return (
    <RoadmapProvider>
      <HomeContent />
    </RoadmapProvider>
  );
}
