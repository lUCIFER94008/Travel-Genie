import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (conn && conn.connection && conn.connection.readyState === 1) {
      return NextResponse.json({
        status: 'ok',
        database: 'connected',
      });
    } else {
      return NextResponse.json(
        {
          status: 'error',
          database: 'disconnected',
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        message: error?.message || 'Database connection error',
      },
      { status: 503 }
    );
  }
}
