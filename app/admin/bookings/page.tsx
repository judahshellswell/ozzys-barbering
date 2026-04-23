'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAdminToken, authHeaders } from '@/lib/use-admin-token';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { formatDate, formatTime } from '@/lib/booking-utils';
import { businessConfig } from '@/config/business.config';
import type { Booking, BookingStatus } from '@/types';

const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  NO_SHOW: 'bg-gray-100 text-gray-800',
};

export default function AdminBookingsPage() {
  const { getToken } = useAdminToken();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { currency } = businessConfig.booking;

  const fetchBookings = useCallback(async () => {
    try {
      const token = await getToken();
      const url = filter === 'all' ? '/api/bookings' : `/api/bookings?status=${filter}`;
      const res = await fetch(url, { headers: authHeaders(token) });
      if (!res.ok) throw new Error();
      setBookings(await res.json());
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [getToken, filter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  async function updateStatus(id: string, status: BookingStatus) {
    try {
      const token = await getToken();
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success('Status updated');
      fetchBookings();
    } catch {
      toast.error('Failed to update status');
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader title="Bookings" />
      <div className="p-6">
        {/* Filter */}
        <div className="flex gap-3 mb-6">
          {['all', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === s
                  ? 'bg-[#0f0f0f] text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">No bookings found.</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{b.customerName}</span>
                      <Badge className={`text-xs ${STATUS_COLORS[b.status]}`}>
                        {b.status.toLowerCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {b.serviceName} · {formatDate(b.date)} at {formatTime(b.timeSlot)} · {currency}{b.servicePrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{b.email} {b.phone && `· ${b.phone}`}</p>
                    <p className="text-xs font-mono text-[#6366f1] mt-0.5">{b.confirmationCode}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Select
                      value={b.status}
                      onValueChange={(v) => updateStatus(b.id, v as BookingStatus)}
                    >
                      <SelectTrigger className="w-36 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'] as BookingStatus[]).map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {b.notes && (
                  <p className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">
                    Note: {b.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
