import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LastSale from '@/models/LastSale';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    await connectDB();
    const { playerId } = await params;

    // Delete the sale record for this specific player
    await LastSale.deleteOne({ playerId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sale for player:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete sale' },
      { status: 500 }
    );
  }
}
