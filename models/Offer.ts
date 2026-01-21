import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';

export interface IOffer extends Document {
  candidateId: mongoose.Types.ObjectId;
  employerId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  content: string; // HTML content or rich text
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  salary: string;
  currency: string;
  startDate: Date;
  token: string; // Secure token for public access
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
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
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
    },
    salary: {
      type: String, // String to allow ranges or specific formats like "150,000"
      required: true,
    },
    currency: {
      type: String,
      default: 'NGN',
    },
    startDate: {
      type: Date,
      required: true,
    },
    token: {
      type: String,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate token before saving
OfferSchema.pre('save', function (next) {
  if (!this.token) {
    this.token = crypto.randomBytes(32).toString('hex');
  }
  next();
});

const Offer: Model<IOffer> =
  mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);

export default Offer;
