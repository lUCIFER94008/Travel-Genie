import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Favorite } from '@/models/Favorite';
import { Destination } from '@/models/Destination';
import { Place } from '@/models/Place';
import { Restaurant } from '@/models/Restaurant';
import { Hotel } from '@/models/Hotel';
import { Resort } from '@/models/Resort';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    await connectToDatabase();
    const rawFavs = await Favorite.find({ userId: user.userId }).sort({ createdAt: -1 }).lean();

    const populatedData = await Promise.all(
      rawFavs.map(async (fav: any) => {
        let itemDetail: any = null;
        try {
          const isMongoId = /^[0-9a-fA-F]{24}$/.test(fav.itemId);
          const orConditions: any[] = [{ slug: String(fav.itemId).toLowerCase() }];
          if (isMongoId) {
            orConditions.push({ _id: fav.itemId });
          }

          if (fav.itemType === 'destination') {
            itemDetail = await Destination.findOne({ $or: orConditions }).lean();
          } else if (fav.itemType === 'place') {
            itemDetail = await Place.findOne({ $or: orConditions }).lean();
          } else if (fav.itemType === 'restaurant') {
            itemDetail = await Restaurant.findOne({ $or: orConditions }).lean();
          } else if (fav.itemType === 'hotel') {
            itemDetail = await Hotel.findOne({ $or: orConditions }).lean();
          } else if (fav.itemType === 'resort') {
            itemDetail = await Resort.findOne({ $or: orConditions }).lean();
          }
        } catch (err) {
          console.warn('Populate favorite detail error:', err);
        }

        return {
          ...fav,
          item: itemDetail ? JSON.parse(JSON.stringify(itemDetail)) : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      count: populatedData.length,
      data: JSON.parse(JSON.stringify(populatedData)),
    });
  } catch (err: any) {
    return NextResponse.json({ success: true, count: 0, data: [] });
  }
}

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { itemType, itemId, targetId } = await req.json();
    const finalItemType = (itemType || 'place') as any;
    const finalItemId = itemId || targetId;

    if (!finalItemId) {
      return NextResponse.json({ error: 'Item ID (itemId or targetId) required' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if already favorited
    const existing = await Favorite.findOne({
      userId: user.userId,
      itemType: finalItemType,
      itemId: finalItemId,
    });

    if (existing) {
      return NextResponse.json({ success: true, isFavorite: true, message: 'Already in favorites', data: existing });
    }

    const newFav = await Favorite.create({
      userId: user.userId,
      itemType: finalItemType,
      itemId: finalItemId,
    });

    return NextResponse.json({ success: true, isFavorite: true, message: 'Saved to favorites', data: newFav }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const itemType = (searchParams.get('itemType') || 'place') as any;
    const itemId = searchParams.get('itemId') || searchParams.get('targetId');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    await connectToDatabase();
    await Favorite.findOneAndDelete({
      userId: user.userId,
      itemType,
      itemId,
    });

    return NextResponse.json({ success: true, isFavorite: false, message: 'Removed from favorites' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
