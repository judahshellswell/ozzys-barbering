import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { verifyAdminToken } from '@/lib/auth-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const updates: Record<string, unknown> = {};
    if (body.caption !== undefined) updates.caption = body.caption;
    if (body.order !== undefined) updates.order = body.order;

    await adminDb().collection('galleryImages').doc(id).update(updates);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update image' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const db = adminDb();
    const doc = await db.collection('galleryImages').doc(id).get();
    if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { storagePath } = doc.data() as { storagePath: string };

    // Delete from Storage
    try {
      await adminStorage().bucket().file(storagePath).delete();
    } catch {
      // File may already be deleted — don't fail the whole request
    }

    await db.collection('galleryImages').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
