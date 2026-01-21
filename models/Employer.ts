import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IEmployer extends Document {
  name: string;
  email: string;
  password: string;
  companyName: string;
  phone: string;
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled';
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  paystackCustomerCode?: string;
  paystackSubscriptionCode?: string;
  mattermostTeamId?: string;
  mattermostChannels?: {
    jobId: mongoose.Types.ObjectId;
    channelId: string;
    channelName: string;
  }[];
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    mattermost: boolean;
    interviewReminders: boolean;
    applicationUpdates: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const EmployerSchema = new Schema<IEmployer>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ['trial', 'active', 'expired', 'cancelled'],
      default: 'trial',
    },
    subscriptionStartDate: Date,
    subscriptionEndDate: Date,
    paystackCustomerCode: String,
    paystackSubscriptionCode: String,
    mattermostTeamId: String,
    mattermostChannels: [
      {
        jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
        channelId: String,
        channelName: String,
      },
    ],
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      mattermost: { type: Boolean, default: true },
      interviewReminders: { type: Boolean, default: true },
      applicationUpdates: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
EmployerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
EmployerSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const Employer: Model<IEmployer> = mongoose.models.Employer || mongoose.model<IEmployer>('Employer', EmployerSchema);

export default Employer;

