import { NextRequest, NextResponse } from 'next/server';
import { deleteRowByUuid, replaceRowByUuid, ensureHeaders } from '@/lib/sheets';
import { flattenLogEntry, getSheetHeaders } from '@/lib/utils';
import { LogEntry } from '@/lib/types';
import { SECTIONS } from '@/config/sections.config';

const SHEET_NAME = 'Raw Logs';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteRowByUuid(SHEET_NAME, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete log:', error);
    return NextResponse.json(
      { error: 'Failed to delete log entry' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entry: LogEntry = await req.json();
    entry.id = id;

    const headers = getSheetHeaders(SECTIONS);
    await ensureHeaders(SHEET_NAME, headers);

    const row = flattenLogEntry(entry, SECTIONS);
    await replaceRowByUuid(SHEET_NAME, id, row);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Failed to update log:', error);
    return NextResponse.json(
      { error: 'Failed to update log entry' },
      { status: 500 }
    );
  }
}
