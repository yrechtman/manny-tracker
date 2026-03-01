import { NextRequest, NextResponse } from 'next/server';
import { appendRow, getRows, ensureHeaders } from '@/lib/sheets';
import { flattenLogEntry, getSheetHeaders, parseSheetRow } from '@/lib/utils';
import { LogEntry } from '@/lib/types';
import { SECTIONS } from '@/config/sections.config';

const SHEET_NAME = 'Raw Logs';

export async function POST(req: NextRequest) {
  try {
    const entry: LogEntry = await req.json();
    const headers = getSheetHeaders(SECTIONS);

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
