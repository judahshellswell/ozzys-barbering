import { LinkButton } from '@/components/ui/link-button';
import { CheckCircle2, CalendarCheck, Scissors } from 'lucide-react';
import { businessConfig } from '@/config/business.config';
import { formatDate, formatTime } from '@/lib/booking-utils';
import type { BookingState } from './BookingWizard';

export function BookingConfirmationCard({ booking }: { booking: BookingState }) {
  const { currency } = businessConfig.booking;

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#6366f1]/10 mb-6">
        <CheckCircle2 className="h-10 w-10 text-[#6366f1]" />
      </div>

      <h2 className="font-display text-4xl tracking-wide mb-2">You&apos;re Booked!</h2>
      <p className="text-muted-foreground mb-8">
        A confirmation has been sent to <strong>{booking.email}</strong>
      </p>

      {/* Confirmation code */}
      <div className="bg-[#1e293b] text-white rounded-xl p-6 mb-6 inline-block w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Scissors className="h-4 w-4 text-[#6366f1]" />
          <span className="text-xs text-gray-400 uppercase tracking-widest">Confirmation Code</span>
        </div>
        <p className="text-3xl font-bold tracking-widest text-[#6366f1]">
          {booking.confirmationCode}
        </p>
      </div>

      {/* Appointment details */}
      <div className="bg-muted rounded-xl p-5 text-left mb-6 space-y-3">
        <div className="flex items-center gap-3">
          <CalendarCheck className="h-5 w-5 text-[#6366f1] shrink-0" />
          <div>
            <p className="font-semibold text-sm">{booking.service?.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(booking.date)} at {formatTime(booking.timeSlot)}
            </p>
          </div>
        </div>
        <div className="pt-2 border-t border-border flex justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-bold text-[#6366f1] text-base">
            {booking.service
              ? typeof booking.service.price === 'string'
                ? `${currency}${booking.service.price.split('-').join(` – ${currency}`)}`
                : `${currency}${Number(booking.service.price).toFixed(2)}`
              : ''}
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-6">
        Need to cancel? Contact us at least {businessConfig.booking.cancellationPolicyHours} hours before your appointment.
        <br />
        {businessConfig.contact.phone} · {businessConfig.contact.email}
      </p>

      <LinkButton
        href="/"
        className="bg-[#6366f1] hover:bg-[#4f46e5] text-white border-transparent"
      >
        Back to Home
      </LinkButton>
    </div>
  );
}
