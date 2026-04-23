'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAdminToken, authHeaders } from '@/lib/use-admin-token';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { formatTime } from '@/lib/booking-utils';
import { businessConfig } from '@/config/business.config';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Booking, BookingStatus } from '@/types';

const { currency } = businessConfig.booking;

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// Colour for each status — calendar day dot
function dayColor(statuses: BookingStatus[]): string {
  if (statuses.includes('CONFIRMED')) return 'bg-green-500 text-white';
  if (statuses.includes('PENDING'))   return 'bg-amber-400 text-white';
  if (statuses.includes('COMPLETED')) return 'bg-blue-500 text-white';
  if (statuses.includes('CANCELLED') || statuses.includes('NO_SHOW')) return 'bg-red-500 text-white';
  return '';
}

const STATUS_BADGE: Record<BookingStatus, string> = {
  PENDING:   'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100   text-red-800',
  COMPLETED: 'bg-blue-100  text-blue-800',
  NO_SHOW:   'bg-gray-100  text-gray-700',
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

export default function AdminBookingsPage() {
  const { getToken } = useAdminToken();
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const fetchBookings = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch('/api/bookings', { headers: authHeaders(token) });
      if (!res.ok) throw new Error();
      setAllBookings(await res.json());
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // Map date string → statuses for calendar colouring
  const bookingsByDate = useMemo(() => {
    const map: Record<string, BookingStatus[]> = {};
    for (const b of allBookings) {
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b.status);
    }
    return map;
  }, [allBookings]);

  // Filtered list for the booking table
  const displayedBookings = useMemo(() => {
    let list = allBookings;
    if (selectedDate) list = list.filter((b) => b.date === selectedDate);
    if (statusFilter !== 'all') list = list.filter((b) => b.status === statusFilter);
    return list;
  }, [allBookings, selectedDate, statusFilter]);

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

  // Calendar grid
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader title="Bookings" />
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-5xl">

        {/* Calendar */}
        <div className="bg-card border border-border rounded-xl p-3 sm:p-5">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="font-semibold text-base sm:text-lg">{MONTH_NAMES[viewMonth]} {viewYear}</h2>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_HEADERS.map(d => (
              <div key={d} className="text-center text-[10px] sm:text-xs font-semibold text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {/* Empty leading cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {/* Day numbers */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = toDateStr(viewYear, viewMonth, day);
              const statuses = bookingsByDate[dateStr] ?? [];
              const color = dayColor(statuses);
              const isToday = dateStr === toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
                  className={`
                    aspect-square flex items-center justify-center rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all
                    ${color || 'hover:bg-muted text-foreground'}
                    ${isSelected ? 'ring-2 ring-[#6366f1] ring-offset-1' : ''}
                    ${isToday && !color ? 'border-2 border-[#6366f1] text-[#6366f1]' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-500 inline-block shrink-0" />Confirmed</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-amber-400 inline-block shrink-0" />Pending</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-blue-500 inline-block shrink-0" />Completed</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-red-500 inline-block shrink-0" />Cancelled</span>
          </div>
        </div>

        {/* Bookings list */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-4">
            <h2 className="font-semibold text-base sm:text-lg">
              {selectedDate
                ? `Bookings for ${new Date(selectedDate + 'T00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`
                : 'All Bookings'}
              {selectedDate && (
                <button onClick={() => setSelectedDate(null)} className="ml-2 text-xs text-muted-foreground underline font-normal">clear</button>
              )}
            </h2>
            <div className="flex gap-1.5 flex-wrap">
              {['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    statusFilter === s ? 'bg-[#1e293b] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}
            </div>
          ) : displayedBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-16">
              {selectedDate ? 'No bookings on this day.' : 'No bookings found.'}
            </p>
          ) : (
            <div className="space-y-3">
              {displayedBookings.map((b) => (
                <div key={b.id} className="bg-card border border-border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-sm sm:text-base">{b.customerName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[b.status]}`}>
                          {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{b.serviceName}</span>
                        <span className="mx-1">·</span>
                        {new Date(b.date + 'T00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} at {formatTime(b.timeSlot)}
                        <span className="mx-1">·</span>
                        {currency}{Number(b.servicePrice).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{b.email}{b.phone && ` · ${b.phone}`}</p>
                      <p className="text-xs font-mono text-[#6366f1] mt-0.5">{b.confirmationCode}</p>
                    </div>
                    <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v as BookingStatus)}>
                      <SelectTrigger className="w-full sm:w-36 h-8 text-xs shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(['PENDING','CONFIRMED','CANCELLED','COMPLETED','NO_SHOW'] as BookingStatus[]).map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {b.notes && (
                    <p className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">Note: {b.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
