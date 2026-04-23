export const dynamic = 'force-dynamic';

import { BookingWizard } from '@/components/booking/BookingWizard';
import { adminDb } from '@/lib/firebase-admin';
import type { Service } from '@/types';

async function getServices(): Promise<Service[]> {
  try {
    const db = adminDb();
    const snapshot = await db.collection('services').orderBy('order', 'asc').get();
    return (snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Service, 'id'>),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    })) as Service[]).filter((s) => s.active);
  } catch {
    return [];
  }
}

export default async function BookingPage() {
  const services = await getServices();

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
