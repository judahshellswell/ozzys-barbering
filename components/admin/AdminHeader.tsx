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
    <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <h1 className="font-display text-2xl tracking-wide">{title}</h1>
      {user && (
        <span className="text-sm text-muted-foreground">{user.email}</span>
      )}
    </div>
  );
}
