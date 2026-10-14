import { NextRequest, NextResponse } from 'next/server';
import { FALLBACK_MACHINES } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const machine = FALLBACK_MACHINES.find((m) => m.id.toLowerCase() === id.toLowerCase());

  if (!machine) {
    return NextResponse.json({ detail: `Machine ${id} not found` }, { status: 404 });
  }

  return NextResponse.json(machine);
}
