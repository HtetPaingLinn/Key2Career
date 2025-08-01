"use client";
import { useState, useEffect } from "react";
import { 
  UserIcon, 
  CodeBracketIcon, 
  CpuChipIcon, 
  DevicePhoneMobileIcon, 
  BeakerIcon, 
  CloudIcon, 
  ShieldCheckIcon, 
  CubeIcon, 
  PuzzlePieceIcon, 
  WrenchScrewdriverIcon, 
  ChartBarIcon, 
  ClipboardDocumentListIcon, 
  DocumentTextIcon, 
  UsersIcon, 
  BriefcaseIcon, 
  AcademicCapIcon, 
  GlobeAltIcon,
  PencilSquareIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SparklesIcon,
  PaintBrushIcon,
  MinusIcon,
  MoonIcon,
  DocumentIcon,
  Square3Stack3DIcon,
  StarIcon,
  BoltIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  TrophyIcon,
  ShieldExclamationIcon,
  ClockIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  HeartIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  ListBulletIcon,
  SunIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useAuth } from "@/lib/useAuth";
import { templateConfigs, templateCategories, getTemplatesByCategory, searchTemplates } from "@/lib/templateRegistry";

// Use the template categories from the registry
const categories = templateCategories.map(cat => ({
  name: cat.name,
  icon: (() => {
    const iconMap = {
      'All': GlobeAltIcon,
      'Modern': SparklesIcon,
      'Classic': AcademicCapIcon,
      'Creative': PaintBrushIcon,
      'Minimalist': MinusIcon,
      'Dark': MoonIcon,
      'Professional': BriefcaseIcon,
      'Simple': DocumentIcon,
      'Nature': StarIcon,
      'Geometric': Square3Stack3DIcon,
      'Elegant': StarIcon,
      'Energetic': BoltIcon,
      'Strong': FireIcon,
      'Fire': FireIcon,
      'Water': SunIcon,
      'Growth': ArrowTrendingUpIcon,
      'Advanced': CpuChipIcon,
      'Mystical': SparklesIcon,
      'Legendary': TrophyIcon,
      'Phoenix': FireIcon,
      'Dragon': ShieldExclamationIcon,
      'Time': ClockIcon,
      'Space': GlobeAltIcon,
      'Shadow': EyeSlashIcon,
      'Divine': StarIcon,
      'Truth': CheckCircleIcon,
      'Ideals': HeartIcon,
      'Balance': ScaleIcon,
      'Life': HeartIcon,
      'Destruction': ExclamationTriangleIcon,
      'Order': ListBulletIcon,
      'Sun': SunIcon,
      'Moon': MoonIcon,
      'Prism': SparklesIcon,
      'Sword': ShieldExclamationIcon,
      'Shield': ShieldCheckIcon,
      'Eternity': ArrowPathIcon,
    };
    return iconMap[cat.name] || GlobeAltIcon;
  })()
}));

// Use the template configs from the registry
const templates = templateConfigs;

