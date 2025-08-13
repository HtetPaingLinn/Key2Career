"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Import all template components
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

export default function PrintPage() {
  const searchParams = useSearchParams();
  const [cvData, setCvData] = useState(null);
  const [template, setTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializePage = async () => {
      try {
        const templateParam = searchParams.get('template');
        const dataParam = searchParams.get('data');

        if (!templateParam) {
          throw new Error('Missing template parameter');
        }

        console.log('Print page: Template param:', templateParam);

        // If data is in URL (for small data), decode it
        if (dataParam) {
          try {
            const decodedData = Buffer.from(dataParam, 'base64').toString('utf-8');
            const parsedData = JSON.parse(decodedData);
            console.log('Print page: Parsed CV data from URL, keys:', Object.keys(parsedData));
            setTemplate(templateParam);
            setCvData(parsedData);
            setIsLoading(false);
            return;
          } catch (urlDataError) {
            console.log('Could not parse URL data, trying session storage...');
          }
        }

        // Try to get data from session storage (for large data)
        const sessionData = sessionStorage.getItem('printCvData');
        const sessionTemplate = sessionStorage.getItem('printTemplate');
        
        if (sessionData && sessionTemplate === templateParam) {
          try {
            const parsedData = JSON.parse(sessionData);
            console.log('Print page: Parsed CV data from session, keys:', Object.keys(parsedData));
            setTemplate(templateParam);
            setCvData(parsedData);
            setIsLoading(false);
            return;
          } catch (sessionDataError) {
            console.log('Could not parse session data...');
          }
        }

        throw new Error('No CV data available');

      } catch (err) {
        console.error('Error initializing print page:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initializePage();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="print-container">
        <div className="a4-page">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading template...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="print-container">
        <div className="a4-page">
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-600">
              <p className="font-bold">Error:</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cvData || !template) {
    return (
      <div className="print-container">
        <div className="a4-page">
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-600">
              <p>No data available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const TemplateComponent = getTemplateComponent(template);
  
  if (!TemplateComponent) {
    return (
      <div className="print-container">
        <div className="a4-page">
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-600">
              <p>Template not found: {template}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="print-container">
      <div className="a4-page">
        <TemplateComponent cvData={cvData} />
      </div>
      
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          background: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .print-container {
          width: 100vw;
          min-height: 100vh;
          background: white;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 0;
        }
        
        .a4-page {
          width: 210mm;
          min-height: 297mm;
          background: white;
          margin: 0;
          padding: 0;
          box-shadow: none;
        }
        
        /* Ensure colors print correctly */
        * {
          color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Print media queries */
        @media print {
          .print-container {
            width: 210mm;
            height: 297mm;
          }
          
          .a4-page {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
          }
        }
        
        /* Ensure images display correctly */
        img {
          max-width: 100%;
          height: auto;
        }
        
        /* Ensure text is visible */
        h1, h2, h3, h4, h5, h6, p, span, div {
          color: #000000 !important;
        }
        
        /* Ensure backgrounds are preserved */
        * {
          background-color: inherit !important;
        }
      `}</style>
    </div>
  );
}
