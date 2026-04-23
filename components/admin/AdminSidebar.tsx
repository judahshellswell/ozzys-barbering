'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scissors, CalendarDays, Settings, Image, LayoutDashboard, LogOut } from 'lucide-react';
import { businessConfig } from '@/config/business.config';
import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

const links = [
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/admin/services', label: 'Services', icon: Settings },
  { href: '/admin/availability', label: 'Availability', icon: LayoutDashboard },
  { href: '/admin/gallery', label: 'Gallery', icon: Image },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/admin/login');
  }

  return (
    <aside className="w-56 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Scissors className="h-5 w-5 text-[#c0392b]" />
          <span className="font-display text-sm tracking-widest text-white">
            {businessConfig.name.split(' ')[0].toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-sidebar-foreground/50 mt-1">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              pathname.startsWith(href)
                ? 'bg-sidebar-accent text-[#c0392b]'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
