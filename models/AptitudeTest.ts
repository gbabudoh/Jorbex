import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface IAptitudeTest extends Document {
  title: string;
  description: string;
  testType: 'onboarding' | 'employer_custom';
  expertise?: string; // For onboarding tests
  employerId?: mongoose.Types.ObjectId; // For employer custom tests
  candidateId?: mongoose.Types.ObjectId; // If test is assigned to specific candidate
  originalTestId?: mongoose.Types.ObjectId; // Pointer to the template if this is an assigned test
  questions: IQuestion[];
  passingScore: number; // Default 70%
  timeLimit?: number; // In minutes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (options: string[]) {
        return options.length >= 2 && options.length <= 6;
      },
      message: 'Questions must have between 2 and 6 options',
    },
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  explanation: String,
});

const AptitudeTestSchema = new Schema<IAptitudeTest>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    testType: {
      type: String,
      enum: ['onboarding', 'employer_custom'],
      required: true,
    },
    expertise: {
      type: String,
      enum: ['Finance', 'IT', 'Marketing', 'Sales', 'HR', 'Operations', 'Other'],
    },
    employerId: {
      type: Schema.Types.ObjectId,
      ref: 'Employer',
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'Candidate',
    },
    originalTestId: {
      type: Schema.Types.ObjectId,
      ref: 'AptitudeTest',
    },
    questions: {
      type: [QuestionSchema],
      required: true,
      validate: {
        validator: function (questions: IQuestion[]) {
          return questions.length > 0;
        },
        message: 'Test must have at least one question',
      },
    },
    passingScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
    timeLimit: {
      type: Number, // In minutes
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const AptitudeTest: Model<IAptitudeTest> =
  mongoose.models.AptitudeTest || mongoose.model<IAptitudeTest>('AptitudeTest', AptitudeTestSchema);

export default AptitudeTest;

