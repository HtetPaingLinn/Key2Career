import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb+srv://htetpaing:htetpaing@cluster0.mongodb.net/ForCVs?retryWrites=true&w=majority";

export async function POST(request) {
  let client;
  
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('ForCVs');
    const cvsCollection = db.collection('CVs');
    
    // Check if user has CV data
    const existingCV = await cvsCollection.findOne({ email });
    
    if (!existingCV) {
      return NextResponse.json({ 
        success: false, 
        error: 'No CV data found. Please complete your CV first.' 
      }, { status: 404 });
    }

    // Update the CV with validation request status
    const updateResult = await cvsCollection.updateOne(
      { email },
      { 
        $set: { 
          validationStatus: 'pending',
          validationRequestedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update validation status' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Validation request submitted successfully',
      status: 'pending'
    });

  } catch (error) {
    console.error('Error submitting validation request:', error);
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

export async function GET(request) {
  let client;
  
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('ForCVs');
    const cvsCollection = db.collection('CVs');
    
    // Get validation status for the user
    const cvData = await cvsCollection.findOne(
      { email }, 
      { projection: { validationStatus: 1, validationRequestedAt: 1, validationApprovedAt: 1 } }
    );

    if (!cvData) {
      return NextResponse.json({ 
        success: true, 
        status: null,
        message: 'No CV data found'
      });
    }

    return NextResponse.json({ 
      success: true, 
      status: cvData.validationStatus || null,
      requestedAt: cvData.validationRequestedAt || null,
      approvedAt: cvData.validationApprovedAt || null
    });

  } catch (error) {
    console.error('Error getting validation status:', error);
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
