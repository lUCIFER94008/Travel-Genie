import mongoose, { Schema, Document, Model } from 'mongoose';
import { IPhoto } from './Place';

export interface IRestaurant extends Document {
  name: string;
  slug: string;
  destinationId: string;
  nearbyPlaceId?: string;
  description: string;
  cuisine: string;
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
  openingHours?: string;
  priceLevel?: string | number | null;
  googlePlaceId?: string;
  googleMapsUrl?: string;
  source: string;
  sourceUrl?: string;
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
    source: { type: String, default: 'Google Places / Pixabay' },
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

const RestaurantSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    destinationId: { type: String, required: true, index: true },
    nearbyPlaceId: { type: String, index: true },
    description: { type: String, required: true },
    cuisine: { type: String, default: 'Multi-Cuisine', index: true },
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    photos: [PhotoSchema],
    primaryPhoto: { type: PhotoSchema, required: true },
    rating: { type: Number, default: null, index: true },
    ratingCount: { type: Number, default: null },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    openingHours: { type: String, default: '' },
    priceLevel: { type: Schema.Types.Mixed, default: null },
    googlePlaceId: { type: String, index: true },
    googleMapsUrl: String,
    source: { type: String, default: 'Google Places / Local Verified' },
    sourceUrl: String,
    verified: { type: Boolean, default: true },
    lastVerifiedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

RestaurantSchema.index({ location: '2dsphere' });

export const Restaurant: Model<IRestaurant> =
  mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
