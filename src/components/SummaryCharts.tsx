'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

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

interface Props {
  data: DaySummary[];
}

const COLORS = {
  demandBarking: '#f59e0b',
  reactivity: '#ef4444',
};

export default function SummaryCharts({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No data yet. Start logging to see charts.
      </div>
    );
  }

  const shortDate = (d: string) => {
    const parts = d.split('-');
    return `${parts[1]}/${parts[2]}`;
  };

  const chartData = data.map((d) => ({
    ...d,
    label: shortDate(d.date),
  }));

  return (
    <div className="space-y-6">
      {/* Behavior Frequency Over Time */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Behavior Frequency</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="demandBarkingCount" stroke={COLORS.demandBarking} name="Barking" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="reactivityCount" stroke={COLORS.reactivity} name="Reactivity" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Medication & Behavior */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Medication & Behavior</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="demandBarkingCount" fill={COLORS.demandBarking} name="Barking" radius={[2, 2, 0, 0]} />
            <Bar dataKey="reactivityCount" fill={COLORS.reactivity} name="Reactivity" radius={[2, 2, 0, 0]} />
            <Bar dataKey="redZoneCount" fill="#991b1b" name="Red Zone" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap gap-2">
          {chartData.map((d) => (
            <div key={d.date} className="text-xs text-gray-500">
              {d.label}: {d.clonidine || 'no data'}
              {d.clomipramine && ' +clom'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