export default function ResumeTemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Authentication and user data
  const { userEmail, cvData, isLoading, error, isAuthenticated, redirectToLogin } = useAuth();

  const filteredTemplates = search 
    ? searchTemplates(search).filter(t => selectedCategory === "All" || t.category === selectedCategory)
    : getTemplatesByCategory(selectedCategory);

  // Pick 4 random unique indices for 'New' badge
  const newBadgeIndices = [0, 2, 5, 8]; // You can randomize or change these as needed

  const openModal = (template) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleUseTemplate = (template) => {
    // Check if user is authenticated and has CV data
    if (!isAuthenticated) {
      alert('Please log in to use templates.');
      redirectToLogin();
      return;
    }
    
    if (!cvData) {
      alert('Please create your CV first by going to CV Customization.');
      window.location.href = '/cv-customization';
      return;
    }
    
    // Navigate to template preview with selected template
    window.location.href = `/template-preview?template=${template.id}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Authentication Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={redirectToLogin}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-sans" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 z-40 border-r bg-white"
        style={{ borderColor: "#e5e7eb", background: "#fff" }}
      >
        <div className="flex items-center gap-2 px-6 py-6 border-b shrink-0" style={{ borderColor: "#e5e7eb" }}>
          <Image src="/mainlogo.png" alt="Key2Career Logo" width={36} height={36} priority />
          <span className="font-bold text-xl tracking-tight text-blue-700">Key2Career</span>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <nav className="flex-1 flex flex-col gap-1 px-2 py-4 overflow-y-auto">
            {categories.map(({ name, icon: Icon }) => (
              <button
                key={name}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-sm group border ${
                  selectedCategory === name
                    ? "bg-blue-100 text-blue-700 border-blue-600 shadow"
                    : "hover:bg-blue-50 text-gray-900 border-transparent"
                }`}
                onClick={() => setSelectedCategory(name)}
              >
                <Icon className={`w-5 h-5 ${selectedCategory === name ? "text-blue-700" : "text-blue-500 group-hover:text-blue-700"}`} />
                <span className="truncate">{name}</span>
                {selectedCategory === name && (
                  <span className="ml-auto inline-block w-2 h-2 rounded-full bg-blue-700 border border-blue-100" />
                )}
              </button>
            ))}
          </nav>
          <div className="px-4 py-4 border-t shrink-0" style={{ borderColor: "#e5e7eb" }}>
            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-700">
              Help
            </button>
          </div>
        </div>
      </aside>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-64" style={{ background: "#fff", color: "#111" }}>
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center px-6 py-4 gap-4 border-b bg-white" style={{ borderColor: "#e5e7eb" }}>
          <div className="flex items-center gap-2 md:hidden">
            <Image src="/mainlogo.png" alt="Key2Career Logo" width={32} height={32} priority />
            <span className="font-bold text-lg tracking-tight text-blue-700">Key2Career</span>
          </div>
          <h1 className="hidden md:block text-2xl font-extrabold tracking-tight flex-1 text-blue-700">Resume Templates</h1>
          <div className="relative w-48 md:w-64 max-w-full flex-1">
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border bg-white py-2 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
              style={{ borderColor: "#e5e7eb" }}
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-2-2"/></svg>
          </div>
          <div className="flex items-center gap-3 ml-2">
            {isAuthenticated && userEmail && (
              <div className="text-sm text-gray-600 mr-2">
                Welcome, {userEmail}
              </div>
            )}
            <div className="rounded-full w-9 h-9 bg-blue-100 flex items-center justify-center overflow-hidden">
              <Image src="/mainlogo.png" alt="Profile" width={32} height={32} />
            </div>
          </div>
        </header>
        {/* Main Gallery */}
        <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xl font-bold mb-1 text-blue-700">Choose from 30+ modern, professional templates for every IT field.</h2>
              <p className="text-base text-gray-500">Filter by category or search for your perfect resume style.</p>
            </div>
          </div>
          

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10 bg-blue-50 p-6 rounded-2xl border" style={{ borderColor: "#e5e7eb" }}>
            {filteredTemplates.map((template, idx) => (
              <div
                key={template.id}
                className="rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col items-center group cursor-pointer border relative max-w-md w-full mx-auto"
                style={{ background: "#fff", borderColor: "#e5e7eb" }}
              >
                            <div className="w-full bg-white flex items-center justify-center relative" style={{height: '300px'}}>
                            <img
                src={template.thumbnail}
                alt={template.name}
                    className="w-full h-full object-contain"
                    style={{ maxHeight: '280px' }}
                  />
                  {/* Preview Button Overlay */}
                  <button
                    type="button"
                    onClick={() => openModal(template)}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 absolute left-1/2 -translate-x-1/2 bottom-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 transition-all duration-300"
                  >
                    Preview
                  </button>
                  {/* Show 'New' badge only on selected templates */}
                  {newBadgeIndices.includes(idx) && (
                    <span className="absolute top-3 right-3 rounded-full px-2 py-0.5 text-xs font-semibold border shadow-sm bg-blue-100 text-blue-700 border-blue-200">
                      New
                    </span>
                  )}
                </div>
                <div className="p-4 w-full flex flex-col items-center">
                  <span className="font-semibold text-center mb-1 text-base text-gray-900">
                    {template.name}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2 bg-blue-100 text-blue-700 border border-blue-200">
                    {template.category}
                  </span>
                  {/* Static Use Template Button */}
                  <button
                    type="button"
                    onClick={() => handleUseTemplate(template)}
                    className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 mt-2"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
            {filteredTemplates.length === 0 && (
              <div className="col-span-full text-center py-20 text-lg text-gray-400">No templates found.</div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Preview */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur effect */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          {/* Modal content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Image src="/mainlogo.png" alt="Key2Career Logo" width={32} height={32} />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedTemplate ? selectedTemplate.name : 'Template Preview'}
                  </h2>
                  {selectedTemplate && (
                    <p className="text-sm text-gray-500">{selectedTemplate.category}</p>
                  )}
                </div>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            {/* Modal body */}
            {selectedTemplate && (
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Template preview */}
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="relative">
                        <img
                          src={selectedTemplate.thumbnail}
                          alt={selectedTemplate.name}
                          className="w-full h-auto object-cover rounded-lg shadow-md"
                          style={{ 
                            aspectRatio: '8.5/11', // A4 aspect ratio
                            maxHeight: '600px',
                            objectPosition: 'center'
                          }}
                        />
                        {/* Add a subtle border to make it look like a page */}
                        <div className="absolute inset-0 border-2 border-gray-300 rounded-lg pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Template details */}
                  <div className="lg:w-80 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Template Features</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <span>Professional A4 format</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <span>Clean, modern design</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <span>Optimized for ATS systems</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <span>Easy customization</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <span>Print-ready format</span>
                        </li>
                      </ul>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Perfect for</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        This template is ideal for {selectedTemplate.category.toLowerCase()} positions, featuring a clean layout that highlights your skills and experience effectively.
                      </p>
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                        {selectedTemplate.category}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-3">
                      <button
                        onClick={() => handleUseTemplate(selectedTemplate)}
                        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-4 focus:ring-blue-300 focus:outline-none"
                      >
                        Use This Template
                      </button>
                      <button
                        onClick={closeModal}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors focus:ring-4 focus:ring-gray-300 focus:outline-none"
                      >
                        Continue Browsing
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 