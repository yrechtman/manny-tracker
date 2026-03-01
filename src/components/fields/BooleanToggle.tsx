'use client';

import { FieldConfig } from '@/lib/types';

interface Props {
  config: FieldConfig;
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function BooleanToggle({ config, value, onChange }: Props) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">{config.label}</label>
      <div className="flex gap-2">
        {['Yes', 'No'].map((option) => {
          const isSelected = option === 'Yes' ? value : !value;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option === 'Yes')}
              className={`flex-1 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
