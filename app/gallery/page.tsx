import { adminDb } from '@/lib/firebase-admin';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { LinkButton } from '@/components/ui/link-button';
import type { GalleryImage } from '@/types';

async function getImages(): Promise<GalleryImage[]> {
  try {
    const db = adminDb();
    const snapshot = await db.collection('galleryImages').orderBy('order', 'asc').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<GalleryImage, 'id'>),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function GalleryPage() {
  const images = await getImages();

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[#0f0f0f] text-white py-16 px-4 text-center">
        <h1 className="font-display text-6xl tracking-wide">Gallery</h1>
        <p className="text-gray-400 mt-3">Fresh cuts. Clean fades. Real results.</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <GalleryGrid images={images} />

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Like what you see? Book your cut today.</p>
          <LinkButton
            href="/booking"
            className="bg-[#c0392b] hover:bg-[#a93226] text-black font-semibold px-8 py-3 border-transparent"
          >
            Book Now
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
