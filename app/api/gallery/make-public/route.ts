import { NextRequest, NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase-admin';
import { verifyAdminToken } from '@/lib/auth-server';

// POST { storagePath } — called by client after direct upload completes
export async function POST(req: NextRequest) {
  const uid = await verifyAdminToken(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { storagePath } = await req.json();
    if (!storagePath) return NextResponse.json({ error: 'storagePath required' }, { status: 400 });

    await adminStorage().bucket().file(storagePath).makePublic();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('make-public error:', error);
    return NextResponse.json({ error: 'Failed to make file public' }, { status: 500 });
  }
}
