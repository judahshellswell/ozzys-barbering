'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAdminToken, authHeaders } from '@/lib/use-admin-token';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';
import type { Availability, BlockedDate } from '@/types';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_SCHEDULE: Availability[] = DAY_NAMES.map((_, i) => ({
  dayOfWeek: i,
  startTime: '09:00',
  endTime: '18:00',
  isActive: i >= 1 && i <= 6,
}));

export default function AdminAvailabilityPage() {
  const { getToken } = useAdminToken();
  const [schedule, setSchedule] = useState<Availability[]>(DEFAULT_SCHEDULE);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [schedRes, blockedRes] = await Promise.all([
        fetch('/api/availability'),
        fetch('/api/availability/blocked-dates'),
      ]);
      if (schedRes.ok) {
        const data: Availability[] = await schedRes.json();
        if (data.length > 0) {
          const merged = DEFAULT_SCHEDULE.map((def) => {
            const found = data.find((d) => d.dayOfWeek === def.dayOfWeek);
            return found ?? def;
          });
          setSchedule(merged);
        }
      }
      if (blockedRes.ok) setBlockedDates(await blockedRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function updateDay(dayOfWeek: number, field: keyof Availability, value: string | boolean) {
    setSchedule((s) => s.map((d) => d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d));
  }

  async function saveSchedule() {
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/availability', {
        method: 'PUT',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      });
      if (!res.ok) throw new Error();
      toast.success('Schedule saved');
    } catch {
      toast.error('Failed to save schedule');
    } finally {
      setSaving(false);
    }
  }

  async function addBlockedDate() {
    if (!newDate) return;
    try {
      const token = await getToken();
      const res = await fetch('/api/availability/blocked-dates', {
        method: 'POST',
        headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate, reason: newReason || undefined }),
      });
      if (!res.ok) throw new Error();
      toast.success('Date blocked');
      setNewDate('');
      setNewReason('');
      fetchData();
    } catch {
      toast.error('Failed to block date');
    }
  }

  async function removeBlockedDate(id: string) {
    try {
      const token = await getToken();
      await fetch(`/api/availability/blocked-dates/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });
      toast.success('Date unblocked');
      fetchData();
    } catch {
      toast.error('Failed to remove blocked date');
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <AdminHeader title="Availability" />
      <div className="p-6 space-y-8 max-w-2xl">
        {/* Weekly Schedule */}
        <section>
          <h2 className="font-semibold text-lg mb-4">Weekly Schedule</h2>
          {loading ? (
            <div className="space-y-2">{[1,2,3,4,5,6,7].map(i => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}</div>
          ) : (
            <div className="space-y-2">
              {schedule.map((day) => (
                <div key={day.dayOfWeek} className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${day.isActive ? 'bg-card border-border' : 'bg-muted/50 border-transparent opacity-60'}`}>
                  <button
                    onClick={() => updateDay(day.dayOfWeek, 'isActive', !day.isActive)}
                    className={`w-10 h-6 rounded-full transition-colors shrink-0 ${day.isActive ? 'bg-[#6366f1]' : 'bg-muted-foreground/30'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${day.isActive ? 'translate-x-4' : ''}`} />
                  </button>
                  <span className="w-24 text-sm font-medium shrink-0">{DAY_NAMES[day.dayOfWeek]}</span>
                  <Input
                    type="time"
                    value={day.startTime}
                    onChange={(e) => updateDay(day.dayOfWeek, 'startTime', e.target.value)}
                    disabled={!day.isActive}
                    className="w-32 h-8 text-sm"
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <Input
                    type="time"
                    value={day.endTime}
                    onChange={(e) => updateDay(day.dayOfWeek, 'endTime', e.target.value)}
                    disabled={!day.isActive}
                    className="w-32 h-8 text-sm"
                  />
                  {!day.isActive && <Badge variant="secondary" className="text-xs">Closed</Badge>}
                </div>
              ))}
            </div>
          )}
          <Button onClick={saveSchedule} disabled={saving} className="mt-4 bg-[#6366f1] hover:bg-[#4f46e5] text-white">
            {saving ? 'Saving...' : 'Save Schedule'}
          </Button>
        </section>

        {/* Blocked Dates */}
        <section>
          <h2 className="font-semibold text-lg mb-4">Blocked Dates</h2>
          <p className="text-sm text-muted-foreground mb-4">Block specific dates — no bookings will be accepted on these days.</p>

          <div className="flex gap-2 mb-4">
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-44"
            />
            <Input
              placeholder="Reason (optional)"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addBlockedDate} disabled={!newDate} className="gap-2 bg-[#1e293b] hover:bg-[#334155] text-white shrink-0">
              <Plus className="h-4 w-4" />
              Block
            </Button>
          </div>

          {blockedDates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No dates blocked.</p>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((bd) => (
                <div key={bd.id} className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-2.5">
                  <div>
                    <span className="font-medium text-sm">{new Date(bd.date + 'T00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    {bd.reason && <span className="text-muted-foreground text-sm ml-2">— {bd.reason}</span>}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => removeBlockedDate(bd.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
