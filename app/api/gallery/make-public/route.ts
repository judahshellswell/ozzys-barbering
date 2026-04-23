import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { verifyAdminToken } from '@/lib/auth-server';

// POST { storagePath, contentType, caption }
// Called by the client after a direct upload to Firebase Storage completes.
// Makes the file public and creates the Firestore gallery doc.
export async function POST(req: NextRequest) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { storagePath, contentType, caption } = await req.json();
    if (!storagePath || !contentType) {
      return NextResponse.json({ error: 'storagePath and contentType required' }, { status: 400 });
    }

    const bucket = adminStorage().bucket();
    await bucket.file(storagePath).makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    const type = contentType.startsWith('video/') ? 'video' : 'image';

    const db = adminDb();
    const lastSnap = await db.collection('galleryImages').orderBy('order', 'desc').limit(1).get();
    const order = lastSnap.empty ? 0 : (lastSnap.docs[0].data().order ?? 0) + 1;

    const docRef = await db.collection('galleryImages').add({
      url: publicUrl,
      storagePath,
      caption: caption ?? null,
      type,
      order,
      createdAt: new Date(),
    });

    return NextResponse.json({ id: docRef.id, url: publicUrl, type });
  } catch (error) {
    console.error('make-public error:', error);
    return NextResponse.json({ error: 'Failed to finalise upload' }, { status: 500 });
  }
}
