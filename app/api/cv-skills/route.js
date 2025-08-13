import { NextResponse } from 'next/server';
import clientPromise from '../../../backend/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('ForCVs');
    const collection = db.collection('CVs');
    
    // Fetch the CV document with the specific email
    const cv = await collection.findOne({ email: email });
    
    if (!cv || !cv.skills) {
      return NextResponse.json({ skills: { technical: [], soft: [] } }); // Return empty skills object if no skills found
    }
    
    return NextResponse.json({ skills: cv.skills });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 