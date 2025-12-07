import mongoose, { Schema, models } from 'mongoose';
import { LastSale as LastSaleType } from '@/types';

const LastSaleSchema = new Schema<LastSaleType>(
  {
    playerId: { type: String, required: true },
    teamId: { type: String, required: true },
    amount: { type: Number, required: true },
    timestamp: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const LastSale = models.LastSale || mongoose.model<LastSaleType>('LastSale', LastSaleSchema);

export default LastSale;
