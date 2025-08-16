import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req) {
  try {
    const body = await req.json();

    // Basic shape check
    if (!body || !body.email || !body.fullName) {
      return NextResponse.json(
        { success: false, error: 'fullName and email are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('application');

    const now = new Date();
    const doc = {
      ...body,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(doc);

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Failed to save application:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
