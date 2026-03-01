'use client';

interface Props {
  value: 'Yoni' | 'Zoe';
  onChange: (value: 'Yoni' | 'Zoe') => void;
}

export default function LoggerSelector({ value, onChange }: Props) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Who is logging?</label>
      <div className="flex gap-2">
        {(['Yoni', 'Zoe'] as const).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            className={`flex-1 min-h-[44px] rounded-lg text-sm font-semibold transition-colors ${
              value === name
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
