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
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  googleMapsUrl?: string;
  rating?: number | null;
  ratingCount?: number | null;
  reviewCount?: number | null;
  priceLevel?: string | number | null;
  openingHours?: string;
  googlePlaceId?: string;
  image?: string;
  gallery?: string[];
  photos: IPhoto[];
  primaryPhoto: IPhoto;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
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
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    latitude: { type: Number },
    longitude: { type: Number },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    openingHours: { type: String, default: '10:00 AM - 10:00 PM' },
    priceLevel: { type: Schema.Types.Mixed, default: '$$' },
    googlePlaceId: { type: String, index: true },
    googleMapsUrl: { type: String, default: '' },
    rating: { type: Number, default: 4.5, index: true },
    ratingCount: { type: Number, default: 120 },
    reviewCount: { type: Number, default: 120 },
    image: { type: String },
    gallery: [{ type: String }],
    photos: [PhotoSchema],
    primaryPhoto: { type: PhotoSchema },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
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

