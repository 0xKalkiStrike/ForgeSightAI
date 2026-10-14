import { NextResponse } from 'next/server';
import { FALLBACK_SUMMARY } from '@/lib/api';

export async function GET() {
  return NextResponse.json(FALLBACK_SUMMARY);
}
