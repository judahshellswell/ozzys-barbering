'use client';

import { useEffect, useState } from 'react';
import { auth } from './firebase';

export function useAdminToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    return auth.onAuthStateChanged(async (user) => {
      if (user) {
        const t = await user.getIdToken();
        setToken(t);
      } else {
        setToken(null);
      }
    });
  }, []);

  async function getToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    return user.getIdToken(true);
  }

  return { token, getToken };
}

export function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}
