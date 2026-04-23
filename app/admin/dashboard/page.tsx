'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAdminToken, authHeaders } from '@/lib/use-admin-token';
import { TrendingUp, PoundSterling, UserX, Scissors } from 'lucide-react';
import { businessConfig } from '@/config/business.config';
import type { Booking, BookingStatus } from '@/types';

const { currency } = businessConfig.booking;

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekStart(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface Stats {
  revenueThisWeek: number;
  revenueThisMonth: number;
  bookingsThisWeek: number;
  bookingsThisMonth: number;
  noShowRate: number;
  topService: string | null;
  dayHeatmap: number[]; // index 0=Sun..6=Sat, count of non-cancelled bookings
  recentStatuses: Record<BookingStatus, number>;
}

function computeStats(bookings: Booking[]): Stats {
  const now = new Date();
  const weekStart = toDateStr(getWeekStart(now));
  const monthStart = toDateStr(getMonthStart(now));

  let revenueThisWeek = 0;
  let revenueThisMonth = 0;
  let bookingsThisWeek = 0;
  let bookingsThisMonth = 0;
  const serviceCounts: Record<string, number> = {};
  const dayHeatmap = [0, 0, 0, 0, 0, 0, 0];
  const statusCounts: Record<string, number> = { PENDING: 0, CONFIRMED: 0, CANCELLED: 0, COMPLETED: 0, NO_SHOW: 0 };

  let totalFinished = 0;
  let noShows = 0;

  for (const b of bookings) {
    statusCounts[b.status] = (statusCounts[b.status] ?? 0) + 1;

    if (b.status === 'COMPLETED' || b.status === 'NO_SHOW') totalFinished++;
    if (b.status === 'NO_SHOW') noShows++;

    if (b.status === 'CANCELLED' || b.status === 'NO_SHOW') continue;

    // Day heatmap
    const [y, mo, d] = b.date.split('-').map(Number);
    const dayOfWeek = new Date(y, mo - 1, d).getDay();
    dayHeatmap[dayOfWeek]++;

    // Service counts
    serviceCounts[b.serviceName] = (serviceCounts[b.serviceName] ?? 0) + 1;

    // Revenue / booking counts for this week / month
    if (b.date >= weekStart) {
      revenueThisWeek += Number(b.servicePrice);
      bookingsThisWeek++;
    }
    if (b.date >= monthStart) {
      revenueThisMonth += Number(b.servicePrice);
      bookingsThisMonth++;
    }
  }

  const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const noShowRate = totalFinished > 0 ? Math.round((noShows / totalFinished) * 100) : 0;

  return {
    revenueThisWeek,
    revenueThisMonth,
    bookingsThisWeek,
    bookingsThisMonth,
    noShowRate,
    topService,
    dayHeatmap,
    recentStatuses: statusCounts as Record<BookingStatus, number>,
  };
}

const STATUS_COLOURS: Record<BookingStatus, string> = {
  CONFIRMED: 'bg-green-500',
  PENDING: 'bg-amber-400',
  COMPLETED: 'bg-blue-500',
  CANCELLED: 'bg-red-400',
  NO_SHOW: 'bg-gray-400',
};

export default function AdminDashboardPage() {
  const { getToken } = useAdminToken();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch('/api/bookings', { headers: authHeaders(token) });
      if (!res.ok) throw new Error();
      const bookings: Booking[] = await res.json();
      setStats(computeStats(bookings));
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const maxHeat = stats ? Math.max(...stats.dayHeatmap, 1) : 1;

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader title="Dashboard" />
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-5xl">

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : stats ? (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <PoundSterling className="h-4 w-4 text-[#6366f1]" />
                  <span className="text-xs text-muted-foreground">This Week</span>
                </div>
                <p className="text-2xl font-bold">{currency}{stats.revenueThisWeek.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.bookingsThisWeek} booking{stats.bookingsThisWeek !== 1 ? 's' : ''}</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-[#6366f1]" />
                  <span className="text-xs text-muted-foreground">This Month</span>
                </div>
                <p className="text-2xl font-bold">{currency}{stats.revenueThisMonth.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.bookingsThisMonth} booking{stats.bookingsThisMonth !== 1 ? 's' : ''}</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserX className="h-4 w-4 text-[#6366f1]" />
                  <span className="text-xs text-muted-foreground">No-Show Rate</span>
                </div>
                <p className="text-2xl font-bold">{stats.noShowRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">of completed appts</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Scissors className="h-4 w-4 text-[#6366f1]" />
                  <span className="text-xs text-muted-foreground">Top Service</span>
                </div>
                <p className="text-lg font-bold leading-tight">{stats.topService ?? '—'}</p>
                <p className="text-xs text-muted-foreground mt-1">most booked</p>
              </div>
            </div>

            {/* Busiest days heatmap */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
              <h2 className="font-semibold text-sm sm:text-base mb-4">Busiest Days</h2>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {DAY_NAMES.map((day, i) => {
                  const count = stats.dayHeatmap[i];
                  const intensity = count / maxHeat;
                  const bg = intensity === 0
                    ? 'bg-muted'
                    : intensity < 0.33
                    ? 'bg-[#6366f1]/30'
                    : intensity < 0.66
                    ? 'bg-[#6366f1]/60'
                    : 'bg-[#6366f1]';
                  const textCol = intensity >= 0.66 ? 'text-white' : 'text-foreground';
                  return (
                    <div key={day} className="flex flex-col items-center gap-1.5">
                      <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-sm font-bold ${bg} ${textCol} transition-colors`}>
                        {count}
                      </div>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">{day}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-3">All-time booking count per day of week (excludes cancelled &amp; no-shows)</p>
            </div>

            {/* Status breakdown */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
              <h2 className="font-semibold text-sm sm:text-base mb-4">All-Time Booking Breakdown</h2>
              <div className="space-y-2">
                {(Object.entries(stats.recentStatuses) as [BookingStatus, number][])
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => {
                    const total = Object.values(stats.recentStatuses).reduce((a, b) => a + b, 0);
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span className="text-xs w-24 shrink-0 text-muted-foreground font-medium">
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${STATUS_COLOURS[status]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs w-8 text-right font-semibold">{count}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-center py-16">Failed to load stats.</p>
        )}
      </div>
    </div>
  );
}
