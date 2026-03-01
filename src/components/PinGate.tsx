'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function PinGate({ children }: { children: React.ReactNode }) {
  const { isAuthed, loading, login } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAuthed) {
    return <>{children}</>;
  }

  const handleSubmit = async () => {
    setError(false);
    setChecking(true);
    const ok = await login(pin);
    setChecking(false);
    if (!ok) {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-xs">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Manny Tracker
        </h1>
        <p className="text-sm text-center text-gray-500 mb-8">
          Enter PIN to continue
        </p>
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && pin) handleSubmit();
          }}
          placeholder="PIN"
          autoFocus
          className={`w-full min-h-[52px] px-4 text-center text-2xl tracking-[0.3em] border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
        />
        {error && (
          <p className="text-sm text-red-600 text-center mt-2">Wrong PIN</p>
        )}
        <button
          onClick={handleSubmit}
          disabled={!pin || checking}
          className="w-full min-h-[52px] mt-4 bg-indigo-600 text-white text-base font-semibold rounded-xl transition-colors hover:bg-indigo-700 disabled:bg-indigo-300"
        >
          {checking ? 'Checking...' : 'Enter'}
        </button>
      </div>
    </div>
  );
}
