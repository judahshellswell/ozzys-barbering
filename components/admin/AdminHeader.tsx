'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';

interface AdminHeaderProps {
  title: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return unsub;
  }, []);

  return (
    <div className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
      <h1 className="font-display text-xl sm:text-2xl tracking-wide">{title}</h1>
      {user && (
        <span className="text-xs sm:text-sm text-muted-foreground truncate max-w-[160px] sm:max-w-none">{user.email}</span>
      )}
    </div>
  );
}
