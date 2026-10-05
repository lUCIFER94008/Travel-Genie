import mongoose, { Schema, Document, Model } from 'mongoose';
import { IPhoto } from './Place';

export interface IResort extends Document {
  name: string;
  slug: string;
  destinationId: string;
  description: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  photos: IPhoto[];
  primaryPhoto: IPhoto;
  rating?: number | null;
  ratingCount?: number | null;
  phone?: string;
  website?: string;
  amenities: string[];
  roomTypes?: any[];
  googlePlaceId?: string;
  googleMapsUrl?: string;
  source: string;
  sourceUrl?: string;
  managerIds?: string[];
  isActive?: boolean;
  verified: boolean;
  lastVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PhotoSchema = new Schema(
  {
    url: { type: String, required: true },
    thumbnailUrl: String,
    width: Number,
    height: Number,
    source: { type: String, default: 'Official / Google Places / Pixabay' },
    sourceUrl: String,
    licenseType: { type: String, default: 'Official' },
    licenseStatus: { type: String, default: 'licensed' },
    licenseDate: { type: Date, default: Date.now },
    licenseReference: String,
    photographer: String,
    attribution: String,
    alt: String,
  },
  { _id: false }
);

const ResortSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    destinationId: { type: String, required: true, index: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    photos: [PhotoSchema],
    primaryPhoto: { type: PhotoSchema, required: true },
    rating: { type: Number, default: null },
    ratingCount: { type: Number, default: null },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    amenities: [{ type: String }],
    roomTypes: [{ type: Schema.Types.Mixed }],
    googlePlaceId: { type: String, index: true },
    googleMapsUrl: String,
    managerIds: [{ type: String, index: true }],
    isActive: { type: Boolean, default: true },
    source: { type: String, default: 'Official / Google Places' },
    sourceUrl: String,
    verified: { type: Boolean, default: true },
    lastVerifiedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ResortSchema.index({ location: '2dsphere' });

export const Resort: Model<IResort> =
  mongoose.models.Resort || mongoose.model<IResort>('Resort', ResortSchema);
