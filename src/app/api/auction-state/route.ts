import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AuctionState from '@/models/AuctionState';
import Player from '@/models/Player';
import LastSale from '@/models/LastSale';

export const dynamic = 'force-dynamic';

// Lightweight poll target: who is on the block, the latest sale, and a
// revision string that changes whenever squads change (sale, undo, delete,
// player edits), so clients only refetch full data when something moved.
export async function GET() {
  try {
    await connectDB();
    const [state, lastSale, soldSummary, latestPlayer] = await Promise.all([
      AuctionState.findOne({ key: 'current' }).lean<{ playerId: string | null }>(),
      LastSale.findOne().sort({ timestamp: -1 }).lean(),
      Player.aggregate([
        { $match: { teamId: { $nin: [null, ''] } } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$soldAmount' } } },
      ]),
      Player.findOne().sort({ updatedAt: -1 }).select('updatedAt').lean<{ updatedAt?: Date }>(),
    ]);
    const playerCount = await Player.estimatedDocumentCount();

    const sold = soldSummary[0] ?? { count: 0, total: 0 };
    const revision = [
      playerCount,
      sold.count,
      sold.total,
      latestPlayer?.updatedAt ? new Date(latestPlayer.updatedAt).getTime() : 0,
    ].join(':');

    return NextResponse.json({
      success: true,
      data: {
        playerId: state?.playerId ?? null,
        lastSale: lastSale ?? null,
        revision,
      },
    });
  } catch (error) {
    console.error('Error fetching auction state:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch auction state' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const playerId: string | null = body.playerId ?? null;

    const state = await AuctionState.findOneAndUpdate(
      { key: 'current' },
      { playerId },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json({ success: true, data: state });
  } catch (error) {
    console.error('Error updating auction state:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update auction state' },
      { status: 500 }
    );
  }
}
