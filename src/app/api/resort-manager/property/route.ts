import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Resort } from '@/models/Resort';
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
      queryObj = { _id: { $in: managedIds } };
    }

    const resorts = await Resort.find(queryObj).lean();
    return NextResponse.json({ success: true, count: resorts.length, data: JSON.parse(JSON.stringify(resorts)) });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch manager property' }, { status: 500 });
  }
}
