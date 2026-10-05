import { NextRequest, NextResponse } from 'next/server';
import { getPlaceBySlug } from '@/lib/dataStore';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);

  if (!place) {
    return NextResponse.json({ error: 'Place not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: place });
}
