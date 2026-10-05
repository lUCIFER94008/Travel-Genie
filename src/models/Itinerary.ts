import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IItinerary extends Document {
  userId: string;
  name: string;
  title?: string;
  destinationName?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  items?: any[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const ItinerarySchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, default: 'My Trip Itinerary' },
    title: { type: String, default: 'My Trip Itinerary' },
    destinationName: { type: String, default: 'Munnar' },
    description: { type: String, default: '' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    items: [{ type: Schema.Types.Mixed }],
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'cancelled'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

export const Itinerary: Model<IItinerary> =
  mongoose.models.Itinerary || mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
