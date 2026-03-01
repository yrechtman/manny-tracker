'use client';

import { FieldConfig } from '@/lib/types';

interface Props {
  config: FieldConfig;
  value: string;
  onChange: (value: string) => void;
}

export default function SingleSelect({ config, value, onChange }: Props) {
  const options = config.options || [];

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">{config.label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          const bgColor = isSelected && option.color ? option.color : undefined;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              style={bgColor ? { backgroundColor: bgColor } : undefined}
              className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? option.color
                    ? 'text-white'
                    : 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
