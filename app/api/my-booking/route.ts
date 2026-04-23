import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { Booking } from '@/types';

// GET ?code=OZ-XXXX&email=customer@example.com
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code')?.toUpperCase().trim();
  const email = searchParams.get('email')?.toLowerCase().trim();

  if (!code || !email) {
    return NextResponse.json({ error: 'code and email are required' }, { status: 400 });
  }

  try {
    const db = adminDb();
    const snap = await db
      .collection('bookings')
      .where('confirmationCode', '==', code)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const doc = snap.docs[0];
    const data = doc.data() as Omit<Booking, 'id'>;

    // Verify email matches (case-insensitive)
    if (data.email.toLowerCase() !== email) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking: Booking = {
      id: doc.id,
      ...data,
      createdAt: data.createdAt ?? new Date().toISOString(),
    };

    return NextResponse.json(booking);
  } catch {
    return NextResponse.json({ error: 'Failed to look up booking' }, { status: 500 });
  }
}

// POST { code, email } — cancel the booking
export async function POST(req: NextRequest) {
  try {
    const { code, email } = await req.json();

    if (!code || !email) {
      return NextResponse.json({ error: 'code and email are required' }, { status: 400 });
    }

    const db = adminDb();
    const snap = await db
      .collection('bookings')
      .where('confirmationCode', '==', code.toUpperCase().trim())
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const doc = snap.docs[0];
    const data = doc.data() as Omit<Booking, 'id'>;

    if (data.email.toLowerCase() !== email.toLowerCase().trim()) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (data.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 400 });
    }

    if (data.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Cannot cancel a completed booking' }, { status: 400 });
    }

    await doc.ref.update({ status: 'CANCELLED', updatedAt: new Date() });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
