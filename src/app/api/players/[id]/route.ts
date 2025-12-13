import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Player from '@/models/Player';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const player = await Player.findOne({ id }).lean();

    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: player });
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch player' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await request.json();

    // Handle field removal: if teamId or soldAmount are explicitly undefined/null, use $unset
    const updateOp: any = {};
    const unsetOp: any = {};

    Object.keys(body).forEach(key => {
      if (body[key] === undefined || body[key] === null) {
        unsetOp[key] = '';
      } else {
        updateOp[key] = body[key];
      }
    });

    const update: any = {};
    if (Object.keys(updateOp).length > 0) {
      update.$set = updateOp;
    }
    if (Object.keys(unsetOp).length > 0) {
      update.$unset = unsetOp;
    }

    const player = await Player.findOneAndUpdate(
      { id },
      update,
      { new: true, runValidators: true }
    ).lean();

    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: player });
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update player' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const player = await Player.findOneAndDelete({ id }).lean();

    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: player });
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete player' },
      { status: 500 }
    );
  }
}
