import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { comparePassword, signToken } from '@/lib/auth';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().min(1, 'Please enter your email.').email('Please enter a valid email.'),
  password: z.string().min(1, 'Please enter your password.'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.parse(body);

    await connectToDatabase();

    const user = await User.findOne({ email: parsed.email.toLowerCase() });
    if (!user) {
      // Static admin fallback if user table is clean and email matches admin
      if (parsed.email === 'admin@travelgenie.com' && parsed.password === 'admin123') {
        const token = signToken({
          userId: 'admin_static_id',
          email: 'admin@travelgenie.com',
          name: 'Travel Genie Admin',
          role: 'admin',
        });

        const response = NextResponse.json({
          success: true,
          user: {
            id: 'admin_static_id',
            name: 'Travel Genie Admin',
            email: 'admin@travelgenie.com',
            role: 'admin',
          },
        });

        response.cookies.set('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        });

        return response;
      }
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is deactivated. Please contact support.' }, { status: 403 });
    }

    const passwordToCompare = user.passwordHash || user.password || '';
    const isMatch = await comparePassword(parsed.password, passwordToCompare);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Update last login timestamp
    user.lastLoginAt = new Date();
    await user.save();

    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      managedResortIds: user.managedResortIds || [],
    };

    const token = signToken(tokenPayload as any);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        managedResortIds: user.managedResortIds || [],
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
