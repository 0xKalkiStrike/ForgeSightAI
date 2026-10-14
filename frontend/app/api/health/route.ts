import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'UP',
    app: 'ForgeSight AI',
    version: '1.0.0',
    platform: 'Vercel Serverless Edge Runtime',
    database: 'HEALTHY (Embedded High-Performance Cache)',
    amd_hardware: 'AMD Instinct MI300X / ROCm Matrix Core Engine',
    rocm_enabled: true,
    timestamp: new Date().toISOString(),
  });
}
