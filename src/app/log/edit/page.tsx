'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { LogEntry } from '@/lib/types';
import LogForm from '@/components/LogForm';

function EditLogContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [entry, setEntry] = useState<LogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError(true);
      return;
    }

    fetch('/api/logs')
      .then((res) => res.json())
      .then((entries: LogEntry[]) => {
        const found = entries.find((e) => e.id === id);
        if (found) {
          setEntry(found);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        Entry not found.
      </div>
    );
  }

  return <LogForm editEntry={entry} />;
}

export default function EditLogPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <EditLogContent />
    </Suspense>
  );
}
