import { NextRequest, NextResponse } from 'next/server';
import { FALLBACK_PREDICTIONS } from '@/lib/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const machineId = searchParams.get('machine_id');

  let predictions = [...FALLBACK_PREDICTIONS];

  if (machineId) {
    predictions = predictions.filter((p) => p.machine_id.toLowerCase() === machineId.toLowerCase());
  }

  return NextResponse.json(predictions);
}
