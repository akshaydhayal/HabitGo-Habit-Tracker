import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IHabitDay {
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface IHabit extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: 'good' | 'bad';
  badHabitType?: 'stop' | 'limit';
  repeatMode?: 'weekly' | 'monthly';
  weeklyDays?: string[]; // e.g. ['Mon', 'Tue']
  monthlyDays?: number[]; // e.g. [1, 15]
  reminders?: string[]; // e.g. ['08:00', '20:00']
  goalValue?: number;
  goalUnit?: string;
  goalFrequency?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  frequency: string[]; // Keep for legacy compatibility
  color?: string;
  history: IHabitDay[];
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema = new Schema<IHabit>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['good', 'bad'], default: 'good' },
    badHabitType: { type: String, enum: ['stop', 'limit'] },
    repeatMode: { type: String, enum: ['weekly', 'monthly'], default: 'weekly' },
    weeklyDays: { type: [String] },
    monthlyDays: { type: [Number] },
    reminders: { type: [String], default: [] },
    goalValue: { type: Number },
    goalUnit: { type: String },
    goalFrequency: { type: String },
    startDate: { type: String, required: true },
    endDate: { type: String },
    frequency: { type: [String], default: ['Daily'] },
    color: { type: String, default: '#3b82f6' },
    history: [
      {
        date: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

export const Habit: Model<IHabit> = mongoose.models.Habit || mongoose.model<IHabit>('Habit', HabitSchema)
