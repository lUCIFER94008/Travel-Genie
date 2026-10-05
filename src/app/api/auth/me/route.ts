import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, comparePassword, hashPassword } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';

export async function GET(req: NextRequest) {
  const tokenUser = getUserFromRequest(req);
  if (!tokenUser) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const dbUser = await User.findById(tokenUser.userId).select('-password -passwordHash').lean();

    if (dbUser) {
      return NextResponse.json({
        user: {
          id: dbUser._id.toString(),
          email: dbUser.email,
          name: dbUser.name,
          phone: dbUser.phone || '',
          avatar: dbUser.avatar || dbUser.profileImage || '',
          role: dbUser.role || 'user',
          managedResortIds: dbUser.managedResortIds || [],
          emailVerified: dbUser.emailVerified || dbUser.isVerified || false,
          createdAt: dbUser.createdAt,
        },
      });
    }
  } catch (err) {
    console.warn('GET /api/auth/me DB warning:', err);
  }

  // Fallback to token payload
  return NextResponse.json({
    user: {
      id: tokenUser.userId,
      email: tokenUser.email,
      name: tokenUser.name,
      role: tokenUser.role || 'user',
      managedResortIds: tokenUser.managedResortIds || [],
    },
  });
}

export async function PATCH(req: NextRequest) {
  const tokenUser = getUserFromRequest(req);
  if (!tokenUser) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    await connectToDatabase();

    const user = await User.findById(tokenUser.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (body.name) user.name = body.name.trim();
    if (body.phone !== undefined) user.phone = body.phone.trim();
    if (body.avatar !== undefined) user.avatar = body.avatar.trim();

    if (body.newPassword) {
      const currentPass = body.currentPassword || '';
      const passwordToCompare = user.passwordHash || user.password || '';
      const isMatch = await comparePassword(currentPass, passwordToCompare);

      if (!isMatch) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
      }

      const newHash = await hashPassword(body.newPassword);
      user.passwordHash = newHash;
      user.password = newHash;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
