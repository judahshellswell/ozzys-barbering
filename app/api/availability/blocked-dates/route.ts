import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAdminToken } from '@/lib/auth-server';
import { blockedDateSchema } from '@/lib/validations/availability.schema';
import type { BlockedDate } from '@/types';

export async function GET() {
  try {
    const db = adminDb();
    const snapshot = await db.collection('blockedDates').orderBy('date', 'asc').get();
    const dates: BlockedDate[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<BlockedDate, 'id'>),
    }));
    return NextResponse.json(dates);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch blocked dates' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data = blockedDateSchema.parse(body);
    const db = adminDb();
    const ref = await db.collection('blockedDates').add({
      date: data.date,
      reason: data.reason ?? null,
    });
    return NextResponse.json({ id: ref.id, ...data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to add blocked date' }, { status: 500 });
  }
}
