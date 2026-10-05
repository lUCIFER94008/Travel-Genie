import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPhoto {
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  source: string;
  sourceId?: string;
  sourceUrl?: string;
  photographer?: string;
  attribution?: string;
  alt?: string;
  searchQuery?: string;
}

export interface IPlace extends Document {
  name: string;
  slug: string;
  destinationId: string;
  category: 'attraction' | 'viewpoint' | 'waterfall' | 'lake' | 'dam' | 'museum' | 'national-park' | 'wildlife' | 'heritage' | 'nature' | string;
  description: string;
  shortDescription?: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  photos: IPhoto[];
  primaryPhoto: IPhoto;
  rating?: number | null;
  ratingCount?: number | null;
  phone?: string;
  website?: string;
  openingHours?: string;
  activities?: string[];
  facilities?: string[];
  bestTimeToVisit?: string;
  source: string;
  sourceUrl?: string;
  googlePlaceId?: string;
  googleMapsUrl?: string;
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
    source: { type: String, default: 'Pixabay' },
    sourceId: String,
    sourceUrl: String,
    photographer: String,
    attribution: String,
    alt: String,
    searchQuery: String,
  },
  { _id: false }
);

const PlaceSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    destinationId: { type: String, required: true, index: true },
    category: {
      type: String,
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    shortDescription: { type: String, default: '' },
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
    openingHours: { type: String, default: '' },
    activities: [{ type: String }],
    facilities: [{ type: String }],
    bestTimeToVisit: { type: String, default: '' },
    source: { type: String, required: true, default: 'Kerala Tourism' },
    sourceUrl: String,
    googlePlaceId: { type: String, index: true },
    googleMapsUrl: String,
    verified: { type: Boolean, default: true },
    lastVerifiedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

PlaceSchema.index({ location: '2dsphere' });

export const Place: Model<IPlace> =
  mongoose.models.Place || mongoose.model<IPlace>('Place', PlaceSchema);
