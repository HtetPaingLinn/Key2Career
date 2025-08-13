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
import { generateSimplePDF } from "@/lib/simplePdfGenerator";
import { generateJsPDF, testJsPDF } from "@/lib/jsPdfGenerator";
import { testTemplate } from "@/lib/testStyledPdf";
import { generateTestCVData, testImageLoading } from "@/lib/debugPdfData";
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

// Import template components
import { ModernTemplate1 } from '@/components/templates/ModernTemplate1';
import { ModernTemplate2 } from '@/components/templates/ModernTemplate2';
import { ModernTemplate3 } from '@/components/templates/ModernTemplate3';
import { ModernTemplate4 } from '@/components/templates/ModernTemplate4';
import { ModernTemplate5 } from '@/components/templates/ModernTemplate5';
import { ModernTemplate6 } from '@/components/templates/ModernTemplate6';
import { ModernTemplate7 } from '@/components/templates/ModernTemplate7';
import { ModernTemplate8 } from '@/components/templates/ModernTemplate8';
import { ModernTemplate9 } from '@/components/templates/ModernTemplate9';
import { ModernTemplate10 } from '@/components/templates/ModernTemplate10';
import { ModernTemplate11 } from '@/components/templates/ModernTemplate11';
import { ModernTemplate12 } from '@/components/templates/ModernTemplate12';
import { ModernTemplate13 } from '@/components/templates/ModernTemplate13';
import { ModernTemplate14 } from '@/components/templates/ModernTemplate14';
import { ModernTemplate15 } from '@/components/templates/ModernTemplate15';
import { ModernTemplate16 } from '@/components/templates/ModernTemplate16';
import { ModernTemplate17 } from '@/components/templates/ModernTemplate17';
import { ModernTemplate18 } from '@/components/templates/ModernTemplate18';
import { ModernTemplate19 } from '@/components/templates/ModernTemplate19';
import { ModernTemplate20 } from '@/components/templates/ModernTemplate20';

// Template component mapping
const getTemplateComponent = (templateId) => {
  const templateMap = {
    'modern-template-1': ModernTemplate1,
    'modern-template-2': ModernTemplate2,
    'modern-template-3': ModernTemplate3,
    'modern-template-4': ModernTemplate4,
    'modern-template-5': ModernTemplate5,
    'modern-template-6': ModernTemplate6,
    'modern-template-7': ModernTemplate7,
    'modern-template-8': ModernTemplate8,
    'modern-template-9': ModernTemplate9,
    'modern-template-10': ModernTemplate10,
    'modern-template-11': ModernTemplate11,
    'modern-template-12': ModernTemplate12,
          'modern-template-13': ModernTemplate13,
      'modern-template-14': ModernTemplate14,
    'modern-template-15': ModernTemplate15,
          'modern-template-16': ModernTemplate16,
    'modern-template-17': ModernTemplate17,
    'modern-template-18': ModernTemplate18,
    'modern-template-19': ModernTemplate19,
    'modern-template-20': ModernTemplate20,
    };
  
  return templateMap[templateId] || null;
};

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
      // Import the new pdfmake professional library
      const { generatePdfMakePDF } = await import('@/lib/pdfmakeProfessional');
      const { cleanCVDataForPDF, generatePDFFilename, validateCVDataForPDF } = await import('@/lib/pdfmakeUtils');
      
      // Clean and validate CV data
      const cleanedData = cleanCVDataForPDF(cvData);
      const validation = validateCVDataForPDF(cleanedData);
      
      if (!validation.isValid) {
        console.error('CV data validation failed:', validation.errors);
        throw new Error(`Invalid CV data: ${validation.errors.join(', ')}`);
      }
      
      if (validation.warnings.length > 0) {
        console.warn('CV data warnings:', validation.warnings);
      }
      
      // Generate appropriate filename
      const filename = generatePDFFilename(cleanedData, selectedTemplate.id);
      
      console.log('Generating PDF with pdfmake for template:', selectedTemplate.id);
      console.log('Using cleaned data:', cleanedData);
      
      // Generate PDF using the new pdfmake implementation
      await generatePdfMakePDF(cleanedData, selectedTemplate.id, filename);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
      console.log('PDF generated successfully with pdfmake professional');
      
    } catch (error) {
      // Simple fallback: Alert user and suggest using browser's print functionality
      console.error('PDF export error:', error);
      alert(`PDF generation failed: ${error.message}. Please try refreshing the page and try again. If the problem persists, you can use your browser's print function (Ctrl+P) and save as PDF.`);
    } finally {
      setIsExporting(false);
    }
  };

