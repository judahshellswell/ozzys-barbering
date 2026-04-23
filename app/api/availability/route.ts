import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAdminToken } from '@/lib/auth-server';
import type { Availability } from '@/types';

export async function GET() {
  try {
    const db = adminDb();
    const snapshot = await db.collection('availability').orderBy('dayOfWeek', 'asc').get();

    const schedule: Availability[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Availability, 'id'>),
    }));

    return NextResponse.json(schedule);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body: Availability[] = await req.json();
    const db = adminDb();
    const batch = db.batch();

    for (const day of body) {
      const ref = db.collection('availability').doc(String(day.dayOfWeek));
      batch.set(ref, {
        dayOfWeek: day.dayOfWeek,
        startTime: day.startTime,
        endTime: day.endTime,
        isActive: day.isActive,
      }, { merge: true });
    }

    await batch.commit();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
  }
}
