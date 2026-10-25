import { put, del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const BLOB_TOKEN = process.env.AUCTION_BLOB_READ_WRITE_TOKEN;

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename || !request.body) {
    return NextResponse.json({ error: 'Filename and body required' }, { status: 400 });
  }

  // Photos only: an SVG or other file saved under a .jpg name shows as a broken image.
  const type = request.headers.get('content-type') ?? '';
  if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(type)) {
    return NextResponse.json({ error: 'Upload a JPG or PNG photo' }, { status: 415 });
  }

  // Local development without a Blob token: keep uploads in public/uploads.
  if (!BLOB_TOKEN && process.env.NODE_ENV === 'development') {
    const safe = `${Date.now()}-${filename.replace(/[^\w.-]+/g, '_')}`;
    const dir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, safe), Buffer.from(await request.arrayBuffer()));
    return NextResponse.json({ url: `/uploads/${safe}` });
  }

  try {
    const blob = await put(filename, request.body, {
      addRandomSuffix: true,
      access: 'public',
      token: BLOB_TOKEN,
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  try {
    await del(url, { token: BLOB_TOKEN });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
