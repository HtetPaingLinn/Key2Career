"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeftIcon, 
  DocumentArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/useAuth";
import { getTemplateById } from "@/lib/templateRegistry";
import { downloadPDFWithFallback, testPDFGeneration } from "@/lib/pdfGenerator";
import { converter as culoriConverter, parse as culoriParse } from 'culori';

// Import createRoot for React 18 client-side rendering
let createRoot;
if (typeof window !== "undefined") {
  createRoot = require("react-dom/client").createRoot;
}

// Helper: Convert OKLCH to RGB using culori
function oklchToRgb(oklch) {
  try {
    const parsed = culoriParse(oklch);
    if (!parsed) return '#fff';
    const toRgb = culoriConverter('rgb');
    const rgb = toRgb(parsed);
    if (!rgb) return '#fff';
    // Return as rgb(r,g,b) or rgba(r,g,b,a)
    if (typeof rgb.alpha === 'number' && rgb.alpha < 1) {
      return `rgba(${Math.round(rgb.r * 255)},${Math.round(rgb.g * 255)},${Math.round(rgb.b * 255)},${rgb.alpha})`;
    } else {
      return `rgb(${Math.round(rgb.r * 255)},${Math.round(rgb.g * 255)},${Math.round(rgb.b * 255)})`;
    }
  } catch {
    return '#fff';
  }
}

// Function to convert OKLCH colors to RGB/HEX
const OKLCH_REGEX = /oklch\([^)]+\)/gi;

function replaceOKLCHColors(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, null, false);
  let node;
  while ((node = walker.nextNode())) {
    // 1. Inline style properties
    for (let i = 0; i < node.style.length; i++) {
      const prop = node.style[i];
      const value = node.style.getPropertyValue(prop);
      if (value && value.includes('oklch')) {
        const newValue = value.replace(OKLCH_REGEX, (match) => oklchToRgb(match));
        node.style.setProperty(prop, newValue);
      }
    }
    // 2. CSS custom properties (variables)
    const computed = getComputedStyle(node);
    for (let j = 0; j < computed.length; j++) {
      const prop = computed[j];
      if (prop.startsWith('--')) {
        const value = computed.getPropertyValue(prop);
        if (value && value.includes('oklch')) {
          const newValue = value.replace(OKLCH_REGEX, (match) => oklchToRgb(match));
          node.style.setProperty(prop, newValue);
        }
      }
    }
  }
}

// Import all template components
import { AzurillTemplate } from "@/components/templates/AzurillTemplate";
import { BronzorTemplate } from "@/components/templates/BronzorTemplate";
import { ChikoritaTemplate } from "@/components/templates/ChikoritaTemplate";
import {
  DittoTemplate,
  GengarTemplate,
  GlalieTemplate,
  KakunaTemplate,
  LeafishTemplate,
  NosepassTemplate,
  OnyxTemplate,
  PikachuTemplate,
  RhyhornTemplate,
  CharizardTemplate,
  BlastoiseTemplate,
  VenusaurTemplate,
  MewtwoTemplate,
  MewTemplate,
  LugiaTemplate,
  HoOhTemplate,
  RayquazaTemplate,
  DialgaTemplate,
  PalkiaTemplate,
  GiratinaTemplate,
  ArceusTemplate,
  ReshiramTemplate,
  ZekromTemplate,
  KyuremTemplate,
  XerneasTemplate,
  YveltalTemplate,
  ZygardeTemplate,
  SolgaleoTemplate,
  LunalaTemplate,
  NecrozmaTemplate,
  ZacianTemplate,
  ZamazentaTemplate,
  EternatusTemplate
} from "@/components/templates/TemplateVariants";

