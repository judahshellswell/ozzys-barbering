export type BusinessType = 'barbershop' | 'salon' | 'cafe' | 'photography';

export const businessConfig = {
  name: "Ozzy's Barbering",
  tagline: "Sharp cuts. Clean fades. Every time.",
  businessType: 'barbershop' as BusinessType,
  logo: null,

  colors: {
    primary: '#0f0f0f',
    accent: '#6366f1',
    background: '#f9f6f1',
    surface: '#ffffff',
    text: '#0f0f0f',
    textMuted: '#6b6b6b',
    border: '#e5e0d8',
  },

  fonts: {
    display: 'Bebas Neue',
    body: 'Inter',
  },

  contact: {
    phone: '+44 7797851386',
    email: 'ozzy.stewartsunley@gmail.com',
    instagram: 'https://www.instagram.com/0zzy_s_sunley/',
    tiktok: 'https://www.tiktok.com/@0_sunley',
  },

  nav: [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Contact', href: '/contact' },
    { label: 'Book Now', href: '/booking', highlight: true },
  ],

  booking: {
    slotIntervalMinutes: 30,
    advanceBookingDays: 30,
    cancellationPolicyHours: 24,
    currency: '£',
  },

  seo: {
    title: "Ozzy's Barbering | Sharp Cuts in Jersey",
    description: "Book your next haircut with Ozzy. Professional fades, cuts, and beard trims. Reserve your slot online.",
    ogImage: '/og-image.jpg',
  },
} as const;
