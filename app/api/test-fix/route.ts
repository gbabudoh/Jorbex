import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    
    // Use raw MongoDB query to bypass Mongoose schema
    const db = mongoose.connection.db;
    const collection = db?.collection('candidates');
    
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 500 });
    }
    
    const candidateId = new mongoose.Types.ObjectId('6970e4e73aee5a2e4cc6753d');
    
    // Read current state directly from MongoDB
    const candidateBefore = await collection.findOne({ _id: candidateId });
    console.log('[DEBUG RAW] Before:', candidateBefore);
    
    // Update directly via MongoDB
    const updateResult = await collection.updateOne(
      { _id: candidateId },
      { $set: { country: 'Nigeria', city: 'Lagos' } }
    );
    
    // Read after update
    const candidateAfter = await collection.findOne({ _id: candidateId });
    console.log('[DEBUG RAW] After:', candidateAfter);
    
    return NextResponse.json({ 
      success: true,
      before: { 
        name: candidateBefore?.name,
        country: candidateBefore?.country, 
        city: candidateBefore?.city 
      },
      after: { 
        name: candidateAfter?.name,
        country: candidateAfter?.country, 
        city: candidateAfter?.city 
      },
      updateResult
    });
  } catch (error: unknown) {
    console.error('[DEBUG ERROR]', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
