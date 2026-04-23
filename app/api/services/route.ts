import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAdminToken } from '@/lib/auth-server';
import { serviceSchema } from '@/lib/validations/service.schema';
import type { Service } from '@/types';

export async function GET() {
  try {
    const db = adminDb();
    const snapshot = await db
      .collection('services')
      .orderBy('order', 'asc')
      .get();

    const services = (snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      })) as Service[])
      .filter((s) => s.active);

    return NextResponse.json(services);
  } catch (error) {
    console.error('GET /api/services error:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data = serviceSchema.parse(body);

    const db = adminDb();
    const ref = await db.collection('services').add({
      ...data,
      createdAt: new Date(),
    });

    return NextResponse.json({ id: ref.id, ...data }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
