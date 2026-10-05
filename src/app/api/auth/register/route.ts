import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { hashPassword, signToken } from '@/lib/auth';
import { z } from 'zod';

const RegisterSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().min(1, 'Please enter your email.').email('Please enter a valid email address.'),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.'),
  terms: z.boolean().refine((val) => val === true, 'You must accept the Terms & Conditions.'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.parse(body);

    await connectToDatabase();

    const existingUser = await User.findOne({ email: parsed.email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email address already exists.' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(parsed.password);

    const newUser = await User.create({
      name: parsed.name,
      email: parsed.email.toLowerCase(),
      phone: parsed.phone || '',
      passwordHash: hashedPassword,
      password: hashedPassword, // Compatibility
      role: 'user', // Enforce 'user' role for self-registration
      isActive: true,
      emailVerified: false,
      lastLoginAt: new Date(),
    });

    const tokenPayload = {
      userId: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: 'user' as const,
      managedResortIds: [],
    };

    const token = signToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: 'user',
        managedResortIds: [],
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
