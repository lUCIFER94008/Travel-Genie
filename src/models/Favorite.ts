import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFavorite extends Document {
  userId: string;
  itemType: 'destination' | 'place' | 'restaurant' | 'hotel' | 'resort';
  itemId: string;
  createdAt: Date;
}

const FavoriteSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    itemType: {
      type: String,
      enum: ['destination', 'place', 'restaurant', 'hotel', 'resort'],
      required: true,
    },
    itemId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound unique index so user cannot favorite the same item twice
FavoriteSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

export const Favorite: Model<IFavorite> =
  mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', FavoriteSchema);
