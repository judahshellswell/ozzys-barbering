'use client';

import { useState } from 'react';
import { ServiceSelector } from './ServiceSelector';
import { DatePickerStep } from './DatePickerStep';
import { TimeSlotPicker } from './TimeSlotPicker';
import { CustomerDetailsForm } from './CustomerDetailsForm';
import { BookingConfirmationCard } from './BookingConfirmationCard';
import type { Service } from '@/types';
import { businessConfig } from '@/config/business.config';

export type WizardStep = 'service' | 'date' | 'time' | 'details' | 'confirmed';

export interface BookingState {
  service: Service | null;
  date: string;
  timeSlot: string;
  customerName: string;
  email: string;
  phone: string;
  notes: string;
  confirmationCode: string;
}

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'service', label: 'Service' },
  { key: 'date', label: 'Date' },
  { key: 'time', label: 'Time' },
  { key: 'details', label: 'Details' },
];

export function BookingWizard({ services }: { services: Service[] }) {
  const [step, setStep] = useState<WizardStep>('service');
  const [booking, setBooking] = useState<BookingState>({
    service: null,
    date: '',
    timeSlot: '',
    customerName: '',
    email: '',
    phone: '',
    notes: '',
    confirmationCode: '',
  });

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Step indicator */}
      {step !== 'confirmed' && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    i < currentStepIndex
                      ? 'bg-[#6366f1] text-white'
                      : i === currentStepIndex
                      ? 'bg-[#1e293b] text-white ring-2 ring-[#6366f1]'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i < currentStepIndex ? '✓' : i + 1}
                </div>
                <span
                  className={`text-sm hidden sm:inline ${
                    i === currentStepIndex ? 'font-semibold' : 'text-muted-foreground'
                  }`}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-6 sm:w-12 ${i < currentStepIndex ? 'bg-[#6366f1]' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Summary chips */}
          {booking.service && (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-[#1e293b] text-[#6366f1] px-3 py-1 rounded-full">
                {booking.service.name}
              </span>
              {booking.date && (
                <span className="bg-muted px-3 py-1 rounded-full text-muted-foreground">
                  {new Date(booking.date + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              )}
              {booking.timeSlot && (
                <span className="bg-muted px-3 py-1 rounded-full text-muted-foreground">
                  {booking.timeSlot}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step content */}
      {step === 'service' && (
        <ServiceSelector
          services={services}
          selectedId={booking.service?.id}
          onSelect={(service) => {
            setBooking((b) => ({ ...b, service, date: '', timeSlot: '' }));
            setStep('date');
          }}
        />
      )}

      {step === 'date' && booking.service && (
        <DatePickerStep
          advanceBookingDays={businessConfig.booking.advanceBookingDays}
          onSelect={(date) => {
            setBooking((b) => ({ ...b, date, timeSlot: '' }));
            setStep('time');
          }}
          onBack={() => setStep('service')}
        />
      )}

      {step === 'time' && booking.service && booking.date && (
        <TimeSlotPicker
          serviceId={booking.service.id}
          date={booking.date}
          onSelect={(timeSlot) => {
            setBooking((b) => ({ ...b, timeSlot }));
            setStep('details');
          }}
          onBack={() => setStep('date')}
        />
      )}

      {step === 'details' && booking.service && booking.date && booking.timeSlot && (
        <CustomerDetailsForm
          booking={booking}
          onSuccess={(code) => {
            setBooking((b) => ({ ...b, confirmationCode: code }));
            setStep('confirmed');
          }}
          onBack={() => setStep('time')}
        />
      )}

      {step === 'confirmed' && (
        <BookingConfirmationCard booking={booking} />
      )}
    </div>
  );
}
