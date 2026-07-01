import mongoose, { Schema, Document } from 'mongoose';

export interface IUDID extends Document {
  userId: mongoose.Types.ObjectId;
  udid: string;
  deviceName: string;
  deviceType: 'ios' | 'android' | 'web';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const udidSchema = new Schema<IUDID>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    udid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    deviceName: {
      type: String,
      required: true,
    },
    deviceType: {
      type: String,
      enum: ['ios', 'android', 'web'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const UDID = mongoose.model<IUDID>('UDID', udidSchema);
