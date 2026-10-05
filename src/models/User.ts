import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  passwordHash?: string;
  profileImage?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'resort_manager';
  managedResortIds?: string[];
  isVerified: boolean;
  emailVerified?: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  savedPlaces?: mongoose.Types.ObjectId[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    password: { type: String }, // Backwards compatibility
    passwordHash: { type: String },
    profileImage: { type: String, default: '' },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: ['user', 'admin', 'resort_manager'],
      default: 'user',
    },
    managedResortIds: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    savedPlaces: [{ type: Schema.Types.ObjectId, ref: 'Place' }],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

