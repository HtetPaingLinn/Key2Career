// PDF Generator using html2canvas and jsPDF for accurate visual reproduction
import { transformToReactiveResumeFormat } from './cvDataTransformer';

// Dynamic imports for better performance
let html2canvas = null;
let jsPDF = null;

// Initialize libraries
const initializeLibraries = async () => {
  if (!html2canvas) {
    html2canvas = (await import('html2canvas')).default;
  }
  if (!jsPDF) {
    jsPDF = (await import('jspdf')).default;
  }
};

// Wait for fonts to load
const waitForFonts = () => {
  return new Promise((resolve) => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setTimeout(resolve, 200); // Increased delay to ensure fonts are fully loaded
      });
    } else {
      setTimeout(resolve, 1000); // Increased fallback delay
    }
  });
};

// Wait for images to load
const waitForImages = () => {
  return new Promise((resolve) => {
    const images = document.querySelectorAll('img');
    if (images.length === 0) {
      resolve();
      return;
    }

    let loadedCount = 0;
    const totalImages = images.length;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount >= totalImages) {
        resolve();
      }
    };

    images.forEach(img => {
      if (img.complete) {
        checkComplete();
      } else {
        img.onload = checkComplete;
        img.onerror = checkComplete;
      }
    });
  });
};

// Create a clean template element for PDF generation
const createCleanTemplateElement = (templateElement) => {
  // Find the actual template content
  const templateContent = templateElement.querySelector('[data-template-preview]') || templateElement;
  
  // Create a new container for PDF generation
  const pdfContainer = document.createElement('div');
  pdfContainer.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 800px;
    background: white;
    padding: 40px;
    z-index: -1;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.4;
    color: black;
  `;
  
  // Clone the template content
  const clonedContent = templateContent.cloneNode(true);
  
  // Remove any data attributes that might interfere
  clonedContent.removeAttribute('data-template-preview');
  
  // Ensure the cloned content has proper styling
  clonedContent.style.cssText = `
    background: white;
    color: black;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.4;
    margin: 0;
    padding: 0;
  `;
  
  pdfContainer.appendChild(clonedContent);
  
  // Add to document temporarily
  document.body.appendChild(pdfContainer);
  
  return pdfContainer;
};

// Test function to verify PDF generation
export const testPDFGeneration = async () => {
  try {
    console.log('Testing PDF generation...');
    
    await initializeLibraries();
    
    // Create a simple test element
    const testElement = document.createElement('div');
    testElement.innerHTML = `
      <div style="background: white; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: black; font-size: 24px;">Test PDF Generation</h1>
        <p style="color: black; font-size: 16px;">This is a test to verify PDF generation is working.</p>
        <p style="color: black; font-size: 16px;">If you can see this in the PDF, the generation is successful!</p>
      </div>
    `;
    testElement.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 400px;
      background: white;
      z-index: -1;
    `;
    
    document.body.appendChild(testElement);
    
    try {
      const canvas = await html2canvas(testElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
      });
      
      console.log('Test canvas generated successfully:', canvas);
      
      // Create and download test PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(canvas, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('test-pdf-generation.pdf');
      
      console.log('Test PDF generated successfully!');
      return true;
    } finally {
      if (testElement.parentNode) {
        testElement.parentNode.removeChild(testElement);
      }
    }
  } catch (error) {
    console.error('Test PDF generation failed:', error);
    return false;
  }
};

