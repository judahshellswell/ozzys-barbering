'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { businessConfig } from '@/config/business.config';
import { formatDate, formatTime } from '@/lib/booking-utils';
import { Scissors, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { Booking } from '@/types';

const { currency } = businessConfig.booking;

const STATUS_LABEL: Record<string, { label: string; colour: string }> = {
  PENDING:   { label: 'Pending Confirmation', colour: 'text-amber-600 bg-amber-50 border-amber-200' },
  CONFIRMED: { label: 'Confirmed',             colour: 'text-green-700 bg-green-50 border-green-200' },
  CANCELLED: { label: 'Cancelled',             colour: 'text-red-600 bg-red-50 border-red-200' },
  COMPLETED: { label: 'Completed',             colour: 'text-blue-700 bg-blue-50 border-blue-200' },
  NO_SHOW:   { label: 'No Show',               colour: 'text-gray-600 bg-gray-50 border-gray-200' },
};

function MyBookingContent() {
  const params = useSearchParams();
  const [code, setCode] = useState(params.get('code') ?? '');
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [cancelled, setCancelled] = useState(false);

  // Auto-lookup if code+email are in URL params
  useEffect(() => {
    const urlCode = params.get('code');
    const urlEmail = params.get('email');
    if (urlCode && urlEmail) lookup(urlCode, urlEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function lookup(lookupCode = code, lookupEmail = email) {
    setError('');
    setBooking(null);
    setCancelled(false);
    if (!lookupCode || !lookupEmail) { setError('Please enter your confirmation code and email.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/my-booking?code=${encodeURIComponent(lookupCode)}&email=${encodeURIComponent(lookupEmail)}`);
      if (res.status === 404) { setError('No booking found. Please check your code and email.'); return; }
      if (!res.ok) throw new Error();
      setBooking(await res.json());
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking() {
    if (!booking) return;
    if (!confirm('Are you sure you want to cancel your appointment?')) return;
    setCancelling(true);
    try {
      const res = await fetch('/api/my-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: booking.confirmationCode, email: booking.email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to cancel booking.');
        return;
      }
      setCancelled(true);
      setBooking((b) => b ? { ...b, status: 'CANCELLED' } : b);
    } catch {
      setError('Failed to cancel booking. Please contact us directly.');
    } finally {
      setCancelling(false);
    }
  }

  const canCancel = booking && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && booking.status !== 'NO_SHOW';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#1e293b] text-white py-12 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Scissors className="h-5 w-5 text-[#6366f1]" />
          <span className="text-[#6366f1] text-sm font-medium uppercase tracking-widest">
            {businessConfig.name}
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wide">My Booking</h1>
        <p className="text-gray-400 mt-2 text-sm">Look up or cancel your appointment</p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Lookup form */}
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <h2 className="font-semibold mb-4">Find Your Booking</h2>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Confirmation Code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. OZ-A3K9"
                className="font-mono"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="The email used when booking"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </p>
            )}
            <Button
              onClick={() => lookup()}
              disabled={loading}
              className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white"
            >
              {loading ? 'Looking up...' : 'Find Booking'}
            </Button>
          </div>
        </div>

        {/* Booking details */}
        {booking && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Confirmation Code</p>
                <p className="font-mono font-bold text-[#6366f1] text-lg">{booking.confirmationCode}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_LABEL[booking.status]?.colour}`}>
                {STATUS_LABEL[booking.status]?.label ?? booking.status}
              </span>
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{booking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{booking.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{formatDate(booking.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{formatTime(booking.timeSlot)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">{currency}{Number(booking.servicePrice).toFixed(2)}</span>
              </div>
            </div>

            {cancelled ? (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
                <CheckCircle className="h-4 w-4 shrink-0" />
                Your booking has been cancelled successfully.
              </div>
            ) : canCancel ? (
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground mb-3">
                  Need to cancel? Please do so at least {businessConfig.booking.cancellationPolicyHours} hours before your appointment.
                </p>
                <Button
                  variant="outline"
                  onClick={cancelBooking}
                  disabled={cancelling}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {cancelling ? 'Cancelling...' : 'Cancel Appointment'}
                </Button>
              </div>
            ) : null}

            {booking.status === 'CANCELLED' && !cancelled && (
              <div className="flex items-center gap-2 text-muted-foreground bg-muted rounded-lg px-4 py-3 text-sm">
                This booking has already been cancelled.
              </div>
            )}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-8">
          Need help? Call us at {businessConfig.contact.phone} or email {businessConfig.contact.email}
        </p>
      </div>
    </div>
  );
}

export default function MyBookingPage() {
  return (
    <Suspense>
      <MyBookingContent />
    </Suspense>
  );
}
