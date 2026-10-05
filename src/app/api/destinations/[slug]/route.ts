import { NextRequest, NextResponse } from 'next/server';
import { getDestinationBySlug } from '@/lib/dataStore';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);

  if (!destination) {
    return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: destination });
}
