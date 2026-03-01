'use client';

import { FieldConfig } from '@/lib/types';

interface Props {
  config: FieldConfig;
  value: string;
  onChange: (value: string) => void;
}

export default function FreeText({ config, value, onChange }: Props) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">{config.label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={config.placeholder}
        rows={3}
        className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
      />
    </div>
  );
}
