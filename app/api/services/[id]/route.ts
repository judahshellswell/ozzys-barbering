import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyAdminToken } from '@/lib/auth-server';
import { serviceSchema } from '@/lib/validations/service.schema';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const data = serviceSchema.parse(body);
    await adminDb().collection('services').doc(id).update({ ...data, updatedAt: new Date() });
    return NextResponse.json({ id, ...data });
  } catch {
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    await adminDb().collection('services').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
