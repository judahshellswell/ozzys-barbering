import { adminDb } from '@/lib/firebase-admin';
import { ServiceGrid } from '@/components/services/ServiceGrid';
import { LinkButton } from '@/components/ui/link-button';
import type { Service } from '@/types';

async function getServices(): Promise<Service[]> {
  try {
    const db = adminDb();
    const snapshot = await db.collection('services').where('active', '==', true).orderBy('order', 'asc').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Service, 'id'>),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[#0f0f0f] text-white py-16 px-4 text-center">
        <h1 className="font-display text-6xl tracking-wide text-white">Our Services</h1>
        <p className="text-gray-400 mt-3 max-w-md mx-auto">
          From classic cuts to precision fades — every service is delivered with care.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <ServiceGrid services={services} />

        {services.length === 0 && (
          <p className="text-center text-muted-foreground py-16">Services coming soon.</p>
        )}

        <div className="text-center mt-12">
          <LinkButton
            href="/booking"
            className="bg-[#c0392b] hover:bg-[#a93226] text-black font-semibold px-8 py-6 text-lg border-transparent"
          >
            Book Now
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
