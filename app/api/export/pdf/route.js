import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import crypto from 'crypto';

// Set runtime to Node.js for Puppeteer compatibility
export const runtime = 'nodejs';

export async function POST(request) {
  let browser = null;
  
  try {
    // Parse request body
    const { template, cvData, filename = 'Key2Career_CV.pdf' } = await request.json();
    
    if (!template || !cvData) {
      return NextResponse.json(
        { error: 'Missing template or cvData parameters' },
        { status: 400 }
      );
    }

    console.log('Starting PDF generation for template:', template);
    
    // Get base URL (works for both development and production)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    // Check if data is small enough for URL (less than 2000 characters when encoded)
    const dataString = JSON.stringify(cvData);
    const encodedData = Buffer.from(dataString).toString('base64');
    
    let printUrl;
    if (encodedData.length < 2000) {
      // Use URL parameter for small data
      const dataParam = encodeURIComponent(encodedData);
      printUrl = `${baseUrl}/print?template=${template}&data=${dataParam}`;
      console.log('Using URL parameter for data (size:', encodedData.length, ')');
    } else {
      // Use session storage for large data
      printUrl = `${baseUrl}/print?template=${template}`;
      console.log('Using session storage for data (size:', encodedData.length, ')');
    }
    
    console.log('Print URL:', printUrl);

    // Launch Puppeteer browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2
    });

    // If using session storage, set the data first
    if (encodedData.length >= 2000) {
      console.log('Setting session storage data...');
      await page.goto(`${baseUrl}/print?template=${template}`);
      await page.evaluate((data, templateName) => {
        sessionStorage.setItem('printCvData', data);
        sessionStorage.setItem('printTemplate', templateName);
      }, dataString, template);
    }

    // Navigate to print page
    console.log('Navigating to print page...');
    
    const response = await page.goto(printUrl, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('Page response status:', response.status());
    console.log('Page response ok:', response.ok());

    // Wait for page to load
    console.log('Waiting for page to load...');
    await page.waitForTimeout(3000);

    // Check if the page loaded correctly
    const pageCheck = await page.evaluate(() => {
      const a4Page = document.querySelector('.a4-page');
      return {
        hasA4Page: !!a4Page,
        a4PageChildren: a4Page ? a4Page.children.length : 0,
        bodyText: document.body.textContent.substring(0, 200)
      };
    });
    
    console.log('Page check result:', pageCheck);
    
    if (!pageCheck.hasA4Page) {
      throw new Error('Print page did not load correctly - no .a4-page element found');
    }

    // Generate PDF
    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      }
    });

    // Calculate SHA-256 hash of the PDF
    const hashHex = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
    console.log('PDF generated successfully. Hash:', hashHex);

    // Close browser
    await browser.close();
    browser = null;

    // Return PDF with headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'X-Document-SHA256': hashHex,
        'X-Generated-At': new Date().toISOString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    
    // Ensure browser is closed on error
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }

    // Return error response
    return NextResponse.json(
      { 
        error: 'PDF generation failed',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (for testing)
export async function GET(request) {
  console.log('GET request received for PDF API');
  return NextResponse.json(
    { 
      message: 'PDF Export API is running',
      usage: 'Send POST request with { template, cvData, filename }',
      timestamp: new Date().toISOString(),
      status: 'ready'
    },
    { status: 200 }
  );
}
