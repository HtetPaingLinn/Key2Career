import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { email, section, data } = await request.json();
    console.log('API /cv/save-section called with:', { email, section, data });
    if (!email || !section || !data) {
      console.error('Missing required fields:', { email, section, data });
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const { db } = await connectToDatabase();
    const collection = db.collection('CVs');
    
    // Log the exact data being saved
    console.log('Saving to MongoDB:', {
      email,
      section,
      data: JSON.stringify(data, null, 2)
    });
    
    // Additional logging for personalInfo section
    if (section === 'personalInfo') {
      console.log('PersonalInfo data details:', {
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        description: data.description,
        imageUrl: data.imageUrl
      });
      console.log('Full personalInfo object being saved:', JSON.stringify(data, null, 2));
    }
    
    const result = await collection.updateOne(
      { email },
      { 
        $set: { 
          [section]: data, 
          updatedAt: new Date(),
          validationStatus: "pending",
          validationRequestedAt: null,
          validationApprovedAt: null
        } 
      },
      { upsert: true }
    );
    console.log('MongoDB update result:', result);
    
    // Verify the data was saved by fetching it back
    const savedData = await collection.findOne({ email });
    console.log('Data after save:', savedData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /cv/save-section:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 