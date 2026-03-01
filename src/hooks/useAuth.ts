'use client';

import { useState, useEffect, useCallback } from 'react';

export function useAuth() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsAuthed(sessionStorage.getItem('manny_auth') === 'true');
    setLoading(false);
  }, []);

  const login = useCallback(async (pin: string): Promise<boolean> => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const { authenticated } = await res.json();
    if (authenticated) {
      sessionStorage.setItem('manny_auth', 'true');
      setIsAuthed(true);
    }
    return authenticated;
  }, []);

  return { isAuthed, loading, login };
}
