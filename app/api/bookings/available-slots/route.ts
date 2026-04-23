import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAvailableSlots, isPastSlot } from '@/lib/booking-utils';
import type { Availability, Booking, Service } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get('serviceId');
  const date = searchParams.get('date'); // "YYYY-MM-DD"

  if (!serviceId || !date) {
    return NextResponse.json({ error: 'serviceId and date are required' }, { status: 400 });
  }

  try {
    const db = adminDb();

    // Fetch service for duration
    const serviceDoc = await db.collection('services').doc(serviceId).get();
    if (!serviceDoc.exists) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    const service = serviceDoc.data() as Service;

    // Get day of week (0=Sunday)
    const [y, mo, d] = date.split('-').map(Number);
    const dayOfWeek = new Date(y, mo - 1, d).getDay();

    // Check blocked dates
    const blockedSnap = await db
      .collection('blockedDates')
      .where('date', '==', date)
      .limit(1)
      .get();

    if (!blockedSnap.empty) {
      return NextResponse.json([]);
    }

    // Fetch availability for this day
    const availDoc = await db.collection('availability').doc(String(dayOfWeek)).get();
    if (!availDoc.exists || !(availDoc.data() as Availability).isActive) {
      return NextResponse.json([]);
    }
    const availability = availDoc.data() as Availability;

    // Fetch existing bookings for this date, filter cancelled in app code to avoid composite index
    const bookingsSnap = await db
      .collection('bookings')
      .where('date', '==', date)
      .get();

    const existingBookings: Booking[] = bookingsSnap.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Booking, 'id'>) }))
      .filter((b) => b.status !== 'CANCELLED');

    const slots = getAvailableSlots(availability, existingBookings, service.duration);

    // Filter out past slots
    const futureSlots = slots.filter((slot) => !isPastSlot(date, slot));

    return NextResponse.json(futureSlots);
  } catch (error) {
    console.error('available-slots error:', error);
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
  }
}
