import { NextRequest, NextResponse } from 'next/server';
import { FALLBACK_ALERTS } from '@/lib/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const severity = searchParams.get('severity');

  let alerts = [...FALLBACK_ALERTS];

  if (status && status !== 'All') {
    alerts = alerts.filter((a) => a.status.toLowerCase() === status.toLowerCase());
  }
  if (severity && severity !== 'All') {
    alerts = alerts.filter((a) => a.severity.toLowerCase() === severity.toLowerCase());
  }

  return NextResponse.json(alerts);
}
