import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAdminToken } from '@/lib/auth-server';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    await adminDb().collection('blockedDates').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete blocked date' }, { status: 500 });
  }
}
