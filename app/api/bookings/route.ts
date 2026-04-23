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
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    let query: FirebaseFirestore.Query = db.collection('bookings').orderBy('createdAt', 'desc');

    if (status) query = query.where('status', '==', status);
    if (date) query = query.where('date', '==', date);

    const snapshot = await query.limit(200).get();
    const bookings: Booking[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Booking, 'id'>),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    }));

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

    // Transaction: check slot not taken, then write
    const confirmationCode = generateConfirmationCode();

    const result = await db.runTransaction(async (tx) => {
      const existing = await tx.get(
        db
          .collection('bookings')
          .where('date', '==', data.date)
          .where('timeSlot', '==', data.timeSlot)
          .where('status', '!=', 'CANCELLED')
      );

      if (!existing.empty) {
        throw new Error('SLOT_TAKEN');
      }

      const bookingRef = db.collection('bookings').doc();
      tx.set(bookingRef, {
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

      return bookingRef.id;
    });

    // Send confirmation email (non-blocking)
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
      await db.collection('bookings').doc(result).update({ emailSent: true });
    } catch (emailErr) {
      console.error('Email failed:', emailErr);
    }

    return NextResponse.json(
      { id: result, confirmationCode, status: 'PENDING' },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'SLOT_TAKEN') {
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please choose another.' },
        { status: 409 }
      );
    }
    console.error('POST /api/bookings error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
