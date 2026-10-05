import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Booking } from '@/models/Booking';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || (user.role !== 'resort_manager' && user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    
    let queryObj: any = {};
    if (user.role === 'resort_manager') {
      const managedIds = user.managedResortIds || [];
      queryObj = { propertyId: { $in: managedIds } };
    }

    const bookings = await Booking.find(queryObj).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, count: bookings.length, data: JSON.parse(JSON.stringify(bookings)) });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch manager bookings' }, { status: 500 });
  }
}
