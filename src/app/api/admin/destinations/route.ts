import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Destination } from '@/models/Destination';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const destinations = await Destination.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(destinations)) });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: [] });
  }
}
