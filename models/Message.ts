import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  senderType: 'employer' | 'candidate';
  content: string;
  isRead: boolean;
  deletedBySender: boolean;
  deletedByReceiver: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'senderTypeModel',
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'receiverTypeModel',
    },
    senderType: {
      type: String,
      required: true,
      enum: ['employer', 'candidate'],
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    deletedBySender: {
      type: Boolean,
      default: false,
    },
    deletedByReceiver: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals for dynamic refPath
MessageSchema.virtual('senderTypeModel').get(function() {
  return this.senderType === 'employer' ? 'Employer' : 'Candidate';
});

MessageSchema.virtual('receiverTypeModel').get(function() {
  // If sender is employer, receiver is candidate, and vice versa
  return this.senderType === 'employer' ? 'Candidate' : 'Employer';
});

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
