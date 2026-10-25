import mongoose, { Schema, models } from 'mongoose';

// Single document holding who is on the block right now, so the stage
// and every viewer see the same player the admin selected.
export interface AuctionStateDoc {
  key: string;
  playerId: string | null;
}

const AuctionStateSchema = new Schema<AuctionStateDoc>(
  {
    key: { type: String, required: true, unique: true, default: 'current' },
    playerId: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

const AuctionState =
  models.AuctionState ||
  mongoose.model<AuctionStateDoc>('AuctionState', AuctionStateSchema);

export default AuctionState;
