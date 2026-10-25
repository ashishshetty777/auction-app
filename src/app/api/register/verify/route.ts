import { NextRequest, NextResponse } from 'next/server';
import { passcodeMatches } from '@/lib/server-auth';

export async function POST(request: NextRequest) {
  const { passcode } = await request.json().catch(() => ({}));
  if (!passcodeMatches(passcode)) {
    return NextResponse.json({ success: false, error: 'That password isn’t right.' }, { status: 401 });
  }
  return NextResponse.json({ success: true });
}
