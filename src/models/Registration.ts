import mongoose, { Schema, models } from 'mongoose';

// A self-registration waiting for an admin. It becomes a Player only when an
// admin gives it a category and adds it to the pool.
const RegistrationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    status: { type: String, required: true, enum: ['PENDING', 'ADDED'], default: 'PENDING' },
    playerId: { type: String },
    name: { type: String, required: true },
    nameKey: { type: String, required: true, index: true },
    mobileNumber: { type: String, required: true, index: true },
    wing: { type: String, required: true },
    flatNumber: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    age: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    playingRole: { type: String, required: true, enum: ['Batsman', 'Bowler', 'Allrounder'] },
    battingStyle: { type: String, required: true, enum: ['Left', 'Right'] },
    bowlingStyle: { type: String, required: true, enum: ['Left', 'Right', 'None'] },
    tshirtSize: { type: String, required: true },
    tshirtName: { type: String, required: true },
    tshirtNumber: { type: String, required: true },
    playedLastSeason: { type: String, required: true, enum: ['YES', 'NO', 'NOT_SURE'] },
    remark: { type: String },
    feeAgreed: { type: Boolean, required: true },
  },
  { timestamps: true },
);

const Registration = models.Registration || mongoose.model('Registration', RegistrationSchema);

export default Registration;
