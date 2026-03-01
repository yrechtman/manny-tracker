'use client';

import { useState, useEffect } from 'react';

export function useLogger() {
  const [logger, setLoggerState] = useState<'Yoni' | 'Zoe'>('Yoni');

  useEffect(() => {
    const saved = localStorage.getItem('manny_logger');
    if (saved === 'Yoni' || saved === 'Zoe') setLoggerState(saved);
  }, []);

  const setLogger = (value: 'Yoni' | 'Zoe') => {
    localStorage.setItem('manny_logger', value);
    setLoggerState(value);
  };

  return { logger, setLogger };
}
