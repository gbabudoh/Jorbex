import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotificationLog extends Document {
  userId?: mongoose.Types.ObjectId;
  userType: 'candidate' | 'employer' | 'admin';
  email?: string;
  type: string;
  channel: 'EMAIL' | 'PUSH' | 'SMS' | 'IN_APP' | 'MATTERMOST';
  subject?: string;
  content: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  sentAt?: Date;
  error?: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationLogSchema = new Schema<INotificationLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      refPath: 'userModel',
    },
    userType: {
      type: String,
      enum: ['candidate', 'employer', 'admin'],
      required: true,
    },
    email: String,
    type: {
      type: String,
      required: true,
    },
    channel: {
      type: String,
      enum: ['EMAIL', 'PUSH', 'SMS', 'IN_APP', 'MATTERMOST'],
      required: true,
    },
    subject: String,
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED'],
      default: 'PENDING',
    },
    sentAt: Date,
    error: String,
    referenceId: String,
    referenceType: String,
  },
  {
    timestamps: true,
  }
);

// Virtual for dynamic reference
NotificationLogSchema.virtual('userModel').get(function () {
  if (this.userType === 'candidate') return 'Candidate';
  if (this.userType === 'employer') return 'Employer';
  return 'User';
});

const NotificationLog: Model<INotificationLog> =
  mongoose.models.NotificationLog || mongoose.model<INotificationLog>('NotificationLog', NotificationLogSchema);

export default NotificationLog;
