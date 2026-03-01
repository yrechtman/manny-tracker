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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DaySummary {
  date: string;
  totalEntries: number;
  demandBarkingCount: number;
  avgDemandBarkingIntensity: number | null;
  reactivityCount: number;
  redZoneCount: number;
  settlingCount: number;
  noiseCount: number;
  goodMomentsCount: number;
  clomipramine: boolean;
  clonidine: string;
}

interface Props {
  data: DaySummary[];
}

const COLORS = {
  demandBarking: '#f59e0b',
  reactivity: '#ef4444',
  settling: '#8b5cf6',
  noise: '#6366f1',
  goodMoments: '#22c55e',
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

  // Trigger breakdown for pie chart
  // We'd need raw log data for this, so we'll show behavior type breakdown instead
  const behaviorTotals = [
    { name: 'Demand Barking', value: data.reduce((s, d) => s + d.demandBarkingCount, 0), color: COLORS.demandBarking },
    { name: 'Reactivity', value: data.reduce((s, d) => s + d.reactivityCount, 0), color: COLORS.reactivity },
    { name: 'Settling', value: data.reduce((s, d) => s + d.settlingCount, 0), color: COLORS.settling },
    { name: 'Noise', value: data.reduce((s, d) => s + d.noiseCount, 0), color: COLORS.noise },
  ].filter((b) => b.value > 0);

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
            <Line type="monotone" dataKey="settlingCount" stroke={COLORS.settling} name="Settling" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="noiseCount" stroke={COLORS.noise} name="Noise" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Good Moments Trend */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Good Moments</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="goodMomentsCount" fill={COLORS.goodMoments} name="Good Moments" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Medication Correlation */}
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

      {/* Behavior Type Breakdown */}
      {behaviorTotals.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Behavior Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={behaviorTotals}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {behaviorTotals.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
