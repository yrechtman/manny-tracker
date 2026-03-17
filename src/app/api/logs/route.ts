import { NextRequest, NextResponse } from 'next/server';
import { appendRow, getRows, ensureHeaders, rewriteSheet } from '@/lib/sheets';
import { flattenLogEntry, getSheetHeaders, parseSheetRow } from '@/lib/utils';
import { LogEntry } from '@/lib/types';
import { SECTIONS } from '@/config/sections.config';

const SHEET_NAME = 'Raw Logs';

// One-time migration: re-parse all data with old headers, then rewrite with new config
async function migrateIfNeeded(newHeaders: string[]) {
  const rows = await getRows(SHEET_NAME);
  if (rows.length < 2) return; // no data to migrate

  const currentHeaders = rows[0];
  const headersMatch =
    currentHeaders.length === newHeaders.length &&
    newHeaders.every((h, i) => currentHeaders[i] === h);

  if (headersMatch) return; // already up to date

  // Parse all existing rows using the OLD headers (header-name-based lookup with aliases)
  const dataRows = rows.slice(1);
  const migratedRows: string[][] = [newHeaders];

  for (const row of dataRows) {
    const entry = parseSheetRow(row, currentHeaders, SECTIONS);
    // Ensure entryType has a value
    if (!entry.entryType) entry.entryType = 'Daily Log';
    migratedRows.push(flattenLogEntry(entry, SECTIONS));
  }

  await rewriteSheet(SHEET_NAME, migratedRows);
}

export async function POST(req: NextRequest) {
  try {
    const entry: LogEntry = await req.json();
    const headers = getSheetHeaders(SECTIONS);

    // Migrate old data format if needed (one-time)
    await migrateIfNeeded(headers);
    await ensureHeaders(SHEET_NAME, headers);

    const row = flattenLogEntry(entry, SECTIONS);
    await appendRow(SHEET_NAME, row);

    return NextResponse.json({ success: true, id: entry.id });
  } catch (error) {
    console.error('Failed to save log:', error);
    return NextResponse.json(
      { error: 'Failed to save log entry' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const logger = searchParams.get('logger');

    const rows = await getRows(SHEET_NAME);
    if (rows.length < 2) {
      return NextResponse.json([]);
    }

    const headers = rows[0];
    let entries = rows.slice(1).map((row) => parseSheetRow(row, headers, SECTIONS));

    if (from) {
      entries = entries.filter((e) => e.date >= from);
    }
    if (to) {
      entries = entries.filter((e) => e.date <= to);
    }
    if (logger) {
      entries = entries.filter((e) => e.logger === logger);
    }

    entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
