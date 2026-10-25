import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Player from '@/models/Player';
import Registration from '@/models/Registration';
import { isAdmin } from '@/lib/server-auth';
import { CATEGORY_ORDER } from '@/lib/constants';
import { PlayerCategory } from '@/types';

type Params = { params: Promise<{ id: string }> };

// Add to the pool: the admin's category turns the registration into a player.
export async function POST(request: NextRequest, { params }: Params) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Admins only' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const { category } = await request.json();
    if (!CATEGORY_ORDER.includes(category as PlayerCategory)) {
      return NextResponse.json({ success: false, error: 'Choose a category' }, { status: 400 });
    }

    await connectDB();
    const reg = await Registration.findOne({ id });
    if (!reg) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 });
    }
    if (reg.status === 'ADDED') {
      return NextResponse.json({ success: false, error: 'Already in the pool' }, { status: 409 });
    }

    const playerId = `reg-${reg.id}`;
    const player = await Player.create({
      id: playerId,
      registrationId: reg.id,
      name: reg.name,
      mobileNumber: reg.mobileNumber,
      playingRole: reg.playingRole,
      battingStyle: reg.battingStyle,
      bowlingStyle: reg.bowlingStyle,
      wing: reg.wing,
      flatNumber: reg.flatNumber,
      dateOfBirth: reg.dateOfBirth,
      age: reg.age,
      category,
      imageUrl: reg.imageUrl,
    });
    reg.status = 'ADDED';
    reg.playerId = playerId;
    await reg.save();

    return NextResponse.json({ success: true, data: player });
  } catch (error) {
    console.error('Error adding registration to pool:', error);
    return NextResponse.json({ success: false, error: 'Failed to add to the pool' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Admins only' }, { status: 401 });
  }
  try {
    const { id } = await params;
    await connectDB();
    const reg = await Registration.findOne({ id }).lean<{ status: string }>();
    if (!reg) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 });
    }
    if (reg.status === 'ADDED') {
      return NextResponse.json(
        { success: false, error: 'This player is in the pool. Remove them from the Players page first.' },
        { status: 409 },
      );
    }
    await Registration.deleteOne({ id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
