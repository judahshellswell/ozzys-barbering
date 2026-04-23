import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { verifyAdminToken } from '@/lib/auth-server';

// POST { filename, contentType, caption }
// Returns a signed upload URL + the storagePath + future public URL
// The client uploads directly to Firebase Storage — no file data passes through Vercel
export async function POST(req: NextRequest) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { filename, contentType, caption } = await req.json();
    if (!filename || !contentType) {
      return NextResponse.json({ error: 'filename and contentType required' }, { status: 400 });
    }

    const ext = filename.split('.').pop() ?? 'bin';
    const storagePath = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const bucket = adminStorage().bucket();
    const fileRef = bucket.file(storagePath);

    // Signed URL valid for 15 minutes — enough for any upload
    const [signedUrl] = await fileRef.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000,
      contentType,
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    const type = contentType.startsWith('video/') ? 'video' : 'image';

    // Pre-create the Firestore doc so we can return its ID immediately
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

    // Make the file public after upload — client calls /api/gallery/make-public once done
    return NextResponse.json({ signedUrl, storagePath, publicUrl, type, id: docRef.id });
  } catch (error) {
    console.error('upload-url error:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
