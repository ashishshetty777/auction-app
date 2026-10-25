import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Player from '@/models/Player';
import Team from '@/models/Team';
import LastSale from '@/models/LastSale';
import AuctionState from '@/models/AuctionState';
import { AUCTION_RULES } from '@/lib/constants';
import { isAdmin } from '@/lib/server-auth';

// Restart the auction: every player back in the pool, every team back to a
// full purse and an empty squad. Players and registrations are kept.
export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Admins only' }, { status: 401 });
  }
  try {
    await connectDB();
    await Promise.all([
      Player.updateMany({}, { $unset: { teamId: '', soldAmount: '' } }),
      Team.updateMany(
        {},
        {
          $set: {
            purse: AUCTION_RULES.teamPurse,
            remainingPurse: AUCTION_RULES.teamPurse,
            players: [],
            categoryCount: { LEGEND: 0, YOUNGSTAR: 0, GOLD: 0, SILVER: 0, BRONZE: 0 },
          },
        },
      ),
      LastSale.deleteMany({}),
      AuctionState.deleteMany({}),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting auction:', error);
    return NextResponse.json({ success: false, error: 'Failed to reset the auction' }, { status: 500 });
  }
}
