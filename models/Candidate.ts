import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ICandidate extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  city: string;
  expertise: string; // e.g., Finance, IT, Marketing
  skills: string[]; // Max 5 skills
  personalStatement?: string;
  workHistory: {
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    description: string;
  }[];
  references: {
    name: string;
    email: string;
    phone: string;
    relationship: string;
  }[];
  onboardingTestPassed: boolean;
  onboardingTestScore?: number;
  highestQualification?: string;
  university?: string;
  degree?: string;
  professionalQualifications?: string;
  hobbies?: string;
  ntfyTopic?: string;
  mattermostUserId?: string;
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    mattermost: boolean;
    interviewReminders: boolean;
    jobAlerts: boolean;
    applicationUpdates: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const CandidateSchema = new Schema<ICandidate>(
  {
    // ... (previous fields)
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
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    country: {
      type: String,
      required: false, // Optional initially, but recommended
      trim: true,
    },
    city: {
      type: String,
      required: false,
      trim: true,
    },
    expertise: {
      type: String,
      required: [true, 'Expertise is required'],
      enum: ['Finance', 'IT', 'Marketing', 'Sales', 'HR', 'Operations', 'Other'],
    },
    personalStatement: {
      type: String,
      maxlength: [1000, 'Personal statement must not exceed 1000 characters'],
      trim: true,
    },
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: function (skills: string[]) {
          return skills.length <= 5;
        },
        message: 'Maximum 5 skills allowed',
      },
    },
    workHistory: [
      {
        company: { type: String, required: true },
        position: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: Date,
        description: { type: String, required: true },
      },
    ],
    references: [
      {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        relationship: { type: String, required: true },
      },
    ],
    onboardingTestPassed: {
      type: Boolean,
      default: false,
    },
    onboardingTestScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    highestQualification: {
      type: String,
      trim: true,
    },
    university: {
      type: String,
      trim: true,
    },
    degree: {
      type: String,
      trim: true,
    },
    professionalQualifications: {
      type: String,
      trim: true,
    },
    hobbies: {
      type: String,
      trim: true,
    },
    ntfyTopic: String,
    mattermostUserId: String,
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      mattermost: { type: Boolean, default: false },
      interviewReminders: { type: Boolean, default: true },
      jobAlerts: { type: Boolean, default: true },
      applicationUpdates: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
CandidateSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
CandidateSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const Candidate: Model<ICandidate> = mongoose.models.Candidate || mongoose.model<ICandidate>('Candidate', CandidateSchema);

export default Candidate;

