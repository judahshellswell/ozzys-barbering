'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { LightboxModal } from './LightboxModal';
import type { GalleryImage } from '@/types';

interface GalleryGridProps {
  images: GalleryImage[];
}

export function GalleryGrid({ images }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>No photos yet — check back soon!</p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
        {images.map((image, i) => (
          <button
            key={image.id}
            onClick={() => setLightboxIndex(i)}
            className="block w-full break-inside-avoid rounded-lg overflow-hidden cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1]"
          >
            <div className="relative">
              {image.type === 'video' ? (
                <>
                  <video
                    src={image.url}
                    className="w-full h-auto object-cover group-hover:opacity-90 transition-opacity"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 rounded-full p-3 group-hover:bg-black/70 transition-colors">
                      <Play className="h-6 w-6 text-white fill-white" />
                    </div>
                  </div>
                </>
              ) : (
                <Image
                  src={image.url}
                  alt={image.caption ?? `Gallery photo ${i + 1}`}
                  width={400}
                  height={500}
                  className="w-full h-auto object-cover group-hover:opacity-90 transition-opacity"
                  unoptimized
                />
              )}
              {image.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">{image.caption}</p>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <LightboxModal
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
