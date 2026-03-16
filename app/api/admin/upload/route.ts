import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { upsertSiteContent } from '@/lib/siteContent';

const s3 = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || 'http://149.102.155.247:9000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'admin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || '',
  },
  forcePathStyle: true,
});

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const imageKey = formData.get('key') as string; // 'candidate_image_url' or 'employer_image_url'

  if (!file || !imageKey) {
    return NextResponse.json({ error: 'Missing file or key' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop() || 'png';
  const filename = `hero/${imageKey.replace('_image_url', '')}_${Date.now()}.${ext}`;
  const bucket = process.env.MINIO_BUCKET || 'jorbex';

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    })
  );

  const url = `${process.env.MINIO_ENDPOINT}/${bucket}/${filename}`;
  await upsertSiteContent('hero', { [imageKey]: url }, session!.user.id);

  return NextResponse.json({ url });
}
