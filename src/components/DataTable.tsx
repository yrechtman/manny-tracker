'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogEntry } from '@/lib/types';
import { SECTIONS } from '@/config/sections.config';

interface Props {
  entries: LogEntry[];
}

export default function DataTable({ entries }: Props) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterLogger, setFilterLogger] = useState<string>('all');

  const filtered = entries.filter((e) => {
    if (filterLogger !== 'all' && e.logger !== filterLogger) return false;
    return true;
  });

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No entries yet.
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['all', 'Yoni', 'Zoe'].map((opt) => (
          <button
            key={opt}
            onClick={() => setFilterLogger(opt)}
            className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterLogger === opt
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {opt === 'all' ? 'All' : opt}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {filtered.map((entry) => {
          const isExpanded = expandedId === entry.id;
          const activeSections = SECTIONS.filter(
            (s) => entry.sections[s.id]?.active
          );

          return (
            <div
              key={entry.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                className="w-full px-4 py-3 text-left flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(entry.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {entry.logger} · {entry.entryType}
                    {activeSections.length > 0 &&
                      ` · ${activeSections.map((s) => s.name).join(', ')}`}
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-4 pb-3 border-t border-gray-100">
                  <div className="mt-3 mb-2 flex justify-end">
                    <button
                      onClick={() => router.push(`/log/edit?id=${entry.id}`)}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                  {SECTIONS.map((section) => {
                    const data = entry.sections[section.id];
                    if (!data?.active && section.hasGate) return null;

                    const hasContent = Object.values(data?.fields || {}).some(
                      (v) =>
                        v !== '' &&
                        v !== false &&
                        v !== null &&
                        !(Array.isArray(v) && v.length === 0)
                    );
                    if (!hasContent) return null;

                    return (
                      <div key={section.id} className="mt-3">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          {section.name}
                        </div>
                        {section.fields.map((field) => {
                          const val = data?.fields[field.id];
                          if (
                            val === '' ||
                            val === false ||
                            val === null ||
                            val === undefined ||
                            (Array.isArray(val) && val.length === 0)
                          )
                            return null;

                          let display: string;
                          if (Array.isArray(val)) {
                            const labels = val.map((v) => {
                              const opt = field.options?.find((o) => o.value === v);
                              return opt?.label || v;
                            });
                            display = labels.join(', ');
                          } else if (typeof val === 'boolean') {
                            display = val ? 'Yes' : 'No';
                          } else if (field.type === 'intensity_scale' && field.scaleLabels) {
                            display = field.scaleLabels[Number(val) - 1] || String(val);
                          } else if (field.options) {
                            const opt = field.options.find((o) => o.value === val);
                            display = opt?.label || String(val);
                          } else {
                            display = String(val);
                          }

                          return (
                            <div key={field.id} className="text-xs text-gray-700 ml-2 mb-0.5">
                              <span className="text-gray-500">{field.label}:</span>{' '}
                              {display}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
