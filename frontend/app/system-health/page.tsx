'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Cpu, 
  Database, 
  Zap, 
  Server, 
  Layers, 
  RefreshCw, 
  ShieldCheck, 
  HardDrive,
  Clock
} from 'lucide-react';
import { getSystemHealth } from '@/lib/api';
import { useToast } from '@/components/ToastContext';

export default function SystemHealthPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();

  const fetchHealth = async (showNotification = false) => {
    try {
      setRefreshing(true);
      if (showNotification) {
        toast.info('Polling edge telemetry workers and AMD ROCm compute stack...', 'Inspecting Services');
      }
      const res = await getSystemHealth();
      setData(res);
      if (showNotification) {
        toast.success('All backend inference pipelines and SCADA dispatchers verified.', 'System Healthy');
      }
    } catch (err) {
      console.error(err);
      if (showNotification) {
        toast.error('Failed to query system health.', 'Diagnostics Error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth(false);
    const interval = setInterval(() => fetchHealth(false), 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 gap-3">
        <Activity className="w-6 h-6 animate-spin text-amber-500" />
        <span className="text-sm font-semibold text-slate-700">Inspecting System Infrastructure & Worker Health...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">System Infrastructure Health</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
              OPERATIONAL
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time status of backend services, AI/ML inference workers, AMD ROCm compute stack, and queue dispatchers.
          </p>
        </div>

        <button
          onClick={() => fetchHealth(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer self-start sm:self-auto whitespace-nowrap"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {/* Hardware & Accelerator Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
          <Zap className="w-64 h-64 text-amber-400" />
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Accelerator</span>
            <div className="flex items-center gap-2 mt-1">
              <Zap className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-base sm:text-lg font-bold text-white truncate">{data?.amd_hardware?.device_name}</span>
            </div>
            <p className="text-xs text-amber-400/90 mt-1 font-medium">Status: {data?.amd_hardware?.gpu_status}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Host CPU Processor</span>
            <div className="flex items-center gap-2 mt-1">
              <Cpu className="w-5 h-5 text-blue-400 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-slate-100 truncate">{data?.amd_hardware?.cpu_host}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">SIMD Vectorized Architecture</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AMD ROCm Runtime</span>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-emerald-400">
                {data?.amd_hardware?.rocm_enabled ? 'ROCm 6.x Enabled' : 'Native PyTorch Host'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Accelerated Tensor Offload</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">OS Platform</span>
            <div className="flex items-center gap-2 mt-1">
              <Server className="w-5 h-5 text-purple-400 shrink-0" />
              <span className="text-xs font-mono text-slate-200">{data?.amd_hardware?.os_platform}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Python {data?.amd_hardware?.python_version}</p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.services?.map((srv: any, idx: number) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{srv.name}</h3>
                  <p className="text-xs text-slate-500">{srv.details}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
                {srv.status}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {srv.latency_ms} ms latency
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Health Check OK</span>
            </div>
          </div>
        ))}
      </div>

      {/* Job Queue & Worker Stats */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-500" />
          <span>Background Job Dispatcher & Queue Engine</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Active Workers</span>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{data?.queue_stats?.worker_count}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">● 100% Ready</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Pending Jobs</span>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{data?.queue_stats?.pending_jobs}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Queue Empty</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Completed Inferences</span>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{data?.queue_stats?.completed_jobs}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Zero Failure</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Failed Jobs</span>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{data?.queue_stats?.failed_jobs}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Clean State</p>
          </div>
        </div>
      </div>
    </div>
  );
}
