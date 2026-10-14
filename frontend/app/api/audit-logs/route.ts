import { NextResponse } from 'next/server';
import { FALLBACK_AUDIT_LOGS } from '@/lib/api';

export async function GET() {
  return NextResponse.json(FALLBACK_AUDIT_LOGS);
}
