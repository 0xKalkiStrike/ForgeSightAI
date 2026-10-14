'use client';

import { useState } from 'react';
import { Settings, Shield, Sliders, Database, Cpu, Zap, Bell, Save, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ToastContext';

export default function SettingsPage() {
  const [contamination, setContamination] = useState('0.08');
  const [tempThreshold, setTempThreshold] = useState('85.0');
  const [vibThreshold, setVibThreshold] = useState('7.5');
  const [autoApproveLowRisk, setAutoApproveLowRisk] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const toast = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Production settings and anomaly thresholds updated successfully.', 'Settings Saved');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">System Configuration & Settings</h1>
        <p className="text-xs text-slate-500">Platform thresholds, AMD GPU settings, and notification preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* AMD Hardware Acceleration */}
        <div className="industrial-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">AMD Hardware & Engine Configuration</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">ROCm Hardware Provider</span>
              <p className="text-slate-500">AMD Radeon(TM) Graphics / Instinct GPU</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                Hardware Accelerated
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">SIMD Vectorized Execution</span>
              <p className="text-slate-500">FastAPI C-Accelerated NumPy / Scikit-Learn kernels</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                Active (84.9% Speedup)
              </span>
            </div>
          </div>
        </div>

        {/* Anomaly Detection Thresholds */}
        <div className="industrial-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-5 h-5 text-slate-700" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Operational Anomaly Thresholds</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Isolation Forest Contamination</label>
              <input
                type="text"
                value={contamination}
                onChange={(e) => setContamination(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Expected outlier ratio (0.01 - 0.20)</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Max Thermal Threshold (°C)</label>
              <input
                type="text"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Triggers high-priority alert above this</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Vibration Critical Limit (mm/s)</label>
              <input
                type="text"
                value={vibThreshold}
                onChange={(e) => setVibThreshold(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">ISO 10816 Zone D threshold</span>
            </div>
          </div>
        </div>

        {/* Human-in-the-Loop & Notification Preferences */}
        <div className="industrial-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Notifications & Automation Policy</h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
              />
              <div>
                <span className="font-bold text-slate-900 block">Dispatch Critical Alert Push Notifications</span>
                <span className="text-slate-500 text-[11px]">Notify plant engineering team via mobile web & SCADA dashboard broadcast</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={autoApproveLowRisk}
                onChange={(e) => setAutoApproveLowRisk(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
              />
              <div>
                <span className="font-bold text-slate-900 block">Auto-Schedule Routine Low-Risk Work Orders</span>
                <span className="text-slate-500 text-[11px]">Bypasses human review for routine greasing and filter inspections under $100</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
