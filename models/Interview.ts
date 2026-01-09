import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInterview extends Document {
  employerId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  dateTime: Date;
  type: 'virtual' | 'physical';
  location: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterview>(
  {
    employerId: {
      type: Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['virtual', 'physical'],
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Interview: Model<IInterview> =
  mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema);

export default Interview;
