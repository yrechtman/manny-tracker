'use client';

interface Props {
  loading: boolean;
  onClick: () => void;
}

export default function SubmitButton({ loading, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full min-h-[52px] bg-indigo-600 text-white text-base font-semibold rounded-xl transition-colors hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-300 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Saving...
        </span>
      ) : (
        'Log Entry'
      )}
    </button>
  );
}
