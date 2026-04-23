import { NextRequest, NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase-admin';
import { verifyAdminToken } from '@/lib/auth-server';

// POST { filename, contentType }
// Returns only a signed upload URL + storagePath.
// The client uploads directly to Firebase Storage, then calls /api/gallery/make-public
// which makes the file public AND creates the Firestore doc — so no ghost records.
export async function POST(req: NextRequest) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { filename, contentType } = await req.json();
    if (!filename || !contentType) {
      return NextResponse.json({ error: 'filename and contentType required' }, { status: 400 });
    }

    const ext = filename.split('.').pop() ?? 'bin';
    const storagePath = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const bucket = adminStorage().bucket();
    const fileRef = bucket.file(storagePath);

    const [signedUrl] = await fileRef.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000,
      contentType,
    });

    return NextResponse.json({ signedUrl, storagePath });
  } catch (error) {
    console.error('upload-url error:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
