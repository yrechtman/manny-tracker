'use client';

import { useState } from 'react';
import { SECTIONS } from '@/config/sections.config';
import { useLogger } from '@/hooks/useLogger';
import { useFormState } from '@/hooks/useFormState';
import { generateId, formatTimestamp, formatDate, formatTime } from '@/lib/utils';
import LoggerSelector from './LoggerSelector';
import EntryTypeSelector from './EntryTypeSelector';
import FormSection from './FormSection';
import SubmitButton from './SubmitButton';
import SuccessToast from './SuccessToast';

export default function LogForm() {
  const { logger, setLogger } = useLogger();
  const [entryType, setEntryType] = useState<'Incident' | 'End of Day'>('Incident');
  const { state, setGate, setField, reset } = useFormState(SECTIONS);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ time: string; entryId: string } | null>(null);

  const hasAtLeastOneSection = Object.values(state).some((s) => s.active);

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
      entryType,
      sections: state,
    };

    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });

      if (!res.ok) throw new Error('Failed to save');

      setToast({ time: formatTime(now), entryId });
      reset();
      setEntryType('Incident');
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
    } catch {
      // silent fail on undo
    }
    setToast(null);
  };

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Log Entry</h1>
        <LoggerSelector value={logger} onChange={setLogger} />
        <EntryTypeSelector value={entryType} onChange={setEntryType} />
      </div>

      <div className="px-4 space-y-3">
        {SECTIONS.map((section) => (
          <FormSection
            key={section.id}
            config={section}
            active={state[section.id]?.active ?? false}
            fields={state[section.id]?.fields ?? {}}
            onGateChange={(active) => setGate(section.id, active)}
            onFieldChange={(fieldId, value) => setField(section.id, fieldId, value)}
          />
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
          onUndo={handleUndo}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
