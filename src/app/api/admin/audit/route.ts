import { NextResponse } from 'next/server';
import { auditDestinationData } from '../../../../../scripts/audit-destination-data';

export async function GET() {
  try {
    const report = await auditDestinationData();
    return NextResponse.json({ success: true, data: report });
  } catch (err: any) {
    console.error('API /api/admin/audit error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to run data audit' },
      { status: 500 }
    );
  }
}
