import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDestination extends Document {
  name: string;
  slug: string;
  state: string;
  country: string;
  district: string;
  description: string;
  shortDescription?: string;
  heroImage: string;
  imageSource?: string;
  imageSourceUrl?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  categories: string[];
  featured: boolean;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DestinationSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    state: { type: String, required: true, default: 'Kerala' },
    district: { type: String, required: true, default: 'Idukki' },
    country: { type: String, required: true, default: 'India' },
    description: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    heroImage: { type: String, required: true },
    imageSource: { type: String, default: 'Kerala Tourism' },
    imageSourceUrl: { type: String, default: 'https://www.keralatourism.org/munnar/' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    categories: [{ type: String }],
    featured: { type: Boolean, default: false },
    verified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

DestinationSchema.index({ location: '2dsphere' });

export const Destination: Model<IDestination> =
  mongoose.models.Destination || mongoose.model<IDestination>('Destination', DestinationSchema);
