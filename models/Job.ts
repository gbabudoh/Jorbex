import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
  employerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  location: string;
  type: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  status: 'active' | 'closed' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    employerId: {
      type: Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    location: String,
    type: String,
    salary: {
      min: Number,
      max: Number,
      currency: String,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
export default Job;
