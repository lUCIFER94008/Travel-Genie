import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IItinerary extends Document {
  userId: string;
  title: string;
  name?: string;
  destinationId?: string;
  destinationName: string;
  startDate?: Date;
  endDate?: Date;
  travelers?: number;
  notes?: string;
  description?: string;
  items?: any[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const ItinerarySchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, default: 'My Trip Itinerary' },
    name: { type: String },
    destinationId: { type: String, index: true },
    destinationName: { type: String, required: true, default: 'India' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    travelers: { type: Number, default: 1 },
    notes: { type: String, default: '' },
    description: { type: String, default: '' },
    items: [{ type: Schema.Types.Mixed }],
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export const Itinerary: Model<IItinerary> =
  mongoose.models.Itinerary || mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
