import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function GET() {
  try {
    console.log('Testing database connection...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'NOT SET');
    
    await dbConnect();
    
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    
    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    const collections = await mongoose.connection.db?.listCollections().toArray() || [];
    
    return NextResponse.json({
      success: true,
      connectionState: dbStates[dbState as keyof typeof dbStates] || 'unknown',
      databaseName: dbName,
      collections: collections.map(c => c.name),
      candidateCount: await mongoose.connection.db?.collection('candidates')?.countDocuments() || 0,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'NOT SET',
    }, { status: 500 });
  }
}

