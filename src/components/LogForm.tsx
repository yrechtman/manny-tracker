'use client';

import { useState, useRef, useEffect } from 'react';
import { SECTIONS } from '@/config/sections.config';
import { useLogger } from '@/hooks/useLogger';
import { useFormState } from '@/hooks/useFormState';
import { generateId, formatTimestamp, formatDate, formatTime } from '@/lib/utils';
import { LogEntry } from '@/lib/types';
import LoggerSelector from './LoggerSelector';
import FormSection from './FormSection';
import SubmitButton from './SubmitButton';
import SuccessToast from './SuccessToast';

export default function LogForm() {
  const { logger, setLogger } = useLogger();
  const { state, setGate, setField, reset, fillNormalDay } = useFormState(SECTIONS);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    time: string;
    entryId: string;
    merged: boolean;
    previousEntry: LogEntry | null;
  } | null>(null);
  const [normalDayFilled, setNormalDayFilled] = useState(false);
  const [todayHasEntry, setTodayHasEntry] = useState(false);
  const notesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = formatDate(new Date());
    fetch(`/api/logs?from=${today}&to=${today}&logger=${logger}`)
      .then((res) => res.json())
      .then((entries: LogEntry[]) => setTodayHasEntry(entries.length > 0))
      .catch(() => {});
  }, [logger]);

  const hasAtLeastOneSection = Object.values(state).some((s) => s.active);

  const handleNormalDay = () => {
    fillNormalDay();
    setNormalDayFilled(true);
    // Scroll to notes after a tick so state updates render
    setTimeout(() => {
      notesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleSubmit = async () => {
    if (!hasAtLeastOneSection) return;

    setSubmitting(true);
    const now = new Date();
    const entryId = generateId();

    const entry = {
      id: entryId,
      timestamp: formatTimestamp(now),
      date: formatDate(now),
      logger,
      entryType: 'Daily Log',
      sections: state,
    };

    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });

      if (!res.ok) throw new Error('Failed to save');

      const data = await res.json();
      setToast({
        time: formatTime(now),
        entryId: data.id,
        merged: data.merged ?? false,
        previousEntry: data.previousEntry ?? null,
      });
      setTodayHasEntry(true);
      reset();
      setNormalDayFilled(false);
    } catch {
      alert('Failed to save entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUndo = async () => {
    if (!toast) return;
    try {
      await fetch(`/api/logs/${toast.entryId}`, { method: 'DELETE' });
      if (toast.merged && toast.previousEntry) {
        // Restore the pre-merge entry
        await fetch('/api/logs?skipMerge=true', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toast.previousEntry),
        });
      } else {
        setTodayHasEntry(false);
      }
    } catch {
      // silent fail on undo
    }
    setToast(null);
  };

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Daily Log</h1>
        <LoggerSelector value={logger} onChange={setLogger} />

        {todayHasEntry && (
          <div className="mt-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            Updating today&apos;s log &mdash; new data will merge with your earlier entry
          </div>
        )}

        <button
          type="button"
          onClick={handleNormalDay}
          className={`w-full mt-3 py-3 px-4 rounded-xl text-base font-semibold transition-colors border-2 ${
            normalDayFilled
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'bg-indigo-50 border-indigo-200 text-indigo-700 active:bg-indigo-100'
          }`}
        >
          {normalDayFilled ? 'Normal routine filled — edit below or submit' : 'Normal Routine'}
        </button>
      </div>

      <div className="px-4 space-y-3">
        {SECTIONS.map((section) => (
          <div key={section.id} ref={section.id === 'notes' ? notesRef : undefined}>
            <FormSection
              config={section}
              active={state[section.id]?.active ?? false}
              fields={state[section.id]?.fields ?? {}}
              onGateChange={(active) => setGate(section.id, active)}
              onFieldChange={(fieldId, value) => setField(section.id, fieldId, value)}
            />
          </div>
        ))}
      </div>

      <div className="px-4 mt-6">
        <SubmitButton loading={submitting} onClick={handleSubmit} />
        {!hasAtLeastOneSection && (
          <p className="text-xs text-gray-400 text-center mt-2">
            Fill in at least one section to submit
          </p>
        )}
      </div>

      {toast && (
        <SuccessToast
          time={toast.time}
          merged={toast.merged}
          onUndo={handleUndo}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
