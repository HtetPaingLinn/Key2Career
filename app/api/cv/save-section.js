import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { email, section, data } = await request.json();
    if (!email || !section || !data) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const { db } = await connectToDatabase();
    const collection = db.collection('CVs');
    await collection.updateOne(
      { email },
      { $set: { [section]: data, updatedAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 