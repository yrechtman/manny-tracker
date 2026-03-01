import { NextRequest, NextResponse } from 'next/server';
import { getRows } from '@/lib/sheets';
import { parseSheetRow } from '@/lib/utils';
import { analyzeData } from '@/lib/claude';
import { SECTIONS } from '@/config/sections.config';

const SHEET_NAME = 'Raw Logs';
const MAX_QUERIES_PER_DAY = 10;

// Simple in-memory rate limiter (resets on server restart, fine for 2 users)
const queryCount: Record<string, number> = {};

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function checkRateLimit(): { allowed: boolean; remaining: number } {
  const today = getToday();
  const count = queryCount[today] || 0;
  if (count >= MAX_QUERIES_PER_DAY) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: MAX_QUERIES_PER_DAY - count - 1 };
}

function incrementRateLimit() {
  const today = getToday();
  queryCount[today] = (queryCount[today] || 0) + 1;

  // Clean up old days
  for (const key of Object.keys(queryCount)) {
    if (key !== today) delete queryCount[key];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { dateRange, customQuestion } = await req.json();

    const { allowed, remaining } = checkRateLimit();
    if (!allowed) {
      return NextResponse.json(
        { error: 'Daily AI query limit reached (10/day)', queriesRemainingToday: 0 },
        { status: 429 }
      );
    }

    // Calculate date range
    const now = new Date();
    const days = dateRange === '7d' ? 7 : dateRange === '14d' ? 14 : 30;
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const fromStr = from.toISOString().split('T')[0];

    // Fetch logs
    const rows = await getRows(SHEET_NAME);
    if (rows.length < 2) {
      return NextResponse.json({
        analysis: 'No data available for the selected period.',
        queriesRemainingToday: remaining,
      });
    }

    const headers = rows[0];
    const entries = rows
      .slice(1)
      .map((row) => parseSheetRow(row, headers, SECTIONS))
      .filter((e) => e.date >= fromStr);

    if (entries.length === 0) {
      return NextResponse.json({
        analysis: 'No entries found for the selected period.',
        queriesRemainingToday: remaining,
      });
    }

    incrementRateLimit();

    const rangeLabel = `${days} days`;
    const analysis = await analyzeData(entries, rangeLabel, customQuestion);

    return NextResponse.json({
      analysis,
      queriesRemainingToday: remaining,
    });
  } catch (error) {
    console.error('AI analysis failed:', error);
    return NextResponse.json(
      { error: 'AI analysis failed' },
      { status: 500 }
    );
  }
}
