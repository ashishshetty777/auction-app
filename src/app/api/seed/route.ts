import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Player from '@/models/Player';
import Team from '@/models/Team';
import LastSale from '@/models/LastSale';
import { PLAYERS_DATA } from '@/lib/players-seed';
import { TEAM_NAMES, AUCTION_RULES } from '@/lib/constants';

export async function POST() {
  try {
    await connectDB();

    // Clear existing data
    await Player.deleteMany({});
    await Team.deleteMany({});
    await LastSale.deleteMany({});

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
