import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { isAdmin } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Admins only' }, { status: 401 });
  }
  try {
    await connectDB();
    const registrations = await Registration.find({}, { nameKey: 0, _id: 0, __v: 0 })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, data: registrations });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch registrations' }, { status: 500 });
  }
}
