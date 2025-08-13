import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    console.log('CV get request for email:', email);
    
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email parameter is required' }, { status: 400 });
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection('CVs');
    const cv = await collection.findOne({ email });
    console.log('CV found:', cv ? 'yes' : 'no');
    if (!cv) {
      // Return empty CV structure instead of 404
      return NextResponse.json({ 
        success: true, 
        data: {
          personalInfo: {
            firstName: '',
            lastName: '',
            email: email,
            phone: '',
            address: '',
            dateOfBirth: '',
            nationality: '',
            linkedin: '',
            website: '',
            drivingLicense: '',
            bio: '',
            description: '',
            imageUrl: ''
          },
          jobApplied: '',
          workExperience: [],
          education: [],
          skills: { technical: [], soft: [] },
          languages: [],
          projects: [],
          certifications: [],
          awards: [],
          references: []
        }
      });
    }
    return NextResponse.json({ success: true, data: cv });
  } catch (error) {
    console.error('Error in CV get API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 