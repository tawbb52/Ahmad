import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  userId: mongoose.Types.ObjectId;
  certificateData: string;
  expiryDate: Date;
  status: 'active' | 'expired' | 'revoked';
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<ICertificate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    certificateData: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'revoked'],
      default: 'active',
    },
    revokedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Certificate = mongoose.model<ICertificate>('Certificate', certificateSchema);
