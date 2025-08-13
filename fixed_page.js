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

  const handleTestStyledPDF = async () => {
    if (!selectedTemplate) return;
    
    try {
      const supportedTemplates = ['modern-template-1', 'modern-template-4', 'modern-template-7', 'modern-template-10'];
      
      if (supportedTemplates.includes(selectedTemplate.id)) {
        const success = await testTemplate(selectedTemplate.id);
        if (success) {
          alert(`Test jsPDF generated successfully for ${selectedTemplate.name}! Check your downloads.`);
        } else {
          alert('Test jsPDF generation failed. Check console for details.');
        }
      } else {
        alert(`jsPDF not yet supported for ${selectedTemplate.name}. Currently supported: Template 1, 4, 7, 10.`);
      }
    } catch (error) {
      console.error('Test jsPDF error:', error);
      alert('Test jsPDF generation failed: ' + error.message);
    }
  };

  const handleTestSimplePDF = async () => {
    if (!selectedTemplate) return;
    
    try {
      // Use real CV data if available, otherwise use test data
      const dataToUse = cvData || generateTestCVData();
      const filename = `test_simple_${selectedTemplate.id}_${Date.now()}.pdf`;
      
      console.log('Testing with data:', dataToUse);
      await generateSimplePDF(dataToUse, selectedTemplate.id, filename);
      alert(`Test simple PDF generated successfully for ${selectedTemplate.name}! Check your downloads for ${filename}.`);
    } catch (error) {
      console.error('Test simple PDF error:', error);
      alert('Test simple PDF generation failed: ' + error.message);
    }
  };

  const handleTestImageLoading = async () => {
    if (!cvData?.personalInfo?.imageUrl) {
      alert('No profile image URL found in CV data');
      return;
    }
    
    try {
      console.log('Testing image loading for:', cvData.personalInfo.imageUrl);
      const result = await testImageLoading(cvData.personalInfo.imageUrl);
      if (result) {
        alert('✅ Image loaded successfully! Check console for details.');
      } else {
        alert('❌ Image loading failed! Check console for details.');
      }
    } catch (error) {
      console.error('Image loading test error:', error);
      alert('Image loading test failed: ' + error.message);
    }
  };

  const handleTestJsPDF = async () => {
    if (!cvData || !selectedTemplate) {
      alert('No CV data or template available. Please load a CV first.');
      return;
    }

    try {
      console.log('Testing jsPDF generation...');
      const testData = cvData || generateTestCVData();
      const result = await testJsPDF(testData, selectedTemplate.id);
      
      if (result) {
        alert('✅ jsPDF test completed successfully! Check downloads for test_jsPDF_resume.pdf');
      } else {
        alert('❌ jsPDF test failed. Check console for details.');
      }
    } catch (error) {
      console.error('jsPDF test error:', error);
      alert('jsPDF test error: ' + error.message);
    }
  };

  // Template component for rendering
  const TemplateComponent = ({ cvData }) => {
    if (!selectedTemplate || !cvData) return null;
    
    const Component = getTemplateComponent(selectedTemplate.id);
    if (!Component) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <p className="text-gray-500 text-lg font-medium">No template component available</p>
            <p className="text-gray-400 text-sm mt-2">All templates have been removed from the system.</p>
          </div>
        </div>
      );
    }
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

                <button
                  onClick={handleTestStyledPDF}
                  className="w-full px-4 py-3 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  Test jsPDF (Styled)
                </button>

                <button
                  onClick={handleTestSimplePDF}
                  className="w-full px-4 py-3 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                >
                  Test Simple PDF
                </button>

                <button
                  onClick={handleTestImageLoading}
                  className="w-full px-4 py-3 text-sm font-medium text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
                >
                  Test Image Loading
                </button>

                <button
                  onClick={handleTestJsPDF}
                  className="w-full px-4 py-3 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Test jsPDF
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