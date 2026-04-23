'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GalleryImage } from '@/types';

interface LightboxModalProps {
  images: GalleryImage[];
  initialIndex: number;
  onClose: () => void;
}

export function LightboxModal({ images, initialIndex, onClose }: LightboxModalProps) {
  const [index, setIndex] = useState(initialIndex);

  const prev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose, prev, next]);

  const image = images[index];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
        onClick={onClose}
      >
        <X className="h-7 w-7" />
      </button>

      {/* Prev */}
      {images.length > 1 && (
        <button
          className="absolute left-4 text-white/80 hover:text-white p-2"
          onClick={(e) => { e.stopPropagation(); prev(); }}
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}

      {/* Image */}
      <div
        className="max-w-4xl max-h-[85vh] w-full px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={image.url}
          alt={image.caption ?? `Gallery photo ${index + 1}`}
          width={1200}
          height={900}
          className="w-full h-full object-contain max-h-[80vh] rounded-lg"
          unoptimized
        />
        {image.caption && (
          <p className="text-center text-white/70 text-sm mt-3">{image.caption}</p>
        )}
        <p className="text-center text-white/40 text-xs mt-1">
          {index + 1} / {images.length}
        </p>
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          className="absolute right-4 text-white/80 hover:text-white p-2"
          onClick={(e) => { e.stopPropagation(); next(); }}
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}
    </div>
  );
}
