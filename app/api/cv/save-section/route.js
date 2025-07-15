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
    const result = await collection.updateOne(
      { email },
      { $set: { [section]: data, updatedAt: new Date() } },
      { upsert: true }
    );
    console.log('MongoDB update result:', result);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /cv/save-section:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 