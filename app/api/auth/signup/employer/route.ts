import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Employer from '@/models/Employer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, companyName } = body;

    if (!name || !email || !password || !phone || !companyName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if employer already exists
    const existingEmployer = await Employer.findOne({ email });
    if (existingEmployer) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Calculate trial end date (30 days from now)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);

    // Create new employer
    const employer = await Employer.create({
      name,
      email,
      password,
      phone,
      companyName,
      subscriptionStatus: 'trial',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: trialEndDate,
    });

    return NextResponse.json(
      {
        message: 'Employer created successfully',
        employer: {
          id: employer._id,
          email: employer.email,
          name: employer.name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create employer' },
      { status: 500 }
    );
  }
}