export default function TemplatePreviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = searchParams.get('template');
  
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Authentication and user data
  const { userEmail, cvData, isLoading, error, isAuthenticated, redirectToLogin } = useAuth();

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Get template configuration
        const template = getTemplateById(templateId);
        if (!template) {
          console.error('Template not found:', templateId);
          router.push('/resume-templates');
          return;
        }
        setSelectedTemplate(template);
      } catch (error) {
        console.error('Error initializing page:', error);
        router.push('/resume-templates');
      }
    };

    if (templateId && !isLoading) {
      initializePage();
    }
  }, [templateId, router, isLoading]);

  const handleExportPDF = async () => {
    if (!cvData || !selectedTemplate) return;
    setIsExporting(true);

    try {
      // Dynamically import pdfmake only when needed
      const pdfMake = (await import('pdfmake/build/pdfmake')).default;
      const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;
      
      // Initialize pdfmake fonts safely
      if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
      } else {
        console.warn('pdfFonts not available, using default fonts');
      }

      // Helper: Convert image URL to base64 (for profile picture)
      async function getBase64FromUrl(url) {
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.warn('Failed to load profile image:', error);
          return null;
        }
      }

      // Helper: Format date for display
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        });
      };

      const formatDateRange = (startDate, endDate, current = false) => {
        const start = formatDate(startDate);
        const end = current ? 'Present' : formatDate(endDate);
        return `${start} - ${end}`;
      };

      // Profile image (if any)
      let profileImage = null;
      if (cvData.personalInfo?.imageUrl) {
        profileImage = await getBase64FromUrl(cvData.personalInfo.imageUrl);
      }

      // Build pdfmake doc definition
      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        content: [
          {
            columns: [
              // Left Sidebar (30% width)
              {
                width: '30%',
                stack: [
                  // Profile Section
                  {
                    stack: [
                      profileImage
                        ? {
                            image: profileImage,
                            width: 80,
                            height: 80,
                            alignment: 'center',
                            margin: [0, 0, 0, 10],
                            style: 'profileImage'
                          }
                        : {
                            text: `${cvData.personalInfo?.firstName?.[0] || ''}${cvData.personalInfo?.lastName?.[0] || ''}`,
                            style: 'profileInitials'
                          },
                      {
                        text: `${cvData.personalInfo?.firstName || ''} ${cvData.personalInfo?.lastName || ''}`,
                        style: 'name'
                      },
                      {
                        text: cvData.jobApplied || '',
                        style: 'jobTitle'
                      }
                    ],
                    alignment: 'center',
                    margin: [0, 0, 0, 15]
                  },
                  
                  // Contact Information
                  {
                    text: 'Contact Information',
                    style: 'sidebarSectionHeader'
                  },
                  {
                    stack: [
                      cvData.personalInfo?.email && { text: `📧 ${cvData.personalInfo.email}`, style: 'contactItem' },
                      cvData.personalInfo?.phone && { text: `📞 ${cvData.personalInfo.phone}`, style: 'contactItem' },
                      cvData.personalInfo?.address && { text: `📍 ${cvData.personalInfo.address}`, style: 'contactItem' },
                      cvData.personalInfo?.website && { text: `🌐 ${cvData.personalInfo.website}`, style: 'contactItem' },
                      cvData.personalInfo?.linkedin && { text: `💼 ${cvData.personalInfo.linkedin}`, style: 'contactItem' },
                      cvData.personalInfo?.dateOfBirth && { text: `🎂 ${cvData.personalInfo.dateOfBirth}`, style: 'contactItem' },
                      cvData.personalInfo?.nationality && { text: `🌍 ${cvData.personalInfo.nationality}`, style: 'contactItem' },
                      cvData.personalInfo?.drivingLicense && { text: `🚗 ${cvData.personalInfo.drivingLicense}`, style: 'contactItem' }
                    ].filter(Boolean),
                    margin: [0, 5, 0, 15]
                  },

                  // Skills Section
                  (cvData.skills?.technical?.length || cvData.skills?.soft?.length) && {
                    text: 'Skills',
                    style: 'sidebarSectionHeader'
                  },
                  cvData.skills?.technical?.length && {
                    text: 'Technical Skills',
                    style: 'skillCategory'
                  },
                  cvData.skills?.technical?.length && {
                    ul: cvData.skills.technical.map(skill => `${skill.name} (${skill.proficiency || skill.level}/5)`),
                    style: 'skillList'
                  },
                  cvData.skills?.soft?.length && {
                    text: 'Soft Skills',
                    style: 'skillCategory'
                  },
                  cvData.skills?.soft?.length && {
                    ul: cvData.skills.soft.map(skill => `${skill.name} (${skill.proficiency || skill.level}/5)`),
                    style: 'skillList'
                  },

                  // Certifications Section
                  cvData.certifications?.length && {
                    text: 'Certifications',
                    style: 'sidebarSectionHeader'
                  },
                  cvData.certifications?.length && {
                    ul: cvData.certifications.map(cert => 
                      `${cert.name} - ${cert.issuingOrganization}${cert.date ? ` (${formatDate(cert.date)})` : ''}`
                    ),
                    style: 'certList'
                  },

                  // Languages Section
                  cvData.languages?.length && {
                    text: 'Languages',
                    style: 'sidebarSectionHeader'
                  },
                  cvData.languages?.length && {
                    ul: cvData.languages.map(lang => 
                      `${lang.language} (${lang.proficiency}/5)${lang.cefr ? ` - CEFR: ${lang.cefr}` : ''}`
                    ),
                    style: 'langList'
                  },

                  // References Section (if in sidebar)
                  cvData.references?.length && {
                    text: 'References',
                    style: 'sidebarSectionHeader'
                  },
                  ...((cvData.references || []).map(ref => ({
                    margin: [0, 2, 0, 2],
                    stack: [
                      { text: ref.name, style: 'refName' },
                      { text: `${ref.position}${ref.company ? ` at ${ref.company}` : ''}`, style: 'refDetails' },
                      { text: `${ref.email}${ref.phone ? ` | ${ref.phone}` : ''}`, style: 'refContact' }
                    ]
                  })))
                ].filter(Boolean),
                style: 'sidebar'
              },

              // Main Content (70% width)
              {
                width: '70%',
                stack: [
                  // Bio/Description Section
                  (cvData.personalInfo?.bio || cvData.personalInfo?.description) && {
                    text: 'Professional Summary',
                    style: 'mainSectionHeader'
                  },
                  cvData.personalInfo?.bio && {
                    text: cvData.personalInfo.bio,
                    style: 'bioText'
                  },
                  cvData.personalInfo?.description && {
                    text: cvData.personalInfo.description,
                    style: 'bioText'
                  },

                  // Work Experience Section
                  cvData.workExperience?.length && {
                    text: 'Work Experience',
                    style: 'mainSectionHeader'
                  },
                  ...((cvData.workExperience || []).map(exp => ({
                    margin: [0, 0, 0, 10],
                    stack: [
                      {
                        text: `${exp.company} - ${exp.role}`,
                        style: 'expCompany'
                      },
                      {
                        text: `${formatDateRange(exp.startDate, exp.endDate, exp.current)} | ${exp.location || ''}`,
                        style: 'expDates'
                      },
                      exp.website && {
                        text: exp.website,
                        style: 'expWebsite'
                      },
                      exp.achievements?.length
                        ? {
                            ul: exp.achievements,
                            style: 'expAchievements'
                          }
                        : exp.description && {
                            text: exp.description,
                            style: 'expDescription'
                          }
                    ].filter(Boolean)
                  }))),

                  // Education Section
                  cvData.education?.length && {
                    text: 'Education',
                    style: 'mainSectionHeader'
                  },
                  ...((cvData.education || []).map(edu => ({
                    margin: [0, 0, 0, 10],
                    stack: [
                      {
                        text: `${edu.degree} - ${edu.institution}`,
                        style: 'eduDegree'
                      },
                      {
                        text: `${formatDateRange(edu.startDate, edu.endDate)} | ${edu.location || ''}`,
                        style: 'eduDates'
                      },
                      edu.fieldOfStudy && {
                        text: `Field of Study: ${edu.fieldOfStudy}`,
                        style: 'eduField'
                      },
                      edu.grade && {
                        text: `GPA: ${edu.grade}`,
                        style: 'eduGrade'
                      },
                      edu.description && {
                        text: edu.description,
                        style: 'eduDescription'
                      }
                    ].filter(Boolean)
                  }))),

                  // Projects Section
                  cvData.projects?.length && {
                    text: 'Projects',
                    style: 'mainSectionHeader'
                  },
                  ...((cvData.projects || []).map(proj => ({
                    margin: [0, 0, 0, 10],
                    stack: [
                      {
                        text: proj.title,
                        style: 'projTitle'
                      },
                      {
                        text: `${proj.role}${proj.duration ? ` | ${proj.duration}` : ''}`,
                        style: 'projRole'
                      },
                      proj.technologies && {
                        text: `Technologies: ${proj.technologies}`,
                        style: 'projTech'
                      },
                      proj.github && {
                        text: `GitHub: ${proj.github}`,
                        style: 'projLink'
                      },
                      proj.demo && {
                        text: `Demo: ${proj.demo}`,
                        style: 'projLink'
                      },
                      {
                        text: proj.description,
                        style: 'projDescription'
                      }
                    ].filter(Boolean)
                  }))),

                  // Awards Section
                  cvData.awards?.length && {
                    text: 'Awards & Honors',
                    style: 'mainSectionHeader'
                  },
                  ...((cvData.awards || []).map(award => ({
                    margin: [0, 0, 0, 8],
                    stack: [
                      {
                        text: award.title,
                        style: 'awardTitle'
                      },
                      {
                        text: `${award.issuer}${award.year ? ` (${award.year})` : ''}`,
                        style: 'awardIssuer'
                      },
                      award.description && {
                        text: award.description,
                        style: 'awardDescription'
                      }
                    ].filter(Boolean)
                  }))),

                  // Courses Section
                  cvData.courses?.length && {
                    text: 'Courses & Training',
                    style: 'mainSectionHeader'
                  },
                  ...((cvData.courses || []).map(course => ({
                    margin: [0, 0, 0, 8],
                    stack: [
                      {
                        text: course.title,
                        style: 'courseTitle'
                      },
                      {
                        text: `${course.institution}${course.year ? ` (${course.year})` : ''}`,
                        style: 'courseInstitution'
                      }
                    ]
                  }))),

                  // Volunteer Section
                  cvData.volunteer?.length && {
                    text: 'Volunteer Experience',
                    style: 'mainSectionHeader'
                  },
                  ...((cvData.volunteer || []).map(vol => ({
                    margin: [0, 0, 0, 8],
                    stack: [
                      {
                        text: vol.organization,
                        style: 'volOrganization'
                      },
                      {
                        text: `${vol.role}${vol.year ? ` (${vol.year})` : ''}`,
                        style: 'volRole'
                      },
                      vol.description && {
                        text: vol.description,
                        style: 'volDescription'
                      }
                    ].filter(Boolean)
                  }))),

                  // Memberships Section
                  cvData.memberships?.length && {
                    text: 'Memberships',
                    style: 'mainSectionHeader'
                  },
                  ...((cvData.memberships || []).map(mem => ({
                    margin: [0, 0, 0, 8],
                    stack: [
                      {
                        text: mem.organization,
                        style: 'memOrganization'
                      },
                      {
                        text: `${mem.role}${mem.year ? ` (${mem.year})` : ''}`,
                        style: 'memRole'
                      }
                    ]
                  }))),

                  // Publications Section
                  cvData.publications?.length && {
                    text: 'Publications',
                    style: 'mainSectionHeader'
                  },
                  ...((cvData.publications || []).map(pub => ({
                    margin: [0, 0, 0, 8],
                    stack: [
                      {
                        text: pub.title,
                        style: 'pubTitle'
                      },
                      {
                        text: `${pub.publisher}${pub.year ? ` (${pub.year})` : ''}`,
                        style: 'pubPublisher'
                      },
                      pub.url && {
                        text: pub.url,
                        style: 'pubUrl'
                      },
                      pub.description && {
                        text: pub.description,
                        style: 'pubDescription'
                      }
                    ].filter(Boolean)
                  }))),

                  // Interests Section
                  cvData.interests?.length && {
                    text: 'Interests',
                    style: 'mainSectionHeader'
                  },
                  cvData.interests?.length && {
                    text: cvData.interests.map(interest => interest.value || interest).join(', '),
                    style: 'interestsText'
                  },

                  // Attachments Section
                  cvData.attachments?.length && {
                    text: 'Attachments',
                    style: 'mainSectionHeader'
                  },
                  cvData.attachments?.length && {
                    ul: cvData.attachments.map(att => att.name),
                    style: 'attachmentsList'
                  },

                  // References Section (if in main content)
                  cvData.references?.length && {
                    text: 'References',
                    style: 'mainSectionHeader'
                  },
                  ...((cvData.references || []).map(ref => ({
                    margin: [0, 0, 0, 8],
                    stack: [
                      {
                        text: ref.name,
                        style: 'refNameMain'
                      },
                      {
                        text: `${ref.position}${ref.company ? ` at ${ref.company}` : ''}`,
                        style: 'refDetailsMain'
                      },
                      {
                        text: `${ref.email}${ref.phone ? ` | ${ref.phone}` : ''}`,
                        style: 'refContactMain'
                      }
                    ]
                  })))
                ].filter(Boolean),
                style: 'main'
              }
            ]
          }
        ],
        styles: {
          // Sidebar styles
          sidebar: {
            fillColor: '#059669',
            color: '#ffffff',
            fontSize: 9,
            margin: [0, 0, 15, 0]
          },
          sidebarSectionHeader: {
            fontSize: 11,
            bold: true,
            color: '#d1fae5',
            margin: [0, 10, 0, 5],
            decoration: 'underline'
          },
          skillCategory: {
            fontSize: 10,
            bold: true,
            color: '#d1fae5',
            margin: [0, 5, 0, 2]
          },
          skillList: {
            fontSize: 8,
            color: '#ffffff',
            margin: [0, 0, 0, 8]
          },
          certList: {
            fontSize: 8,
            color: '#ffffff',
            margin: [0, 0, 0, 8]
          },
          langList: {
            fontSize: 8,
            color: '#ffffff',
            margin: [0, 0, 0, 8]
          },
          contactItem: {
            fontSize: 8,
            color: '#d1fae5',
            margin: [0, 2, 0, 2]
          },
          refName: {
            fontSize: 9,
            bold: true,
            color: '#ffffff'
          },
          refDetails: {
            fontSize: 8,
            color: '#d1fae5'
          },
          refContact: {
            fontSize: 8,
            color: '#d1fae5'
          },

          // Profile styles
          profileImage: {
            margin: [0, 0, 0, 8],
            alignment: 'center'
          },
          profileInitials: {
            fontSize: 32,
            bold: true,
            color: '#059669',
            alignment: 'center',
            margin: [0, 0, 0, 10]
          },
          name: {
            fontSize: 16,
            bold: true,
            color: '#ffffff',
            alignment: 'center',
            margin: [0, 0, 0, 4]
          },
          jobTitle: {
            fontSize: 11,
            color: '#d1fae5',
            alignment: 'center',
            margin: [0, 0, 0, 8]
          },

          // Main content styles
          main: {
            fontSize: 10,
            color: '#374151',
            margin: [15, 0, 0, 0]
          },
          mainSectionHeader: {
            fontSize: 14,
            bold: true,
            color: '#059669',
            margin: [0, 15, 0, 8],
            decoration: 'underline'
          },
          bioText: {
            fontSize: 10,
            italics: true,
            color: '#374151',
            margin: [0, 0, 0, 10]
          },

          // Experience styles
          expCompany: {
            fontSize: 12,
            bold: true,
            color: '#059669'
          },
          expDates: {
            fontSize: 9,
            color: '#6b7280',
            margin: [0, 2, 0, 4]
          },
          expWebsite: {
            fontSize: 9,
            color: '#059669',
            margin: [0, 2, 0, 4]
          },
          expAchievements: {
            fontSize: 9,
            color: '#374151',
            margin: [0, 4, 0, 0]
          },
          expDescription: {
            fontSize: 9,
            color: '#374151',
            margin: [0, 4, 0, 0]
          },

          // Education styles
          eduDegree: {
            fontSize: 12,
            bold: true,
            color: '#059669'
          },
          eduDates: {
            fontSize: 9,
            color: '#6b7280',
            margin: [0, 2, 0, 4]
          },
          eduField: {
            fontSize: 9,
            color: '#374151',
            margin: [0, 2, 0, 4]
          },
          eduGrade: {
            fontSize: 9,
            color: '#374151',
            margin: [0, 2, 0, 4]
          },
          eduDescription: {
            fontSize: 9,
            color: '#374151',
            margin: [0, 4, 0, 0]
          },

          // Project styles
          projTitle: {
            fontSize: 12,
            bold: true,
            color: '#059669'
          },
          projRole: {
            fontSize: 9,
            color: '#6b7280',
            margin: [0, 2, 0, 4]
          },
          projTech: {
            fontSize: 9,
            color: '#059669',
            margin: [0, 2, 0, 4]
          },
          projLink: {
            fontSize: 9,
            color: '#059669',
            margin: [0, 2, 0, 4]
          },
          projDescription: {
            fontSize: 9,
            color: '#374151',
            margin: [0, 4, 0, 0]
          },

          // Award styles
          awardTitle: {
            fontSize: 12,
            bold: true,
            color: '#059669'
          },
          awardIssuer: {
            fontSize: 9,
            color: '#6b7280',
            margin: [0, 2, 0, 4]
          },
          awardDescription: {
            fontSize: 9,
            color: '#374151',
            margin: [0, 4, 0, 0]
          },

          // Course styles
          courseTitle: {
            fontSize: 12,
            bold: true,
            color: '#059669'
          },
          courseInstitution: {
            fontSize: 9,
            color: '#6b7280',
            margin: [0, 2, 0, 4]
          },

          // Volunteer styles
          volOrganization: {
            fontSize: 12,
            bold: true,
            color: '#059669'
          },
          volRole: {
            fontSize: 9,
            color: '#6b7280',
            margin: [0, 2, 0, 4]
          },
          volDescription: {
            fontSize: 9,
            color: '#374151',
            margin: [0, 4, 0, 0]
          },

          // Membership styles
          memOrganization: {
            fontSize: 12,
            bold: true,
            color: '#059669'
          },
          memRole: {
            fontSize: 9,
            color: '#6b7280',
            margin: [0, 2, 0, 4]
          },

          // Publication styles
          pubTitle: {
            fontSize: 12,
            bold: true,
            color: '#059669'
          },
          pubPublisher: {
            fontSize: 9,
            color: '#6b7280',
            margin: [0, 2, 0, 4]
          },
          pubUrl: {
            fontSize: 9,
            color: '#059669',
            margin: [0, 2, 0, 4]
          },
          pubDescription: {
            fontSize: 9,
            color: '#374151',
            margin: [0, 4, 0, 0]
          },

          // Interests styles
          interestsText: {
            fontSize: 10,
            color: '#374151',
            margin: [0, 0, 0, 10]
          },

          // Attachments styles
          attachmentsList: {
            fontSize: 9,
            color: '#374151',
            margin: [0, 0, 0, 10]
          },

          // Reference styles (main content)
          refNameMain: {
            fontSize: 12,
            bold: true,
            color: '#059669'
          },
          refDetailsMain: {
            fontSize: 9,
            color: '#6b7280',
            margin: [0, 2, 0, 4]
          },
          refContactMain: {
            fontSize: 9,
            color: '#6b7280',
            margin: [0, 2, 0, 4]
          }
        }
      };

      // Generate and download PDF
      pdfMake.createPdf(docDefinition).download(
        `${cvData.personalInfo?.firstName || "resume"}_${selectedTemplate.name}.pdf`
      );

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('PDF export error:', error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleBackToTemplates = () => {
    router.push('/resume-templates');
  };

  const handleEditCV = () => {
    router.push('/cv-customization');
  };

  const handleTestPDF = async () => {
    try {
      const success = await testPDFGeneration();
      if (success) {
        alert('Test PDF generated successfully! Check your downloads for test-pdf-generation.pdf');
      } else {
        alert('Test PDF generation failed. Check console for details.');
      }
    } catch (error) {
      console.error('Test PDF error:', error);
      alert('Test PDF generation failed: ' + error.message);
    }
  };

  // Template component mapping
  const getTemplateComponent = (templateId) => {
    const templateMap = {
      azurill: AzurillTemplate,
      bronzor: BronzorTemplate,
      chikorita: ChikoritaTemplate,
      ditto: DittoTemplate,
      gengar: GengarTemplate,
      glalie: GlalieTemplate,
      kakuna: KakunaTemplate,
      leafish: LeafishTemplate,
      nosepass: NosepassTemplate,
      onyx: OnyxTemplate,
      pikachu: PikachuTemplate,
      rhyhorn: RhyhornTemplate,
      charizard: CharizardTemplate,
      blastoise: BlastoiseTemplate,
      venusaur: VenusaurTemplate,
      mewtwo: MewtwoTemplate,
      mew: MewTemplate,
      lugia: LugiaTemplate,
      hooh: HoOhTemplate,
      rayquaza: RayquazaTemplate,
      dialga: DialgaTemplate,
      palkia: PalkiaTemplate,
      giratina: GiratinaTemplate,
      arceus: ArceusTemplate,
      reshiram: ReshiramTemplate,
      zekrom: ZekromTemplate,
      kyurem: KyuremTemplate,
      xerneas: XerneasTemplate,
      yveltal: YveltalTemplate,
      zygarde: ZygardeTemplate,
      solgaleo: SolgaleoTemplate,
      lunala: LunalaTemplate,
      necrozma: NecrozmaTemplate,
      zacian: ZacianTemplate,
      zamazenta: ZamazentaTemplate,
      eternatus: EternatusTemplate,
    };
    
    return templateMap[templateId] || AzurillTemplate;
  };

  // Template component for rendering
  const TemplateComponent = ({ cvData }) => {
    if (!selectedTemplate || !cvData) return null;
    
    const Component = getTemplateComponent(selectedTemplate.id);
    return <Component cvData={cvData} />;
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

  // Show authentication error state
  if (error || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Authentication Error</p>
            <p className="text-sm">{error || 'Please log in to access this page.'}</p>
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

  // Show error if no CV data
  if (!cvData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">No CV Data Found</p>
            <p className="text-sm">Please create your CV first by going to CV Customization.</p>
          </div>
          <button
            onClick={() => router.push('/cv-customization')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to CV Customization
          </button>
        </div>
      </div>
    );
  }

  // Show error if template not found
  if (!selectedTemplate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Template not found.</p>
          <button 
            onClick={handleBackToTemplates}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Templates
          </button>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToTemplates}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back to Templates</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {selectedTemplate.name} Template Preview
                </h1>
                <p className="text-sm text-gray-500">
                  {selectedTemplate.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* User Info */}
              {isAuthenticated && userEmail && (
                <div className="text-sm text-gray-600">
                  Welcome, {userEmail}
                </div>
              )}

              {/* Preview Toggle */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {showPreview ? (
                  <>
                    <EyeSlashIcon className="w-4 h-4" />
                    <span>Hide Preview</span>
                  </>
                ) : (
                  <>
                    <EyeIcon className="w-4 h-4" />
                    <span>Show Preview</span>
                  </>
                )}
              </button>

              {/* Edit CV Button */}
              <button
                onClick={handleEditCV}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Edit CV
              </button>

              {/* Export PDF Button */}
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    <span>Export PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Success Message */}
      {exportSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <CheckCircleIcon className="w-5 h-5" />
          <span>PDF exported successfully!</span>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Template Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="mb-6">
                <img
                  src={selectedTemplate.thumbnail}
                  alt={selectedTemplate.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedTemplate.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  {selectedTemplate.description}
                </p>
                
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {selectedTemplate.category}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                    {selectedTemplate.difficulty}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Exporting PDF...</span>
                    </>
                  ) : (
                    <>
                      <DocumentArrowDownIcon className="w-4 h-4" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleEditCV}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Edit CV Data
                </button>

                <button
                  onClick={handleBackToTemplates}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Choose Different Template
                </button>

                <button
                  onClick={handleTestPDF}
                  className="w-full px-4 py-3 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  Test PDF Generation
                </button>
              </div>
            </div>
          </div>

          {/* Template Preview */}
          <div className="lg:col-span-2">
            {showPreview ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Template Preview
                  </h3>
                  <p className="text-sm text-gray-600">
                    This is how your CV will look with the {selectedTemplate.name} template
                  </p>
                </div>
                
                <div className="p-4">
                  <div className="border border-gray-300 rounded-lg overflow-hidden shadow-lg">
                    <div data-template-preview className="bg-white">
                      <TemplateComponent cvData={cvData} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <EyeSlashIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Preview Hidden
                </h3>
                <p className="text-gray-600 mb-4">
                  Click "Show Preview" to see how your CV looks with this template
                </p>
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 mx-auto"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span>Show Preview</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 