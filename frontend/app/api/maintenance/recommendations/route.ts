import { NextRequest, NextResponse } from 'next/server';
import { FALLBACK_RECOMMENDATIONS } from '@/lib/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const machineId = searchParams.get('machine_id');

  let recommendations = [...FALLBACK_RECOMMENDATIONS];

  if (machineId) {
    recommendations = recommendations.filter((r) => r.machine_id.toLowerCase() === machineId.toLowerCase());
  }

  return NextResponse.json(recommendations);
}
