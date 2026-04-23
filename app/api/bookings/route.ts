import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAdminToken } from '@/lib/auth-server';
import { bookingSchema } from '@/lib/validations/booking.schema';
import { generateConfirmationCode } from '@/lib/confirmation-code';
import { sendBookingConfirmation } from '@/lib/email';
import type { Service, Booking } from '@/types';

export async function GET(req: NextRequest) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = adminDb();
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    // Avoid composite index: fetch all ordered by createdAt, filter in app code
    const snapshot = await db.collection('bookings').orderBy('createdAt', 'desc').limit(200).get();
    let bookings: Booking[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Booking, 'id'>),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    }));

    if (statusFilter) {
      bookings = bookings.filter((b) => b.status === statusFilter);
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('GET /api/bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = bookingSchema.parse(body);

    const db = adminDb();

    // Fetch service details
    const serviceDoc = await db.collection('services').doc(data.serviceId).get();
    if (!serviceDoc.exists) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    const service = serviceDoc.data() as Service;

    // Check for existing booking at same date+slot (no transaction query — avoid index requirement)
    const existingSnap = await db
      .collection('bookings')
      .where('date', '==', data.date)
      .where('timeSlot', '==', data.timeSlot)
      .get();

    const alreadyTaken = existingSnap.docs.some((d) => d.data().status !== 'CANCELLED');
    if (alreadyTaken) {
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please choose another.' },
        { status: 409 }
      );
    }

    // Write the booking
    const confirmationCode = generateConfirmationCode();
    const bookingRef = db.collection('bookings').doc();
    await bookingRef.set({
      confirmationCode,
      customerName: data.customerName,
      email: data.email,
      phone: data.phone ?? null,
      notes: data.notes ?? null,
      serviceId: data.serviceId,
      serviceName: service.name,
      serviceDuration: service.duration,
      servicePrice: Number(service.price),
      date: data.date,
      timeSlot: data.timeSlot,
      status: 'PENDING',
      emailSent: false,
      createdAt: new Date(),
    });

    // Send emails (non-blocking — don't fail the booking if email fails)
    try {
      await sendBookingConfirmation({
        customerName: data.customerName,
        email: data.email,
        confirmationCode,
        serviceName: service.name,
        date: data.date,
        timeSlot: data.timeSlot,
        servicePrice: Number(service.price),
        serviceDuration: service.duration,
      });
      await bookingRef.update({ emailSent: true });
    } catch (emailErr) {
      console.error('Email failed:', emailErr);
    }

    return NextResponse.json(
      { id: bookingRef.id, confirmationCode, status: 'PENDING' },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('POST /api/bookings error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
