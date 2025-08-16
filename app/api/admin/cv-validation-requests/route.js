import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb+srv://htetpaing:htetpaing@cluster0.mongodb.net/ForCVs?retryWrites=true&w=majority";

export async function GET(request) {
  let client;
  
  try {
    // TODO: Add admin authentication check here
    // For now, we'll assume the request is authenticated
    
    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('ForCVs');
    const cvsCollection = db.collection('CVs');
    
    // Fetch all CVs with complete data for preview
    const cvs = await cvsCollection.find({}).toArray();

    // Sort by validation request date (most recent first)
    cvs.sort((a, b) => {
      const dateA = a.validationRequestedAt ? new Date(a.validationRequestedAt) : new Date(0);
      const dateB = b.validationRequestedAt ? new Date(b.validationRequestedAt) : new Date(0);
      return dateB - dateA;
    });

    return NextResponse.json(cvs);

  } catch (error) {
    console.error('Error fetching CV validation requests:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
