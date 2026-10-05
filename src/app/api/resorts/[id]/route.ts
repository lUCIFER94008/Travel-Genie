import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Resort } from '@/models/Resort';
import { getUserFromRequest } from '@/lib/auth';
import mongoose from 'mongoose';

async function findResortByIdentifier(identifier: string) {
  await connectToDatabase();
  let resort = null;
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    resort = await Resort.findById(identifier);
  }
  if (!resort) {
    resort = await Resort.findOne({ slug: identifier.toLowerCase() });
  }
  return resort;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const resort = await findResortByIdentifier(id);
    if (!resort) {
      return NextResponse.json({ error: 'Resort not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(resort)), resort: JSON.parse(JSON.stringify(resort)) });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch resort' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    const resort = await findResortByIdentifier(id);
    if (!resort) {
      return NextResponse.json({ error: 'Resort not found' }, { status: 404 });
    }

    // Auth check: Admin or assigned Resort Manager
    const isManager = user.role === 'resort_manager' && (user.managedResortIds || []).includes(resort._id.toString());
    const isAdmin = user.role === 'admin';

    if (!isAdmin && !isManager) {
      return NextResponse.json({ error: 'Unauthorized to edit this resort' }, { status: 403 });
    }

    if (body.name) resort.name = body.name;
    if (body.description) resort.description = body.description;
    if (body.address) resort.address = body.address;
    if (body.phone !== undefined) resort.phone = body.phone;
    if (body.website !== undefined) resort.website = body.website;
    if (Array.isArray(body.amenities)) resort.amenities = body.amenities;
    if (Array.isArray(body.roomTypes)) resort.roomTypes = body.roomTypes;
    if (body.isActive !== undefined && isAdmin) resort.isActive = Boolean(body.isActive);

    await resort.save();

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(resort)) });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update resort' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  const { id } = await params;
  try {
    const resort = await findResortByIdentifier(id);
    if (!resort) {
      return NextResponse.json({ error: 'Resort not found' }, { status: 404 });
    }
    await Resort.findByIdAndDelete(resort._id);
    return NextResponse.json({ success: true, message: 'Resort deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete resort' }, { status: 500 });
  }
}
