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
        const demandBarkingCount = dayEntries.filter(
          (e) => e.sections.demand_barking?.active
        ).length;

        const demandBarkingIntensities = dayEntries
          .filter((e) => e.sections.demand_barking?.active)
          .map((e) => Number(e.sections.demand_barking.fields.intensity))
          .filter((n) => !isNaN(n));

        const reactivityCount = dayEntries.filter(
          (e) => e.sections.reactivity?.active
        ).length;

        const redZoneCount = dayEntries.filter(
          (e) =>
            e.sections.reactivity?.active &&
            e.sections.reactivity.fields.intensity === 'Red'
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
