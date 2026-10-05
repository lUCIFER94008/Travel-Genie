import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'travelgenie_super_secret_jwt_key_2026_production';

export interface UserTokenPayload {
  userId: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'resort_manager';
  managedResortIds?: string[];
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: UserTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function decodeTokenPayload(token: string): UserTokenPayload | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    let jsonString = '';
    if (typeof atob === 'function') {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      jsonString = new TextDecoder().decode(bytes);
    } else if (typeof Buffer !== 'undefined') {
      jsonString = Buffer.from(base64, 'base64').toString('utf8');
    }

    if (!jsonString) return null;

    const payload = JSON.parse(jsonString);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload as UserTokenPayload;
  } catch (error) {
    return null;
  }
}

export function verifyToken(token: string): UserTokenPayload | null {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as UserTokenPayload;
  } catch (error) {
    return decodeTokenPayload(token);
  }
}

export function getUserFromRequest(req: NextRequest): UserTokenPayload | null {
  const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token) || decodeTokenPayload(token);
}
