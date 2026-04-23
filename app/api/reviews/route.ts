import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAdminToken } from '@/lib/auth-server';
import type { Review } from '@/types';

export async function GET() {
  try {
    const db = adminDb();
    const snapshot = await db.collection('reviews').orderBy('createdAt', 'desc').get();
    const reviews: Review[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Review, 'id'>),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    }));
    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { customerName, rating, body: reviewBody, service } = body;

    if (!customerName || !rating || !reviewBody) {
      return NextResponse.json({ error: 'customerName, rating, and body are required' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 });
    }

    const ref = await adminDb().collection('reviews').add({
      customerName,
      rating: Number(rating),
      body: reviewBody,
      service: service ?? null,
      createdAt: new Date(),
    });

    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