// Generate PDF using html2canvas and jsPDF
export const generatePDF = async (cvData, templateId) => {
  try {
    console.log('Generating PDF for template:', templateId);
    console.log('CV Data:', cvData);
    
    await initializeLibraries();
    
    // Wait for fonts and images to load
    await Promise.all([waitForFonts(), waitForImages()]);
    
    // Find the template component element
    const templateElement = document.querySelector('[data-template-preview]');
    if (!templateElement) {
      throw new Error('Template preview element not found. Make sure the template is rendered.');
    }
    
    console.log('Template element found:', templateElement);
    console.log('Template element dimensions:', {
      width: templateElement.scrollWidth,
      height: templateElement.scrollHeight,
      offsetWidth: templateElement.offsetWidth,
      offsetHeight: templateElement.offsetHeight
    });
    
    // Ensure the element is visible and has content
    if (templateElement.scrollHeight === 0) {
      throw new Error('Template element has no content. Please ensure the template is properly rendered.');
    }
    
    // Create a clean template element for PDF generation
    const pdfContainer = createCleanTemplateElement(templateElement);
    
    try {
      // Configure html2canvas options for high quality
      const canvas = await html2canvas(pdfContainer, {
        scale: 2, // Higher resolution for crisp text
        useCORS: true, // Handle cross-origin images
        allowTaint: true, // Allow external images
        backgroundColor: '#ffffff',
        width: pdfContainer.scrollWidth,
        height: pdfContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: pdfContainer.scrollWidth,
        windowHeight: pdfContainer.scrollHeight,
        foreignObjectRendering: true, // Better font rendering
        removeContainer: true,
        logging: true, // Enable logging for debugging
        imageTimeout: 30000, // Longer timeout for images
        onclone: (clonedDoc) => {
          // Ensure the cloned element has proper styling
          const clonedContainer = clonedDoc.body.firstChild;
          if (clonedContainer) {
            // Force all styles to be applied
            clonedContainer.style.display = 'block';
            clonedContainer.style.visibility = 'visible';
            clonedContainer.style.opacity = '1';
            clonedContainer.style.position = 'relative';
            clonedContainer.style.left = '0';
            clonedContainer.style.top = '0';
            
            // Ensure all child elements are visible
            const allElements = clonedContainer.querySelectorAll('*');
            allElements.forEach(el => {
              el.style.display = el.style.display || 'block';
              el.style.visibility = el.style.visibility || 'visible';
              el.style.opacity = el.style.opacity || '1';
              el.style.position = el.style.position || 'static';
            });
          }
        }
      });
      
      console.log('Canvas generated successfully');
      console.log('Canvas dimensions:', {
        width: canvas.width,
        height: canvas.height
      });
      
      return canvas;
    } finally {
      // Clean up the temporary container
      if (pdfContainer && pdfContainer.parentNode) {
        pdfContainer.parentNode.removeChild(pdfContainer);
      }
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

// Download PDF function
export const downloadPDF = async (cvData, templateId, filename = 'resume.pdf') => {
  try {
    console.log('Starting PDF download for template:', templateId);
    
    await initializeLibraries();
    
    // Generate canvas from template
    const canvas = await generatePDF(cvData, templateId);
    
    // Calculate PDF dimensions (A4 format)
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    console.log('PDF dimensions calculated:', {
      imgWidth,
      imgHeight,
      pageHeight,
      totalPages: Math.ceil(imgHeight / pageHeight)
    });
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    let heightLeft = imgHeight;
    let position = 0;
    let pageNumber = 1;
    
    // Add first page
    pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    pageNumber++;
    
    // Add additional pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      pageNumber++;
    }
    
    console.log(`PDF created with ${pageNumber - 1} pages`);
    
    // Download the PDF
    pdf.save(filename);
    
    console.log('PDF downloaded successfully');
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw new Error(`Failed to download PDF: ${error.message}`);
  }
};

// Alternative PDF generation using react-pdf (fallback)
export const generatePDFWithReactPDF = async (cvData, templateId) => {
  try {
    console.log('Generating PDF with react-pdf for template:', templateId);
    
    const { pdf } = await import('@react-pdf/renderer');
    
    // Create a simple PDF document as fallback
    const { Document, Page, Text, View, StyleSheet, Font } = await import('@react-pdf/renderer');
    
    // Register fonts
    Font.register({
      family: 'Inter',
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
    });
    
    const styles = StyleSheet.create({
      page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 20,
        fontFamily: 'Inter',
      },
      header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
      },
      section: {
        marginBottom: 15,
      },
      sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1e40af',
      },
      item: {
        marginBottom: 8,
      },
      title: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
      },
      subtitle: {
        fontSize: 10,
        color: '#6b7280',
        marginBottom: 2,
      },
      text: {
        fontSize: 10,
        lineHeight: 1.4,
      },
    });
    
    const reactiveResumeData = transformToReactiveResumeFormat(cvData);
    const { basics, sections } = reactiveResumeData;
    
    const PDFDocument = () => (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Text>{basics.name}</Text>
            <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 5 }}>
              {basics.headline}
            </Text>
          </View>
          
          {/* Contact Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            {basics.email && (
              <View style={styles.item}>
                <Text style={styles.text}>Email: {basics.email}</Text>
              </View>
            )}
            {basics.phone && (
              <View style={styles.item}>
                <Text style={styles.text}>Phone: {basics.phone}</Text>
              </View>
            )}
            {basics.location && (
              <View style={styles.item}>
                <Text style={styles.text}>Location: {basics.location}</Text>
              </View>
            )}
          </View>
          
          {/* Summary */}
          {sections.summary?.visible && sections.summary.items?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={styles.text}>{sections.summary.items[0].summary}</Text>
            </View>
          )}
          
          {/* Experience */}
          {sections.experience?.visible && sections.experience.items?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experience</Text>
              {sections.experience.items.map((exp, index) => (
                <View key={index} style={styles.item}>
                  <Text style={styles.title}>{exp.position}</Text>
                  <Text style={styles.subtitle}>{exp.company}</Text>
                  <Text style={styles.subtitle}>
                    {exp.startDate && new Date(exp.startDate).getFullYear()} - 
                    {exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}
                  </Text>
                  {exp.description && (
                    <Text style={styles.text}>{exp.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
          
          {/* Education */}
          {sections.education?.visible && sections.education.items?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              {sections.education.items.map((edu, index) => (
                <View key={index} style={styles.item}>
                  <Text style={styles.title}>{edu.degree}</Text>
                  <Text style={styles.subtitle}>{edu.institution}</Text>
                  <Text style={styles.subtitle}>
                    {edu.startDate && new Date(edu.startDate).getFullYear()} - 
                    {edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
                  </Text>
                  {edu.description && (
                    <Text style={styles.text}>{edu.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
          
          {/* Skills */}
          {sections.skills?.visible && sections.skills.items?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              {sections.skills.items.map((skill, index) => (
                <View key={index} style={styles.item}>
                  <Text style={styles.text}>{skill.name} - Level {skill.level}/5</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Projects */}
          {sections.projects?.visible && sections.projects.items?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Projects</Text>
              {sections.projects.items.map((proj, index) => (
                <View key={index} style={styles.item}>
                  <Text style={styles.title}>{proj.name}</Text>
                  <Text style={styles.subtitle}>{proj.summary}</Text>
                  {proj.description && (
                    <Text style={styles.text}>{proj.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </Page>
      </Document>
    );
    
    const blob = await pdf(<PDFDocument />).toBlob();
    return blob;
  } catch (error) {
    console.error('Error generating PDF with react-pdf:', error);
    throw new Error(`Failed to generate PDF with react-pdf: ${error.message}`);
  }
};

// Enhanced download function with fallback
export const downloadPDFWithFallback = async (cvData, templateId, filename = 'resume.pdf') => {
  try {
    // Try html2canvas method first
    await downloadPDF(cvData, templateId, filename);
  } catch (error) {
    console.warn('html2canvas method failed, trying react-pdf fallback:', error);
    try {
      // Fallback to react-pdf
      const blob = await generatePDFWithReactPDF(cvData, templateId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (fallbackError) {
      console.error('Both PDF generation methods failed:', fallbackError);
      throw new Error('PDF generation failed. Please try again.');
    }
  }
};

const pdfGenerator = { generatePDF, downloadPDF, downloadPDFWithFallback, testPDFGeneration };
export default pdfGenerator; 