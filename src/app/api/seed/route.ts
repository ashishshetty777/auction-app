import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Player from '@/models/Player';
import Team from '@/models/Team';
import LastSale from '@/models/LastSale';
import AuctionState from '@/models/AuctionState';
import { PLAYERS_DATA } from '@/lib/players-seed';
import { TEAM_NAMES, AUCTION_RULES } from '@/lib/constants';

// Loads the original player list into an empty database. Players now come in
// through registration, so this refuses to run over existing players unless
// called with ?force=1. Resetting the auction is /api/reset.
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const force = new URL(request.url).searchParams.get('force') === '1';
    if (!force && (await Player.estimatedDocumentCount()) > 0) {
      return NextResponse.json(
        { success: false, error: 'Players already exist. Use /api/reset to restart the auction.' },
        { status: 409 },
      );
    }

    // Clear existing data
    await Player.deleteMany({});
    await Team.deleteMany({});
    await LastSale.deleteMany({});
    await AuctionState.deleteMany({});

    // Seed players
    await Player.insertMany(PLAYERS_DATA);

    // Seed teams
    const initialTeams = TEAM_NAMES.map((name, index) => ({
      id: `team-${index + 1}`,
      name,
      purse: AUCTION_RULES.teamPurse,
      remainingPurse: AUCTION_RULES.teamPurse,
      players: [],
      categoryCount: {
        LEGEND: 0,
        YOUNGSTAR: 0,
        GOLD: 0,
        SILVER: 0,
        BRONZE: 0,
      },
    }));

    await Team.insertMany(initialTeams);

    const playersCount = await Player.countDocuments();
    const teamsCount = await Team.countDocuments();

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        players: playersCount,
        teams: teamsCount,
      },
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 },
    );
  }
}
