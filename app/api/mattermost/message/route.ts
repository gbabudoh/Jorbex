import { NextResponse } from 'next/server';
import { mattermost } from '@/lib/mattermost';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { channelId, message, fileIds, props } = body;

    if (!channelId || !message) {
      return NextResponse.json({ error: 'Missing channelId or message' }, { status: 400 });
    }

    const post = await mattermost.postMessage({
      channelId,
      message,
      fileIds,
      props,
    });

    return NextResponse.json({ success: true, post });

  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error('Mattermost Post Message Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
