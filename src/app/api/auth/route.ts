import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { pin } = await req.json();
  const valid = pin === process.env.APP_PIN;
  return NextResponse.json(
    { authenticated: valid },
    { status: valid ? 200 : 401 }
  );
}
