'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, Clock, Filter, AlertTriangle } from 'lucide-react';
import { getAlerts, updateAlertStatus, Alert } from '@/lib/api';
import { useToast } from '@/components/ToastContext';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchAlertsData = async () => {
    try {
      const data = await getAlerts(statusFilter);
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
  }, [statusFilter]);

  const handleStatusChange = async (alertId: string, newStatus: string) => {
    try {
      await updateAlertStatus(alertId, newStatus);
      toast.success(`Alert ${alertId} status updated to ${newStatus}.`, 'Status Updated');
      fetchAlertsData();
    } catch (err) {
      toast.error('Failed to update alert status.', 'Error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Industrial Alert Center</h1>
          <p className="text-xs text-slate-500">Real-time telemetry anomalies, failure risks, and operator acknowledgments</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs overflow-x-auto max-w-full">
          {['All', 'New', 'Acknowledged', 'Investigating', 'Resolved'].map((st) => (
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

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="industrial-card p-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            No active alerts matching filter.
          </div>
        ) : (
          alerts.map((alt) => (
            <div 
              key={alt.id}
              className={`industrial-card p-4 sm:p-5 border-l-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                alt.status === 'Resolved' ? 'border-l-emerald-500' :
                alt.severity === 'Critical' ? 'border-l-red-600' : 'border-l-amber-500'
              }`}
            >
              <div className="space-y-1.5 max-w-2xl min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-900">{alt.id}</span>
                  <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {alt.machine_id}
                  </span>
                  <span className={`px-2 py-0.5 font-bold rounded-xs text-[10px] ${
                    alt.severity === 'Critical' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {alt.severity}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{new Date(alt.timestamp).toLocaleTimeString()}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{alt.alert_type}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{alt.ai_explanation}</p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                  <span>Current: <strong>{alt.current_value}</strong></span>
                  <span>Expected: <strong>{alt.expected_range}</strong></span>
                  <span>Failure Prob: <strong className="text-red-600">{Math.round(alt.failure_probability * 100)}%</strong></span>
                </div>
              </div>

              {/* Operator Status Actions */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  alt.status === 'New' ? 'bg-red-50 text-red-700 border-red-200' :
                  alt.status === 'Acknowledged' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  alt.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {alt.status}
                </span>

                <div className="flex items-center gap-2">
                  {alt.status === 'New' && (
                    <button
                      onClick={() => handleStatusChange(alt.id, 'Acknowledged')}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg cursor-pointer transition-all shadow-xs"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alt.status !== 'Resolved' && (
                    <button
                      onClick={() => handleStatusChange(alt.id, 'Resolved')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-all shadow-xs"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
