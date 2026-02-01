import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotificationPreference extends Document {
  userId: mongoose.Types.ObjectId;
  userType: 'candidate' | 'employer';
  channels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  types: {
    messages: boolean;
    applications: boolean;
    interviews: boolean;
    tests: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'userModel',
    },
    userType: {
      type: String,
      enum: ['candidate', 'employer'],
      required: true,
    },
    channels: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
    },
    types: {
      messages: { type: Boolean, default: true },
      applications: { type: Boolean, default: true },
      interviews: { type: Boolean, default: true },
      tests: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

NotificationPreferenceSchema.virtual('userModel').get(function () {
  return this.userType === 'candidate' ? 'Candidate' : 'Employer';
});

const NotificationPreference: Model<INotificationPreference> =
  mongoose.models.NotificationPreference || mongoose.model<INotificationPreference>('NotificationPreference', NotificationPreferenceSchema);

export default NotificationPreference;
