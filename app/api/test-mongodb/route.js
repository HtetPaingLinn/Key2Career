import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    
    const connection = await connectToDatabase();
    console.log('MongoDB connection successful:', connection);
    
    const { db } = connection;
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections);
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      collections: collections.map(col => col.name)
    });
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 