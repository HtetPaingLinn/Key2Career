"use client";
import { ModernTemplate1 } from '@/components/templates/ModernTemplate1';

export default function TestPrintPage() {
  // Simple test data
  const testData = {
    personalInfo: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      address: "123 Main St, City, Country"
    },
    workExperience: [
      {
        company: "Test Company",
        position: "Software Engineer",
        startDate: "2020-01",
        endDate: "2023-12",
        description: "Test work experience"
      }
    ],
    education: [
      {
        institution: "Test University",
        degree: "Bachelor of Science",
        field: "Computer Science",
        startDate: "2016-09",
        endDate: "2020-05"
      }
    ],
    skills: ["JavaScript", "React", "Node.js"]
  };

  return (
    <div className="print-container">
      <div className="a4-page">
        <ModernTemplate1 cvData={testData} />
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
