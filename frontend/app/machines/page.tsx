'use client';

import { useState, useEffect } from 'react';
import { Search, Cpu, ArrowRight, Activity, Thermometer, Gauge, Zap } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { getMachines, Machine } from '@/lib/api';
import Link from 'next/link';

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchMachinesData = async () => {
    try {
      const data = await getMachines(statusFilter, search);
      setMachines(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachinesData();
  }, [statusFilter, search]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Machine Telemetry & Fleet Monitoring</h1>
          <p className="text-xs text-slate-500">Real-time status, health scores, and operational metrics</p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Machine ID, Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs overflow-x-auto">
            {['All', 'Healthy', 'Warning', 'Critical'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Card Grid (< md) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {machines.map((m) => (
          <Link
            key={m.id}
            href={`/machines/${m.id}`}
            className="industrial-card p-4 hover:border-slate-300 transition-all flex flex-col justify-between gap-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{m.id}</span>
                    <StatusBadge status={m.status} />
                  </div>
                  <span className="text-slate-600 text-xs block">{m.name}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Health</span>
                <div
                  className={`text-base font-bold ${
                    m.health_score >= 90
                      ? 'text-emerald-600'
                      : m.health_score >= 75
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                >
                  {m.health_score}/100
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
              <div className="bg-slate-50 p-1.5 rounded">
                <span className="text-[10px] text-slate-400 uppercase block">Vibration</span>
                <span className="font-bold text-slate-800">{m.current_vibration} mm/s</span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded">
                <span className="text-[10px] text-slate-400 uppercase block">Temp</span>
                <span className="font-bold text-slate-800">{m.current_temperature}°C</span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded">
                <span className="text-[10px] text-slate-400 uppercase block">Risk</span>
                <span
                  className={`font-bold ${
                    m.failure_probability >= 0.5 ? 'text-red-600' : 'text-slate-800'
                  }`}
                >
                  {Math.round(m.failure_probability * 100)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="text-[11px] truncate max-w-[200px]">{m.production_line}</span>
              <span className="font-bold text-amber-600 flex items-center gap-1">
                Monitor Diagnostics <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop / Tablet Table (>= md) */}
      <div className="hidden md:block industrial-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="p-4">Machine</th>
                <th className="p-4">Production Line</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Health Score</th>
                <th className="p-4 text-center">Failure Risk</th>
                <th className="p-4 text-center">Temp (°C)</th>
                <th className="p-4 text-center">Vibration (mm/s)</th>
                <th className="p-4 text-center">Pressure (PSI)</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {machines.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{m.id}</span>
                        <span className="text-slate-500 text-[11px]">{m.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-700">{m.production_line}</span>
                    <span className="text-[11px] text-slate-400 block">{m.location}</span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`font-bold ${
                        m.health_score >= 90
                          ? 'text-emerald-600'
                          : m.health_score >= 75
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    >
                      {m.health_score}/100
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`font-bold ${
                        m.failure_probability >= 0.5 ? 'text-red-600' : 'text-slate-700'
                      }`}
                    >
                      {Math.round(m.failure_probability * 100)}%
                    </span>
                  </td>
                  <td className="p-4 text-center font-mono">{m.current_temperature}</td>
                  <td className="p-4 text-center font-mono">{m.current_vibration}</td>
                  <td className="p-4 text-center font-mono">{m.current_pressure}</td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/machines/${m.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-all"
                    >
                      <span>Monitor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
