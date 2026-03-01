'use client';

import { useState } from 'react';

export default function AiInsights() {
  const [dateRange, setDateRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [customQuestion, setCustomQuestion] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRange,
          customQuestion: customQuestion.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Analysis failed');
        if (data.queriesRemainingToday !== undefined) {
          setRemaining(data.queriesRemainingToday);
        }
        return;
      }

      setAnalysis(data.analysis);
      setRemaining(data.queriesRemainingToday);
    } catch {
      setError('Failed to connect to AI service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">AI Insights</h3>

      {/* Date Range */}
      <div className="flex gap-2 mb-3">
        {(['7d', '14d', '30d'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`flex-1 min-h-[36px] rounded-lg text-xs font-medium transition-colors ${
              dateRange === range
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {range === '7d' ? '7 days' : range === '14d' ? '14 days' : '30 days'}
          </button>
        ))}
      </div>

      {/* Custom Question */}
      <textarea
        value={customQuestion}
        onChange={(e) => setCustomQuestion(e.target.value)}
        placeholder="Ask a specific question (optional)... e.g., 'Is demand barking worse on days with increased clonidine?'"
        rows={2}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none mb-3"
      />

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full min-h-[44px] bg-indigo-600 text-white text-sm font-semibold rounded-lg transition-colors hover:bg-indigo-700 disabled:bg-indigo-300"
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {remaining !== null && (
        <p className="text-xs text-gray-400 text-center mt-2">
          {remaining} queries remaining today
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Analysis Result */}
      {analysis && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
            {analysis}
          </div>
        </div>
      )}
    </div>
  );
}
