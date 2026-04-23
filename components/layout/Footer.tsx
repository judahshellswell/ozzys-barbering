import Link from 'next/link';
import { businessConfig } from '@/config/business.config';
import { Scissors, Phone, Mail, MapPin } from 'lucide-react';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#0f0f0f] text-gray-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Scissors className="h-5 w-5 text-[#6366f1]" />
            <span className="font-display text-xl tracking-widest text-white">
              {businessConfig.name.toUpperCase()}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-gray-500">
            {businessConfig.tagline}
          </p>
          <div className="flex gap-3 mt-4">
            <a
              href={businessConfig.contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-[#6366f1] transition-colors"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a
              href={businessConfig.contact.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-[#6366f1] transition-colors"
            >
              <TikTokIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Nav links */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigation</h4>
          <ul className="space-y-2">
            {businessConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm hover:text-[#6366f1] transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-[#6366f1] mt-0.5 shrink-0" />
              {businessConfig.contact.address}
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-[#6366f1] shrink-0" />
              <a href={`tel:${businessConfig.contact.phone}`} className="hover:text-[#6366f1] transition-colors">
                {businessConfig.contact.phone}
              </a>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-[#6366f1] shrink-0" />
              <a href={`mailto:${businessConfig.contact.email}`} className="hover:text-[#6366f1] transition-colors">
                {businessConfig.contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#2a2a2a] py-4 text-center">
        <p className="text-xs text-gray-600">
          &copy; {new Date().getFullYear()} {businessConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
