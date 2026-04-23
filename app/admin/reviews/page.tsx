'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAdminToken, authHeaders } from '@/lib/use-admin-token';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Star, Trash2, Plus, MessageSquare } from 'lucide-react';
import type { Review } from '@/types';

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5"
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              n <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const { getToken } = useAdminToken();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customerName: '', rating: 5, body: '', service: '' });

  const fetchReviews = useCallback(async () => {
    const res = await fetch('/api/reviews');
    if (res.ok) setReviews(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function addReview(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerName || !form.body) return;
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, service: form.service || undefined }),
      });
      if (!res.ok) throw new Error();
      toast.success('Review added');
      setForm({ customerName: '', rating: 5, body: '', service: '' });
      fetchReviews();
    } catch {
      toast.error('Failed to add review');
    } finally {
      setSaving(false);
    }
  }

  async function deleteReview(id: string) {
    if (!confirm('Delete this review?')) return;
    try {
      const token = await getToken();
      await fetch(`/api/reviews/${id}`, { method: 'DELETE', headers: authHeaders(token) });
      toast.success('Review deleted');
      fetchReviews();
    } catch {
      toast.error('Failed to delete review');
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader title="Reviews" />
      <div className="p-3 sm:p-6 space-y-6 max-w-2xl">

        {/* Add review form */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base">
            <MessageSquare className="h-4 w-4 text-[#6366f1]" />
            Add Testimonial
          </h2>
          <form onSubmit={addReview} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Customer Name *</Label>
                <Input
                  value={form.customerName}
                  onChange={(e) => setForm(f => ({ ...f, customerName: e.target.value }))}
                  placeholder="e.g. James T."
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Service (optional)</Label>
                <Input
                  value={form.service}
                  onChange={(e) => setForm(f => ({ ...f, service: e.target.value }))}
                  placeholder="e.g. Boys Haircut"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Rating *</Label>
              <StarPicker value={form.rating} onChange={(n) => setForm(f => ({ ...f, rating: n }))} />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Review *</Label>
              <Textarea
                value={form.body}
                onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="What did the customer say?"
                rows={3}
              />
            </div>
            <Button
              type="submit"
              disabled={saving || !form.customerName || !form.body}
              className="w-full sm:w-auto bg-[#6366f1] hover:bg-[#4f46e5] text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              {saving ? 'Adding...' : 'Add Review'}
            </Button>
          </form>
        </div>

        {/* Reviews list */}
        <div>
          <h2 className="font-semibold text-sm sm:text-base mb-3">
            {reviews.length} Review{reviews.length !== 1 ? 's' : ''} (shown on homepage)
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-10 text-sm">No reviews yet. Add your first testimonial above.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="bg-card border border-border rounded-lg p-3 sm:p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm">{r.customerName}</span>
                      {r.service && <span className="text-xs text-muted-foreground">· {r.service}</span>}
                    </div>
                    <StarDisplay rating={r.rating} />
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{r.body}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteReview(r.id)}
                    className="text-destructive hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
