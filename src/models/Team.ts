import mongoose, { Schema, models } from 'mongoose';
import { Team as TeamType } from '@/types';

const TeamSchema = new Schema<TeamType>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    purse: { type: Number, required: true },
    remainingPurse: { type: Number, required: true },
    players: [{ type: Schema.Types.Mixed }],
    categoryCount: {
      LEGEND: { type: Number, default: 0 },
      YOUNGSTAR: { type: Number, default: 0 },
      GOLD: { type: Number, default: 0 },
      SILVER: { type: Number, default: 0 },
      BRONZE: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const Team = models.Team || mongoose.model<TeamType>('Team', TeamSchema);

export default Team;
