import { NextRequest, NextResponse } from 'next/server';
import { FALLBACK_MACHINES } from '@/lib/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const line = searchParams.get('line');

  let machines = [...FALLBACK_MACHINES];

  if (status && status !== 'All') {
    machines = machines.filter((m) => m.status.toLowerCase() === status.toLowerCase());
  }
  if (line) {
    machines = machines.filter((m) => m.production_line.toLowerCase().includes(line.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    machines = machines.filter(
      (m) =>
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q)
    );
  }

  return NextResponse.json(machines);
}
