import Link from 'next/link';
import { LinkButton } from '@/components/ui/link-button';
import { ServiceGrid } from '@/components/services/ServiceGrid';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { businessConfig } from '@/config/business.config';
import { adminDb } from '@/lib/firebase-admin';
import { Scissors, Star, Clock, CheckCircle } from 'lucide-react';
import type { Service, GalleryImage } from '@/types';

async function getData() {
  try {
    const db = adminDb();
    const [servicesSnap, gallerySnap] = await Promise.all([
      db.collection('services').orderBy('order', 'asc').limit(4).get(),
      db.collection('galleryImages').orderBy('order', 'asc').limit(6).get(),
    ]);

    const services = (servicesSnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Service, 'id'>),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    })) as Service[]).filter((s) => s.active);

    const gallery: GalleryImage[] = gallerySnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<GalleryImage, 'id'>),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    }));

    return { services, gallery };
  } catch {
    return { services: [], gallery: [] };
  }
}

export default async function HomePage() {
  const { services, gallery } = await getData();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-[#1e293b] text-white min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #6366f1 0, #6366f1 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px w-8 bg-[#6366f1]" />
              <span className="text-[#6366f1] text-sm font-medium uppercase tracking-widest">
                Professional Barbering
              </span>
            </div>
            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl leading-none mb-6">
              {businessConfig.name.split(' ')[0]}
              <span className="text-[#6366f1]">&apos;s</span>
              <br />
              <span className="text-gray-300">Barbering</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-md leading-relaxed">
              {businessConfig.tagline} Based in Jersey — walk-ins welcome or book your slot online.
            </p>
            <div className="flex flex-wrap gap-4">
              <LinkButton
                href="/booking"
                className="bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold px-8 py-6 text-base rounded-md border-transparent"
              >
                Book Now
              </LinkButton>
              <LinkButton
                href="/services"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white px-8 py-6 text-base rounded-md"
              >
                View Services
              </LinkButton>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:grid grid-cols-2 gap-4">
            {[
              { icon: Scissors, label: 'Expert Cuts', value: 'Premium' },
              { icon: Star, label: 'Satisfaction', value: '5-Star' },
              { icon: Clock, label: 'Quick Booking', value: 'Online' },
              { icon: CheckCircle, label: 'No Hidden Fees', value: 'Transparent' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
                <Icon className="h-7 w-7 text-[#6366f1] mb-3" />
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-gray-400 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Services Preview */}
      {services.length > 0 && (
        <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-5xl tracking-wide">Services</h2>
              <p className="text-muted-foreground mt-1">What we do best.</p>
            </div>
            <Link href="/services" className="text-sm text-[#6366f1] hover:underline font-medium">
              View all →
            </Link>
          </div>
          <ServiceGrid services={services} />
          <div className="text-center mt-8">
            <LinkButton
              href="/booking"
              className="bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold px-8 border-transparent"
            >
              Book an Appointment
            </LinkButton>
          </div>
        </section>
      )}

      {/* Why choose us */}
      <section className="bg-[#1e293b] text-white py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-5xl tracking-wide text-center mb-12">Why Choose Ozzy?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: '✂️', title: 'Precision Every Time', body: 'Years of experience delivering clean fades, sharp lines, and classic cuts.' },
              { icon: '📱', title: 'Easy Online Booking', body: 'Book your slot in minutes — no phone calls, no waiting around.' },
              { icon: '💈', title: 'Traditional Barbering', body: 'Classic techniques, modern style. The barbershop experience you deserve.' },
            ].map(({ icon, title, body }) => (
              <div key={title} className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-display text-2xl tracking-wide mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      {gallery.length > 0 && (
        <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-5xl tracking-wide">Fresh Cuts</h2>
              <p className="text-muted-foreground mt-1">Recent work from the chair.</p>
            </div>
            <Link href="/gallery" className="text-sm text-[#6366f1] hover:underline font-medium">
              Full gallery →
            </Link>
          </div>
          <GalleryGrid images={gallery} />
        </section>
      )}

      {/* Final CTA */}
      <section className="bg-[#6366f1] py-16 px-4 text-center">
        <h2 className="font-display text-5xl tracking-wide text-white mb-3">Ready for a Fresh Cut?</h2>
        <p className="text-white/80 mb-8 text-lg">
          Book your appointment online in seconds. Walk-ins also welcome.
        </p>
        <LinkButton
          href="/booking"
          className="bg-white hover:bg-gray-100 text-[#6366f1] font-semibold px-10 py-6 text-base rounded-md border-transparent"
        >
          Book Now →
        </LinkButton>
      </section>
    </div>
  );
}
