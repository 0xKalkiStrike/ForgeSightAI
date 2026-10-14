'use client';

import { useState, useEffect } from 'react';
import { FileText, UserCheck, Shield, Clock } from 'lucide-react';
import { getAuditLogs, AuditLog } from '@/lib/api';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    getAuditLogs().then(setLogs).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Plant Audit Trail & Operational Logs</h1>
        <p className="text-xs text-slate-500">Immutable record of operator actions, AI recommendations, and system state changes</p>
      </div>

      <div className="industrial-card overflow-hidden">
        {/* Mobile View (< md) */}
        <div className="divide-y divide-slate-100 md:hidden">
          {logs.map((log) => (
            <div key={log.id} className="p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{log.user_name}</span>
                <span className="font-mono text-[11px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px]">
                  {log.action}
                </span>
                {log.machine_id && (
                  <span className="font-mono text-slate-500 font-semibold">{log.machine_id}</span>
                )}
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">{log.details}</p>
            </div>
          ))}
        </div>

        {/* Desktop View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[650px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="p-4">Timestamp</th>
                <th className="p-4">User / Actor</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Machine ID</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono text-[11px] text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4 font-bold text-slate-900">{log.user_name}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 rounded border border-slate-200 text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 font-mono">{log.machine_id || 'N/A'}</td>
                  <td className="p-4 text-slate-600 max-w-md truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
