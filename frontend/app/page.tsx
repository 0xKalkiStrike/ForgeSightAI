'use client';

import { useState, useEffect } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  Info,
  Play,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import KpiCard from '@/components/KpiCard';
import StatusBadge from '@/components/StatusBadge';
import HealthScoreModal from '@/components/HealthScoreModal';
import { 
  getAnalyticsSummary, 
  getMachines, 
  getAlerts, 
  updateAlertStatus,
  triggerSimulationFailure,
  resetSimulation,
  AnalyticsSummary, 
  Machine, 
  Alert 
} from '@/lib/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import Link from 'next/link';
import { useToast } from '@/components/ToastContext';

export default function DashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const toast = useToast();

  const fetchData = async () => {
    try {
      const [sumData, machData, alertData] = await Promise.all([
        getAnalyticsSummary(),
        getMachines(),
        getAlerts('New')
      ]);
      setSummary(sumData);
      setMachines(machData);
      setAlerts(alertData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Real telemetry polling
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await updateAlertStatus(alertId, 'Acknowledged');
      toast.success(`Alert ${alertId} acknowledged by operator.`, 'Alert Handled');
      fetchData();
    } catch (err) {
      toast.error('Failed to acknowledge alert.', 'Error');
    }
  };

  const filteredMachines = statusFilter === 'All' 
    ? machines 
    : machines.filter(m => m.status === statusFilter);

  // Generate dynamic trend series from current real machine telemetry values
  const dynamicTrendData = machines.map((m, idx) => ({
    time: `M-${idx + 101}`,
    health: m.health_score,
    risk: Math.round(m.failure_probability * 100),
    downtime: m.status === 'Critical' ? 2.5 : m.status === 'Warning' ? 1.0 : 0.0,
    energy: Math.round(m.current_energy * 10)
  }));

  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 gap-3">
        <Activity className="w-6 h-6 animate-spin text-amber-500" />
        <span className="text-sm font-semibold text-slate-700">Connecting to Plant Telemetry Infrastructure...</span>
        <p className="text-xs text-slate-400">Streaming SCADA registers & AMD inference pipelines</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Enterprise Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-lg border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Production Operations Active
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400 font-mono">AMD ROCm Accelerated</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">Factory Operations & Industrial Intelligence</h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Real-time SCADA telemetry, Isolation Forest anomaly detection, failure risk prediction, and automated root-cause analysis.
          </p>
        </div>

        {/* Operational Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-800/80 p-2 sm:p-2.5 rounded-xl border border-slate-700/60 shrink-0 w-full lg:w-auto">
          <button
            onClick={async () => {
              toast.info('Injecting stress test on M-104...', 'Telemetry Drift');
              await triggerSimulationFailure('M-104');
              toast.warning('Machine M-104 vibration elevated to 8.4 mm/s.', 'Stress Test Active');
              fetchData();
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Inject Stress Test (M-104)</span>
          </button>
          <button
            onClick={async () => {
              toast.info('Restoring nominal baseline on M-104...', 'Baseline Reset');
              await resetSimulation('M-104');
              toast.success('Machine M-104 restored to nominal baseline.', 'Nominal Baseline');
              fetchData();
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 sm:py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg border border-slate-600 transition-all cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Dynamic KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Factory Health Score */}
        <div className="industrial-card p-5 flex flex-col justify-between relative overflow-hidden border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Factory Health Index</span>
            <button 
              onClick={() => setIsHealthModalOpen(true)}
              className="text-slate-400 hover:text-amber-600 p-1 transition-all cursor-pointer flex items-center gap-1 text-[11px]"
              title="Explain calculation"
            >
              <Info className="w-4 h-4 text-amber-500" />
              <span className="font-medium text-amber-600">Explain</span>
            </button>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{summary?.factory_health_score ?? 100}</span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200 ml-auto">
              Optimal
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Calculated across {summary?.total_machines ?? 0} online plant assets</p>
        </div>

        <KpiCard
          title="Machines at Risk"
          value={summary?.machines_at_risk ?? 0}
          subtitle={`out of ${summary?.total_machines ?? 0} total`}
          trend={summary?.machines_at_risk && summary.machines_at_risk > 0 ? `${summary.machines_at_risk} Requires Attention` : 'All Systems Nominal'}
          trendType={summary?.machines_at_risk && summary.machines_at_risk > 0 ? 'negative' : 'positive'}
          icon={AlertTriangle}
          iconBg="bg-amber-50 text-amber-600"
        />

        <KpiCard
          title="Prevented Downtime"
          value={`${summary?.prevented_downtime_hours ?? 0} hrs`}
          subtitle="Early failure intervention"
          trend="Intervention Logged"
          trendType="positive"
          icon={Clock}
          iconBg="bg-emerald-50 text-emerald-600"
        />

        <KpiCard
          title="Estimated Cost Saved"
          value={`$${(summary?.estimated_cost_saved ?? 0).toLocaleString()}`}
          subtitle="Avoided breakdown damage"
          trend="Real Cost Calculated"
          trendType="positive"
          icon={DollarSign}
          iconBg="bg-blue-50 text-blue-600"
        />
      </div>

      {/* Main Grid: Machine Health Breakdown + Live Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine Health Overview (2 Cols) */}
        <div className="lg:col-span-2 industrial-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Machine Health Overview</h2>
              <p className="text-xs text-slate-500">Real-time operational telemetry & failure probability metrics</p>
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {['All', 'Healthy', 'Warning', 'Critical'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Machine List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMachines.map((m) => (
              <Link 
                key={m.id} 
                href={`/machines/${m.id}`}
                className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{m.id}</span>
                      <StatusBadge status={m.status} />
                    </div>
                    <p className="text-xs font-medium text-slate-600 mt-0.5">{m.name}</p>
                    <p className="text-[11px] text-slate-400">{m.production_line}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-medium">Health</span>
                    <div className={`text-base font-bold ${
                      m.health_score >= 90 ? 'text-emerald-600' :
                      m.health_score >= 75 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {m.health_score}/100
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Vibration</span>
                    <span className="font-bold text-slate-800">{m.current_vibration} mm/s</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Temp</span>
                    <span className="font-bold text-slate-800">{m.current_temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Failure Risk</span>
                    <span className={`font-bold ${m.failure_probability >= 0.5 ? 'text-red-600' : 'text-slate-800'}`}>
                      {Math.round(m.failure_probability * 100)}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Real-Time Alert Feed (1 Col) */}
        <div className="industrial-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-bold text-slate-900">Real-Time Alert Feed</h2>
              </div>
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                {alerts.length} Active
              </span>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  No active critical alerts. All machine telemetry streams normal.
                </div>
              ) : (
                alerts.map((alt) => (
                  <div 
                    key={alt.id}
                    className="p-3.5 bg-red-50/50 rounded-xl border border-red-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{alt.machine_id}</span>
                      <span className="px-2 py-0.5 bg-red-600 text-white font-bold rounded-sm text-[10px]">
                        {alt.severity}
                      </span>
                    </div>

                    <p className="font-semibold text-red-900">{alt.alert_type}</p>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{alt.ai_explanation}</p>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      <span>Failure Risk: <strong className="text-red-700">{Math.round(alt.failure_probability * 100)}%</strong></span>
                      <button
                        onClick={() => handleAcknowledgeAlert(alt.id)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-md border border-slate-300 cursor-pointer shadow-2xs"
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <Link href="/alerts" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center justify-center gap-1">
              <span>View All Alerts</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic Factory Trend Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="industrial-card p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Fleet Machine Health & Risk Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Calculated from active telemetry database records</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="health" stroke="#10b981" fill="#ecfdf5" name="Health Score" />
                <Area type="monotone" dataKey="risk" stroke="#ef4444" fill="#fef2f2" name="Failure Risk %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="industrial-card p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Energy & Resource Usage Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Power draw per machine asset (kW)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="energy" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Energy (kW)" />
                <Bar dataKey="downtime" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Downtime (hrs)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Health Score Explanation Modal */}
      <HealthScoreModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        score={summary?.factory_health_score ?? 100}
      />
    </div>
  );
}
