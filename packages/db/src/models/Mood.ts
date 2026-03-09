import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMood extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  mood: 'Terrible' | 'Bad' | 'Okay' | 'Good' | 'Excellent';
  activities: string[]; // e.g. ['Work', 'Family']
  context?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  createdAt: Date;
  updatedAt: Date;
}

const MoodSchema = new Schema<IMood>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    mood: { 
      type: String, 
      required: true, 
      enum: ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'] 
    },
    activities: { type: [String], default: [] },
    context: { type: String },
    date: { type: String, required: true },
    time: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

export const Mood: Model<IMood> = mongoose.models.Mood || mongoose.model<IMood>('Mood', MoodSchema)
