import { NextResponse } from 'next/server';
import { getRows } from '@/lib/sheets';
import { parseSheetRow } from '@/lib/utils';
import { SECTIONS } from '@/config/sections.config';

const SHEET_NAME = 'Raw Logs';

export async function GET() {
  try {
    const rows = await getRows(SHEET_NAME);
    if (rows.length < 2) {
      return NextResponse.json([]);
    }

    const headers = rows[0];
    const entries = rows.slice(1).map((row) => parseSheetRow(row, headers, SECTIONS));

    // Group by date and compute summaries
    const byDate: Record<string, typeof entries> = {};
    for (const entry of entries) {
      if (!byDate[entry.date]) byDate[entry.date] = [];
      byDate[entry.date].push(entry);
    }

    const summaries = Object.entries(byDate)
      .map(([date, dayEntries]) => {
        // Flatten intensity values (could be single value or array from merged entries)
        const flattenIntensity = (val: unknown): number[] => {
          if (Array.isArray(val)) return val.map(Number).filter((n) => !isNaN(n));
          const n = Number(val);
          return isNaN(n) ? [] : [n];
        };

        const demandBarkingIntensities = dayEntries
          .filter((e) => e.sections.demand_barking?.active)
          .flatMap((e) => flattenIntensity(e.sections.demand_barking.fields.intensity));

        const demandBarkingCount = demandBarkingIntensities.length;

        // Reactivity intensity could be a single string or merged — count incidents
        const reactivityEntries = dayEntries.filter(
          (e) => e.sections.reactivity?.active
        );
        const reactivityCount = reactivityEntries.length;

        const redZoneCount = reactivityEntries.filter(
          (e) => e.sections.reactivity.fields.intensity === 'Red'
        ).length;

        const medEntries = dayEntries.filter(
          (e) => e.sections.medication
        );
        const clomipramine = medEntries.some(
          (e) => e.sections.medication.fields.clomipramine_taken === true
        );
        const clonidine = medEntries
          .map((e) => e.sections.medication.fields.clonidine_dose as string)
          .filter(Boolean)
          .pop() || '';

        return {
          date,
          totalEntries: dayEntries.length,
          demandBarkingCount,
          avgDemandBarkingIntensity:
            demandBarkingIntensities.length > 0
              ? demandBarkingIntensities.reduce((a, b) => a + b, 0) /
                demandBarkingIntensities.length
              : null,
          reactivityCount,
          redZoneCount,
          clomipramine,
          clonidine,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(summaries);
  } catch (error) {
    console.error('Failed to generate summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
