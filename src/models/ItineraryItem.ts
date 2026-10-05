import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IItineraryItem extends Document {
  itineraryId: mongoose.Types.ObjectId | string;
  itemType: 'place' | 'restaurant' | 'hotel' | 'resort';
  itemId: string;
  date?: Date | string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ItineraryItemSchema: Schema = new Schema(
  {
    itineraryId: { type: Schema.Types.ObjectId, ref: 'Itinerary', required: true, index: true },
    itemType: {
      type: String,
      enum: ['place', 'restaurant', 'hotel', 'resort'],
      required: true,
    },
    itemId: { type: String, required: true },
    date: { type: Schema.Types.Mixed, default: null },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '10:00' },
    notes: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ItineraryItemSchema.index({ itineraryId: 1, order: 1 });

export const ItineraryItem: Model<IItineraryItem> =
  mongoose.models.ItineraryItem || mongoose.model<IItineraryItem>('ItineraryItem', ItineraryItemSchema);
