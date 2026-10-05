import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Review } from '@/models/Review';
import { getUserFromRequest } from '@/lib/auth';
import { z } from 'zod';

const ReviewValidation = z.object({
  placeId: z.string().optional(),
  restaurantId: z.string().optional(),
  hotelId: z.string().optional(),
  resortId: z.string().optional(),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(3, 'Comment must be at least 3 characters'),
  images: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get('placeId') || searchParams.get('targetId');
  const restaurantId = searchParams.get('restaurantId');
  const hotelId = searchParams.get('hotelId');
  const resortId = searchParams.get('resortId');
  const status = searchParams.get('status') || 'approved';

  try {
    await connectToDatabase();
    let query: any = {};
    if (status !== 'all') {
      query.status = status;
    }

    if (placeId) query.$or = [{ placeId }, { targetId: placeId }];
    else if (restaurantId) query.restaurantId = restaurantId;
    else if (hotelId) query.hotelId = hotelId;
    else if (resortId) query.resortId = resortId;

    const reviews = await Review.find(query)
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, count: reviews.length, data: reviews, reviews });
  } catch (err: any) {
    return NextResponse.json({ success: true, count: 0, data: [], reviews: [] });
  }
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = ReviewValidation.parse(body);

    if (!parsed.placeId && !parsed.restaurantId && !parsed.hotelId && !parsed.resortId) {
      return NextResponse.json(
        { error: 'A review must belong to exactly one entity (placeId, restaurantId, hotelId, or resortId)' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newReview = await Review.create({
      userId: user.userId,
      placeId: parsed.placeId,
      restaurantId: parsed.restaurantId,
      hotelId: parsed.hotelId,
      resortId: parsed.resortId,
      rating: parsed.rating,
      comment: parsed.comment,
      images: parsed.images || [],
      status: 'approved', // default approved for user reviews
    });

    return NextResponse.json({ success: true, data: newReview }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
