import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBooking extends Document {
  userId: string;
  bookingCode: string;
  propertyType: 'hotel' | 'resort';
  propertyId: string;
  propertyName?: string;
  destinationId?: string;
  hotelId?: string;
  resortId?: string;
  checkIn: Date | string;
  checkOut: Date | string;
  guests: number;
  rooms: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequest?: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    bookingCode: { type: String, required: true, unique: true, index: true },
    propertyType: { type: String, enum: ['hotel', 'resort'], required: true },
    propertyId: { type: String, required: true, index: true },
    propertyName: { type: String, default: '' },
    destinationId: { type: String, index: true, default: '' },
    hotelId: { type: String, index: true },
    resortId: { type: String, index: true },
    checkIn: { type: Schema.Types.Mixed, required: true },
    checkOut: { type: Schema.Types.Mixed, required: true },
    guests: { type: Number, required: true, default: 2 },
    rooms: { type: Number, required: true, default: 1 },
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true },
    guestPhone: { type: String, required: true },
    specialRequest: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
