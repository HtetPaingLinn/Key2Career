import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdfFile');
    
    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    // Check if it's a PDF file
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Calculate SHA-256 hash
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    
    console.log('Uploaded PDF hash:', hash);

    return NextResponse.json({
      success: true,
      hash: hash,
      filename: file.name,
      size: buffer.length,
      message: 'PDF hash calculated successfully. Use this hash to verify against blockchain.'
    });

  } catch (error) {
    console.error('PDF upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process PDF file', 
      details: error.message 
    }, { status: 500 });
  }
}
