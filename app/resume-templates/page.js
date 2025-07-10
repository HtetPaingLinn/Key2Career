"use client";
import { useState } from "react";
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
  Cog6ToothIcon 
} from "@heroicons/react/24/outline";
import Image from "next/image";

const categories = [
  { name: "All", icon: GlobeAltIcon },
  { name: "Frontend Developer", icon: CodeBracketIcon },
  { name: "Backend Developer", icon: CpuChipIcon },
  { name: "Full Stack Developer", icon: PuzzlePieceIcon },
  { name: "UI/UX Designer", icon: PencilSquareIcon },
  { name: "Data Scientist", icon: BeakerIcon },
  { name: "DevOps Engineer", icon: WrenchScrewdriverIcon },
  { name: "Mobile Developer", icon: DevicePhoneMobileIcon },
  { name: "QA Engineer", icon: ClipboardDocumentListIcon },
  { name: "Product Manager", icon: BriefcaseIcon },
  { name: "AI/ML Engineer", icon: ChartBarIcon },
  { name: "Cloud Architect", icon: CloudIcon },
  { name: "Cybersecurity Analyst", icon: ShieldCheckIcon },
  { name: "Database Admin", icon: CubeIcon },
  { name: "Game Developer", icon: PuzzlePieceIcon },
  { name: "IT Support", icon: UsersIcon },
  { name: "Network Engineer", icon: Cog6ToothIcon },
  { name: "Business Analyst", icon: ChartBarIcon },
  { name: "Project Manager", icon: ClipboardDocumentListIcon },
  { name: "Technical Writer", icon: DocumentTextIcon },
  { name: "System Administrator", icon: UserIcon }
];

const realThumbnails = [
  "onyx.jpg",
  "ditto.jpg",
  "gengar.jpg",
  "glalie.jpg",
  "kakuna.jpg",
  "azurill.jpg",
  "chikorita.jpg",
  "bronzor.jpg",
  "leafish.jpg",
  "nosepass.jpg",
  "pikachu.jpg",
  "rhyhorn.jpg"
];

const templates = Array.from({ length: 32 }).map((_, i) => ({
  id: i + 1,
  name: `Template ${i + 1}`,
  category: categories[(i % (categories.length - 1)) + 1].name,
  thumbnail: `/${realThumbnails[i % realThumbnails.length]}`
}));

export default function ResumeTemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filteredTemplates = templates.filter((t) =>
    (selectedCategory === "All" || t.category === selectedCategory) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pick 4 random unique indices for 'New' badge
  const newBadgeIndices = [0, 2, 5, 8]; // You can randomize or change these as needed

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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
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
            <button className="rounded-full w-9 h-9 bg-gray-100 flex items-center justify-center hover:bg-blue-100">
              <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            </button>
            <button className="rounded-full w-9 h-9 bg-gray-100 flex items-center justify-center hover:bg-blue-100">
              <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            </button>
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
    </div>
  );
} 