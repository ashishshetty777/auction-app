import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import Player from '@/models/Player';
import Registration from '@/models/Registration';
import { passcodeMatches } from '@/lib/server-auth';
import {
  RegistrationInput,
  ageOn,
  nameKey,
  normalizeMobile,
  toStoredDate,
  validateRegistration,
} from '@/lib/registration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!passcodeMatches(body.passcode)) {
      return NextResponse.json(
        { success: false, error: 'The registration password is missing or wrong. Reload the page and enter it again.' },
        { status: 401 },
      );
    }

    const input = body as RegistrationInput;
    const errors = validateRegistration(input);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, error: 'Some answers need fixing.', fields: errors }, { status: 400 });
    }

    await connectDB();
    const mobile = normalizeMobile(input.mobileNumber);
    const key = nameKey(input.name);

    // One registration per person: same mobile number, or same name in the same flat.
    const [regByMobile, regByName, players] = await Promise.all([
      Registration.findOne({ mobileNumber: mobile }).lean(),
      Registration.findOne({ nameKey: key, wing: input.wing, flatNumber: input.flatNumber }).lean(),
      Player.find({}, { name: 1, mobileNumber: 1, wing: 1, flatNumber: 1 }).lean<
        { name: string; mobileNumber: string; wing: string; flatNumber: string }[]
      >(),
    ]);
    const playerByMobile = players.find(p => normalizeMobile(p.mobileNumber) === mobile);
    const playerByName = players.find(
      p => nameKey(p.name) === key && p.wing === input.wing && p.flatNumber === input.flatNumber,
    );

    if (regByMobile || playerByMobile) {
      return NextResponse.json(
        {
          success: false,
          duplicate: true,
          error: 'This mobile number is already registered. If your details need changing, message the organisers.',
          fields: { mobileNumber: 'Already registered.' },
        },
        { status: 409 },
      );
    }
    if (regByName || playerByName) {
      return NextResponse.json(
        {
          success: false,
          duplicate: true,
          error: `Someone named ${input.name.trim()} from ${input.wing} ${input.flatNumber} is already registered. If that isn’t you, message the organisers.`,
          fields: { name: 'Already registered from this flat.' },
        },
        { status: 409 },
      );
    }

    const registration = await Registration.create({
      id: new Types.ObjectId().toString(),
      status: 'PENDING',
      name: input.name.trim().replace(/\s+/g, ' ').toUpperCase(),
      nameKey: key,
      mobileNumber: mobile,
      wing: input.wing,
      flatNumber: input.flatNumber,
      dateOfBirth: toStoredDate(input.dateOfBirth),
      age: ageOn(input.dateOfBirth),
      imageUrl: input.imageUrl,
      playingRole: input.playingRole,
      battingStyle: input.battingStyle,
      bowlingStyle: input.bowlingStyle,
      tshirtSize: input.tshirtSize === 'Other' ? input.tshirtSizeOther.trim() : input.tshirtSize,
      tshirtName: input.tshirtName.trim().toUpperCase(),
      tshirtNumber: String(parseInt(input.tshirtNumber.trim(), 10)),
      playedLastSeason: input.playedLastSeason,
      remark: input.remark.trim() || undefined,
      feeAgreed: true,
    });

    return NextResponse.json({ success: true, data: { id: registration.id } }, { status: 201 });
  } catch (error) {
    console.error('Error registering player:', error);
    return NextResponse.json(
      { success: false, error: 'We couldn’t save your registration. Try again in a minute.' },
      { status: 500 },
    );
  }
}
