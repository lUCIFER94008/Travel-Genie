import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Resort } from '@/models/Resort';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const destinationSlug = searchParams.get('destination') || searchParams.get('destinationId') || undefined;
    const search = searchParams.get('search') || undefined;

    await connectToDatabase();
    let queryObj: any = {};
    if (destinationSlug) {
      queryObj.destinationId = destinationSlug.toLowerCase();
    }
    if (search) {
      queryObj.name = { $regex: search, $options: 'i' };
    }

    const resorts = await Resort.find(queryObj).lean();
    return NextResponse.json({ success: true, count: resorts.length, data: resorts, resorts });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch resorts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const resort = await Resort.create(body);
    return NextResponse.json({ success: true, data: resort }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create resort' }, { status: 500 });
  }
}
