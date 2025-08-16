import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb+srv://htetpaing:htetpaing@cluster0.mongodb.net/ForCVs?retryWrites=true&w=majority";

export async function POST(request) {
  let client;
  
  try {
    const { email, status } = await request.json();
    
    if (!email || !status) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and status are required' 
      }, { status: 400 });
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid status. Must be pending, approved, or rejected' 
      }, { status: 400 });
    }

    // TODO: Add admin authentication check here
    // For now, we'll assume the request is authenticated

    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('ForCVs');
    const cvsCollection = db.collection('CVs');
    
    // Check if CV exists
    const existingCV = await cvsCollection.findOne({ email });
    
    if (!existingCV) {
      return NextResponse.json({ 
        success: false, 
        error: 'CV not found' 
      }, { status: 404 });
    }

    // Prepare update data
    const updateData = {
      validationStatus: status,
      updatedAt: new Date()
    };

    // Add approval timestamp if approved
    if (status === 'approved') {
      updateData.validationApprovedAt = new Date();
    } else if (status === 'rejected') {
      // Remove approval timestamp if rejected
      updateData.validationApprovedAt = null;
    }

    // Update the CV validation status
    const updateResult = await cvsCollection.updateOne(
      { email },
      { $set: updateData }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update validation status' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Validation status updated to ${status}`,
      status: status
    });

  } catch (error) {
    console.error('Error updating validation status:', error);
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
