import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Employer from '@/models/Employer';
import axios from 'axios';

const MATTERMOST_URL = process.env.MATTERMOST_URL;
const MATTERMOST_BOT_TOKEN = process.env.MATTERMOST_BOT_TOKEN;

// Create Team
export async function POST(request: Request) {
  try {
    await dbConnect();
    const { employerId } = await request.json();

    const employer = await Employer.findById(employerId);
    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    if (employer.mattermostTeamId) {
      return NextResponse.json({ error: 'Employer already has a team', teamId: employer.mattermostTeamId }, { status: 400 });
    }

    // Sanitize company name for handle
    const name = employer.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 64);
    
    // Create Team on Mattermost
    const response = await axios.post(
      `${MATTERMOST_URL}/api/v4/teams`,
      {
        name: name,
        display_name: employer.companyName,
        type: 'I', // Invite only
      },
      {
        headers: { Authorization: `Bearer ${MATTERMOST_BOT_TOKEN}` },
      }
    );

    const team = response.data;

    // Save Team ID to Employer
    employer.mattermostTeamId = team.id;
    await employer.save();

    // Defaults channels are created automatically by Mattermost (Town Square, Off-Topic)
    
    return NextResponse.json({ success: true, teamId: team.id, name: team.name });

  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error('Mattermost Team Create Error:', error.response?.data || error.message);
    return NextResponse.json({ error: error.response?.data?.message || error.message }, { status: 500 });
  }
}
