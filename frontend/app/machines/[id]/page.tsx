'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Cpu, 
  Activity, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  FileText, 
  ShieldAlert, 
  Play, 
  RotateCcw,
  Wrench,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import IncidentReportModal from '@/components/IncidentReportModal';
import { useToast } from '@/components/ToastContext';
import { 
  getMachine, 
  getMachineTelemetry, 
  getAnomalies, 
  getPredictions, 
  getRecommendations,
  approveRecommendation,
  triggerSimulationFailure,
  resetSimulation,
  Machine, 
  SensorReading, 
  Anomaly, 
  Prediction, 
  Recommendation 
} from '@/lib/api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function MachineDetailPage() {
  const params = useParams();
  const machineId = (params?.id as string) || 'M-104';

  const [machine, setMachine] = useState<Machine | null>(null);
  const [telemetry, setTelemetry] = useState<SensorReading[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const fetchMachineData = async () => {
    try {
      const [m, tel, anom, predList, recList] = await Promise.all([
        getMachine(machineId),
        getMachineTelemetry(machineId, timeRange),
        getAnomalies(machineId),
        getPredictions(machineId),
        getRecommendations(machineId)
      ]);
      setMachine(m);
      setTelemetry(tel);
      setAnomalies(anom);
      setPrediction(predList[0] || null);
      setRecommendation(recList[0] || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachineData();
    const interval = setInterval(fetchMachineData, 3000);
    return () => clearInterval(interval);
  }, [machineId, timeRange]);

  const toast = useToast();

  const handleApproveRecommendation = async () => {
    if (!recommendation) return;
    try {
      await approveRecommendation(recommendation.id);
      toast.success('Preventive work order approved & dispatched to maintenance team.', 'Work Order Approved');
      fetchMachineData();
    } catch (err) {
      toast.error('Failed to approve recommendation.', 'Error');
    }
  };

  if (loading && !machine) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 gap-3">
        <Activity className="w-6 h-6 animate-spin text-amber-500" />
        <span className="text-sm font-semibold text-slate-700">Loading Machine Telemetry Diagnostics...</span>
      </div>
    );
  }

  const isHighRisk = (machine?.failure_probability ?? 0) >= 0.5;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs">
        <Link 
          href="/machines" 
          className="inline-flex items-center gap-1.5 font-bold text-amber-600 hover:text-amber-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Fleet Monitoring</span>
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-500 font-mono">{machineId} Diagnostics</span>
      </div>

      {/* Top Header Card */}
      <div className="industrial-card p-4 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-l-4 border-l-amber-500">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-3 bg-slate-900 text-white rounded-xl shadow-md shrink-0">
            <Cpu className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">{machine?.id}: {machine?.name}</h1>
              <StatusBadge status={machine?.status || 'Healthy'} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Type: <strong className="text-slate-800">{machine?.type}</strong> • Location: {machine?.location} • {machine?.production_line}
            </p>
          </div>
        </div>

        {/* Demo Scenario Buttons & Incident Report Trigger */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {machineId === 'M-104' && (
            <>
              <button
                onClick={async () => {
                  toast.info('Triggering stress test on M-104...', 'Telemetry Drift');
                  await triggerSimulationFailure('M-104');
                  toast.warning('Machine M-104 failure risk updated.', 'Stress Active');
                  fetchMachineData();
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate Failure</span>
              </button>
              <button
                onClick={async () => {
                  toast.info('Restoring nominal baseline on M-104...', 'Baseline Reset');
                  await resetSimulation('M-104');
                  toast.success('Machine M-104 restored to nominal baseline.', 'Baseline Restored');
                  fetchMachineData();
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-all cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Baseline</span>
              </button>
            </>
          )}

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-xs whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Incident Report</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="industrial-card p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Health Score</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{machine?.health_score}/100</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Calculated baseline stability</p>
        </div>

        <div className="industrial-card p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Failure Probability</span>
          <div className={`text-2xl font-bold mt-1 ${isHighRisk ? 'text-red-600' : 'text-slate-900'}`}>
            {Math.round((machine?.failure_probability ?? 0) * 100)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">AMD Predictive Ensemble v2</p>
        </div>

        <div className="industrial-card p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining Risk Window</span>
          <div className="text-sm font-bold text-slate-900 mt-2">{machine?.remaining_risk_window}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Estimated time before fatigue breakdown</p>
        </div>

        <div className="industrial-card p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operating Hours</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{machine?.operating_hours} hrs</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Since major maintenance overhaul</p>
        </div>
      </div>

      {/* Sensor Telemetry Time-Series Charts */}
      <div className="industrial-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Live Sensor Telemetry Streams</h2>
            <p className="text-xs text-slate-500">Real-time vibration, temperature, and hydraulic pressure dynamics</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            {['1h', '6h', '24h', '7d', '30d'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-md cursor-pointer transition-all ${
                  timeRange === r ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vibration Chart */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase">Mechanical Vibration (mm/s RMS)</span>
              <span className="text-xs font-bold text-slate-900">Current: {machine?.current_vibration} mm/s</span>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetry}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val.split('T')[1]?.substring(0,5) || val} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[2, 12]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="vibration" stroke="#ef4444" strokeWidth={2.5} dot={false} name="Vibration (mm/s)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Temperature Chart */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase">Operating Temperature (°C)</span>
              <span className="text-xs font-bold text-slate-900">Current: {machine?.current_temperature}°C</span>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetry}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val.split('T')[1]?.substring(0,5) || val} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[50, 95]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Temperature (°C)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* AI Intelligence Section: Anomaly, Root Cause & Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Root Cause Analysis & Anomaly Detection */}
        <div className="industrial-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">AI Root Cause Diagnostic Engine</h2>
          </div>

          {anomalies.length > 0 ? (
            <div className="space-y-3">
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Primary Diagnosis</span>
                <h3 className="text-base font-bold text-amber-950">Likely Issue: Drive-Side Bearing Degradation</h3>
                <p className="text-xs text-slate-700">
                  Confidence Score: <strong className="text-amber-900">91%</strong> (Matched against historical bearing fatigue signatures)
                </p>

                <div className="pt-2 border-t border-amber-200/60 space-y-1 text-xs text-slate-700">
                  <span className="font-bold text-slate-800 block text-[11px] uppercase">Empirical Evidence:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                    <li>Vibration increased 31% (+8.4 mm/s vs 5.9 mm/s baseline)</li>
                    <li>Temperature elevated +8°C above nominal operating limit</li>
                    <li>1,860 operating hours accumulated since last service overhaul</li>
                  </ul>
                </div>
              </div>

              {/* Anomaly list */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Detected Anomaly List</h4>
                {anomalies.map((anom) => (
                  <div key={anom.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{anom.sensor.toUpperCase()} ANOMALY</span>
                      <p className="text-slate-600 mt-0.5">{anom.explanation}</p>
                    </div>
                    <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 shrink-0">
                      {anom.deviation_pct > 0 ? `+${anom.deviation_pct}%` : `${anom.deviation_pct}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              No active anomalies detected on this machine.
            </div>
          )}
        </div>

        {/* Maintenance Recommendation Engine */}
        <div className="industrial-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Recommended Operator Action</h2>
              </div>
              {recommendation && (
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                  (recommendation.human_status || recommendation.status) === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {recommendation.human_status || recommendation.status || 'Pending'}
                </span>
              )}
            </div>

            {recommendation ? (
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900">{recommendation.title}</h3>
                  <div className="flex items-center gap-4 text-slate-600 text-[11px]">
                    <span>Priority: <strong className="text-red-600">{recommendation.priority}</strong></span>
                    <span>Window: <strong>{recommendation.recommended_time_window}</strong></span>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-2 text-center text-[11px]">
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <span className="text-emerald-700 font-semibold block">Avoided Downtime</span>
                      <span className="font-bold text-slate-900 text-xs">{recommendation.estimated_avoided_downtime} Hours</span>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <span className="text-emerald-700 font-semibold block">Avoided Cost</span>
                      <span className="font-bold text-slate-900 text-xs">${recommendation.estimated_avoided_cost}</span>
                    </div>
                  </div>
                </div>

                {/* Procedure Steps */}
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">Recommended Procedure Steps</span>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 text-[11px] text-slate-700 max-h-44 overflow-y-auto">
                    {(recommendation.procedure_steps || [
                      '1. Lockout/Tagout spindle drive electrical supply.',
                      '2. Remove front housing cover and inspect grease condition.',
                      '3. Check bearing play and shaft runout with dial gauge.',
                      '4. Relubricate with Kluber NBU 15 grease or replace bearing unit.'
                    ]).map((step: string, idx: number) => (
                      <p key={idx} className="leading-relaxed">{step}</p>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No pending maintenance recommendations.
              </div>
            )}
          </div>

          {recommendation && (recommendation.human_status === 'Pending' || recommendation.status === 'Pending Review' || !recommendation.human_status) && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={handleApproveRecommendation}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-xs"
              >
                Approve Maintenance Action
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Incident Report Modal */}
      <IncidentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        machineId={machine?.id || 'M-104'}
        machineName={machine?.name || 'CNC Machine'}
        issue={recommendation?.title || 'Abnormal Vibration Spike'}
        riskPct={Math.round((machine?.failure_probability ?? 0) * 100)}
        rootCause="Drive-Side Bearing Degradation"
        recommendation={recommendation?.title || 'Inspect drive bearing assembly'}
        avoidedDowntime={recommendation?.estimated_avoided_downtime || 6.5}
        avoidedCost={recommendation?.estimated_avoided_cost || 4800}
      />
    </div>
  );
}
