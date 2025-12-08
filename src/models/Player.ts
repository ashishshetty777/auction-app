import mongoose, { Schema, models } from 'mongoose';
import { Player as PlayerType } from '@/types';

const PlayerSchema = new Schema<PlayerType>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    playingRole: { type: String, required: true, enum: ['Batsman', 'Bowler', 'Allrounder'] },
    wing: { type: String, required: true },
    flatNumber: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    age: { type: Number, required: true },
    category: { type: String, required: true, enum: ['LEGEND', 'YOUNGSTAR', 'GOLD', 'SILVER', 'BRONZE'] },
    teamId: { type: String },
    soldAmount: { type: Number },
    imageUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

const Player = models.Player || mongoose.model<PlayerType>('Player', PlayerSchema);

export default Player;
