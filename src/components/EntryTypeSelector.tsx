'use client';

interface Props {
  value: 'Incident' | 'End of Day';
  onChange: (value: 'Incident' | 'End of Day') => void;
}

export default function EntryTypeSelector({ value, onChange }: Props) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Entry type</label>
      <div className="flex gap-2">
        {(['Incident', 'End of Day'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`flex-1 min-h-[44px] rounded-lg text-sm font-semibold transition-colors ${
              value === type
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}
