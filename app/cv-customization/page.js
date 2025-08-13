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
import JobAppliedSection from "@/components/cv/JobAppliedSection";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBriefcase, faGraduationCap, faCogs, faGlobe, faProjectDiagram, faAward, faUsers, faCertificate, faStar } from '@fortawesome/free-solid-svg-icons';
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
  const [showImportModal, setShowImportModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isGitHubImporting, setIsGitHubImporting] = useState(false);
  const [isLinkedInImporting, setIsLinkedInImporting] = useState(false);
  const [hasImportedData, setHasImportedData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialDataFetch, setIsInitialDataFetch] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false); // New state for GitHub loading
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false); // New state for LinkedIn loading
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
    certifications: [],
    awardsAndHonors: [],
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
    if (!userEmail || isLoading || isInitialDataFetch) return; // Don't save while loading or during initial fetch
    
    // Check if the data has meaningful content before saving
    const hasMeaningfulData = checkIfDataHasContent(cvSections[sectionIndex].id, sectionData);
    if (!hasMeaningfulData) {
      console.log('Skipping debounced save for section:', cvSections[sectionIndex].id, '- no meaningful data');
      return;
    }
    
    try {
      const res = await fetch("/api/cv/save-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, section: cvSections[sectionIndex].id, data: sectionData })
      });
      const result = await res.json();
      if (!result.success) {
        console.error('Debounced save failed:', result.error);
        setSaveError(result.error || 'Failed to save.');
      } else {
        console.log('Debounced save successful:', cvSections[sectionIndex].id);
        setSaveError(null);
      }
    } catch (e) {
      console.error('Debounced save error:', e);
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
    { id: 'certifications', title: 'Licenses & Certifications', icon: faCertificate, completed: false },
    { id: 'awardsAndHonors', title: 'Awards & Honors', icon: faAward, completed: false },
    { id: 'references', title: 'References', icon: faUsers, completed: false }
  ];

  // On mount: get email and fetch CV
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    const email = getEmailFromJWT(jwt);
    setUserEmail(email);
    
    // Check if data was recently imported
    const dataImported = localStorage.getItem('cvDataImported');
    
    if (email) {
      // First check if user exists in the database and has CV data
      checkUserAndCVData(email, jwt).then((hasData) => {
        if (hasData || dataImported === 'true') {
          console.log('User has CV data or data was recently imported, hiding import modal and fetching data');
          setShowImportModal(false);
          setHasImportedData(true);
          
          // Fetch the existing CV data
          fetchCVFromDB(email).then((data) => {
            if (data) {
              // Also fetch profile image from Spring Boot backend if not present
              if (!data.personalInfo?.imageUrl) {
                fetchProfileImage(email, jwt);
              }
            }
            // Clear the import flag after data is fetched
            localStorage.removeItem('cvDataImported');
          });
        } else if (!hasImportedData) {
          console.log('User has no CV data, showing import modal');
          setShowImportModal(true);
        } else {
          console.log('Data already imported, hiding import modal');
          setShowImportModal(false);
        }
        setIsLoading(false);
        setIsInitialDataFetch(false);
      });
    } else {
      console.log('No email found, showing import modal');
      setShowImportModal(true);
      setIsLoading(false);
      setIsInitialDataFetch(false);
    }
  }, []); // Empty dependency array to run only once on mount

  // Handle network errors and fallback
  useEffect(() => {
    if (isLoading) {
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.log('Loading timeout, showing import modal as fallback');
        setIsLoading(false);
        setShowImportModal(true);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  // Handle page refresh - check if user has already started working on CV
  useEffect(() => {
    if (!isLoading && userEmail && !hasImportedData) {
      // Check if there's any data in the current state that indicates user has started
      const hasStartedWork = (
        cvData.personalInfo?.firstName || 
        cvData.personalInfo?.lastName || 
        cvData.personalInfo?.phone ||
        cvData.personalInfo?.address ||
        cvData.personalInfo?.bio ||
        cvData.personalInfo?.description ||
        cvData.jobApplied || 
        (cvData.workExperience && cvData.workExperience.length > 0) ||
        (cvData.education && cvData.education.length > 0) ||
        (cvData.skills && (cvData.skills.technical?.length > 0 || cvData.skills.soft?.length > 0)) ||
        (cvData.languages && cvData.languages.length > 0) ||
        (cvData.projects && cvData.projects.length > 0) ||
        (cvData.certifications && cvData.certifications.length > 0) ||
        (cvData.awards && cvData.awards.length > 0) ||
        (cvData.references && cvData.references.length > 0)
      );
      
      console.log('Page refresh check - hasStartedWork:', hasStartedWork);
      console.log('Current cvData:', cvData);
      
      if (hasStartedWork) {
        setShowImportModal(false);
        setHasImportedData(true);
      }
    }
  }, [isLoading, userEmail, cvData, hasImportedData]);

  // Fetch profile image from Spring Boot backend
  const fetchProfileImage = async (email, jwt) => {
    try {
      const response = await fetch(`http://localhost:8080/api/common/profileData?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.image_url) {
          console.log('Fetched profile image URL:', data.image_url);
          
          // Update the state
          setCvData(prev => {
            const updated = {
              ...prev,
              personalInfo: {
                ...prev.personalInfo,
                imageUrl: data.image_url
              }
            };
            
            // Also save the updated personalInfo to MongoDB
            if (userEmail) {
              console.log('Saving updated personalInfo with imageUrl to MongoDB');
              fetch("/api/cv/save-section", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                  email: userEmail, 
                  section: 'personalInfo', 
                  data: updated.personalInfo 
                })
              }).then(res => res.json())
                .then(result => {
                  if (result.success) {
                    console.log('Profile image URL saved to MongoDB successfully');
                  } else {
                    console.error('Failed to save profile image URL:', result.error);
                  }
                })
                .catch(error => {
                  console.error('Error saving profile image URL:', error);
                });
            }
            
            return updated;
          });
        }
      } else {
        console.error('Failed to fetch profile data:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  // Check if user exists in database and has CV data
  const checkUserAndCVData = async (email, jwt) => {
    try {
      // First check if user exists in the database
      const userResponse = await fetch(`http://localhost:8080/api/common/profileData?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
      });

      if (!userResponse.ok) {
        console.log('User not found in database or unauthorized');
        return false;
      }

      // Then check if user has CV data in MongoDB
      const cvResponse = await fetch(`/api/cv/get?email=${encodeURIComponent(email)}`);
      if (cvResponse.ok) {
        const cvResult = await cvResponse.json();
        if (cvResult.success && cvResult.data) {
          // Check if there's meaningful data in any section
          const hasData = (
            cvResult.data.personalInfo?.firstName || 
            cvResult.data.personalInfo?.lastName || 
            cvResult.data.personalInfo?.phone ||
            cvResult.data.personalInfo?.address ||
            cvResult.data.personalInfo?.bio ||
            cvResult.data.personalInfo?.description ||
            cvResult.data.jobApplied || 
            (cvResult.data.workExperience && cvResult.data.workExperience.length > 0) ||
            (cvResult.data.education && cvResult.data.education.length > 0) ||
            (cvResult.data.skills && (cvResult.data.skills.technical?.length > 0 || cvResult.data.skills.soft?.length > 0)) ||
            (cvResult.data.languages && cvResult.data.languages.length > 0) ||
            (cvResult.data.projects && cvResult.data.projects.length > 0) ||
            (cvResult.data.certifications && cvResult.data.certifications.length > 0) ||
            (cvResult.data.awards && cvResult.data.awards.length > 0) ||
            (cvResult.data.references && cvResult.data.references.length > 0)
          );
          
          // Additional check: if user has at least name or bio/description, consider it as having data
          const hasBasicInfo = (
            cvResult.data.personalInfo?.firstName ||
            cvResult.data.personalInfo?.lastName ||
            cvResult.data.personalInfo?.bio ||
            cvResult.data.personalInfo?.description ||
            cvResult.data.personalInfo?.imageUrl
          );
          
          // Debug logging for data detection
          console.log('Data detection debug:', {
            personalInfo: cvResult.data.personalInfo,
            hasData,
            hasBasicInfo,
            firstName: cvResult.data.personalInfo?.firstName,
            lastName: cvResult.data.personalInfo?.lastName,
            bio: cvResult.data.personalInfo?.bio,
            description: cvResult.data.personalInfo?.description,
            imageUrl: cvResult.data.personalInfo?.imageUrl
          });
          console.log('CV data check result:', hasData ? 'Has data' : 'No data');
          console.log('Has basic info:', hasBasicInfo);
          console.log('CV data found:', cvResult.data);
          return hasData || hasBasicInfo;
        }
      } else {
        console.log('Failed to fetch CV data from MongoDB');
      }
      return false;
    } catch (error) {
      console.error('Error checking user and CV data:', error);
      return false;
    }
  };

  // Note: Removed beforeunload save to prevent overwriting saved data on refresh

  // Fetch CV from DB (return data for modal logic)
  const fetchCVFromDB = async (email) => {
    if (!email) return;
    try {
      const res = await fetch(`/api/cv/get?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          console.log('Fetched CV data from MongoDB:', result.data);
          
          // Merge data intelligently - only update fields that have actual values
          setCvData((prev) => {
            const merged = { ...prev };
            
            // Merge personalInfo intelligently
            if (result.data.personalInfo) {
              merged.personalInfo = { ...prev.personalInfo };
              Object.keys(result.data.personalInfo).forEach(key => {
                const value = result.data.personalInfo[key];
                // Only update if the value is not empty and not null/undefined
                if (value && value !== '' && value !== null && value !== undefined) {
                  merged.personalInfo[key] = value;
                  console.log(`Updated personalInfo.${key}:`, value);
                }
              });
            }
            
            // Merge other sections
            Object.keys(result.data).forEach(section => {
              if (section !== 'personalInfo' && section !== '_id' && section !== 'email' && section !== 'updatedAt') {
                const sectionData = result.data[section];
                if (sectionData && Array.isArray(sectionData) && sectionData.length > 0) {
                  merged[section] = sectionData;
                } else if (sectionData && typeof sectionData === 'object' && Object.keys(sectionData).length > 0) {
                  merged[section] = { ...prev[section], ...sectionData };
                } else if (sectionData && sectionData !== '') {
                  merged[section] = sectionData;
                }
              }
            });
            
            console.log('Merged CV data:', merged);
            console.log('PersonalInfo after merge:', merged.personalInfo);
            return merged;
          });
          setIsInitialDataFetch(false);
          return result.data;
        }
      } else {
        console.error('Failed to fetch CV:', res.status, res.statusText);
      }
    } catch (e) { 
      console.error('Error fetching CV:', e); 
    }
    return null;
  };

  // Save section to DB
  const saveSectionToDB = async (sectionIndex) => {
    const sectionId = cvSections[sectionIndex].id;
    const sectionData = cvData[sectionId];
    if (!userEmail) return;
    
    // Check if the data has meaningful content before saving
    const hasMeaningfulData = checkIfDataHasContent(sectionId, sectionData);
    if (!hasMeaningfulData) {
      console.log('Skipping save for section:', sectionId, '- no meaningful data');
      return;
    }
    
    try {
      console.log('Saving section to DB:', sectionId, sectionData);
      const res = await fetch("/api/cv/save-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, section: sectionId, data: sectionData })
      });
      const result = await res.json();
      if (!result.success) {
        console.error('Failed to save section:', result.error);
      } else {
        console.log('Section saved successfully:', sectionId);
      }
    } catch (e) { 
      console.error('Error saving section:', e); 
    }
  };

  // Save all sections to DB
  const saveAllSectionsToDB = async () => {
    if (!userEmail) return;
    try {
      console.log('Saving all sections to DB');
      for (let i = 0; i < cvSections.length; i++) {
        const sectionId = cvSections[i].id;
        const sectionData = cvData[sectionId];
        if (sectionData) {
          await saveSectionToDB(i);
        }
      }
      console.log('All sections saved successfully');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (e) {
      console.error('Error saving all sections:', e);
      setSaveError('Failed to save all sections');
    }
  };

  // Auto-save to DB on every field change (debounced)
  const updateCvData = (section, data) => {
    console.log('updateCvData called', section, data);
    setCvData(prev => {
      const updated = { ...prev, [section]: data };
      // Debounced save - only save if there's actual data
      const sectionIndex = cvSections.findIndex(s => s.id === section);
      if (sectionIndex !== -1) {
        // Check if the data has meaningful content before saving
        const hasMeaningfulData = checkIfDataHasContent(section, data);
        if (hasMeaningfulData) {
          debouncedSaveSectionToDB(sectionIndex, updated[section]);
        }
      }
      return updated;
    });
  };

  // Helper function to check if data has meaningful content
  const checkIfDataHasContent = (section, data) => {
    if (!data) return false;
    
    if (section === 'personalInfo') {
      // For personalInfo, check if any important field has content
      const importantFields = ['firstName', 'lastName', 'email', 'bio', 'description', 'imageUrl'];
      const hasImportantContent = importantFields.some(field => {
        const value = data[field];
        const hasContent = value && value !== '' && value !== null && value !== undefined;
        if (field === 'imageUrl') {
          console.log(`Checking imageUrl: "${value}" - hasContent: ${hasContent}`);
        }
        return hasContent;
      });
      
      console.log('PersonalInfo content check:', {
        data,
        importantFields,
        hasImportantContent
      });
      
      return hasImportantContent;
    } else if (Array.isArray(data)) {
      // For arrays, check if there are any items
      return data.length > 0;
    } else if (typeof data === 'object') {
      // For objects, check if any property has content
      return Object.values(data).some(value => 
        value && value !== '' && value !== null && value !== undefined
      );
    } else {
      // For primitive values, check if not empty
      return data && data !== '' && data !== null && data !== undefined;
    }
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
    
    if (method.id === 'github') {
      if (hasImportedData) {
        console.log('Data already imported, skipping GitHub modal');
        return;
      }
      setShowGitHubModal(true);
      return;
    }
    
    if (method.id === 'linkedin') {
      if (hasImportedData) {
        console.log('Data already imported, skipping LinkedIn modal');
        return;
      }
      setShowLinkedInModal(true);
      return;
    }
    
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
              
              // Prepare the updated personal info data
              const updatedPersonalInfo = {
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
                drivingLicense: userData.drivingLicense || '',
                imageUrl: userData.image_url || ''
              };

              console.log('Prepared personal info data:', updatedPersonalInfo);
              console.log('Image URL from user data:', userData.image_url);
              console.log('Final imageUrl value:', updatedPersonalInfo.imageUrl);

              // Update the state
              setCvData(prev => ({
                ...prev,
                personalInfo: updatedPersonalInfo
              }));

              // If imageUrl is empty, try to fetch it from the backend
              if (!updatedPersonalInfo.imageUrl) {
                console.log('Image URL is empty, fetching from backend...');
                fetchProfileImage(userEmail, jwt);
              }

              // Save the imported data to MongoDB immediately
              try {
                console.log('Saving imported user data to MongoDB:', updatedPersonalInfo);
                const saveResponse = await fetch("/api/cv/save-section", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ 
                    email: userEmail, 
                    section: 'personalInfo', 
                    data: updatedPersonalInfo 
                  })
                });
                const saveResult = await saveResponse.json();
                if (saveResult.success) {
                  console.log('Imported user data saved successfully to MongoDB');
                  setShowSuccessMessage(true);
                  setTimeout(() => setShowSuccessMessage(false), 5000);
                  
                  // Mark that data has been imported to prevent modal on refresh
                  localStorage.setItem('cvDataImported', 'true');
                  setHasImportedData(true);
                  
                  // Add a small delay to ensure the save operation is complete
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  
                  // Verify the data was saved by fetching it back
                  console.log('Verifying saved data...');
                  const verifyResponse = await fetch(`/api/cv/get?email=${encodeURIComponent(userEmail)}`);
                  if (verifyResponse.ok) {
                    const verifyResult = await verifyResponse.json();
                    console.log('Verified saved data:', verifyResult.data);
                  }
                } else {
                  console.error('Failed to save imported data:', saveResult.error);
                }
              } catch (saveError) {
                console.error('Error saving imported data:', saveError);
              }
            } else {
              console.error('Failed to get user data:', result.error);
            }
          } else {
            console.error('Failed to fetch user data:', response.status, response.statusText);
          }
        }
      } catch (error) {
        console.error('Error importing user data:', error);
      }
    } else {
      // For other import methods, just close the modal and let user start fresh
      console.log('Selected import method:', method.id);
    }
  };

  // Handle GitHub import
  const handleGitHubImport = async () => {
    if (!githubUsername.trim()) {
      alert('Please enter a GitHub username');
      return;
    }

    // Check if data has already been imported
    if (hasImportedData) {
      console.log('Data already imported, skipping GitHub import');
      setShowGitHubModal(false);
      return;
    }

    console.log('Starting GitHub import for:', githubUsername.trim());
    setShowGitHubModal(false);
    setIsGitHubImporting(true);
    setIsGitHubLoading(true);

    try {
      console.log('Importing from GitHub for username:', githubUsername);
      const response = await fetch('/api/github/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: githubUsername.trim() })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('GitHub API response:', result);
        
        if (result.success && result.data) {
          const githubData = result.data;
          
          console.log('GitHub data imported:', githubData);

          // Update the state with GitHub data
          setCvData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, ...githubData.personalInfo },
            skills: githubData.skills,
            projects: githubData.projects
          }));

          // Save all imported data to MongoDB
          const userEmail = getEmailFromJWT(localStorage.getItem('jwt'));
          if (userEmail) {
            try {
              // Save personal info
              await fetch("/api/cv/save-section", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                  email: userEmail, 
                  section: 'personalInfo', 
                  data: githubData.personalInfo 
                })
              });

              // Save skills
              await fetch("/api/cv/save-section", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                  email: userEmail, 
                  section: 'skills', 
                  data: githubData.skills 
                })
              });

              // Save projects
              await fetch("/api/cv/save-section", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                  email: userEmail, 
                  section: 'projects', 
                  data: githubData.projects 
                })
              });

              console.log('GitHub data saved successfully to MongoDB');
              setShowSuccessMessage(true);
              setTimeout(() => setShowSuccessMessage(false), 5000);
              
              // Mark that data has been imported to prevent modal on refresh
              localStorage.setItem('cvDataImported', 'true');
              setHasImportedData(true);
              
              // Add a small delay to ensure the save operation is complete
              await new Promise(resolve => setTimeout(resolve, 1000));
              
            } catch (saveError) {
              console.error('Error saving GitHub data:', saveError);
            }
          }
        } else {
          console.error('Failed to import GitHub data:', result.error);
          alert('Failed to import GitHub data: ' + (result.error || 'Unknown error'));
        }
      } else {
        const errorData = await response.json();
        console.error('GitHub import failed:', errorData);
        alert('Failed to import GitHub data: ' + (errorData.error || 'User not found'));
      }
    } catch (error) {
      console.error('Error importing GitHub data:', error);
      alert('Error importing GitHub data: ' + error.message);
    } finally {
      setIsGitHubLoading(false);
      setIsGitHubImporting(false);
      setGithubUsername('');
    }
  };

  // Handle LinkedIn import
  const handleLinkedInImport = async () => {
    if (!linkedinUrl.trim()) {
      alert('Please enter a LinkedIn profile URL');
      return;
    }

    // Check if data has already been imported
    if (hasImportedData) {
      console.log('Data already imported, skipping LinkedIn import');
      setShowLinkedInModal(false);
      return;
    }

    console.log('Starting LinkedIn import for:', linkedinUrl.trim());
    setShowLinkedInModal(false);
    setIsLinkedInImporting(true);
    setIsLinkedInLoading(true);

    try {
      console.log('Importing from LinkedIn for URL:', linkedinUrl);
      const response = await fetch('/api/linkedin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl: linkedinUrl.trim() })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('LinkedIn API response:', result);
        
        if (result.success && result.data) {
          const linkedinData = result.data;
          
          console.log('LinkedIn data imported:', linkedinData);

          // Update the state with LinkedIn data
          setCvData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, ...linkedinData.personalInfo },
            workExperience: linkedinData.workExperience || prev.workExperience,
            education: linkedinData.education || prev.education,
            skills: linkedinData.skills || prev.skills,
            languages: linkedinData.languages || prev.languages,
            projects: linkedinData.projects || prev.projects,
            certifications: linkedinData.certifications || prev.certifications,
            awardsAndHonors: linkedinData.awardsAndHonors || prev.awardsAndHonors,
            references: linkedinData.references || prev.references
          }));

          // Save all imported data to MongoDB
          const userEmail = getEmailFromJWT(localStorage.getItem('jwt'));
          if (userEmail) {
            try {
              // Save all sections
              const sections = [
                { section: 'personalInfo', data: linkedinData.personalInfo },
                { section: 'workExperience', data: linkedinData.workExperience },
                { section: 'education', data: linkedinData.education },
                { section: 'skills', data: linkedinData.skills },
                { section: 'languages', data: linkedinData.languages },
                { section: 'projects', data: linkedinData.projects },
                { section: 'certifications', data: linkedinData.certifications },
                { section: 'awardsAndHonors', data: linkedinData.awardsAndHonors },
                { section: 'references', data: linkedinData.references }
              ];

              for (const { section, data } of sections) {
                if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
                  await fetch("/api/cv/save-section", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                      email: userEmail, 
                      section: section, 
                      data: data 
                    })
                  });
                }
              }

              console.log('LinkedIn data saved successfully to MongoDB');
              setShowSuccessMessage(true);
              setTimeout(() => setShowSuccessMessage(false), 5000);
              
              // Mark that data has been imported to prevent modal on refresh
              localStorage.setItem('cvDataImported', 'true');
              setHasImportedData(true);
              
              // Add a small delay to ensure the save operation is complete
              await new Promise(resolve => setTimeout(resolve, 1000));
              
            } catch (saveError) {
              console.error('Error saving LinkedIn data:', saveError);
            }
          }
        } else {
          console.error('Failed to import LinkedIn data:', result.error);
          alert('Failed to import LinkedIn data: ' + (result.error || 'Unknown error'));
        }
      } else {
        const errorData = await response.json();
        console.error('LinkedIn import failed:', errorData);
        alert('Failed to import LinkedIn data: ' + (errorData.error || 'Profile not found'));
      }
    } catch (error) {
      console.error('Error importing LinkedIn data:', error);
      alert('Error importing LinkedIn data: ' + error.message);
    } finally {
      setIsLinkedInLoading(false);
      setIsLinkedInImporting(false);
      setLinkedinUrl('');
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
      4: "Add your various skills including communication, organizational, and technical skills",
      5: "Add your language skills with proficiency levels",
      6: "Add your projects and research work",
      7: "Add your professional certifications and licenses",
      8: "Add your awards, honors, and achievements",
      9: "Add your professional references"
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
      // Save current section before switching
      await saveSectionToDB(currentStep);
      // Don't refetch data as it will overwrite current state
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
              <button 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={saveAllSectionsToDB}
              >
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

      {/* Loading Modal */}
      <Dialog open={isLoading}>
        <DialogContent
          showCloseButton={false}
          className="backdrop-blur-sm bg-white/90 border-none shadow-2xl max-w-md w-full mx-4 p-0 flex flex-col items-center justify-center"
        >
          <DialogTitle className="sr-only">Loading</DialogTitle>
          <div className="w-full px-8 py-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Checking your data...</h2>
            <p className="text-gray-600">Please wait while we check if you have existing CV data</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* LinkedIn Loading Modal */}
      <Dialog open={isLinkedInLoading}>
        <DialogContent
          showCloseButton={false}
          className="backdrop-blur-sm bg-white/90 border-none shadow-2xl max-w-md w-full mx-4 p-0 flex flex-col items-center justify-center"
        >
          <DialogTitle className="sr-only">Importing from LinkedIn</DialogTitle>
          <div className="w-full px-8 py-10 text-center">
            <div className="p-3 rounded-lg bg-blue-500 text-white mb-4 inline-block">
              <LinkIcon className="w-7 h-7" />
            </div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Importing from LinkedIn...</h2>
            <p className="text-gray-600">Please wait while we fetch your profile data and professional information</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Method Modal */}
      <Dialog open={showImportModal && !isLoading && !hasImportedData && !isLinkedInLoading && !isLinkedInImporting}>
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

      {/* GitHub Username Modal */}
      <Dialog open={showGitHubModal && !hasImportedData && !isLinkedInImporting}>
        <DialogContent
          showCloseButton={false}
          className="backdrop-blur-sm bg-white/90 border-none shadow-2xl max-w-md w-full mx-4 p-0 flex flex-col items-center justify-center"
        >
          <DialogTitle className="sr-only">Enter GitHub Username</DialogTitle>
          <div className="w-full px-8 py-10">
            <div className="text-center mb-8">
              <div className="p-3 rounded-lg bg-gray-800 text-white mb-4 inline-block">
                <CodeBracketIcon className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Import from GitHub</h2>
              <p className="text-gray-600">Enter your GitHub username to import your profile, repositories, and skills</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Username</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. johndoe"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGitHubImport()}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setShowGitHubModal(false);
                    setGithubUsername('');
                    if (!hasImportedData) {
                      setShowImportModal(true);
                    }
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleGitHubImport}
                  disabled={!githubUsername.trim() || isGitHubImporting}
                >
                  {isGitHubImporting ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* LinkedIn URL Modal */}
      <Dialog open={showLinkedInModal && !hasImportedData}>
        <DialogContent
          showCloseButton={false}
          className="backdrop-blur-sm bg-white/90 border-none shadow-2xl max-w-md w-full mx-4 p-0 flex flex-col items-center justify-center"
        >
          <DialogTitle className="sr-only">Enter LinkedIn Profile URL</DialogTitle>
          <div className="w-full px-8 py-10">
            <div className="text-center mb-8">
              <div className="p-3 rounded-lg bg-blue-500 text-white mb-4 inline-block">
                <LinkIcon className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Import from LinkedIn</h2>
              <p className="text-gray-600">Enter your LinkedIn profile URL to import your professional data</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile URL</label>
                <input
                  type="url"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.linkedin.com/in/username/"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLinkedInImport()}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setShowLinkedInModal(false);
                    setLinkedinUrl('');
                    if (!hasImportedData) {
                      setShowImportModal(true);
                    }
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleLinkedInImport}
                  disabled={!linkedinUrl.trim() || isLinkedInImporting}
                >
                  {isLinkedInImporting ? 'Importing...' : 'Import'}
                </button>
              </div>
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
          <span>Data saved successfully!</span>
        </div>
      )}

      {/* Error Feedback */}
      {saveError && (
        <div className="fixed top-20 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <span>Error saving: {saveError}</span>
        </div>
      )}

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto px-0 sm:px-2 lg:px-4 py-8 print:p-0 ${isLoading || isLinkedInLoading || isLinkedInImporting ? 'hidden' : ''}`}>
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
              {currentStep === 7 && <CertificationsSection data={cvData.certifications} onChange={(data) => updateCvData('certifications', data)} onAdd={() => addItem('certifications')} onRemove={(index) => removeItem('certifications', index)} onMove={(fromIndex, toIndex) => moveItem('certifications', fromIndex, toIndex)} />}
              {currentStep === 8 && <AwardsSection data={cvData.awardsAndHonors} onChange={(data) => updateCvData('awardsAndHonors', data)} onAdd={() => addItem('awardsAndHonors')} onRemove={(index) => removeItem('awardsAndHonors', index)} onMove={(fromIndex, toIndex) => moveItem('awardsAndHonors', fromIndex, toIndex)} />}
              {currentStep === 9 && <ReferencesSection data={cvData.references} onChange={(data) => updateCvData('references', data)} onAdd={() => addItem('references')} onRemove={(index) => removeItem('references', index)} onMove={(fromIndex, toIndex) => moveItem('references', fromIndex, toIndex)} />}
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


 