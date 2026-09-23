export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    return NextResponse.json({ success: true, received: payload });
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}
