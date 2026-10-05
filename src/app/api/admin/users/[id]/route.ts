import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Resort } from '@/models/Resort';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = getUserFromRequest(req);
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  const { id } = await params;

  try {
    await connectToDatabase();
    const user = await User.findById(id).select('-password -passwordHash').lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(user)) });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = getUserFromRequest(req);
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    await connectToDatabase();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (body.role && ['user', 'admin', 'resort_manager'].includes(body.role)) {
      user.role = body.role;
    }

    if (body.isActive !== undefined) {
      user.isActive = Boolean(body.isActive);
    }

    if (Array.isArray(body.managedResortIds)) {
      user.managedResortIds = body.managedResortIds;

      // Update Resort documents with managerIds for consistency
      await Resort.updateMany(
        { _id: { $in: body.managedResortIds } },
        { $addToSet: { managerIds: id } }
      );
    }

    await user.save();

    return NextResponse.json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        managedResortIds: user.managedResortIds || [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
