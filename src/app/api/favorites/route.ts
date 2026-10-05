import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Favorite } from '@/models/Favorite';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    await connectToDatabase();
    const favorites = await Favorite.find({ userId: user.userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, count: favorites.length, data: favorites, favorites });
  } catch (err: any) {
    return NextResponse.json({ success: true, count: 0, data: [], favorites: [] });
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
