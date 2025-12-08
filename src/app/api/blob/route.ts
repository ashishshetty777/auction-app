import { put, del } from '@vercel/blob';
import { NextResponse } from 'next/server';

const BLOB_TOKEN = process.env.AUCTION_BLOB_READ_WRITE_TOKEN;

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename || !request.body) {
    return NextResponse.json({ error: 'Filename and body required' }, { status: 400 });
  }

  try {
    const blob = await put(filename, request.body, {
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
