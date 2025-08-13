import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import crypto from 'crypto';

// Set runtime to Node.js for Puppeteer compatibility
export const runtime = 'nodejs';

export async function GET(request) {
  let browser = null;
  
  try {
    console.log('Starting test PDF generation...');
    
    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    const testUrl = `${baseUrl}/test-print`;
    console.log('Test URL:', testUrl);

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

    // Navigate to test page
    console.log('Navigating to test page...');
    
    const response = await page.goto(testUrl, { 
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
      throw new Error('Test page did not load correctly - no .a4-page element found');
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
        'Content-Disposition': 'attachment; filename="test.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
        'X-Document-SHA256': hashHex,
        'X-Generated-At': new Date().toISOString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Test PDF generation error:', error);
    
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
        error: 'Test PDF generation failed',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
