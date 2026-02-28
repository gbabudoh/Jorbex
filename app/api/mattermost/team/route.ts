import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import axios from 'axios';

const MATTERMOST_URL = process.env.MATTERMOST_URL;
const MATTERMOST_BOT_TOKEN = process.env.MATTERMOST_BOT_TOKEN;

export async function POST(request: Request) {
  try {
    const { employerId } = await request.json();

    const employer = await prisma.employer.findUnique({ where: { id: employerId } });
    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    if (employer.mattermostTeamId) {
      return NextResponse.json({ error: 'Employer already has a team', teamId: employer.mattermostTeamId }, { status: 400 });
    }

    const name = employer.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 64);

    const response = await axios.post(
      `${MATTERMOST_URL}/api/v4/teams`,
      { name, display_name: employer.companyName, type: 'I' },
      { headers: { Authorization: `Bearer ${MATTERMOST_BOT_TOKEN}` } }
    );

    const team = response.data;

    await prisma.employer.update({
      where: { id: employerId },
      data: { mattermostTeamId: team.id },
    });

    return NextResponse.json({ success: true, teamId: team.id, name: team.name });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    console.error('Mattermost Team Create Error:', err.response?.data || err.message);
    return NextResponse.json({ error: err.response?.data?.message || err.message }, { status: 500 });
  }
}
