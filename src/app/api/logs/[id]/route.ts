import { NextRequest, NextResponse } from 'next/server';
import { deleteRowByUuid } from '@/lib/sheets';

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
