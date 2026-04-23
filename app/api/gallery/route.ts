import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { verifyAdminToken } from '@/lib/auth-server';
import type { GalleryImage } from '@/types';

export async function GET() {
  try {
    const db = adminDb();
    const snapshot = await db.collection('galleryImages').orderBy('order', 'asc').get();
    const images: GalleryImage[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<GalleryImage, 'id'>),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    }));
    return NextResponse.json(images);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const caption = formData.get('caption') as string | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop() ?? 'jpg';
    const storagePath = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const bucket = adminStorage().bucket();
    const fileRef = bucket.file(storagePath);
    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
    });
    await fileRef.makePublic();

    const url = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    // Get current max order
    const db = adminDb();
    const lastSnap = await db.collection('galleryImages').orderBy('order', 'desc').limit(1).get();
    const order = lastSnap.empty ? 0 : (lastSnap.docs[0].data().order ?? 0) + 1;

    const ref = await db.collection('galleryImages').add({
      url,
      storagePath,
      caption: caption ?? null,
      order,
      createdAt: new Date(),
    });

    return NextResponse.json({ id: ref.id, url, storagePath, caption, order }, { status: 201 });
  } catch (error) {
    console.error('Gallery upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
