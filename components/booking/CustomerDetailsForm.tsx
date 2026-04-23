'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { bookingSchema, type BookingFormData } from '@/lib/validations/booking.schema';
import type { BookingState } from './BookingWizard';
import { businessConfig } from '@/config/business.config';
import { formatDate, formatTime } from '@/lib/booking-utils';

interface CustomerDetailsFormProps {
  booking: BookingState;
  onSuccess: (confirmationCode: string) => void;
  onBack: () => void;
}

export function CustomerDetailsForm({ booking, onSuccess, onBack }: CustomerDetailsFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const { currency } = businessConfig.booking;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: booking.service?.id ?? '',
      date: booking.date,
      timeSlot: booking.timeSlot,
      customerName: booking.customerName,
      email: booking.email,
      phone: booking.phone,
      notes: booking.notes,
    },
  });

  async function onSubmit(data: BookingFormData) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? 'Booking failed. Please try again.');
        return;
      }

      onSuccess(result.confirmationCode);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="font-display text-3xl tracking-wide mb-2">Your Details</h2>
      <p className="text-muted-foreground mb-6">Almost done — just fill in your info.</p>

      {/* Summary */}
      <div className="bg-[#1e293b] text-white rounded-lg p-4 mb-6 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div><span className="text-gray-400">Service</span><p className="font-medium">{booking.service?.name}</p></div>
          <div><span className="text-gray-400">Price</span><p className="font-medium text-[#6366f1]">{currency}{booking.service?.price.toFixed(2)}</p></div>
          <div><span className="text-gray-400">Date</span><p className="font-medium">{formatDate(booking.date)}</p></div>
          <div><span className="text-gray-400">Time</span><p className="font-medium">{formatTime(booking.timeSlot)}</p></div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('serviceId')} />
        <input type="hidden" {...register('date')} />
        <input type="hidden" {...register('timeSlot')} />

        <div>
          <Label htmlFor="customerName">Full Name *</Label>
          <Input id="customerName" {...register('customerName')} className="mt-1" placeholder="John Smith" />
          {errors.customerName && <p className="text-destructive text-xs mt-1">{errors.customerName.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input id="email" type="email" {...register('email')} className="mt-1" placeholder="john@example.com" />
          {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" {...register('phone')} className="mt-1" placeholder="+44 7700 900000" />
        </div>

        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            className="mt-1"
            placeholder="Any preferences or notes for Ozzy..."
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-[#6366f1] hover:bg-[#4f46e5] text-black font-semibold"
          >
            {submitting ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </div>
      </form>
    </div>
  );
}
