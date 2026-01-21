import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInterview extends Document {
  employerId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  jobTitle?: string;
  applicationId?: mongoose.Types.ObjectId;
  dateTime: Date;
  duration: number; // minutes
  timezone: string;
  type: 'virtual' | 'physical';
  location: string;
  meetingUrl?: string; // Jitsi URL
  meetingRoomName?: string;
  candidateMeetingUrl?: string;
  employerMeetingUrl?: string;
  interviewerName?: string;
  interviewerEmail?: string;
  notes?: string;
  feedback?: string;
  rating?: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  cancelledAt?: Date;
  cancelReason?: string;
  reminders: {
    remindAt: Date;
    type: 'DAY_BEFORE' | 'HOUR_BEFORE' | 'FIFTEEN_MINUTES';
    channel: 'EMAIL' | 'PUSH' | 'BOTH';
    sent: boolean;
    sentAt?: Date;
    error?: string;
  }[];
  mattermostChannelId?: string;
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
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
    jobTitle: {
      type: String,
      required: false,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
    },
    dateTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: 30,
    },
    timezone: {
      type: String,
      default: 'UTC',
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
    meetingUrl: String,
    meetingRoomName: String,
    candidateMeetingUrl: String,
    employerMeetingUrl: String,
    interviewerName: String,
    interviewerEmail: String,
    notes: {
      type: String,
      trim: true,
    },
    feedback: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'],
      default: 'pending',
    },
    cancelledAt: Date,
    cancelReason: String,
    reminders: [
      {
        remindAt: Date,
        type: {
          type: String,
          enum: ['DAY_BEFORE', 'HOUR_BEFORE', 'FIFTEEN_MINUTES'],
        },
        channel: {
          type: String,
          enum: ['EMAIL', 'PUSH', 'BOTH'],
          default: 'BOTH',
        },
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
        error: String,
      },
    ],
    mattermostChannelId: String,
  },
  {
    timestamps: true,
  }
);

const Interview: Model<IInterview> =
  mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema);

export default Interview;
