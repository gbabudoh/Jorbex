import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

export interface ITestResult extends Document {
  testId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  employerId?: mongoose.Types.ObjectId;
  answers: IAnswer[];
  score: number;
  passingScore: number;
  passed: boolean;
  timeSpent?: number; // In seconds
  completedAt: Date;
  createdAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  questionId: {
    type: String,
    required: true,
  },
  selectedAnswer: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
});

const TestResultSchema = new Schema<ITestResult>(
  {
    testId: {
      type: Schema.Types.ObjectId,
      ref: 'AptitudeTest',
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
    },
    answers: {
      type: [AnswerSchema],
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    passingScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    timeSpent: {
      type: Number, // In seconds
      min: 0,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
TestResultSchema.index({ candidateId: 1, testId: 1 });
TestResultSchema.index({ employerId: 1 });

const TestResult: Model<ITestResult> =
  mongoose.models.TestResult || mongoose.model<ITestResult>('TestResult', TestResultSchema);

export default TestResult;

