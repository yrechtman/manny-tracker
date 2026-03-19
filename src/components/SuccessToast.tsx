'use client';

import { useEffect, useState } from 'react';

interface Props {
  time: string;
  merged?: boolean;
  onUndo: () => void;
  onDismiss: () => void;
}

export default function SuccessToast({ time, merged, onUndo, onDismiss }: Props) {
  const [remaining, setRemaining] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-gray-900 text-white rounded-xl px-4 py-3 flex items-center justify-between shadow-lg">
        <span className="text-sm">{merged ? 'Updated' : 'Logged'} at {time}</span>
        <button
          onClick={onUndo}
          className="min-h-[36px] px-3 py-1 bg-white text-gray-900 text-sm font-medium rounded-lg"
        >
          Undo ({remaining}s)
        </button>
      </div>
      <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-1000 ease-linear"
          style={{ width: `${(remaining / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}
