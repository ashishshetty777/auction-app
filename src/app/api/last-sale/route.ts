import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LastSale from '@/models/LastSale';

export async function GET() {
  try {
    await connectDB();
    const lastSale = await LastSale.findOne().sort({ timestamp: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: lastSale
    });
  } catch (error) {
    console.error('Error fetching last sale:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch last sale' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Clear all previous last sales
    await LastSale.deleteMany({});

    // Create new last sale
    const lastSale = await LastSale.create(body);

    return NextResponse.json({ success: true, data: lastSale }, { status: 201 });
  } catch (error) {
    console.error('Error creating last sale:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create last sale' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await connectDB();
    await LastSale.deleteMany({});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting last sale:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete last sale' },
      { status: 500 }
    );
  }
}
