import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  employerId: mongoose.Types.ObjectId;
  status: 'applied' | 'reviewing' | 'test_sent' | 'interview_scheduled' | 'offer_sent' | 'hired' | 'rejected';
  resumeUrl?: string;
  coverLetter?: string;
  testResultId?: mongoose.Types.ObjectId;
  interviewId?: mongoose.Types.ObjectId;
  offerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    employerId: {
      type: Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
    },
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'test_sent', 'interview_scheduled', 'offer_sent', 'hired', 'rejected'],
      default: 'applied',
    },
    resumeUrl: String,
    coverLetter: String,
    testResultId: {
      type: Schema.Types.ObjectId,
      ref: 'TestResult',
    },
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
    },
    offerId: {
      type: Schema.Types.ObjectId,
      ref: 'Offer',
    },
  },
  {
    timestamps: true,
  }
);

const Application: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
