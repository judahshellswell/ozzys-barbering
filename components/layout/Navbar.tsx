'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { businessConfig } from '@/config/business.config';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Menu, X, Scissors } from 'lucide-react';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md border-b border-gray-100' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <Scissors className="h-5 w-5 text-[#6366f1]" />
            <span className="font-display text-xl tracking-widest text-[#1e293b] group-hover:text-[#6366f1] transition-colors">
              {businessConfig.name.toUpperCase()}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {businessConfig.nav.map((item) => {
              const highlighted = 'highlight' in item && item.highlight;
              return highlighted ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    buttonVariants({ size: 'sm' }),
                    'ml-4 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold border-transparent'
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                    pathname === item.href
                      ? 'text-[#6366f1]'
                      : 'text-slate-600 hover:text-[#1e293b]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            className="md:hidden p-2 text-slate-600 hover:text-[#1e293b]"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          {businessConfig.nav.map((item) => {
            const highlighted = 'highlight' in item && item.highlight;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  highlighted
                    ? 'bg-[#6366f1] text-white font-semibold text-center'
                    : pathname === item.href
                    ? 'text-[#6366f1]'
                    : 'text-slate-600 hover:text-[#1e293b]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
