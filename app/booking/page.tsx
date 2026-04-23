'use client';

import { useEffect, useState } from 'react';
import { BookingWizard } from '@/components/booking/BookingWizard';
import type { Service } from '@/types';

export default function BookingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="text-center mb-6 px-4">
        <h1 className="font-display text-5xl tracking-wide">Book an Appointment</h1>
        <p className="text-muted-foreground mt-2">Select a service, pick a date and time, and you&apos;re all set.</p>
      </div>
      <BookingWizard services={services} />
    </div>
  );
}
