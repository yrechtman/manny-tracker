'use client';

import { FieldConfig } from '@/lib/types';

interface Props {
  config: FieldConfig;
  value: string[];
  onChange: (value: string[]) => void;
}

export default function MultiSelect({ config, value, onChange }: Props) {
  const options = config.options || [];

  const toggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">{config.label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              className={`min-h-[44px] px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-indigo-600 text-white'
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
