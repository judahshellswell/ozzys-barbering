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

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
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
            <Scissors className="h-5 w-5 text-[#c0392b]" />
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
              className="text-gray-500 hover:text-[#c0392b] transition-colors"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a
              href={businessConfig.contact.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-[#c0392b] transition-colors"
            >
              <FacebookIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Nav links */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigation</h4>
          <ul className="space-y-2">
            {businessConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm hover:text-[#c0392b] transition-colors">
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
              <MapPin className="h-4 w-4 text-[#c0392b] mt-0.5 shrink-0" />
              {businessConfig.contact.address}
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-[#c0392b] shrink-0" />
              <a href={`tel:${businessConfig.contact.phone}`} className="hover:text-[#c0392b] transition-colors">
                {businessConfig.contact.phone}
              </a>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-[#c0392b] shrink-0" />
              <a href={`mailto:${businessConfig.contact.email}`} className="hover:text-[#c0392b] transition-colors">
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
