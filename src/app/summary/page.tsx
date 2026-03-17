'use client';

import { useState, useEffect } from 'react';
import SummaryCharts from '@/components/SummaryCharts';
import DataTable from '@/components/DataTable';
import AiInsights from '@/components/AiInsights';
import { LogEntry } from '@/lib/types';

type Tab = 'charts' | 'logs' | 'ai';

interface DaySummary {
  date: string;
  totalEntries: number;
  demandBarkingCount: number;
  avgDemandBarkingIntensity: number | null;
  reactivityCount: number;
  redZoneCount: number;
  clomipramine: boolean;
  clonidine: string;
}

export default function SummaryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('charts');
  const [summaryData, setSummaryData] = useState<DaySummary[]>([]);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [summaryRes, logsRes] = await Promise.all([
          fetch('/api/summary'),
          fetch('/api/logs'),
        ]);
        if (summaryRes.ok) setSummaryData(await summaryRes.json());
        if (logsRes.ok) setLogEntries(await logsRes.json());
      } catch {
        // silent fail, show empty state
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'charts', label: 'Charts' },
    { key: 'logs', label: 'Logs' },
    { key: 'ai', label: 'AI' },
  ];

  return (
    <div className="pb-4">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Summary</h1>

        {/* Sub-tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-h-[36px] rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {activeTab === 'charts' && <SummaryCharts data={summaryData} />}
            {activeTab === 'logs' && <DataTable entries={logEntries} />}
            {activeTab === 'ai' && <AiInsights />}
          </>
        )}
      </div>
    </div>
  );
}
