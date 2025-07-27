"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useUserSync } from "@/lib/useUserSync";
import CVPreview from "@/components/CVPreview";
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
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  LinkIcon,
  PhotoIcon,
  UserGroupIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import PersonalInfoSection from "@/components/cv/PersonalInfoSection";
import WorkExperienceSection from "@/components/cv/WorkExperienceSection";
import EducationSection from "@/components/cv/EducationSection";
import SkillsSection from "@/components/cv/SkillsSection";
import ProjectsSection from "@/components/cv/ProjectsSection";
import CertificationsSection from "@/components/cv/CertificationsSection";
import LanguagesSection from "@/components/cv/LanguagesSection";
import InterestsSection from "@/components/cv/InterestsSection";
import ReferencesSection from "@/components/cv/ReferencesSection";
import AwardsSection from "@/components/cv/AwardsSection";
import VolunteerSection from "@/components/cv/VolunteerSection";
import CoursesSection from "@/components/cv/CoursesSection";
import MembershipsSection from "@/components/cv/MembershipsSection";
import PublicationsSection from "@/components/cv/PublicationsSection";
import AttachmentsSection from "@/components/cv/AttachmentsSection";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBriefcase, faGraduationCap, faCogs, faGlobe, faProjectDiagram, faAward, faUsers } from '@fortawesome/free-solid-svg-icons';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Debounce utility
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export default function CVCustomizationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [importMethod, setImportMethod] = useState(null);
  const [showImportModal, setShowImportModal] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [cvData, setCvData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      nationality: '',
      linkedin: '',
      website: '',
      drivingLicense: '',
      bio: '',
      description: '',
      imageUrl: '' // Added imageUrl to cvData
    },
    jobApplied: '',
    workExperience: [],
    education: [],
    skills: { technical: [], soft: [] },
    languages: [],
    projects: [],
    awards: [],
    references: []
  });
  
  // User sync functionality
  const { isSyncing, syncError } = useUserSync('cv-customization');
  const [userEmail, setUserEmail] = useState("");
  const isFirstLoad = useRef(true);
  const previewRef = useRef();
  const [exporting, setExporting] = useState(false);

  // Error feedback state
  const [saveError, setSaveError] = useState(null);

  // Debounced save function (always uses latest userEmail)
  const debouncedSaveSectionToDB = debounce(async (sectionIndex, sectionData) => {
    console.log('debouncedSaveSectionToDB called', sectionIndex, sectionData);
    if (!userEmail) return;
    try {
      const res = await fetch("/api/cv/save-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, section: cvSections[sectionIndex].id, data: sectionData })
      });
      const result = await res.json();
      if (!result.success) {
        setSaveError(result.error || 'Failed to save.');
      } else {
        setSaveError(null);
      }
    } catch (e) {
      setSaveError(e.message || 'Failed to save.');
    }
  }, 500);

  const importMethods = [
    {
      id: 'linkedin',
      title: 'LinkedIn Import',
      description: 'Import your profile data from LinkedIn',
      icon: LinkIcon,
      color: 'bg-blue-500'
    },
    {
      id: 'github',
      title: 'GitHub Import',
      description: 'Import your repositories and contributions',
      icon: CodeBracketIcon,
      color: 'bg-gray-800'
    },
    {
      id: 'pdf',
      title: 'PDF Import',
      description: 'Upload and parse your existing CV',
      icon: DocumentArrowDownIcon,
      color: 'bg-red-500'
    },
    {
      id: 'userdata',
      title: 'User Data Import',
      description: 'Use your stored profile data from Key2Career',
      icon: UserIcon,
      color: 'bg-green-500'
    }
  ];

  // Update cvSections to only include the above sections, in this order
  const cvSections = [
    { id: 'personalInfo', title: 'Personal Information', icon: faUser, completed: false },
    { id: 'jobApplied', title: 'Job Applied For', icon: faBriefcase, completed: false },
    { id: 'workExperience', title: 'Work Experience', icon: faBriefcase, completed: false },
    { id: 'education', title: 'Education', icon: faGraduationCap, completed: false },
    { id: 'skills', title: 'Skills', icon: faCogs, completed: false },
    { id: 'languages', title: 'Languages', icon: faGlobe, completed: false },
    { id: 'projects', title: 'Projects', icon: faProjectDiagram, completed: false },
    { id: 'awards', title: 'Awards & Honors', icon: faAward, completed: false },
    { id: 'references', title: 'References', icon: faUsers, completed: false }
  ];

  // On mount: get email and fetch CV
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    const email = getEmailFromJWT(jwt);
    setUserEmail(email);
    if (email) {
      fetchCVFromDB(email).then((data) => {
        if (data && (data.personalInfo?.firstName || data.jobApplied || (data.workExperience && data.workExperience.length > 0))) {
          setShowImportModal(false);
        }
      });
      // Fetch profile image from Spring Boot backend if not present
      if (!cvData.personalInfo.imageUrl) {
        fetch(`http://localhost:8080/api/user/profileData?email=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`,
          },
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data && data.image_url) {
              setCvData(prev => ({
                ...prev,
                personalInfo: {
                  ...prev.personalInfo,
                  imageUrl: data.image_url
                }
              }));
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  // Fetch CV from DB (return data for modal logic)
  const fetchCVFromDB = async (email) => {
    if (!email) return;
    try {
      const res = await fetch(`/api/cv/get?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setCvData((prev) => ({ ...prev, ...result.data }));
          return result.data;
        }
      }
    } catch (e) { console.error(e); }
    return null;
  };

  // Save section to DB
  const saveSectionToDB = async (sectionIndex) => {
    const sectionId = cvSections[sectionIndex].id;
    const sectionData = cvData[sectionId];
    if (!userEmail) return;
    try {
      await fetch("/api/cv/save-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, section: sectionId, data: sectionData })
      });
    } catch (e) { console.error(e); }
  };

  // Auto-save to DB on every field change (debounced)
  const updateCvData = (section, data) => {
    console.log('updateCvData called', section, data);
    setCvData(prev => {
      const updated = { ...prev, [section]: data };
      // Debounced save
      const sectionIndex = cvSections.findIndex(s => s.id === section);
      if (sectionIndex !== -1) debouncedSaveSectionToDB(sectionIndex, data);
      return updated;
    });
  };

  // Force save on blur
  const handleFieldBlur = (section, data) => {
    const sectionIndex = cvSections.findIndex(s => s.id === section);
    if (sectionIndex !== -1) saveSectionToDB(sectionIndex);
  };

  // After importing user data, immediately save to DB
  const handleImportMethodSelect = async (method) => {
    setImportMethod(method);
    setShowImportModal(false);
    if (method.id === 'userdata') {
      try {
        const jwt = localStorage.getItem('jwt');
        if (jwt) {
          const userEmail = getEmailFromJWT(jwt);
          const response = await fetch(`/api/get-user-data?email=${encodeURIComponent(userEmail)}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const userData = result.data;
              setCvData(prev => {
                const updated = {
                  ...prev,
                  personalInfo: {
                    ...prev.personalInfo,
                    firstName: userData.name?.split(' ')[0] || '',
                    lastName: userData.name?.split(' ').slice(1).join(' ') || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    address: userData.address || '',
                    linkedin: userData.linkedin || '',
                    website: userData.website || '',
                    bio: userData.bio || '',
                    description: userData.description || '',
                    nationality: userData.nationality || '',
                    dateOfBirth: userData.dateOfBirth || '',
                    drivingLicense: userData.drivingLicense || ''
                  }
                };
                // Save imported data
                saveSectionToDB(0);
                return updated;
              });
              setShowSuccessMessage(true);
              setTimeout(() => setShowSuccessMessage(false), 5000);
            }
          }
        }
      } catch (error) {
        console.error('Error importing user data:', error);
      }
    }
  };

  // Helper to get email from JWT
  const getEmailFromJWT = (jwt) => {
    if (!jwt) return "";
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      return payload.email || payload.sub || "";
    } catch {
      return "";
    }
  };

  // Fix addItem to always add an empty object
  const addItem = (section) => {
    setCvData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), {}]
    }));
  };

  const removeItem = (section, index) => {
    setCvData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const moveItem = (section, fromIndex, toIndex) => {
    setCvData(prev => {
      const items = [...prev[section]];
      const [movedItem] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, movedItem);
      return {
        ...prev,
        [section]: items
      };
    });
  };

  const getSectionDescription = (step) => {
    const descriptions = {
      0: "Enter your personal information and contact details",
      1: "Specify the job title or position you're applying for",
      2: "Add your work experience with detailed descriptions",
      3: "Add your education and training qualifications",
      4: "List your language skills with proficiency levels",
      5: "Add your various skills including communication, organizational, and technical skills",
      6: "Add your professional certifications and licenses",
      7: "Add your courses and training programs",
      8: "Add your volunteering experience and community work",
      9: "Add your projects and research work",
      10: "Add your publications and presentations",
      11: "Add your professional memberships and associations",
      12: "Add your awards, scholarships, and achievements",
      13: "Add your professional references",
      14: "Add your portfolio links and attachments"
    };
    return descriptions[step] || "Complete this section of your CV";
  };

  // Navigation: handlePrev and handleNext
  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    setCurrentStep((prev) => Math.min(cvSections.length - 1, prev + 1));
  };
  // Navigation: handleSectionClick
  const handleSectionClick = async (index) => {
    if (!isFirstLoad.current) {
      await saveSectionToDB(currentStep);
      await fetchCVFromDB(userEmail);
    }
    setCurrentStep(index);
    isFirstLoad.current = false;
  };

  // PDF Export handler
  const handleExportPDF = async () => {
    setExporting(true);
    try {
      if (typeof window === 'undefined') throw new Error('PDF export only works in the browser.');
      const input = previewRef.current;
      if (!input) throw new Error('Preview not found.');
      // Use html2canvas to render the preview
      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      // Create PDF (A4 size)
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      // Calculate width/height to fit A4
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      // Scale image to fit page
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      const pdfWidth = imgWidth * ratio;
      const pdfHeight = imgHeight * ratio;
      const x = (pageWidth - pdfWidth) / 2;
      const y = 20; // top margin
      pdf.addImage(imgData, "PNG", x, y, pdfWidth, pdfHeight);
      pdf.save("Key2Career_CV.pdf");
    } catch (e) {
      console.error('PDF export error:', e);
      alert("Failed to export PDF: " + (e.message || e));
    }
    setExporting(false);
  };

  // Print handler for CV preview only
  const handlePrintCV = () => {
    // Navigate to resume templates page instead of printing
    window.location.href = '/resume-templates';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Image src="/mainlogo.png" alt="Key2Career" width={40} height={40} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CV Customization</h1>
                <p className="text-sm text-gray-500">Build your professional CV step by step</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Save Draft
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors relative"
                onClick={handlePrintCV}
              >
                Print CV
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Import Method Modal */}
      <Dialog open={showImportModal}>
        <DialogContent
          showCloseButton={false}
          className="backdrop-blur-sm bg-white/90 border-none shadow-2xl max-w-2xl w-full mx-4 p-0 flex flex-col items-center justify-center"
        >
          <DialogTitle className="sr-only">Choose Your Data Import Method</DialogTitle>
          <div className="w-full px-8 py-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Data Import Method</h2>
              <p className="text-gray-600">Select how you'd like to start building your CV</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {importMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => handleImportMethodSelect(method)}
                    className="group relative flex flex-col items-start p-6 border-2 border-gray-200 rounded-xl bg-white hover:border-blue-600 focus:border-blue-600 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-lg focus:shadow-lg min-h-[120px]"
                    tabIndex={0}
                  >
                    <div className={`p-3 rounded-lg ${method.color} text-white mb-4`}>
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-700 group-focus:text-blue-700 mb-1">{method.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{method.description}</p>
                    <span className="absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-blue-200 group-focus:ring-blue-400 pointer-events-none transition-all" />
                  </button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>User data imported successfully!</span>
        </div>
      )}

      {/* Error Feedback */}
      {saveError && (
        <div className="fixed top-20 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <span>Error saving: {saveError}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-0 sm:px-2 lg:px-4 py-8 print:p-0">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-xs text-gray-500 mb-6 font-sans print:hidden" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <FontAwesomeIcon icon={faUser} className="w-3 h-3 mr-1 text-gray-400" />
              <span className={`ml-1 ${currentStep === 0 ? 'font-bold text-gray-900' : 'hover:text-blue-600 cursor-pointer'}`} onClick={() => handleSectionClick(0)}>
                Personal Info
              </span>
            </li>
            {cvSections.slice(1).map((section, idx) => (
              <li key={section.id} className="inline-flex items-center">
                <span className="mx-1">/</span>
                <FontAwesomeIcon icon={section.icon} className="w-3 h-3 mr-1 text-gray-400" />
                <span
                  className={`ml-1 ${currentStep === idx + 1 ? 'font-bold text-gray-900' : 'hover:text-blue-600 cursor-pointer'}`}
                  onClick={() => handleSectionClick(idx + 1)}
                >
              {section.title}
                </span>
              </li>
          ))}
          </ol>
        </nav>

        {/* Main Grid */}
        <div className="flex flex-row gap-5 justify-center print:block">
          {/* Left Panel - Form Content */}
          <div className="bg-white border border-gray-200 rounded-xl shadow p-6 max-w-xl w-full h-full overflow-y-auto font-sans lg:order-1 lg:ml-0 lg:mr-6 print:hidden">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">{cvSections[currentStep]?.title}</h2>
              <p className="text-sm text-gray-500 font-normal">{getSectionDescription(currentStep)}</p>
            </div>
            {/* Section Content */}
            <div className="space-y-6 divide-y divide-gray-100">
              <div className="pt-0">
                {currentStep === 0 && <PersonalInfoSection data={cvData.personalInfo} onChange={(data) => updateCvData('personalInfo', data)} twoColumnLayout />}
              {currentStep === 1 && <JobAppliedSection data={cvData.jobApplied} onChange={(data) => updateCvData('jobApplied', data)} />}
              {currentStep === 2 && <WorkExperienceSection data={cvData.workExperience} onChange={(data) => updateCvData('workExperience', data)} onAdd={() => addItem('workExperience')} onRemove={(index) => removeItem('workExperience', index)} onMove={(fromIndex, toIndex) => moveItem('workExperience', fromIndex, toIndex)} />}
              {currentStep === 3 && <EducationSection data={cvData.education} onChange={(data) => updateCvData('education', data)} onAdd={() => addItem('education')} onRemove={(index) => removeItem('education', index)} onMove={(fromIndex, toIndex) => moveItem('education', fromIndex, toIndex)} />}
              {currentStep === 4 && <SkillsSection data={cvData.skills} onChange={(data) => updateCvData('skills', data)} onAdd={() => addItem('skills')} onRemove={(index) => removeItem('skills', index)} onMove={(fromIndex, toIndex) => moveItem('skills', fromIndex, toIndex)} />}
              {currentStep === 5 && <LanguagesSection data={cvData.languages} onChange={(data) => updateCvData('languages', data)} onAdd={() => addItem('languages')} onRemove={(index) => removeItem('languages', index)} onMove={(fromIndex, toIndex) => moveItem('languages', fromIndex, toIndex)} />}
              {currentStep === 6 && <ProjectsSection data={cvData.projects} onChange={(data) => updateCvData('projects', data)} onAdd={() => addItem('projects')} onRemove={(index) => removeItem('projects', index)} onMove={(fromIndex, toIndex) => moveItem('projects', fromIndex, toIndex)} />}
              {currentStep === 7 && <AwardsSection data={cvData.awards} onChange={(data) => updateCvData('awards', data)} onAdd={() => addItem('awards')} onRemove={(index) => removeItem('awards', index)} onMove={(fromIndex, toIndex) => moveItem('awards', fromIndex, toIndex)} />}
              {currentStep === 8 && <ReferencesSection data={cvData.references} onChange={(data) => updateCvData('references', data)} onAdd={() => addItem('references')} onRemove={(index) => removeItem('references', index)} onMove={(fromIndex, toIndex) => moveItem('references', fromIndex, toIndex)} />}
            </div>
            </div>
            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === cvSections.length - 1}
                className="px-5 py-2 text-sm font-semibold text-white bg-purple-500 rounded-full hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          </div>

          {/* Right Panel - CV Preview */}
          <div className="w-full flex justify-start lg:order-2 lg:ml-6 print:w-full print:block">
            <div ref={previewRef} className="w-full print:w-full print:block">
              <CVPreview cvData={cvData} />
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print\:hidden { display: none !important; }
          .print\:block { display: block !important; }
          .print\:w-full { width: 100% !important; }
          .print\:p-0 { padding: 0 !important; }
        }
        @page {
          margin: 0;
          size: auto;
        }
      `}</style>
    </div>
  );
}

function JobAppliedSection({ data, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Job Title / Position
      </label>
      <input
        type="text"
        value={data}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., Senior Software Engineer, Data Scientist, Product Manager"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
 