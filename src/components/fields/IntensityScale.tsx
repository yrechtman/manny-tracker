'use client';

import { FieldConfig } from '@/lib/types';

interface Props {
  config: FieldConfig;
  value: number | null;
  onChange: (value: number) => void;
}

export default function IntensityScale({ config, value, onChange }: Props) {
  const max = config.scaleMax || 3;
  const labels = config.scaleLabels || [];

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">{config.label}</label>
      <div className="flex flex-col gap-2">
        {Array.from({ length: max }, (_, i) => i + 1).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={`min-h-[44px] px-4 py-2 rounded-lg text-left text-sm font-medium transition-colors ${
              value === level
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {labels[level - 1] || `${level}`}
          </button>
        ))}
      </div>
    </div>
  );
}
