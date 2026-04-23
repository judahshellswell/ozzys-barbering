'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, useRef } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAdminToken, authHeaders } from '@/lib/use-admin-token';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Upload, Trash2, ImagePlus } from 'lucide-react';
import Image from 'next/image';
import type { GalleryImage } from '@/types';

export default function AdminGalleryPage() {
  const { getToken } = useAdminToken();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchImages = useCallback(async () => {
    const res = await fetch('/api/gallery');
    if (res.ok) setImages(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append('file', file);
      if (caption) fd.append('caption', caption);

      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: authHeaders(token),
        body: fd,
      });

      if (!res.ok) throw new Error();
      toast.success('Image uploaded');
      setCaption('');
      if (fileRef.current) fileRef.current.value = '';
      fetchImages();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function deleteImage(id: string) {
    if (!confirm('Delete this image?')) return;
    try {
      const token = await getToken();
      await fetch(`/api/gallery/${id}`, { method: 'DELETE', headers: authHeaders(token) });
      toast.success('Image deleted');
      fetchImages();
    } catch {
      toast.error('Failed to delete image');
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader title="Gallery" />
      <div className="p-6">
        {/* Upload section */}
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-[#6366f1]" />
            Upload New Photo
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="sm:flex-1"
            />
            <label className="cursor-pointer">
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#6366f1] hover:bg-[#4f46e5] text-black transition-colors cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Choose Photo'}
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Gallery grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ImagePlus className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No photos yet. Upload your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
                <Image
                  src={img.url}
                  alt={img.caption ?? 'Gallery image'}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-2">
                    <p className="text-white text-xs truncate">{img.caption}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteImage(img.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
