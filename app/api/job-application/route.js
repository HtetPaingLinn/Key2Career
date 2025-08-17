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

    const email = String(body.email).trim().toLowerCase();
    const jobId = String(body.jobId || '').trim();
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'jobId is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('application');

    // Ensure a compound unique index on (email, jobId). This is idempotent.
    try {
      await collection.createIndex({ email: 1, jobId: 1 }, { unique: true, name: 'uniq_email_job' });
    } catch (_) {
      // ignore index race errors
    }

    // Check for existing application with same email + jobId
    const existing = await collection.findOne({ email, jobId });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You have already applied to this job with this email.' },
        { status: 409 }
      );
    }

    const now = new Date();
    const doc = {
      ...body,
      email,
      jobId,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const result = await collection.insertOne(doc);
      return NextResponse.json({ success: true, id: result.insertedId });
    } catch (e) {
      // In case of a late race, surface a friendly error
      if (e?.code === 11000) {
        return NextResponse.json(
          { success: false, error: 'You have already applied to this job with this email.' },
          { status: 409 }
        );
      }
      throw e;
    }
  } catch (error) {
    console.error('Failed to save application:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// GET /api/job-application?email={email}
// Returns applications belonging to the specified email only
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const rawEmail = searchParams.get('email');
    if (!rawEmail) {
      return NextResponse.json(
        { success: false, error: 'email is required' },
        { status: 400 }
      );
    }

    const email = String(rawEmail).trim().toLowerCase();
    const { db } = await connectToDatabase();
    const collection = db.collection('application');

    const apps = await collection
      .find({ email })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return NextResponse.json({ success: true, applications: apps });
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
