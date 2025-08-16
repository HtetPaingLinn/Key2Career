import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function DELETE(request) {
  try {
    const { email } = await request.json();
    console.log('Clear CV data request for email:', email);
    
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Connect to MongoDB using the same method as other CV endpoints
    const { db } = await connectToDatabase();
    const collection = db.collection('CVs');
    
    // Delete the CV document for the user
    const result = await collection.deleteOne({ email: email });
    console.log('MongoDB delete result:', result);
    
    if (result.deletedCount > 0) {
      console.log(`CV data cleared for user: ${email}`);
      return NextResponse.json({ 
        success: true, 
        message: 'CV data cleared successfully',
        deletedCount: result.deletedCount 
      });
    } else {
      console.log(`No CV data found for user: ${email}`);
      return NextResponse.json({ 
        success: true, 
        message: 'No CV data found to clear',
        deletedCount: 0 
      });
    }
    
  } catch (error) {
    console.error('Error clearing CV data:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to clear CV data: ' + error.message 
    }, { status: 500 });
  }
}
