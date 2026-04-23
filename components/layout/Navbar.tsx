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
        scrolled ? 'bg-[#0f0f0f] shadow-lg' : 'bg-[#0f0f0f]/95'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Scissors className="h-5 w-5 text-[#c0392b]" />
            <span className="font-display text-xl tracking-widest text-white group-hover:text-[#c0392b] transition-colors">
              {businessConfig.name.toUpperCase()}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {businessConfig.nav.map((item) => {
              const highlighted = 'highlight' in item && item.highlight;
              return highlighted ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    buttonVariants({ size: 'sm' }),
                    'ml-4 bg-[#c0392b] hover:bg-[#a93226] text-black font-semibold border-transparent'
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
                      ? 'text-[#c0392b]'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#0f0f0f] border-t border-[#2a2a2a] px-4 py-4 space-y-1">
          {businessConfig.nav.map((item) => {
            const highlighted = 'highlight' in item && item.highlight;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  highlighted
                    ? 'bg-[#c0392b] text-black font-semibold text-center'
                    : pathname === item.href
                    ? 'text-[#c0392b]'
                    : 'text-gray-300 hover:text-white'
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
