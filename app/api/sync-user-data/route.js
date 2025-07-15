import { NextResponse } from 'next/server';
import { syncUserData } from '@/lib/mongodb';

export async function POST(request) {
  try {
    console.log('API route called - sync-user-data');
    
    const userData = await request.json();
    console.log('Received user data:', userData);
    
    // Validate required fields
    if (!userData.email) {
      console.log('Validation failed: Email is required');
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Starting MongoDB sync...');
    // Sync user data to MongoDB
    const result = await syncUserData(userData);
    console.log('MongoDB sync result:', result);
    
    if (result.success) {
      console.log('Sync successful, returning success response');
      return NextResponse.json(
        { success: true, message: 'User data synced successfully' },
        { status: 200 }
      );
    } else {
      console.log('Sync failed, returning error response');
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
} 